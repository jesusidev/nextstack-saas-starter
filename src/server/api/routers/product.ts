import { z } from 'zod';
import { productInput, productQueryInput, updateProductInput } from '~/types/product';
import { requiresProductOwnership } from '../middleware/ownership';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const productRouter = createTRPCRouter({
  // Consolidated endpoint - handles both single product and list queries
  products: publicProcedure.input(productQueryInput).query(async ({ ctx, input }) => {
    // Common include for both single and list queries
    const includeConfig = {
      categories: {
        include: {
          category: true,
        },
      },
      remaining: true,
      favoriteProducts: ctx.auth?.userId
        ? {
            where: {
              userId: ctx.auth.userId,
            },
            select: {
              userId: true,
            },
          }
        : false,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      images: true,
    };

    // If ID is provided, return single product
    if (input?.id) {
      const product = await ctx.db.product.findUnique({
        include: includeConfig,
        where: {
          id: input.id,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const isFavorite = ctx.auth?.userId ? product.favoriteProducts.length > 0 : false;

      return {
        ...product,
        isFavorite,
        images: product.images.map((image: { url: string }) => image.url),
      };
    }

    // Otherwise, return list of products
    const productsByProject = input?.projectId ? { projectId: input.projectId } : {};

    // Determine access level and filtering
    const isPublicQuery = input?.isPublic === true;
    const whereCondition = isPublicQuery
      ? { ...productsByProject } // Public - no user filter
      : input?.show === 'all'
        ? { ...productsByProject } // Protected but show all
        : ctx.auth?.userId
          ? { userId: ctx.auth.userId, ...productsByProject } // Protected - user's products only
          : { ...productsByProject }; // Fallback

    const products = await ctx.db.product.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: includeConfig,
      where: whereCondition,
    });

    return products.map((product) => ({
      ...product,
      isFavorite: ctx.auth?.userId ? product.favoriteProducts.length > 0 : false,
      images: product.images.map((image: { url: string }) => image.url),
    }));
  }),

  create: protectedProcedure.input(productInput).mutation(async ({ ctx, input }) => {
    const connectProject = input.projectId
      ? {
          project: {
            connect: {
              id: input.projectId,
            },
          },
        }
      : {};

    const product = await ctx.db.product.create({
      data: {
        name: input.name,
        brand: input.brand,
        sku: input.sku,
        description: input.description,
        status: input.status || 'ACTIVE',
        remaining: {
          create: {
            quantity: input.quantity,
          },
        },
        user: {
          connect: {
            id: ctx.auth.userId,
          },
        },
        ...connectProject,
        images: {
          create:
            input.imageUrls?.map((url) => ({
              url,
            })) ?? [], // Format the images correctly
        },
      },
    });

    if (input.isFavorite) {
      await ctx.db.favoriteProduct.create({
        data: {
          user: {
            connect: {
              id: ctx.auth.userId,
            },
          },
          product: {
            connect: {
              id: product.id,
            },
          },
        },
      });
    }

    // Handle categories if provided
    if (input.categories && input.categories.length > 0) {
      for (const categoryId of input.categories) {
        await ctx.db.productCategory.create({
          data: {
            productId: product.id,
            categoryId: categoryId,
          },
        });
      }
    }

    const freshProduct = await ctx.db.product.findUnique({
      include: {
        categories: true,
        remaining: true,
        favoriteProducts: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        images: true,
      },
      where: {
        id: product.id,
      },
    });

    return freshProduct;
  }),

  getUserCategories: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.category.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        productId: z.string().optional(), // Optional productId for standalone category creation
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find existing category or create new one (user-specific)
      let category = await ctx.db.category.findFirst({
        where: {
          name: input.name,
          userId: ctx.auth.userId,
        },
      });

      if (!category) {
        category = await ctx.db.category.create({
          data: {
            name: input.name,
            userId: ctx.auth.userId,
          },
        });
      }

      // Only create ProductCategory relationship if productId is provided
      if (input.productId) {
        await ctx.db.productCategory.create({
          data: {
            productId: input.productId,
            categoryId: category.id,
          },
        });
      }

      return category;
    }),

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor this mutation to reduce complexity
  update: protectedProcedure
    .input(updateProductInput)
    .use(requiresProductOwnership)
    .mutation(async ({ ctx, input }) => {
      // Handle image updates
      if (input.images) {
        await ctx.db.$transaction(async (prisma) => {
          // Remove existing images
          await prisma.productImage.deleteMany({
            where: { productId: input.id },
          });

          // Add new images
          if (input.images) {
            for (const imageUrl of input.images) {
              await prisma.productImage.create({
                data: {
                  url: imageUrl,
                  productId: input.id,
                },
              });
            }
          }
        });
      }

      // Handle category addition (legacy single category)
      if (input.categoryName) {
        // Find existing category or create new one
        let category = await ctx.db.category.findFirst({
          where: {
            name: input.categoryName,
          },
        });

        if (!category) {
          category = await ctx.db.category.create({
            data: {
              name: input.categoryName,
            },
          });
        }

        await ctx.db.productCategory.create({
          data: {
            productId: input.id,
            categoryId: category.id,
          },
        });
      }

      // Handle categories array update (replace all categories)
      if (input.categories !== undefined) {
        // First, remove all existing categories for this product
        await ctx.db.productCategory.deleteMany({
          where: {
            productId: input.id,
          },
        });

        // Then add the new categories
        if (input.categories.length > 0) {
          for (const categoryId of input.categories) {
            await ctx.db.productCategory.create({
              data: {
                productId: input.id,
                categoryId: categoryId,
              },
            });
          }
        }
      }

      const connectProject =
        input.projectId !== undefined
          ? input.projectId && input.projectId !== ''
            ? {
                project: {
                  connect: {
                    id: input.projectId,
                  },
                },
              }
            : {
                project: {
                  disconnect: true,
                },
              }
          : {};

      const product = await ctx.db.product.update({
        data: {
          name: input.name,
          brand: input.brand,
          sku: input.sku,
          description: input.description,
          status: input.status,
          ...connectProject,
        },
        where: {
          id: input.id,
        },
      });

      // Handle quantity update
      if (input.quantity !== undefined) {
        // Check if a Remaining record exists for this product
        const existingRemaining = await ctx.db.remaining.findUnique({
          where: {
            productId: input.id,
          },
        });

        if (existingRemaining) {
          // Update existing remaining record
          await ctx.db.remaining.update({
            where: {
              productId: input.id,
            },
            data: {
              quantity: input.quantity,
            },
          });
        } else {
          // Create new remaining record
          await ctx.db.remaining.create({
            data: {
              quantity: input.quantity,
              productId: input.id,
            },
          });
        }
      }

      // Handle favorite status update
      if (input.isFavorite !== undefined) {
        const existingFavorite = await ctx.db.favoriteProduct.findUnique({
          where: {
            userId_productId: {
              userId: ctx.auth.userId,
              productId: input.id,
            },
          },
        });

        if (input.isFavorite && !existingFavorite) {
          await ctx.db.favoriteProduct.create({
            data: {
              userId: ctx.auth.userId,
              productId: input.id,
            },
          });
        } else if (!input.isFavorite && existingFavorite) {
          await ctx.db.favoriteProduct.delete({
            where: {
              userId_productId: {
                userId: ctx.auth.userId,
                productId: input.id,
              },
            },
          });
        }
      }

      const freshProduct = await ctx.db.product.findUnique({
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          remaining: true,
          favoriteProducts: {
            where: {
              userId: ctx.auth.userId,
            },
            select: {
              userId: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          images: true,
        },
        where: {
          id: product.id,
        },
      });

      if (!freshProduct) {
        return product;
      }

      return {
        ...freshProduct,
        isFavorite: freshProduct.favoriteProducts.length > 0,
        images: freshProduct.images.map((image: { url: string }) => image.url),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .use(requiresProductOwnership)
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.delete({
        where: {
          id: input.id,
        },
      });

      return product;
    }),
});

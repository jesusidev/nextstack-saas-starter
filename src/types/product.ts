import { z } from 'zod';

// Create Product type from the backend Prisma model instead of router output to avoid union issues
export type Product = {
  id: string;
  name: string;
  brand: string | null;
  sku: string | null;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  storeId: string | null;
  projectId: string | null;
  remaining: {
    id: string;
    quantity: number;
    productId: string | null;
  } | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  categories: {
    productId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      status: 'ACTIVE' | 'INACTIVE';
      createdAt: Date;
      updatedAt: Date;
      userId: string | null;
    };
  }[];
  favoriteProducts: { userId: string; productId: string }[];
  images: string[];
};

const ShowFilterEnum = z.enum(['all']);
export type ShowFilter = z.infer<typeof ShowFilterEnum>;

// Consolidated query input - can get single product by ID or list with filters
export const productQueryInput = z
  .object({
    // Single product query
    id: z.string().optional(),

    // List query filters
    show: ShowFilterEnum.optional(),
    projectId: z.string().optional(),

    // Public vs protected
    isPublic: z.boolean().optional(),
  })
  .optional();

export const productInput = z.object({
  name: z.string(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  isFavorite: z.boolean().optional(),
  quantity: z.number().optional(),
  projectId: z.string().optional(),
  categories: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export const updateProductInput = z.object({
  id: z.string(),
  name: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  isFavorite: z.boolean().optional(),
  categoryName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  quantity: z.number().optional(),
  images: z.array(z.string().url()).optional(),
  projectId: z.string().optional(),
});

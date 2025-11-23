'use client';

import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBoxSeam, IconClipboardList, IconListDetails, IconTags } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { HeartIcon, type HeartIconHandle } from '~/components/icons/HeartIcon';
import { CategorySelect } from '~/components/input/CategorySelect';
import { InputNumber } from '~/components/input/InputNumber';
import { InputText } from '~/components/input/InputText';
import { ProjectSelect } from '~/components/input/ProjectSelect';
import { useProductService } from '~/hooks/service/useProductService';

interface CreateProductFormValues {
  name: string;
  brand: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE';
  isFavorite: boolean;
  quantity: number;
  projectId: string;
  categories: string[];
  description: string;
}

interface ModalCreateProductProps {
  opened: boolean;
  close: () => void;
  productId?: string; // For edit mode
  isEditing?: boolean;
}

export function ModalCreateProduct({
  opened,
  close,
  productId,
  isEditing = false,
}: ModalCreateProductProps) {
  const heartRef = useRef<HeartIconHandle>(null);
  const [heartBounce, setHeartBounce] = useState(false);

  const handleFavoriteToggle = () => {
    setHeartBounce(true);
    form.setFieldValue('isFavorite', !form.values.isFavorite);
    setTimeout(() => setHeartBounce(false), 600);
  };

  const form = useForm<CreateProductFormValues>({
    initialValues: {
      name: '',
      brand: '',
      sku: '',
      status: 'ACTIVE',
      isFavorite: false,
      quantity: 0,
      projectId: '',
      categories: [],
      description: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Product name is required' : null),
      quantity: (value) => (value < 0 ? 'Quantity must be greater than or equal to 0' : null),
    },
  });

  const productService = useProductService();
  const { createProduct, updateProduct } = productService.useMutations();

  // Fetch product data for editing
  const { data: productData } = productService.useProduct(productId || '');

  // Pre-populate form when editing
  // biome-ignore lint/correctness/useExhaustiveDependencies: form object is stable from useForm hook, adding it would cause infinite loops
  useEffect(() => {
    if (isEditing && productData && form.values.name === '') {
      // Only set values if form is empty (prevents infinite loop)
      form.setValues({
        name: productData.name || '',
        brand: productData.brand || '',
        sku: productData.sku || '',
        status: productData.status || 'ACTIVE',
        isFavorite: productData.isFavorite || false,
        quantity: productData.remaining?.quantity || 0,
        projectId: productData.projectId || '',
        categories:
          productData.categories?.map((cat: { categoryId: string }) => cat.categoryId) || [],
        description: productData.description || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditing,
    productData, // Only set values if form is empty (prevents infinite loop)
    form.setValues,
    form.values.name,
  ]);

  function onSubmitForm(values: CreateProductFormValues) {
    const submitData = {
      name: values.name,
      brand: values.brand || undefined,
      sku: values.sku || undefined,
      description: values.description || undefined,
      status: values.status,
      isFavorite: values.isFavorite,
      quantity: values.quantity,
      projectId: values.projectId || (isEditing ? '' : undefined),
      categories: values.categories,
    };

    if (isEditing && productId) {
      updateProduct.mutate({ id: productId, ...submitData });
    } else {
      createProduct.mutate(submitData);
    }
  }

  // Close modal on successful creation or update
  useEffect(() => {
    if (createProduct.isSuccess || updateProduct.isSuccess) {
      close();
    }
  }, [createProduct.isSuccess, updateProduct.isSuccess, close]);

  // Reset form when modal opens for create mode or when productId changes for edit mode
  // biome-ignore lint/correctness/useExhaustiveDependencies: form object is stable from useForm hook, adding it would cause infinite loops
  useEffect(() => {
    if (opened && !isEditing) {
      // Reset form for create mode
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    opened,
    isEditing, // Reset form for create mode
    form.reset,
  ]);

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={close}
      title={isEditing ? 'Edit Product' : 'Create New Product'}
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
    >
      <Tabs defaultValue="product" variant="outline" radius="md">
        <Tabs.List>
          <Tabs.Tab value="product" leftSection={<IconBoxSeam size="0.8rem" />}>
            Product Info
          </Tabs.Tab>
          <Tabs.Tab value="remaining" leftSection={<IconListDetails size="0.8rem" />}>
            Inventory
          </Tabs.Tab>
          <Tabs.Tab value="project" leftSection={<IconClipboardList size="0.8rem" />}>
            Project
          </Tabs.Tab>
          <Tabs.Tab value="categories" leftSection={<IconTags size="0.8rem" />}>
            Categories
          </Tabs.Tab>
        </Tabs.List>
        <form onSubmit={form.onSubmit(onSubmitForm)}>
          <Tabs.Panel value="product" pt="xs">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              <InputText
                withAsterisk
                label="Product Name"
                placeholder="Enter product name"
                {...form.getInputProps('name')}
              />
              <InputText
                label="Brand Name"
                placeholder="Enter brand"
                {...form.getInputProps('brand')}
              />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm" mt="sm">
              <InputText label="SKU" placeholder="Enter SKU" {...form.getInputProps('sku')} />
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Favorite Product
                </Text>
                <ActionIcon
                  variant="heart"
                  radius="md"
                  size={36}
                  onClick={handleFavoriteToggle}
                  onMouseEnter={() => heartRef.current?.startAnimation()}
                  onMouseLeave={() => heartRef.current?.stopAnimation()}
                  style={{
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: heartBounce ? 'scale(1.3)' : 'scale(1)',
                  }}
                >
                  <HeartIcon ref={heartRef} size={18} filled={form.values.isFavorite} />
                </ActionIcon>
              </Stack>
            </SimpleGrid>
            <TextInput
              label="Description"
              placeholder="Enter product description"
              mt="sm"
              {...form.getInputProps('description')}
            />
            <Select
              label="Status"
              placeholder="Select product status"
              mt="sm"
              data={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
              {...form.getInputProps('status')}
            />
          </Tabs.Panel>

          <Tabs.Panel value="remaining" pt="xs">
            <InputNumber label="Quantity" min={0} {...form.getInputProps('quantity')} />
          </Tabs.Panel>

          <Tabs.Panel value="project" pt="xs">
            <ProjectSelect
              label="Project"
              placeholder="Select a project (optional)"
              {...form.getInputProps('projectId')}
              disabled={isEditing ? updateProduct.isPending : createProduct.isPending}
            />
          </Tabs.Panel>

          <Tabs.Panel value="categories" pt="xs">
            <Stack gap="sm">
              <CategorySelect
                label="Categories"
                placeholder="Select or create categories"
                {...form.getInputProps('categories')}
              />
              <Text size="xs" c="dimmed">
                Select existing categories or create new ones for better organization
              </Text>
            </Stack>
          </Tabs.Panel>

          <Divider my="sm" />
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              loading={isEditing ? updateProduct.isPending : createProduct.isPending}
              disabled={!form.values.name.trim()}
            >
              {isEditing ? 'Update Product!' : 'Create Product'}
            </Button>
          </Group>
        </form>
      </Tabs>
    </Modal>
  );
}

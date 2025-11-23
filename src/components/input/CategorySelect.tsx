import { useMemo } from 'react';
import { useCategoryService } from '~/hooks/service/useCategoryService';
import { SelectWithCreate } from './SelectWithCreate';

interface CategorySelectProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

export function CategorySelect({
  value = [],
  onChange,
  placeholder,
  error,
  label,
  required,
}: CategorySelectProps) {
  const categoryService = useCategoryService();
  const { data: userCategories = [], isLoading } = categoryService.useCategories();
  const createCategoryMutation = categoryService.useCreateCategory();

  // Convert user categories to select data format
  const selectData = useMemo(
    () =>
      userCategories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [userCategories]
  );

  // Handle category creation
  const handleCreateCategory = async (name: string) => {
    const newCategory = await createCategoryMutation.mutateAsync({ name });
    return newCategory;
  };

  return (
    <SelectWithCreate<true>
      multiple
      value={value}
      onChange={onChange}
      data={selectData}
      onCreate={handleCreateCategory}
      createLabel="Create new category"
      label={label}
      placeholder={placeholder || 'Select or create categories'}
      error={error}
      required={required}
      isLoading={isLoading}
      isCreating={createCategoryMutation.isPending}
    />
  );
}

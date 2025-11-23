import { useMemo } from 'react';
import { useProjectService } from '~/hooks/service/useProjectService';
import { SelectWithCreate } from './SelectWithCreate';

interface ProjectSelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function ProjectSelect({
  value,
  onChange,
  label,
  placeholder,
  required,
  error,
  disabled,
}: ProjectSelectProps) {
  const projectService = useProjectService();
  const { data: projects = [], isLoading } = projectService.useProjects();
  const { createProject } = projectService.useMutations();

  // Convert projects to select data format
  const selectData = useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects]
  );

  // Handle value changes (normalize empty string to null)
  const handleChange = (newValue: string | null) => {
    onChange(newValue || '');
  };

  // Handle project creation
  const handleCreateProject = async (name: string) => {
    const newProject = await createProject.mutateAsync({ name });
    return newProject;
  };

  return (
    <SelectWithCreate
      value={value || null}
      onChange={handleChange}
      data={selectData}
      onCreate={handleCreateProject}
      createLabel="Create new project"
      data-testid="project-select"
      label={label}
      placeholder={placeholder || 'Select a project'}
      error={error}
      required={required}
      disabled={disabled}
      isLoading={isLoading}
      isCreating={createProject.isPending}
      clearable
      helperText="Select an existing project or create a new one for better organization"
    />
  );
}

'use client';

import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useProjectService } from '~/hooks/service/useProjectService';

interface EditProjectNameProps {
  opened: boolean;
  close: () => void;
  projectId: string;
}

export function EditProjectName({ opened, close, projectId }: EditProjectNameProps) {
  const projectService = useProjectService();
  const { data: project } = projectService.useProject(projectId);
  const { updateProject } = projectService.useMutations();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => {
        if (value.length < 1) {
          return 'Project name is required';
        }
        if (value.length > 100) {
          return 'Project name is too long';
        }
        return null;
      },
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: form is stable from useForm hook
  useEffect(() => {
    if (project && opened) {
      form.setValues({ name: project.name });
      setFormError(null);
    }
  }, [project, opened]);

  useEffect(() => {
    if (updateProject.error?.message.includes('Unique constraint failed')) {
      setFormError('Project name already exists. Please use a different name.');
    }
  }, [updateProject.error]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: form is stable from useForm hook
  useEffect(() => {
    if (updateProject.isSuccess) {
      close();
      form.reset();
    }
  }, [updateProject.isSuccess, close]);

  const handleSubmit = (values: { name: string }) => {
    setFormError(null);
    updateProject.mutate({
      id: projectId,
      name: values.name,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Edit Project Name"
      data-testid="edit-project-modal"
    >
      <form onSubmit={form.onSubmit(handleSubmit)} data-testid="edit-project-form">
        <Stack gap="md">
          {formError && (
            <div style={{ color: 'red', fontSize: '14px' }} data-testid="form-error">
              {formError}
            </div>
          )}
          <TextInput
            withAsterisk
            label="Project Name"
            placeholder="Enter project name"
            data-testid="project-name-input"
            {...form.getInputProps('name')}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close} data-testid="cancel-button">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateProject.isPending}
              disabled={!form.values.name.trim()}
              data-testid="submit-button"
            >
              Update Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

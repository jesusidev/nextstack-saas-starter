'use client';

import { Button, Container, Modal, Paper, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import { useProjectService } from '~/hooks/service/useProjectService';
import { color } from '~/styles/colors';

export default function ModalCreateProject({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) {
  const projectService = useProjectService();
  const { createProject } = projectService.useMutations();
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (createProject.error?.message.includes('Unique constraint failed on the fields: (`name`)')) {
      setFormError('Project Name already exists, Please use a different projects name.');
    }

    if (createProject.isSuccess) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createProject.isSuccess, createProject.error, close]);

  const form = useForm({
    initialValues: {
      name: '',
    },
  });

  const onFormSubmit = (values: ReturnType<(values: { name: string }) => { name: string }>) => {
    createProject.mutate({ name: values.name });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      overlayProps={{
        color: color.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
    >
      <Container size={420} my={40}>
        <Title order={3}>Please Enter Your Project Name:</Title>
        {formError && <div style={{ color: 'red' }}>{formError}</div>}

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit((values) => onFormSubmit(values))}>
            <TextInput
              error
              label="Project Name:"
              placeholder="Art Frame"
              required
              withAsterisk
              {...form.getInputProps('name')}
            />
            <Button fullWidth mt="xl" type="submit">
              Submit
            </Button>
          </form>
        </Paper>
      </Container>
    </Modal>
  );
}

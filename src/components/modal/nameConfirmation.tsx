'use client';

import { useUser } from '@clerk/nextjs';
import { Button, Container, Modal, Paper, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useUserService } from '~/hooks/service/useUserService';

export default function ModalNameConfirmation() {
  const userService = useUserService();
  const { createUser } = userService.useMutations();
  const theme = useMantineTheme();
  // Start with opened true to avoid flickering - the parent component (UserVerification)
  // only renders this component when it should be shown
  const [opened, setOpened] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    // No need to call open() since we initialize with opened=true
    if (createUser.isSuccess) {
      setOpened(false);
    }
    if (createUser.error?.message.includes('Unique constraint failed on the fields: (`id`)')) {
      setFormError(
        'Email already exists, Please login with your email and password or reset your password.'
      );
    }
  }, [createUser.isSuccess, createUser.error]);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
    },
  });

  const onFormSubmit = (
    values: ReturnType<
      (values: { firstName: string; lastName: string }) => {
        firstName: string;
        lastName: string;
      }
    >
  ) => {
    createUser.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      email: user?.primaryEmailAddress?.emailAddress as string,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      withCloseButton={false}
      overlayProps={{
        color: theme.colors.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
    >
      <Container size={420} my={40}>
        <Title order={3}>Please Enter Your Name:</Title>
        {formError && <div style={{ color: 'red' }}>{formError}</div>}

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit((values) => onFormSubmit(values))}>
            <TextInput
              label="FirstName"
              placeholder="Test"
              required
              withAsterisk
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label="LastName"
              placeholder="Test"
              required
              withAsterisk
              {...form.getInputProps('lastName')}
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

import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditProjectName } from '../EditProjectName';

// Helper to render with Mantine Provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

const mockClose = jest.fn();
const mockMutate = jest.fn();
const mockReset = jest.fn();

const mockUpdateProject = {
  mutate: mockMutate,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  reset: mockReset,
};

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('~/hooks/service/useProjectService', () => ({
  useProjectService: () => ({
    useProject: () => ({
      data: mockProject,
      isLoading: false,
      isError: false,
    }),
    useMutations: () => ({
      updateProject: mockUpdateProject,
    }),
  }),
}));

describe('EditProjectName Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateProject.isSuccess = false;
    mockUpdateProject.isPending = false;
    mockUpdateProject.error = null;
  });

  describe('Rendering', () => {
    it('should render modal when opened prop is true', () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      expect(screen.getByText('Edit Project Name')).toBeInTheDocument();
    });

    it('should not render modal when opened prop is false', () => {
      renderWithProvider(
        <EditProjectName opened={false} close={mockClose} projectId="test-project-id" />
      );

      expect(screen.queryByText('Edit Project Name')).not.toBeInTheDocument();
    });

    it('should render form input with testid', () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      expect(screen.getByTestId('project-name-input')).toBeInTheDocument();
    });

    it('should render Update and Cancel buttons', () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when name is empty', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(input, { target: { value: '' } });

      expect(submitButton).toBeDisabled();
    });

    it('should show error when name is empty and form is submitted', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input');
      const form = screen.getByTestId('edit-project-form');

      // Clear the pre-populated value
      fireEvent.change(input, { target: { value: '' } });

      // Submit the form
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when name exceeds 100 characters', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input');
      const longName = 'a'.repeat(101);

      fireEvent.change(input, { target: { value: longName } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/project name is too long/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button when name is valid', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(input, { target: { value: 'Valid Project Name' } });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Data Fetching and Pre-population', () => {
    it('should pre-populate form with current project name', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;

      await waitFor(() => {
        expect(input.value).toBe('Test Project');
      });
    });
  });

  describe('Update Flow', () => {
    it('should call updateProject mutation with correct data', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(input, { target: { value: 'Updated Project Name' } });
      fireEvent.click(submitButton);

      expect(mockMutate).toHaveBeenCalledWith({
        id: 'test-project-id',
        name: 'Updated Project Name',
      });
    });

    it('should show loading state during update', () => {
      mockUpdateProject.isPending = true;

      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const submitButton = screen.getByTestId('submit-button');

      expect(submitButton).toHaveAttribute('data-loading');
    });

    it('should close modal on successful update', async () => {
      const { rerender } = renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      mockUpdateProject.isSuccess = true;

      rerender(
        <MantineProvider>
          <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
        </MantineProvider>
      );

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error for duplicate project name', async () => {
      mockUpdateProject.error = {
        message: 'Unique constraint failed on the fields: (`name`)',
      } as unknown as typeof mockUpdateProject.error;

      const { rerender } = renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      rerender(
        <MantineProvider>
          <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
        </MantineProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-error')).toBeInTheDocument();
        expect(
          screen.getByText(/project name already exists. please use a different name./i)
        ).toBeInTheDocument();
      });
    });

    it('should keep modal open on error', async () => {
      mockUpdateProject.error = {
        message: 'Unique constraint failed on the fields: (`name`)',
      } as unknown as typeof mockUpdateProject.error;

      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Project Name')).toBeInTheDocument();
      });

      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should close modal when Cancel button clicked', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(mockClose).toHaveBeenCalled();
    });

    it('should allow typing in input field', async () => {
      renderWithProvider(
        <EditProjectName opened={true} close={mockClose} projectId="test-project-id" />
      );

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'New Name' } });

      expect(input.value).toBe('New Name');
    });
  });
});

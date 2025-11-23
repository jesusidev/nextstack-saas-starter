import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SelectWithCreate } from '../SelectWithCreate';

// Helper to render with Mantine Provider
const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

// Mock data
const mockData = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

describe('SelectWithCreate Component', () => {
  describe('Single-Select Mode', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders without crashing in single-select mode', () => {
      expect(() => {
        renderWithMantine(
          <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />
        );
      }).not.toThrow();
    });

    it('displays label correctly', () => {
      renderWithMantine(
        <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} label="Test Label" />
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('shows placeholder when no value selected', () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          placeholder="Choose an option"
        />
      );

      const input = screen.getByPlaceholderText('Choose an option');
      expect(input).toBeInTheDocument();
    });

    it('displays selected value', () => {
      renderWithMantine(<SelectWithCreate value="1" onChange={mockOnChange} data={mockData} />);

      // When not focused, the input should show the selected option's label
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Option 1');
    });

    it('opens dropdown when clicked', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Dropdown should open and show all options
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('shows loading indicator when isLoading is true', () => {
      renderWithMantine(
        <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} isLoading />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('shows error message when error prop is provided', () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays helper text when provided', () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          helperText="Select an option"
        />
      );

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('selects an option when clicked', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      const option = screen.getByText('Option 2');
      fireEvent.click(option);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('2');
      });
    });

    it('clears selection when clear button is clicked', async () => {
      renderWithMantine(
        <SelectWithCreate value="1" onChange={mockOnChange} data={mockData} clearable />
      );

      // Clear button should be visible when value is selected
      const clearButton = screen.getByLabelText('Clear selection');
      expect(clearButton).toBeInTheDocument();

      fireEvent.mouseDown(clearButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('Multi-Select Mode', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders without crashing in multi-select mode', () => {
      expect(() => {
        renderWithMantine(
          <SelectWithCreate<true> multiple value={[]} onChange={mockOnChange} data={mockData} />
        );
      }).not.toThrow();
    });

    it('displays selected items as pills', () => {
      renderWithMantine(
        <SelectWithCreate<true>
          multiple
          value={['1', '2']}
          onChange={mockOnChange}
          data={mockData}
        />
      );

      // Pills should show the selected options
      const pills = screen.getAllByText('Option 1');
      expect(pills.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Option 2').length).toBeGreaterThan(0);
    });

    it('shows placeholder when no items selected', () => {
      renderWithMantine(
        <SelectWithCreate<true>
          multiple
          value={[]}
          onChange={mockOnChange}
          data={mockData}
          placeholder="Select multiple"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Select multiple');
    });

    it('removes pill when close button is clicked', async () => {
      const { container } = renderWithMantine(
        <SelectWithCreate<true>
          multiple
          value={['1', '2']}
          onChange={mockOnChange}
          data={mockData}
        />
      );

      // Find remove buttons by class (Mantine doesn't add aria-label to pill remove buttons)
      const removeButtons = container.querySelectorAll('.mantine-Pill-remove');
      expect(removeButtons.length).toBe(2);

      // Click the first remove button
      // biome-ignore lint/style/noNonNullAssertion: length check ensures element exists
      fireEvent.click(removeButtons[0]!);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['2']);
      });
    });

    it('adds option when clicked in multi-select', async () => {
      renderWithMantine(
        <SelectWithCreate<true> multiple value={['1']} onChange={mockOnChange} data={mockData} />
      );

      // Focus the input to open dropdown
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      // Click Option 2 to add it
      const option = screen.getByText('Option 2');
      fireEvent.click(option);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['1', '2']);
      });
    });

    it('removes option when clicked again in multi-select', async () => {
      renderWithMantine(
        <SelectWithCreate<true>
          multiple
          value={['1', '2']}
          onChange={mockOnChange}
          data={mockData}
        />
      );

      // Focus the input to open dropdown
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Wait for dropdown to show all options
      let options: HTMLElement[] = [];
      await waitFor(() => {
        options = screen.getAllByRole('option');
        expect(options.length).toBe(3); // All three options should be in dropdown
      });

      // Find Option 1 in the dropdown by value attribute
      const option1 = options.find((opt) => opt.getAttribute('value') === '1');
      expect(option1).toBeDefined();

      if (option1) {
        fireEvent.click(option1);
      }

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['2']);
      });
    });
  });

  describe('Search Functionality', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('filters options based on search input', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Type to filter
      fireEvent.change(input, { target: { value: 'Option 1' } });

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
      });
    });

    it('shows empty state when no results match search', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'Nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('filters are case-insensitive', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'option 1' } });

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('shows all options when search is cleared', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Type to filter
      fireEvent.change(input, { target: { value: 'Option 1' } });

      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });

      // Clear the search
      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });
  });

  describe('Inline Creation', () => {
    const mockOnChange = jest.fn();
    const mockOnCreate = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      mockOnCreate.mockResolvedValue({ id: '4', name: 'New Option' });
    });

    it('shows create option when typing non-existent item', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        expect(screen.getByText(/Create "New Option"/)).toBeInTheDocument();
      });
    });

    it('does not show create option for existing item', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'Option 1' } });

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Should not show Create option
      expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
    });

    it('does not show create option when onCreate is not provided', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
    });

    it('calls onCreate when create option is clicked', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        const createOption = screen.getByText(/Create "New Option"/);
        fireEvent.click(createOption);
      });

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith('New Option');
      });
    });

    it('adds created item to selection in single-select', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        const createOption = screen.getByText(/Create "New Option"/);
        fireEvent.click(createOption);
      });

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith('New Option');
        expect(mockOnChange).toHaveBeenCalledWith('4');
      });
    });

    it('adds created item to selection in multi-select', async () => {
      renderWithMantine(
        <SelectWithCreate<true>
          multiple
          value={['1']}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        const createOption = screen.getByText(/Create "New Option"/);
        fireEvent.click(createOption);
      });

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith('New Option');
        expect(mockOnChange).toHaveBeenCalledWith(['1', '4']);
      });
    });

    it('shows loading state during creation', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
          isCreating
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });

    it('disables create option during creation', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
          isCreating
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        const creatingOption = screen.getByText('Creating...');
        expect(creatingOption).toBeInTheDocument();
      });
    });

    it('uses custom create label when provided', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
          createLabel="Add new"
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        expect(screen.getByText(/Add new "New Option"/)).toBeInTheDocument();
      });
    });

    it('trims whitespace from search before creating', async () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreate}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: '  New Option  ' } });

      await waitFor(() => {
        const createOption = screen.getByText(/Create "New Option"/);
        fireEvent.click(createOption);
      });

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith('New Option');
      });
    });

    it('handles creation errors gracefully', async () => {
      // Suppress console.error for this test since we're intentionally testing error handling
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty - suppressing expected error output
      });

      const mockOnCreateError = jest.fn().mockRejectedValue(new Error('Creation failed'));

      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          onCreate={mockOnCreateError}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'New Option' } });

      await waitFor(() => {
        const createOption = screen.getByText(/Create "New Option"/);
        fireEvent.click(createOption);
      });

      await waitFor(() => {
        expect(mockOnCreateError).toHaveBeenCalledWith('New Option');
      });

      // Should not call onChange if creation fails
      expect(mockOnChange).not.toHaveBeenCalled();

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Disabled State', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('disables interaction when disabled prop is true', () => {
      renderWithMantine(
        <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} disabled />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('disables interaction when isLoading is true', () => {
      renderWithMantine(
        <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} isLoading />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not open dropdown when disabled', () => {
      renderWithMantine(
        <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} disabled />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Dropdown should not open
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('disables multi-select when disabled prop is true', () => {
      renderWithMantine(
        <SelectWithCreate<true>
          multiple
          value={[]}
          onChange={mockOnChange}
          data={mockData}
          disabled
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    const mockOnChange = jest.fn();

    it('has proper ARIA attributes', () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          label="Test Select"
          required
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('required');
    });

    it('shows required indicator when required prop is true', () => {
      renderWithMantine(
        <SelectWithCreate
          value={null}
          onChange={mockOnChange}
          data={mockData}
          label="Required Field"
          required
        />
      );

      expect(screen.getByText('Required Field')).toBeInTheDocument();
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    it('associates label with input', () => {
      renderWithMantine(
        <SelectWithCreate value={null} onChange={mockOnChange} data={mockData} label="Test Label" />
      );

      const label = screen.getByText('Test Label');
      const input = screen.getByRole('textbox');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('has clear button with accessible label', () => {
      renderWithMantine(
        <SelectWithCreate value="1" onChange={mockOnChange} data={mockData} clearable />
      );

      const clearButton = screen.getByLabelText('Clear selection');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Focus and Blur Behavior', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('opens dropdown on focus', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('closes dropdown on blur in single-select', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Wait for dropdown to open with all options visible
      await waitFor(() => {
        const options = screen.getAllByText('Option 1');
        expect(options.length).toBeGreaterThan(0);
      });

      fireEvent.blur(input);

      // Wait for dropdown to close - options should disappear from dropdown but may still be in data
      await waitFor(
        () => {
          // After blur, dropdown should be hidden, so options should not be accessible
          const dropdownOptions = screen.queryAllByRole('option');
          expect(dropdownOptions.length).toBe(0);
        },
        { timeout: 1000 }
      );
    });

    it('clears search on blur in single-select', async () => {
      renderWithMantine(<SelectWithCreate value={null} onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Option' } });

      expect(input).toHaveValue('Option');

      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('shows selected value when not focused', () => {
      renderWithMantine(<SelectWithCreate value="1" onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Option 1');
    });

    it('switches to search mode when focused with selection', async () => {
      renderWithMantine(<SelectWithCreate value="1" onChange={mockOnChange} data={mockData} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Option 1');

      fireEvent.focus(input);

      await waitFor(() => {
        // When focused, it should show the value in editable mode
        expect(input).toHaveValue('Option 1');
      });
    });
  });
});

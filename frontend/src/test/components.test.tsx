import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AadhaarVerification from '../components/steps/AadhaarVerification';
import PANVerification from '../components/steps/PANVerification';
import ProgressTracker from '../components/common/ProgressTracker';
import DynamicFormField from '../components/common/DynamicFormField';

// Mock the API services
vi.mock('../api/udyamService', () => ({
  udyamService: {
    submitAadhaar: vi.fn(),
    verifyOTP: vi.fn(),
    submitPAN: vi.fn(),
  },
}));

vi.mock('../api/schemaService', () => ({
  schemaService: {
    getFormSchema: vi.fn(),
    getValidationRules: vi.fn(),
  },
}));

describe('ProgressTracker Component', () => {
  it('should render progress tracker with correct steps', () => {
    render(<ProgressTracker currentStep={1} totalSteps={2} />);
    
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Aadhaar Verification')).toBeInTheDocument();
    expect(screen.getByText('PAN Verification')).toBeInTheDocument();
  });

  it('should highlight current step correctly', () => {
    render(<ProgressTracker currentStep={2} totalSteps={2} />);
    
    const step2Element = screen.getByText('PAN Verification').closest('div');
    expect(step2Element).toHaveClass('active');
  });

  it('should show completed steps', () => {
    render(<ProgressTracker currentStep={2} totalSteps={2} />);
    
    const step1Element = screen.getByText('Aadhaar Verification').closest('div');
    expect(step1Element).toHaveClass('completed');
  });
});

describe('DynamicFormField Component', () => {
  const mockField = {
    name: 'test-field',
    label: 'Test Field',
    type: 'text',
    required: true,
    placeholder: 'Enter test value',
    maxLength: 10,
  };

  it('should render text input field correctly', () => {
    render(
      <DynamicFormField
        field={mockField}
        value=""
        onChange={vi.fn()}
        error={null}
        register={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Test Field *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter test value')).toBeInTheDocument();
  });

  it('should render select field correctly', () => {
    const selectField = {
      ...mockField,
      type: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    };

    render(
      <DynamicFormField
        field={selectField}
        value=""
        onChange={vi.fn()}
        error={null}
        register={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Test Field *')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should render checkbox field correctly', () => {
    const checkboxField = {
      ...mockField,
      type: 'checkbox',
      label: 'Accept terms',
    };

    render(
      <DynamicFormField
        field={checkboxField}
        value={false}
        onChange={vi.fn()}
        error={null}
        register={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should render date field correctly', () => {
    const dateField = {
      ...mockField,
      type: 'date',
      label: 'Date of Birth',
    };

    render(
      <DynamicFormField
        field={dateField}
        value=""
        onChange={vi.fn()}
        error={null}
        register={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'date');
  });

  it('should display error message when provided', () => {
    render(
      <DynamicFormField
        field={mockField}
        value=""
        onChange={vi.fn()}
        error="This field is required"
        register={vi.fn()}
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <DynamicFormField
        field={mockField}
        value=""
        onChange={mockOnChange}
        error={null}
        register={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(mockOnChange).toHaveBeenCalledWith('test-field', 'test value');
  });
});

describe('AadhaarVerification Component', () => {
  const mockFormData = {
    txtadharno: '',
    txtownername: '',
    chkDecarationA: false,
    otpVerified: false,
    submissionId: null,
    completed: false,
    nextStep: 1,
  };

  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful schema loading
    const { schemaService } = require('../api/schemaService');
    schemaService.getFormSchema.mockResolvedValue({
      step1Fields: [
        {
          name: 'ctl00$ContentPlaceHolder1$txtadharno',
          label: 'Aadhaar Number',
          type: 'text',
          required: true,
          placeholder: 'Your Aadhaar No',
        },
        {
          name: 'ctl00$ContentPlaceHolder1$txtownername',
          label: 'Name of Entrepreneur',
          type: 'text',
          required: true,
          placeholder: 'Name as per Aadhaar',
        },
        {
          name: 'ctl00$ContentPlaceHolder1$chkDecarationA',
          label: 'Declaration/Agreement',
          type: 'checkbox',
          required: false,
        },
      ],
    });
    
    schemaService.getValidationRules.mockResolvedValue({
      aadhaar: '^[2-9]{1}[0-9]{11}$',
    });
  });

  it('should render Aadhaar verification form', async () => {
    render(
      <AadhaarVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Aadhaar Verification With OTP')).toBeInTheDocument();
      expect(screen.getByLabelText('Aadhaar Number *')).toBeInTheDocument();
      expect(screen.getByLabelText('Name of Entrepreneur *')).toBeInTheDocument();
      expect(screen.getByLabelText('Declaration/Agreement')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <AadhaarVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={null}
      />
    );

    expect(screen.getByText('Loading form...')).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.submitAadhaar.mockResolvedValue({
      success: true,
      submissionId: 1,
      message: 'OTP sent successfully',
    });

    render(
      <AadhaarVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Aadhaar Number *')).toBeInTheDocument();
    });

    const aadhaarInput = screen.getByLabelText('Aadhaar Number *');
    const nameInput = screen.getByLabelText('Name of Entrepreneur *');
    const declarationCheckbox = screen.getByLabelText('Declaration/Agreement');
    const submitButton = screen.getByText('Validate & Generate OTP');

    await user.type(aadhaarInput, '123456789012');
    await user.type(nameInput, 'Test Entrepreneur');
    await user.click(declarationCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(udyamService.submitAadhaar).toHaveBeenCalledWith({
        txtadharno: '123456789012',
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
        submissionId: null,
      });
    });
  });

  it('should show OTP verification form after successful submission', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.submitAadhaar.mockResolvedValue({
      success: true,
      submissionId: 1,
      message: 'OTP sent successfully',
    });

    render(
      <AadhaarVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Aadhaar Number *')).toBeInTheDocument();
    });

    const aadhaarInput = screen.getByLabelText('Aadhaar Number *');
    const nameInput = screen.getByLabelText('Name of Entrepreneur *');
    const declarationCheckbox = screen.getByLabelText('Declaration/Agreement');
    const submitButton = screen.getByText('Validate & Generate OTP');

    await user.type(aadhaarInput, '123456789012');
    await user.type(nameInput, 'Test Entrepreneur');
    await user.click(declarationCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('OTP Verification')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter OTP')).toBeInTheDocument();
    });
  });

  it('should handle OTP verification', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.verifyOTP.mockResolvedValue({
      success: true,
      message: 'OTP verified successfully',
      nextStep: 2,
    });

    render(
      <AadhaarVerification
        formData={{ ...mockFormData, submissionId: 1 }}
        onComplete={mockOnComplete}
        submissionId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('OTP Verification')).toBeInTheDocument();
    });

    const otpInput = screen.getByLabelText('Enter OTP');
    const verifyButton = screen.getByText('Verify OTP');

    await user.type(otpInput, '123456');
    await user.click(verifyButton);

    await waitFor(() => {
      expect(udyamService.verifyOTP).toHaveBeenCalledWith({
        submissionId: 1,
        otp: '123456',
      });
    });
  });

  it('should display error messages for invalid data', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.submitAadhaar.mockRejectedValue(new Error('Invalid Aadhaar format'));

    render(
      <AadhaarVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Aadhaar Number *')).toBeInTheDocument();
    });

    const aadhaarInput = screen.getByLabelText('Aadhaar Number *');
    const nameInput = screen.getByLabelText('Name of Entrepreneur *');
    const declarationCheckbox = screen.getByLabelText('Declaration/Agreement');
    const submitButton = screen.getByText('Validate & Generate OTP');

    await user.type(aadhaarInput, '123'); // Invalid Aadhaar
    await user.type(nameInput, 'Test Entrepreneur');
    await user.click(declarationCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid Aadhaar format')).toBeInTheDocument();
    });
  });
});

describe('PANVerification Component', () => {
  const mockFormData = {
    txtPAN: '',
    ddlOrganisationType: '',
    txtPANHolderName: '',
    txtDOB: '',
    submissionId: 1,
    completed: false,
    nextStep: 2,
  };

  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful schema loading
    const { schemaService } = require('../api/schemaService');
    schemaService.getFormSchema.mockResolvedValue({
      step2Fields: [
        {
          name: 'ctl00$ContentPlaceHolder1$ddlOrganisationType',
          label: 'Type of Organisation',
          type: 'select',
          required: true,
          options: [
            { value: 'Proprietorship', label: 'Proprietorship' },
            { value: 'Partnership', label: 'Partnership' },
          ],
        },
        {
          name: 'ctl00$ContentPlaceHolder1$txtPAN',
          label: 'PAN',
          type: 'text',
          required: true,
          placeholder: 'ENTER PAN NUMBER',
        },
        {
          name: 'ctl00$ContentPlaceHolder1$txtPANHolderName',
          label: 'Name of PAN Holder',
          type: 'text',
          required: true,
          placeholder: 'Name as per PAN',
        },
        {
          name: 'ctl00$ContentPlaceHolder1$txtDOB',
          label: 'DOB or DOI as per PAN',
          type: 'date',
          required: true,
        },
      ],
    });
    
    schemaService.getValidationRules.mockResolvedValue({
      pan: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
    });
  });

  it('should render PAN verification form', async () => {
    render(
      <PANVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('PAN Verification')).toBeInTheDocument();
      expect(screen.getByLabelText('Type of Organisation *')).toBeInTheDocument();
      expect(screen.getByLabelText('PAN *')).toBeInTheDocument();
      expect(screen.getByLabelText('Name of PAN Holder *')).toBeInTheDocument();
      expect(screen.getByLabelText('DOB or DOI as per PAN *')).toBeInTheDocument();
    });
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.submitPAN.mockResolvedValue({
      success: true,
      message: 'Registration completed successfully!',
    });

    render(
      <PANVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('PAN *')).toBeInTheDocument();
    });

    const panInput = screen.getByLabelText('PAN *');
    const nameInput = screen.getByLabelText('Name of PAN Holder *');
    const dobInput = screen.getByLabelText('DOB or DOI as per PAN *');
    const organisationSelect = screen.getByLabelText('Type of Organisation *');
    const submitButton = screen.getByText('Submit PAN Details');

    await user.type(panInput, 'ABCDE1234F');
    await user.type(nameInput, 'Test PAN Holder');
    await user.type(dobInput, '1990-01-01');
    await user.selectOptions(organisationSelect, 'Proprietorship');
    await user.click(submitButton);

    await waitFor(() => {
      expect(udyamService.submitPAN).toHaveBeenCalledWith({
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '1990-01-01',
        submissionId: 1,
      });
    });
  });

  it('should display error messages for invalid data', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.submitPAN.mockRejectedValue(new Error('Invalid PAN format'));

    render(
      <PANVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('PAN *')).toBeInTheDocument();
    });

    const panInput = screen.getByLabelText('PAN *');
    const nameInput = screen.getByLabelText('Name of PAN Holder *');
    const dobInput = screen.getByLabelText('DOB or DOI as per PAN *');
    const organisationSelect = screen.getByLabelText('Type of Organisation *');
    const submitButton = screen.getByText('Submit PAN Details');

    await user.type(panInput, 'INVALID'); // Invalid PAN
    await user.type(nameInput, 'Test PAN Holder');
    await user.type(dobInput, '1990-01-01');
    await user.selectOptions(organisationSelect, 'Proprietorship');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid PAN format')).toBeInTheDocument();
    });
  });

  it('should show success message after successful submission', async () => {
    const user = userEvent.setup();
    const { udyamService } = require('../api/udyamService');
    
    udyamService.submitPAN.mockResolvedValue({
      success: true,
      message: 'Registration completed successfully!',
    });

    render(
      <PANVerification
        formData={mockFormData}
        onComplete={mockOnComplete}
        submissionId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('PAN *')).toBeInTheDocument();
    });

    const panInput = screen.getByLabelText('PAN *');
    const nameInput = screen.getByLabelText('Name of PAN Holder *');
    const dobInput = screen.getByLabelText('DOB or DOI as per PAN *');
    const organisationSelect = screen.getByLabelText('Type of Organisation *');
    const submitButton = screen.getByText('Submit PAN Details');

    await user.type(panInput, 'ABCDE1234F');
    await user.type(nameInput, 'Test PAN Holder');
    await user.type(dobInput, '1990-01-01');
    await user.selectOptions(organisationSelect, 'Proprietorship');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Registration completed successfully!')).toBeInTheDocument();
    });
  });
});

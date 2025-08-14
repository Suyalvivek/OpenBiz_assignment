// Common types for the Udyam Registration application

// Scraped form schema types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  pattern: string;
  maxLength: number;
  placeholder: string;
  step: number;
  validator: string;
  options?: FieldOption[];
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormSchema {
  step1Fields: FormField[];
  step2Fields: FormField[];
}

export interface ValidationRules {
  aadhaar: string;
  pan: string;
  mobile: string;
  email: string;
  pincode: string;
}

// Form data types
export interface FormData {
  // Step 1: Aadhaar Verification
  txtadharno?: string;
  txtownername?: string;
  chkDecarationA?: boolean;
  otpVerified?: boolean;
  
  // Step 2: PAN Verification
  txtPAN?: string;
  ddlOrganisationType?: string;
  txtPANHolderName?: string;
  txtDOB?: string;
  
  // Submission data
  submissionId?: number | null;
  completed?: boolean;
  nextStep?: number;
}

// API response types
export interface ApiResponse {
  success: boolean;
  submissionId?: number;
  nextStep?: number;
  error?: string;
  errors?: string[];
  message?: string;
  status?: string;
}

// Dynamic form field types
export interface DynamicFormField {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  step: number;
  options?: FieldOption[];
  validations?: FieldValidation[];
}

export interface FieldValidation {
  type: string;
  value?: string | number;
  message: string;
}

// Validation rule types
export interface ValidationRule {
  id: number;
  fieldName: string;
  type: string;
  value?: string | number;
  message: string;
}
// Common types for the Udyam Registration application

// Form data types
export interface FormData {
  // Step 1: Aadhaar Verification
  txtadharno?: string;
  txtownername?: string;
  chkDecarationA?: boolean;
  otpVerified?: boolean;
  
  // Step 2: PAN Verification
  txtPAN?: string;
  ddlPANType?: string;
  
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

// Form field types
export interface FormField {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  step: number;
  options?: FieldOption[];
  validations?: FieldValidation[];
}

export interface FieldOption {
  value: string;
  label: string;
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
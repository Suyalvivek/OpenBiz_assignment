// API service for Udyam Registration
import type { ApiResponse } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7777/api/v1';

interface AadhaarSubmitRequest {
  txtadharno: string;
  txtownername: string;
  chkDecarationA: boolean;
  submissionId?: number | null;
}

interface OTPVerifyRequest {
  submissionId: number | null;
  otp: string;
}

interface PANSubmitRequest {
  txtPAN: string;
  ddlOrganisationType: string;
  txtPANHolderName: string;
  txtDOB: string;
  submissionId: number | null;
}

interface FormFieldsResponse {
  success: boolean;
  fields?: any[];
  error?: string;
}

interface ValidationRulesResponse {
  success: boolean;
  rules?: any;
  error?: string;
}

export const udyamService = {
  submitAadhaar: async (data: AadhaarSubmitRequest): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit/step1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to submit Aadhaar details');
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting Aadhaar details';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify OTP');
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while verifying OTP';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  submitPAN: async (data: PANSubmitRequest): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit/step2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to submit PAN details');
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting PAN details';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getSubmissionStatus: async (submissionId: number): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/submission/${submissionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get submission status');
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while getting submission status';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getFormFields: async (step: number): Promise<FormFieldsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fields/${step}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get form fields');
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while getting form fields';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getValidationRules: async (): Promise<ValidationRulesResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/validation-rules`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get validation rules');
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while getting validation rules';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
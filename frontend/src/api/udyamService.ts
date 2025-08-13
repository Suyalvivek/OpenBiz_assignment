// API service for Udyam Registration
import type { ApiResponse } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Request types
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
  ddlPANType: string;
  submissionId: number | null;
}

// API functions
export const udyamService = {
  // Submit Aadhaar details (Step 1)
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while submitting Aadhaar details',
      };
    }
  },

  // Verify OTP
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while verifying OTP',
      };
    }
  },

  // Submit PAN details (Step 2)
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while submitting PAN details',
      };
    }
  },

  // Get submission status
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while getting submission status',
      };
    }
  },

  // Get form fields for a specific step
  getFormFields: async (step: number): Promise<any> => {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while getting form fields',
      };
    }
  },

  // Get validation rules
  getValidationRules: async (): Promise<any> => {
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred while getting validation rules',
      };
    }
  },
};
import { z } from 'zod';

// Dynamic validation schemas that can be updated with scraped validation rules
export const createAadhaarVerificationSchema = (validationRules?: { aadhaar?: string }) => {
  return z.object({
    txtadharno: z.string()
      .min(12, 'Aadhaar number must be 12 digits')
      .max(12, 'Aadhaar number must be 12 digits')
      .regex(
        validationRules?.aadhaar ? new RegExp(validationRules.aadhaar) : /^[2-9]{1}[0-9]{11}$/,
        'Invalid Aadhaar number format'
      ),
    txtownername: z.string().min(1, 'Name is required'),
    chkDecarationA: z.boolean().refine(val => val === true, {
      message: 'You must agree to the declaration',
    }),
  });
};

export const createPANVerificationSchema = (validationRules?: { pan?: string }) => {
  return z.object({
    txtPAN: z.string()
      .min(10, 'PAN number must be 10 characters')
      .max(10, 'PAN number must be 10 characters')
      .regex(
        validationRules?.pan ? new RegExp(validationRules.pan) : /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        'Invalid PAN format'
      ),
    ddlOrganisationType: z.string().min(1, 'Please select an organisation type'),
    txtPANHolderName: z.string().min(1, 'PAN holder name is required'),
    txtDOB: z.string().min(1, 'Date of birth is required'),
  });
};

// Default schemas (fallback)
export const AadhaarVerificationSchema = createAadhaarVerificationSchema();
export const PANVerificationSchema = createPANVerificationSchema();

// Type definitions
export interface AadhaarFormData extends z.infer<typeof AadhaarVerificationSchema> {}
export interface PANFormData extends z.infer<typeof PANVerificationSchema> {}

// Form validation schema
export const formValidationSchema = {
  step1: AadhaarVerificationSchema,
  step2: PANVerificationSchema,
};
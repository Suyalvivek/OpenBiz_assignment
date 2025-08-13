import { z } from 'zod';

// Aadhaar Verification Schema
export const AadhaarVerificationSchema = z.object({
  txtadharno: z.string()
    .min(12, 'Aadhaar number must be 12 digits')
    .max(12, 'Aadhaar number must be 12 digits')
    .regex(/^[2-9]{1}[0-9]{11}$/, 'Invalid Aadhaar number format'),
  txtownername: z.string().min(1, 'Name is required'),
  chkDecarationA: z.boolean().refine(val => val === true, {
    message: 'You must agree to the declaration',
  }),
});

// PAN Verification Schema
export const PANVerificationSchema = z.object({
  txtPAN: z.string()
    .min(10, 'PAN number must be 10 characters')
    .max(10, 'PAN number must be 10 characters')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  ddlPANType: z.enum(['Individual', 'Company', 'Firm', 'Others'], {
    errorMap: () => ({ message: 'Please select a PAN type' }),
  }),
});

// Type definitions
export interface AadhaarFormData extends z.infer<typeof AadhaarVerificationSchema> {}
export interface PANFormData extends z.infer<typeof PANVerificationSchema> {}

// Form validation schema
export const formValidationSchema = {
  step1: AadhaarVerificationSchema,
  step2: PANVerificationSchema,
};
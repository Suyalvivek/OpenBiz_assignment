import { z } from 'zod';
import { AadhaarVerificationSchema, PANVerificationSchema } from './schemas';

// Type definitions
export interface AadhaarFormData extends z.infer<typeof AadhaarVerificationSchema> {}
export interface PANFormData extends z.infer<typeof PANVerificationSchema> {}
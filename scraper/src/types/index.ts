/**
 * Type definitions for the scraper
 */

/**
 * Represents a form field in the Udyam registration form
 */
export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  pattern?: string;
  validator?: string;
  maxLength?: number;
  placeholder?: string;
  options?: string[]; // For select dropdowns
  step: number; // Track which step this field belongs to
}

/**
 * Represents a UI element in the Udyam registration form
 */
export interface UIElement {
  selector: string;
  text: string;
  type: 'button' | 'link' | 'text' | 'error';
  action?: string;
}

/**
 * Represents the complete scraped data from the Udyam registration form
 */
export interface ScrapedData {
  fields: FormField[];
  uiElements: UIElement[];
  validationRules: ValidationRules;
  steps: {
    step1: FormField[];
    step2: FormField[];
  };
}

/**
 * Represents validation rules for form fields
 */
export interface ValidationRules {
  [key: string]: string;
}

/**
 * Represents the simplified schema for frontend use
 */
export interface FrontendSchema {
  step1Fields: FormField[];
  step2Fields: FormField[];
  validationRules: ValidationRules;
}
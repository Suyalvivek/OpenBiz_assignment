/**
 * Service for extracting form fields and elements
 */

import { Page } from 'puppeteer';
import { FormField, UIElement, ValidationRules } from '../types';

/**
 * Extract form fields from the page
 * @param page Puppeteer page instance
 * @param step Form step number
 * @returns Array of form fields
 */
export async function extractFormFields(page: Page, step: number): Promise<FormField[]> {
  return await page.evaluate((stepNumber: number) => {
    const fields: FormField[] = [];
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach((element) => {
      const htmlElement = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      let label = 'No label';
      let required = htmlElement.hasAttribute('required');
      
      // Find associated label
      const labelElement = document.querySelector(`label[for="${htmlElement.id}"]`);
      if (labelElement) {
        label = labelElement.textContent?.trim() || 'No label';
      } else {
        // Try to find label by proximity or common patterns
        const prevElement = htmlElement.previousElementSibling;
        if (prevElement && (prevElement.tagName === 'LABEL' || prevElement.textContent)) {
          label = prevElement.textContent?.trim() || 'No label';
        }
      }

      // Enhanced label detection based on IDs
      if (htmlElement.id.includes('txtadharno') || htmlElement.id.includes('adhar')) {
        label = 'Aadhaar Number';
        required = true;
      } else if (htmlElement.id.includes('txtownername') || htmlElement.id.includes('owner')) {
        label = 'Name of Entrepreneur';
        required = true;
      } else if (htmlElement.id.includes('txtemail')) {
        label = 'Email';
      } else if (htmlElement.id.includes('txtmobile')) {
        label = 'Mobile Number';
      } else if (htmlElement.id.includes('otp')) {
        label = 'OTP';
        required = true;
      } else if (htmlElement.id.includes('pan') || htmlElement.id.includes('PAN')) {
        label = 'PAN Number';
        required = true;
      } else if (htmlElement.id.includes('Declaration') || htmlElement.id.includes('chk')) {
        label = 'Declaration/Agreement';
      }

      // Get options for select elements
      let options: string[] = [];
      if (htmlElement instanceof HTMLSelectElement) {
        options = Array.from(htmlElement.options).map(option => option.text);
      }

      const field: FormField = {
        name: htmlElement.name || htmlElement.id,
        label: label,
        type: htmlElement.type || htmlElement.tagName.toLowerCase(),
        required: required,
        pattern: htmlElement instanceof HTMLInputElement ? htmlElement.pattern : undefined,
        maxLength: htmlElement instanceof HTMLInputElement ? htmlElement.maxLength : undefined,
        placeholder: htmlElement instanceof HTMLInputElement ? htmlElement.placeholder : undefined,
        options: options.length > 0 ? options : undefined,
        step: stepNumber,
        validator: ''
      };

      fields.push(field);
    });

    return fields;
  }, step);
}

/**
 * Extract UI elements from the page
 * @param page Puppeteer page instance
 * @returns Array of UI elements
 */
export async function extractUIElements(page: Page): Promise<UIElement[]> {
  return await page.evaluate(() => {
    const elements: UIElement[] = [];
    
    // Extract buttons
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
    buttons.forEach(button => {
      const htmlButton = button as HTMLButtonElement | HTMLInputElement;
      elements.push({
        selector: `#${htmlButton.id}` || htmlButton.tagName,
        text: htmlButton.textContent?.trim() || htmlButton.value || 'Button',
        type: 'button',
        action: htmlButton.onclick?.toString() || 'click'
      });
    });

    // Extract validation error containers
    const validators = document.querySelectorAll('[id*="Validator"], .validation-error, .error-message');
    validators.forEach(validator => {
      elements.push({
        selector: `#${validator.id}`,
        text: validator.textContent?.trim() || 'Validation Error',
        type: 'error'
      });
    });

    return elements;
  });
}

/**
 * Extract validation rules from the page
 * @param page Puppeteer page instance
 * @returns Validation rules object
 */
export async function extractValidationRules(page: Page): Promise<ValidationRules> {
  return await page.evaluate(() => {
    const rules: Record<string, string> = {};
    
    // Common validation patterns for Indian forms
    rules.aadhaar = '^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$|^[2-9]{1}[0-9]{11}$';
    rules.pan = '^[A-Z]{5}[0-9]{4}[A-Z]{1}$';
    rules.mobile = '^[6-9]\\d{9}$';
    rules.email = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    rules.pincode = '^[1-9][0-9]{5}$';

    // Try to extract any client-side validation rules
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.textContent || '';
      
      // Look for regex patterns in JavaScript
      const regexMatches = content.match(/\/\^.*\$\/g?/g);
      if (regexMatches) {
        regexMatches.forEach(match => {
          console.log('Found regex pattern:', match);
        });
      }
    });

    return rules;
  });
}
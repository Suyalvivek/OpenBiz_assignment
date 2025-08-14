import type { FormSchema, ValidationRules } from '../types/types';

class SchemaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:7777/api/v1';
  }

  async getFormSchema(): Promise<FormSchema> {
    try {
      const response = await fetch(`${this.baseUrl}/schema/form-schema`);
      if (!response.ok) {
        throw new Error(`Failed to fetch form schema: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return this.getFallbackSchema();
    }
  }

  async getValidationRules(): Promise<ValidationRules> {
    try {
      const response = await fetch(`${this.baseUrl}/schema/validation-rules`);
      if (!response.ok) {
        throw new Error(`Failed to fetch validation rules: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return this.getFallbackValidationRules();
    }
  }

  private getFallbackSchema(): FormSchema {
    return {
      step1Fields: [
        {
          name: "ctl00$ContentPlaceHolder1$txtadharno",
          label: "Aadhaar Number",
          type: "text",
          required: true,
          pattern: "",
          maxLength: 12,
          placeholder: "Your Aadhaar No",
          step: 1,
          validator: ""
        },
        {
          name: "ctl00$ContentPlaceHolder1$txtownername",
          label: "Name of Entrepreneur",
          type: "text",
          required: true,
          pattern: "",
          maxLength: 100,
          placeholder: "Name as per Aadhaar",
          step: 1,
          validator: ""
        },
        {
          name: "ctl00$ContentPlaceHolder1$chkDecarationA",
          label: "Declaration/Agreement",
          type: "checkbox",
          required: false,
          pattern: "",
          maxLength: -1,
          placeholder: "",
          step: 1,
          validator: ""
        }
      ],
      step2Fields: [
        {
          name: "ctl00$ContentPlaceHolder1$ddlOrganisationType",
          label: "Type of Organisation",
          type: "select",
          required: true,
          pattern: "",
          maxLength: -1,
          placeholder: "Select Organisation Type",
          step: 2,
          validator: "",
          options: [
            { value: "Proprietorship", label: "Proprietorship" },
            { value: "Partnership", label: "Partnership" },
            { value: "Hindu Undivided Family", label: "Hindu Undivided Family" },
            { value: "Private Limited Company", label: "Private Limited Company" },
            { value: "Public Limited Company", label: "Public Limited Company" },
            { value: "Limited Liability Partnership", label: "Limited Liability Partnership" },
            { value: "Cooperative Society", label: "Cooperative Society" },
            { value: "Society", label: "Society" },
            { value: "Trust", label: "Trust" }
          ]
        },
        {
          name: "ctl00$ContentPlaceHolder1$txtPAN",
          label: "PAN Number",
          type: "text",
          required: true,
          pattern: "",
          maxLength: 10,
          placeholder: "ENTER PAN NUMBER",
          step: 2,
          validator: ""
        },
        {
          name: "ctl00$ContentPlaceHolder1$txtPANHolderName",
          label: "Name of PAN Holder",
          type: "text",
          required: true,
          pattern: "",
          maxLength: 100,
          placeholder: "Name as per PAN",
          step: 2,
          validator: ""
        },
        {
          name: "ctl00$ContentPlaceHolder1$txtDOB",
          label: "DOB or DOI as per PAN",
          type: "date",
          required: true,
          pattern: "",
          maxLength: -1,
          placeholder: "DD/MM/YYYY",
          step: 2,
          validator: ""
        }
      ]
    };
  }

  private getFallbackValidationRules(): ValidationRules {
    return {
      aadhaar: "^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$|^[2-9]{1}[0-9]{11}$",
      pan: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
      mobile: "^[6-9]\\d{9}$",
      email: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      pincode: "^[1-9][0-9]{5}$"
    };
  }
}

export const schemaService = new SchemaService();

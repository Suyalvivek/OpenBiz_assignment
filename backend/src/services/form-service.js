import prisma from '../utils/db/connection.js';

/**
 * Get all form fields
 */
export const getAllFields = async () => {
  return prisma.formField.findMany({
    orderBy: [{ step: 'asc' }, { id: 'asc' }]
  });
};

/**
 * Get form fields by step
 */
export const getFieldsByStep = async (step) => {
  const parsedStep = parseInt(step);
  if (isNaN(parsedStep) || parsedStep < 1 || parsedStep > 2) {
    throw new Error('Invalid step number');
  }
  return prisma.formField.findMany({
    where: { step: parsedStep },
    orderBy: { id: 'asc' }
  });
};

/**
 * Get all validation rules
 */
export const getValidationRules = async () => {
  const rules = await prisma.validationRule.findMany();
  return rules.reduce((acc, rule) => {
    acc[rule.name] = rule.pattern;
    return acc;
  }, {});
};

/**
 * Validate field data against rules
 */
export const validateFields = async (data, step) => {
  const errors = [];

  // Get validation rules
  const validationRules = await getValidationRules();

  // Get required fields for the step
  const stepFields = await getFieldsByStep(step);

  // Validate required fields
  for (const field of stepFields) {
    const fieldName = field.name.includes('$') ? field.name.split('$').pop() || field.name : field.name;

    if (field.required && !data[fieldName]) {
      errors.push(`${field.label} is required`);
    }
  }

  // Step-specific validations
  if (step === 1) {
    // Validate Aadhaar format
    if (data.txtadharno && validationRules.aadhaar) {
      if (!new RegExp(validationRules.aadhaar).test(data.txtadharno)) {
        errors.push('Invalid Aadhaar Number format');
      }
    }

    // Validate declaration checkbox
    if (!data.chkDecarationA) {
      errors.push('You must agree to the declaration');
    }
  } else if (step === 2) {
    // Validate PAN format
    if (data.txtPAN && validationRules.pan) {
      if (!new RegExp(validationRules.pan).test(data.txtPAN)) {
        errors.push('Invalid PAN format');
      }
    }

    // Validate PAN Type
    if (data.ddlPANType && !['Individual', 'Company', 'Firm', 'Others'].includes(data.ddlPANType)) {
      errors.push('Invalid PAN Type');
    }
  }

  return errors;
};
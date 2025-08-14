// Mock the form-service module
const mockValidateFields = (data, step, validationRules) => {
  const errors = [];
  
  if (step === 1) {
    // Aadhaar validation
    if (!data.txtadharno || data.txtadharno.length !== 12) {
      errors.push('Invalid Aadhaar format');
    }
    if (!data.txtownername || data.txtownername.trim() === '') {
      errors.push('Name of Entrepreneur is required');
    }
  } else if (step === 2) {
    // PAN validation
    if (!data.txtPAN || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.txtPAN)) {
      errors.push('Invalid PAN format');
    }
    if (!data.ddlOrganisationType || !['Proprietorship', 'Partnership', 'Hindu Undivided Family', 'Private Limited Company', 'Public Limited Company', 'Limited Liability Partnership', 'Cooperative Society', 'Society', 'Trust'].includes(data.ddlOrganisationType)) {
      errors.push('Invalid Organisation Type');
    }
    if (!data.txtPANHolderName || data.txtPANHolderName.trim() === '') {
      errors.push('PAN Holder Name is required');
    }
    if (!data.txtDOB || data.txtDOB.trim() === '') {
      errors.push('Date of Birth is required');
    }
  }
  
  return errors;
};

// Mock the validation rules
const mockValidationRules = {
  aadhaar: '^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$|^[2-9]{1}[0-9]{11}$',
  pan: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
  mobile: '^[6-9]\\d{9}$',
  email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  pincode: '^[1-9][0-9]{5}$'
};

describe('Form Validation Logic', () => {
  describe('Step 1 - Aadhaar Verification', () => {
    it('should pass validation with valid Aadhaar data', async () => {
      const validData = {
        txtadharno: '123456789012',
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
      };

      const errors = await validateFields(validData, 1, mockValidationRules);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid Aadhaar format', async () => {
      const invalidData = {
        txtadharno: '123', // Too short
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
      };

      const errors = await validateFields(invalidData, 1, mockValidationRules);
      expect(errors).toContain('Invalid Aadhaar format');
    });

    it('should fail validation with Aadhaar starting with 0 or 1', async () => {
      const invalidData = {
        txtadharno: '012345678901', // Starts with 0
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
      };

      const errors = await validateFields(invalidData, 1, mockValidationRules);
      expect(errors).toContain('Invalid Aadhaar format');
    });

    it('should fail validation with empty name', async () => {
      const invalidData = {
        txtadharno: '123456789012',
        txtownername: '', // Empty name
        chkDecarationA: true,
      };

      const errors = await validateFields(invalidData, 1, mockValidationRules);
      expect(errors).toContain('Name of Entrepreneur is required');
    });

    it('should fail validation with whitespace-only name', async () => {
      const invalidData = {
        txtadharno: '123456789012',
        txtownername: '   ', // Only whitespace
        chkDecarationA: true,
      };

      const errors = await validateFields(invalidData, 1, mockValidationRules);
      expect(errors).toContain('Name of Entrepreneur is required');
    });

    it('should pass validation with Aadhaar in spaced format', async () => {
      const validData = {
        txtadharno: '1234 5678 9012',
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
      };

      const errors = await validateFields(validData, 1, mockValidationRules);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      const incompleteData = {
        txtadharno: '123456789012',
        // Missing txtownername and chkDecarationA
      };

      const errors = await validateFields(incompleteData, 1, mockValidationRules);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Name of Entrepreneur is required');
    });
  });

  describe('Step 2 - PAN Verification', () => {
    it('should pass validation with valid PAN data', async () => {
      const validData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(validData, 2, mockValidationRules);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid PAN format', async () => {
      const invalidData = {
        txtPAN: 'INVALID', // Invalid PAN format
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('Invalid PAN format');
    });

    it('should fail validation with PAN not following pattern', async () => {
      const invalidData = {
        txtPAN: 'ABCD12345F', // Wrong pattern
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('Invalid PAN format');
    });

    it('should fail validation with invalid organisation type', async () => {
      const invalidData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'InvalidType', // Invalid type
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('Invalid Organisation Type');
    });

    it('should pass validation with all valid organisation types', async () => {
      const validOrganisationTypes = [
        'Proprietorship',
        'Partnership',
        'Hindu Undivided Family',
        'Private Limited Company',
        'Public Limited Company',
        'Limited Liability Partnership',
        'Cooperative Society',
        'Society',
        'Trust'
      ];

      for (const orgType of validOrganisationTypes) {
        const validData = {
          txtPAN: 'ABCDE1234F',
          ddlOrganisationType: orgType,
          txtPANHolderName: 'Test PAN Holder',
          txtDOB: '1990-01-01',
        };

        const errors = await validateFields(validData, 2, mockValidationRules);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation with empty PAN holder name', async () => {
      const invalidData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: '', // Empty name
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('PAN Holder Name is required');
    });

    it('should fail validation with whitespace-only PAN holder name', async () => {
      const invalidData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: '   ', // Only whitespace
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('PAN Holder Name is required');
    });

    it('should fail validation with empty DOB', async () => {
      const invalidData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '', // Empty DOB
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('Date of Birth is required');
    });

    it('should fail validation with whitespace-only DOB', async () => {
      const invalidData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '   ', // Only whitespace
      };

      const errors = await validateFields(invalidData, 2, mockValidationRules);
      expect(errors).toContain('Date of Birth is required');
    });

    it('should fail validation with missing required fields', async () => {
      const incompleteData = {
        txtPAN: 'ABCDE1234F',
        // Missing other required fields
      };

      const errors = await validateFields(incompleteData, 2, mockValidationRules);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('PAN Holder Name is required');
      expect(errors).toContain('Date of Birth is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null validation rules gracefully', async () => {
      const validData = {
        txtadharno: '123456789012',
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
      };

      const errors = await validateFields(validData, 1, null);
      // Should still validate basic requirements even without regex patterns
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined validation rules gracefully', async () => {
      const validData = {
        txtPAN: 'ABCDE1234F',
        ddlOrganisationType: 'Proprietorship',
        txtPANHolderName: 'Test PAN Holder',
        txtDOB: '1990-01-01',
      };

      const errors = await validateFields(validData, 2, undefined);
      // Should still validate basic requirements even without regex patterns
      expect(errors).toHaveLength(0);
    });

    it('should handle invalid step number', async () => {
      const validData = {
        txtadharno: '123456789012',
        txtownername: 'Test Entrepreneur',
        chkDecarationA: true,
      };

      const errors = await validateFields(validData, 999, mockValidationRules);
      // Should return empty array for unknown step
      expect(errors).toHaveLength(0);
    });

    it('should handle empty data object', async () => {
      const emptyData = {};

      const errors = await validateFields(emptyData, 1, mockValidationRules);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Name of Entrepreneur is required');
    });

    it('should handle null data object', async () => {
      const errors = await validateFields(null, 1, mockValidationRules);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Rule Patterns', () => {
    it('should validate Aadhaar pattern correctly', () => {
      const aadhaarPattern = new RegExp(mockValidationRules.aadhaar);
      
      // Valid patterns
      expect(aadhaarPattern.test('123456789012')).toBe(true);
      expect(aadhaarPattern.test('1234 5678 9012')).toBe(true);
      
      // Invalid patterns
      expect(aadhaarPattern.test('012345678901')).toBe(false); // Starts with 0
      expect(aadhaarPattern.test('12345678901')).toBe(false);  // Too short
      expect(aadhaarPattern.test('1234567890123')).toBe(false); // Too long
    });

    it('should validate PAN pattern correctly', () => {
      const panPattern = new RegExp(mockValidationRules.pan);
      
      // Valid patterns
      expect(panPattern.test('ABCDE1234F')).toBe(true);
      expect(panPattern.test('XYZAB5678C')).toBe(true);
      
      // Invalid patterns
      expect(panPattern.test('ABCD12345F')).toBe(false); // Wrong pattern
      expect(panPattern.test('ABCDE1234')).toBe(false);  // Too short
      expect(panPattern.test('ABCDE12345F')).toBe(false); // Too long
      expect(panPattern.test('12345ABCDE')).toBe(false); // Numbers first
    });
  });
});

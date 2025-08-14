import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Import the app without starting the server
import formRoutes from '../src/api/v1/form-routes.js';
import submissionRoutes from '../src/api/v1/submission-routes.js';
import schemaRoutes from '../src/api/v1/schema-routes.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1', formRoutes);
app.use('/api/v1', submissionRoutes);
app.use('/api/v1/schema', schemaRoutes);

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    udyamSubmission: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    formField: {
      findMany: jest.fn(),
    },
  })),
}));

describe('API Endpoints', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('GET /api/v1/schema/form-schema', () => {
    it('should return form schema successfully', async () => {
      const response = await request(app)
        .get('/api/v1/schema/form-schema')
        .expect(200);

      expect(response.body).toHaveProperty('step1Fields');
      expect(response.body).toHaveProperty('step2Fields');
      expect(response.body).toHaveProperty('validationRules');
      expect(Array.isArray(response.body.step1Fields)).toBe(true);
      expect(Array.isArray(response.body.step2Fields)).toBe(true);
    });

    it('should handle schema file not found', async () => {
      // Mock fs.readFileSync to throw error
      jest.doMock('fs', () => ({
        readFileSync: jest.fn().mockImplementation(() => {
          throw new Error('File not found');
        }),
      }));

      const response = await request(app)
        .get('/api/v1/schema/form-schema')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to load form schema');
    });
  });

  describe('GET /api/v1/schema/validation-rules', () => {
    it('should return validation rules successfully', async () => {
      const response = await request(app)
        .get('/api/v1/schema/validation-rules')
        .expect(200);

      expect(response.body).toHaveProperty('aadhaar');
      expect(response.body).toHaveProperty('pan');
      expect(response.body).toHaveProperty('mobile');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('pincode');
    });
  });

  describe('POST /api/v1/submit/step1', () => {
    const validAadhaarData = {
      txtadharno: '123456789012',
      txtownername: 'Test Entrepreneur',
      chkDecarationA: true,
    };

    it('should create submission successfully with valid data', async () => {
      mockPrisma.udyamSubmission.create.mockResolvedValue({
        id: 1,
        ...validAadhaarData,
        status: 'DRAFT',
        currentStep: 1,
      });

      const response = await request(app)
        .post('/api/v1/submit/step1')
        .send(validAadhaarData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('submissionId');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid Aadhaar number', async () => {
      const invalidData = {
        ...validAadhaarData,
        txtadharno: '123', // Invalid Aadhaar
      };

      const response = await request(app)
        .post('/api/v1/submit/step1')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Invalid Aadhaar format');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        txtadharno: '123456789012',
        // Missing txtownername and chkDecarationA
      };

      const response = await request(app)
        .post('/api/v1/submit/step1')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for empty name', async () => {
      const invalidData = {
        ...validAadhaarData,
        txtownername: '', // Empty name
      };

      const response = await request(app)
        .post('/api/v1/submit/step1')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.errors).toContain('Name of Entrepreneur is required');
    });
  });

  describe('POST /api/v1/submit/verify-otp', () => {
    const validOtpData = {
      submissionId: 1,
      otp: '123456',
    };

    it('should verify OTP successfully', async () => {
      mockPrisma.udyamSubmission.findUnique.mockResolvedValue({
        id: 1,
        otp: '123456',
        status: 'DRAFT',
      });

      mockPrisma.udyamSubmission.update.mockResolvedValue({
        id: 1,
        otpVerified: true,
        status: 'OTP_VERIFIED',
        currentStep: 2,
      });

      const response = await request(app)
        .post('/api/v1/submit/verify-otp')
        .send(validOtpData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('nextStep', 2);
    });

    it('should return 400 for invalid OTP', async () => {
      mockPrisma.udyamSubmission.findUnique.mockResolvedValue({
        id: 1,
        otp: '654321', // Different OTP
      });

      const response = await request(app)
        .post('/api/v1/submit/verify-otp')
        .send(validOtpData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent submission', async () => {
      mockPrisma.udyamSubmission.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/submit/verify-otp')
        .send(validOtpData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/submit/step2', () => {
    const validPanData = {
      submissionId: 1,
      txtPAN: 'ABCDE1234F',
      ddlOrganisationType: 'Proprietorship',
      txtPANHolderName: 'Test PAN Holder',
      txtDOB: '1990-01-01',
    };

    it('should complete registration successfully with valid PAN data', async () => {
      mockPrisma.udyamSubmission.findUnique.mockResolvedValue({
        id: 1,
        status: 'OTP_VERIFIED',
        currentStep: 2,
      });

      mockPrisma.udyamSubmission.update.mockResolvedValue({
        id: 1,
        ...validPanData,
        panVerified: true,
        status: 'COMPLETED',
      });

      const response = await request(app)
        .post('/api/v1/submit/step2')
        .send(validPanData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Registration completed successfully');
    });

    it('should return 400 for invalid PAN format', async () => {
      const invalidData = {
        ...validPanData,
        txtPAN: 'INVALID', // Invalid PAN format
      };

      const response = await request(app)
        .post('/api/v1/submit/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Invalid PAN format');
    });

    it('should return 400 for invalid organisation type', async () => {
      const invalidData = {
        ...validPanData,
        ddlOrganisationType: 'InvalidType', // Invalid organisation type
      };

      const response = await request(app)
        .post('/api/v1/submit/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Invalid Organisation Type');
    });

    it('should return 400 for missing PAN holder name', async () => {
      const invalidData = {
        ...validPanData,
        txtPANHolderName: '', // Empty name
      };

      const response = await request(app)
        .post('/api/v1/submit/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('PAN Holder Name is required');
    });

    it('should return 400 for missing DOB', async () => {
      const invalidData = {
        ...validPanData,
        txtDOB: '', // Empty DOB
      };

      const response = await request(app)
        .post('/api/v1/submit/step2')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Date of Birth is required');
    });

    it('should return 404 for non-existent submission', async () => {
      mockPrisma.udyamSubmission.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/submit/step2')
        .send(validPanData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

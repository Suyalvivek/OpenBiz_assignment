import prisma from '../utils/db/connection.js';
import { validateFields } from './form-service.js';

/**
 * Get submission by ID
 */
export const getSubmission = async (id) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error('Invalid submission ID');
  }

  const submission = await prisma.udyamSubmission.findUnique({
    where: { id: parsedId }
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  return submission;
};

/**
 * Process Aadhaar verification (Step 1)
 */
export const processAadhaarVerification = async (data) => {
  // Validate the data
  const errors = await validateFields(data, 1);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Create or update submission
  let submission;
  if (data.submissionId) {
    submission = await prisma.udyamSubmission.update({
      where: { id: parseInt(data.submissionId) },
      data: {
        aadhaar: data.txtadharno,
        name: data.txtownername,
        declaration: data.chkDecarationA === 'on' || data.chkDecarationA === true,
        currentStep: 1,
        status: 'DRAFT'
      }
    });
  } else {
    submission = await prisma.udyamSubmission.create({
      data: {
        aadhaar: data.txtadharno,
        name: data.txtownername,
        declaration: data.chkDecarationA === 'on' || data.chkDecarationA === true,
        currentStep: 1,
        status: 'DRAFT'
      }
    });
  }

  // In a real app, we would send an OTP to the user's registered mobile
  // For demo purposes, we'll use a fixed OTP
  const demoOtp = '123456';

  return {
    success: true,
    message: 'Aadhaar details saved, OTP sent',
    submissionId: submission.id,
    demoOtp // In a real app, we would NOT send this to the client
  };
};

/**
 * Verify OTP
 */
export const verifyOTP = async (data) => {
  const { submissionId, otp } = data;

  if (!submissionId || !otp) {
    throw new Error('Submission ID and OTP are required');
  }

  // In a real app, we would verify the OTP against what was sent
  // For demo purposes, we'll accept any 6-digit OTP
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    throw new Error('Invalid OTP format');
  }

  // Update submission with OTP verification status
  const submission = await prisma.udyamSubmission.update({
    where: { id: parseInt(submissionId) },
    data: {
      otp,
      otpVerified: true,
      currentStep: 2 // Move to next step
    }
  });

  return {
    success: true,
    message: 'OTP verified successfully',
    submissionId: submission.id,
    nextStep: 2
  };
};

/**
 * Process PAN verification (Step 2)
 */
export const processPANVerification = async (data) => {
  // Validate the data
  const errors = await validateFields(data, 2);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Update submission with new PAN fields
  const submission = await prisma.udyamSubmission.update({
    where: { id: parseInt(data.submissionId) },
    data: {
      pan: data.txtPAN,
      organisationType: data.ddlOrganisationType,
      panHolderName: data.txtPANHolderName,
      panDOB: data.txtDOB,
      panVerified: true,
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });

  return {
    success: true,
    message: 'Registration completed successfully',
    submission
  };
};
import { 
  getSubmission as getSubmissionService,
  processAadhaarVerification as processAadhaarVerificationService,
  verifyOTP as verifyOTPService,
  processPANVerification as processPANVerificationService
} from '../services/submission-service.js';

export const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await getSubmissionService(id);
    res.json(submission);
  } catch (error) {
    console.error(`Error fetching submission ${req.params.id}:`, error);
    res.status(error.message === 'Submission not found' ? 404 : 500)
      .json({ error: error.message || 'Failed to fetch submission' });
  }
};

/**
 * Process Aadhaar verification (Step 1)
 */
export const processAadhaarVerification = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const result = await processAadhaarVerificationService(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error processing Aadhaar verification:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process Aadhaar verification' });
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const result = await verifyOTPService(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to verify OTP' });
  }
};

/**
 * Process PAN verification (Step 2)
 */
export const processPANVerification = async (req, res) => {
  try {
    const result = await processPANVerificationService(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error processing PAN verification:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process PAN verification' });
  }
};
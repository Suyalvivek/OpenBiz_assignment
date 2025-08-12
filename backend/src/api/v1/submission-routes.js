import express from 'express';
import { getSubmission, processAadhaarVerification, verifyOTP, processPANVerification } from '../../controllers/submission-controller.js';

const router = express.Router();

// Get submission by ID
router.get('/:id', getSubmission);

// Process Aadhaar verification (Step 1)
router.post('/step1', processAadhaarVerification);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Process PAN verification (Step 2)
router.post('/step2', processPANVerification);

export default router;
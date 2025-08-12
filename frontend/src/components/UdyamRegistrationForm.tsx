import { useState, useEffect } from 'react';
import AadhaarVerification from './steps/AadhaarVerification';
import PANVerification from './steps/PANVerification';
import ProgressTracker from './common/ProgressTracker';
import type { FormData } from '../types';
import '../styles/UdyamRegistrationForm.css';

const UdyamRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Aadhaar Verification
    txtadharno: '',
    txtownername: '',
    chkDecarationA: false,
    otpVerified: false,
    
    // Step 2: PAN Verification
    txtPAN: '',
    ddlPANType: '',
    
    submissionId: null,
    completed: false,
    nextStep: 1
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleStepComplete = (step: number, data: Partial<FormData>) => {
    updateFormData(data);
    if (data.submissionId) {
      setSubmissionId(data.submissionId);
    }
    if (data.nextStep) {
      setCurrentStep(data.nextStep);
    }
  };

  return (
    <div className="udyam-registration-container">
      <header className="udyam-header">
        <div className="logo-container">
          <img src="/msme-logo.png" alt="MSME Logo" className="msme-logo" />
          <div className="ministry-text">
            <h3>सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय</h3>
            <h3>Ministry of Micro, Small & Medium Enterprises</h3>
          </div>
        </div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">NIC Code</a>
          <a href="#">Useful Documents</a>
          <a href="#">Print / Verify</a>
          <a href="#">Update Details</a>
          <a href="#">Login</a>
        </div>
      </header>

      <div className="form-title">
        <h2>UDYAM REGISTRATION FORM - For New Enterprise who are not Registered yet as MSME</h2>
      </div>

      <ProgressTracker currentStep={currentStep} totalSteps={2} />

      <div className="form-container">
        {currentStep === 1 && (
          <AadhaarVerification 
            formData={formData} 
            onComplete={(data) => handleStepComplete(1, data)} 
            submissionId={submissionId}
          />
        )}
        
        {currentStep === 2 && (
          <PANVerification 
            formData={formData} 
            onComplete={(data) => handleStepComplete(2, data)} 
            submissionId={submissionId}
          />
        )}
      </div>

      <footer className="udyam-footer">
        <p>Activities (NIC codes) not covered under MSMED Act, 2006 for Udyam Registration</p>
      </footer>
    </div>
  );
};

export default UdyamRegistrationForm;
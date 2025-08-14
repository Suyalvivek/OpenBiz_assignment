import { useState } from 'react';
import AadhaarVerification from './steps/AadhaarVerification';
import PANVerification from './steps/PANVerification';
import ProgressTracker from './common/ProgressTracker';
import type { FormData } from '../types/types';
import '../styles/UdyamRegistrationForm.css';

/**
 * UdyamRegistrationForm Component
 * 
 * Main container component for the Udyam registration process.
 * Manages the multi-step form flow and state between steps.
 * 
 * Features:
 * - Step-based navigation
 * - Form data persistence across steps
 * - Progress tracking
 * - Session management
 */
const UdyamRegistrationForm = () => {
  // State management
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
    ddlOrganisationType: '',
    txtPANHolderName: '',
    txtDOB: '',
    
    // Submission data
    submissionId: null,
    completed: false,
    nextStep: 1
  });

  /**
   * Updates form data with new values
   * Merges new data with existing data
   */
  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  /**
   * Handles completion of a step
   * Updates form data and moves to next step if applicable
   */
  const handleStepComplete = (step: number, data: Partial<FormData>) => {
    updateFormData(data);
    
    // Update submission ID if provided
    if (data.submissionId) {
      setSubmissionId(data.submissionId);
    }
    
    // Move to next step if specified
    if (data.nextStep) {
      setCurrentStep(data.nextStep);
    }
    
    // If registration is completed, show completion state
    if (data.completed) {
      // Stay on current step but show success state
      // The PANVerification component will handle the success rendering
    }
  };

  /**
   * Renders the current step component
   */
  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      onComplete: (data: Partial<FormData>) => handleStepComplete(currentStep, data),
      submissionId
    };

    switch (currentStep) {
      case 1:
        return <AadhaarVerification {...commonProps} />;
      case 2:
        return <PANVerification {...commonProps} />;
      default:
        return <div>Invalid step</div>;
    }
  };

  // Show completion banner if registration is completed
  const showCompletionBanner = formData.completed;

  return (
    <div className="udyam-registration-container">
      {/* Header section */}
      <header className="udyam-header">
        <div className="logo-container">
          <img src="/msme-logo.png" alt="MSME Logo" className="msme-logo" />
          <div className="ministry-text">
            <h3>सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय</h3>
            <h3>Ministry of Micro, Small & Medium Enterprises</h3>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className="nav-links">
          <a href="#">Home</a>
          <a href="#">NIC Code</a>
          <a href="#">Useful Documents</a>
          <a href="#">Print / Verify</a>
          <a href="#">Update Details</a>
          <a href="#">Login</a>
        </nav>
      </header>

      {/* Form title */}
      <div className="form-title">
        <h2>UDYAM REGISTRATION FORM - For New Enterprise who are not Registered yet as MSME</h2>
      </div>

      {/* Progress tracker - hide when completed */}
      {!showCompletionBanner && (
        <ProgressTracker currentStep={currentStep} totalSteps={2} />
      )}

      {/* Completion banner */}
      {showCompletionBanner && (
        <div className="completion-banner">
          <div className="banner-content">
            <span className="banner-icon">✅</span>
            <span className="banner-text">Registration Completed Successfully!</span>
          </div>
        </div>
      )}

      {/* Form container */}
      <div className="form-container">
        {renderCurrentStep()}
      </div>

      {/* Footer */}
      <footer className="udyam-footer">
        <p>Activities (NIC codes) not covered under MSMED Act, 2006 for Udyam Registration</p>
      </footer>
    </div>
  );
};

export default UdyamRegistrationForm;
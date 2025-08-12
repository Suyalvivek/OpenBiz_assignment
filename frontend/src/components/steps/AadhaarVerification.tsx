import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AadhaarVerificationSchema } from '../../validations/schemas';
import type { AadhaarFormData } from '../../validations/formTypes';
import { udyamService } from '../../api/udyamService';
import '../../styles/AadhaarVerification.css';
import type { FormData } from '../../types';

interface AadhaarVerificationProps {
  formData: FormData;
  onComplete: (data: Partial<FormData>) => void;
  submissionId: number | null;
}

const AadhaarVerification = ({
  formData,
  onComplete,
  submissionId,
}: AadhaarVerificationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AadhaarFormData>({
    resolver: zodResolver(AadhaarVerificationSchema),
    defaultValues: {
      txtadharno: formData.txtadharno || '',
      txtownername: formData.txtownername || '',
      chkDecarationA: formData.chkDecarationA || false,
    },
  });

  const handleAadhaarSubmit = async (data: AadhaarFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await udyamService.submitAadhaar({ ...data, submissionId });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit Aadhaar details');
      }

      setOtpSent(true);
      onComplete({ ...data, submissionId: result.submissionId });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting Aadhaar details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await udyamService.verifyOTP({ submissionId, otp });

      if (!result.success) {
        throw new Error(result.error || 'Failed to verify OTP');
      }

      onComplete({ otpVerified: true, nextStep: result.nextStep });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while verifying OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aadhaar-verification-container">
      <div className="verification-header">
        <h3>Aadhaar Verification With OTP</h3>
      </div>

      {!otpSent ? (
        <form onSubmit={handleSubmit(handleAadhaarSubmit)} className="aadhaar-form">
          <div className="form-group">
            <div className="form-row">
              <div className="label-container">
                <label htmlFor="txtadharno">1. Aadhaar Number/ आधार संख्या</label>
              </div>
              <div className="input-container">
                <input
                  type="text"
                  id="txtadharno"
                  placeholder="Your Aadhaar No"
                  maxLength={12}
                  {...register('txtadharno')}
                />
                {errors.txtadharno && <span className="error-message">{errors.txtadharno.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <div className="label-container">
                <label htmlFor="txtownername">2. Name of Entrepreneur / उद्यमी का नाम</label>
              </div>
              <div className="input-container">
                <input
                  type="text"
                  id="txtownername"
                  placeholder="Name as per Aadhaar"
                  maxLength={100}
                  {...register('txtownername')}
                />
                {errors.txtownername && <span className="error-message">{errors.txtownername.message}</span>}
              </div>
            </div>
          </div>

          <div className="aadhaar-info">
            <ul>
              <li>Aadhaar number shall be required for Udyam Registration.</li>
              <li>The Aadhaar number shall be of the proprietor in the case of a proprietorship firm, of the managing partner in the case of a partnership firm and of a karta in the case of a Hindu Undivided Family (HUF).</li>
              <li>In case of a Company, LLP, Cooperative Society, Society, or Trust, the organisation or its authorised signatory shall provide its GSTIN (as per applicability of CGST Act 2017) and PAN along with its Aadhaar number.</li>
            </ul>
          </div>

          <div className="form-group declaration-group">
            <div className="checkbox-container">
              <input type="checkbox" id="chkDecarationA" {...register('chkDecarationA')} />
              <label htmlFor="chkDecarationA">
                I, the holder of the above Aadhaar, hereby give my consent to Ministry of MSME, Government of India...
              </label>
            </div>
            {errors.chkDecarationA && <span className="error-message">{errors.chkDecarationA.message}</span>}
          </div>

          {error && <div className="error-alert">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Validate & Generate OTP'}
            </button>
          </div>
        </form>
      ) : (
        <div className="otp-verification">
          <h4>OTP Verification</h4>
          <p>An OTP has been sent to your registered mobile number. Please enter it below.</p>
          
          <div className="form-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
            />
          </div>

          {error && <div className="error-alert">{error}</div>}

          <div className="form-actions">
            <button 
              onClick={handleOtpVerify} 
              className="submit-button" 
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarVerification;
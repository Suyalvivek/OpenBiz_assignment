import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PANVerificationSchema } from '../../validations/schemas';
import type { PANFormData } from '../../validations/formTypes';
import { udyamService } from '../../api/udyamService';
import '../../styles/PANVerification.css';
import type { FormData } from '../../types';

interface PANVerificationProps {
  formData: FormData;
  onComplete: (data: Partial<FormData>) => void;
  submissionId: number | null;
}

export default function PANVerification({ formData, onComplete, submissionId }: PANVerificationProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PANFormData>({
    resolver: zodResolver(PANVerificationSchema),
    defaultValues: {
      txtPAN: formData.txtPAN ?? '',
      ddlPANType: formData.ddlPANType ?? '',
    },
  });

  const handlePANSubmit = async (data: PANFormData) => {
    if (!submissionId) {
      setStatus('error');
      setMessage('Session expired. Please start from step 1.');
      return;
    }

    setStatus('loading');
    setMessage(null);

    try {
      const result = await udyamService.submitPAN({ ...data, submissionId });

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to submit PAN details');
      }

      setStatus('success');
      setMessage('Registration completed successfully!');
      onComplete({ ...data, completed: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error occurred';
      setStatus('error');
      setMessage(errorMsg);
    }
  };

  return (
    <div className="pan-verification-container">
      <div className="verification-header">
        <h3>PAN Verification</h3>
      </div>

      <form onSubmit={handleSubmit(handlePANSubmit)} className="pan-form">
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="txtPAN" className="label-container">
              1. PAN Number
            </label>
            <div className="input-container">
              <input
                type="text"
                id="txtPAN"
                placeholder="Your PAN Number"
                maxLength={10}
                {...register('txtPAN')}
              />
              {errors.txtPAN && <span className="error-message">{errors.txtPAN.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-row">
            <label htmlFor="ddlPANType" className="label-container">
              2. PAN Type
            </label>
            <div className="input-container">
              <select id="ddlPANType" {...register('ddlPANType')}>
                <option value="">Select PAN Type</option>
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
                <option value="Firm">Firm</option>
                <option value="Others">Others</option>
              </select>
              {errors.ddlPANType && <span className="error-message">{errors.ddlPANType.message}</span>}
            </div>
          </div>
        </div>

        <p className="pan-info">
          Please ensure that the PAN details match with the registered information.
        </p>

        {status === 'error' && <div className="error-alert">{message}</div>}
        {status === 'success' && <div className="success-alert">{message}</div>}

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Processing...' : 'Submit PAN Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
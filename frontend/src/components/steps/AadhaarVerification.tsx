import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAadhaarVerificationSchema } from '../../validations/schemas';
import type { AadhaarFormData } from '../../validations/formTypes';
import { udyamService } from '../../api/udyamService';
import { schemaService } from '../../api/schemaService';
import DynamicFormField from '../common/DynamicFormField';
import '../../styles/AadhaarVerification.css';
import type { FormData, FormField, ValidationRules } from '../../types/types';

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
  const [step1Fields, setStep1Fields] = useState<FormField[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRules | null>(null);
  const [loading, setLoading] = useState(true);

  const AadhaarVerificationSchema = createAadhaarVerificationSchema(validationRules || undefined);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useForm<AadhaarFormData>({
    resolver: zodResolver(AadhaarVerificationSchema),
    defaultValues: {
      txtadharno: formData.txtadharno || '',
      txtownername: formData.txtownername || '',
      chkDecarationA: formData.chkDecarationA || false,
    },
  });

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const [schema, rules] = await Promise.all([
          schemaService.getFormSchema(),
          schemaService.getValidationRules()
        ]);
        
        setStep1Fields(schema.step1Fields);
        setValidationRules(rules);
        setDefaultFormValues(schema.step1Fields);
      } catch (error) {
        setFallbackFields();
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, [formData, setValue]);

  const setDefaultFormValues = (fields: FormField[]) => {
    fields.forEach(field => {
      const mappedFieldName = getMappedFieldName(field.name);
      if (mappedFieldName && formData[mappedFieldName as keyof FormData]) {
        setValue(mappedFieldName as keyof AadhaarFormData, formData[mappedFieldName as keyof FormData]);
      }
    });
  };

  const setFallbackFields = () => {
    setStep1Fields([
      {
        name: "ctl00$ContentPlaceHolder1$txtadharno",
        label: "Aadhaar Number",
        type: "text",
        required: true,
        pattern: "",
        maxLength: 12,
        placeholder: "Your Aadhaar No",
        step: 1,
        validator: ""
      },
      {
        name: "ctl00$ContentPlaceHolder1$txtownername",
        label: "Name of Entrepreneur",
        type: "text",
        required: true,
        pattern: "",
        maxLength: 100,
        placeholder: "Name as per Aadhaar",
        step: 1,
        validator: ""
      },
      {
        name: "ctl00$ContentPlaceHolder1$chkDecarationA",
        label: "Declaration/Agreement",
        type: "checkbox",
        required: false,
        pattern: "",
        maxLength: -1,
        placeholder: "",
        step: 1,
        validator: ""
      }
    ]);
  };

  const fieldMapping: { [key: string]: string } = {
    'ctl00$ContentPlaceHolder1$txtadharno': 'txtadharno',
    'ctl00$ContentPlaceHolder1$txtownername': 'txtownername',
    'ctl00$ContentPlaceHolder1$chkDecarationA': 'chkDecarationA'
  };

  const getMappedFieldName = (scrapedName: string): string | null => {
    return fieldMapping[scrapedName] || null;
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    const mappedFieldName = getMappedFieldName(fieldName);
    if (mappedFieldName) {
      setValue(mappedFieldName as keyof AadhaarFormData, value);
    }
  };

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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while submitting Aadhaar details';
      setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while verifying OTP';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  return (
    <div className="aadhaar-verification-container">
      <div className="verification-header">
        <h3>Aadhaar Verification With OTP</h3>
      </div>

      {!otpSent ? (
        <form onSubmit={handleSubmit(handleAadhaarSubmit)} className="aadhaar-form">
          {step1Fields
            .filter(field => field.type !== 'hidden' && field.type !== 'submit')
            .map((field) => (
              <DynamicFormField
                key={field.name}
                field={field}
                value={watch(getMappedFieldName(field.name) as keyof AadhaarFormData)}
                onChange={handleFieldChange}
                error={errors[getMappedFieldName(field.name) as keyof AadhaarFormData]?.message}
                register={register}
              />
            ))}

          <div className="aadhaar-info">
            <ul>
              <li>Aadhaar number shall be required for Udyam Registration.</li>
              <li>The Aadhaar number shall be of the proprietor in the case of a proprietorship firm, of the managing partner in the case of a partnership firm and of a karta in the case of a Hindu Undivided Family (HUF).</li>
              <li>In case of a Company, LLP, Cooperative Society, Society, or Trust, the organisation or its authorised signatory shall provide its GSTIN (as per applicability of CGST Act 2017) and PAN along with its Aadhaar number.</li>
            </ul>
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
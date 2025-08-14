import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPANVerificationSchema } from '../../validations/schemas';
import type { PANFormData } from '../../validations/formTypes';
import { udyamService } from '../../api/udyamService';
import { schemaService } from '../../api/schemaService';
import DynamicFormField from '../common/DynamicFormField';
import '../../styles/PANVerification.css';
import type { FormData, FormField, ValidationRules } from '../../types/types';

interface PANVerificationProps {
  formData: FormData;
  onComplete: (data: Partial<FormData>) => void;
  submissionId: number | null;
}

export default function PANVerification({ 
  formData, 
  onComplete, 
  submissionId 
}: PANVerificationProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [step2Fields, setStep2Fields] = useState<FormField[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRules | null>(null);
  const [loading, setLoading] = useState(true);

  const PANVerificationSchema = createPANVerificationSchema(validationRules || undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PANFormData>({
    resolver: zodResolver(PANVerificationSchema),
    defaultValues: {
      txtPAN: formData.txtPAN ?? '',
      ddlOrganisationType: formData.ddlOrganisationType ?? '',
      txtPANHolderName: formData.txtPANHolderName ?? '',
      txtDOB: formData.txtDOB ?? '',
    },
  });

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const [schema, rules] = await Promise.all([
          schemaService.getFormSchema(),
          schemaService.getValidationRules()
        ]);
        
        setStep2Fields(schema.step2Fields);
        setValidationRules(rules);
        setDefaultFormValues(schema.step2Fields);
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
        setValue(mappedFieldName as keyof PANFormData, formData[mappedFieldName as keyof FormData]);
      }
    });
  };

  const setFallbackFields = () => {
    setStep2Fields([
      {
        name: "ctl00$ContentPlaceHolder1$ddlOrganisationType",
        label: "Type of Organisation",
        type: "select",
        required: true,
        pattern: "",
        maxLength: -1,
        placeholder: "Select Organisation Type",
        step: 2,
        validator: "",
        options: [
          { value: "Proprietorship", label: "Proprietorship" },
          { value: "Partnership", label: "Partnership" },
          { value: "Hindu Undivided Family", label: "Hindu Undivided Family" },
          { value: "Private Limited Company", label: "Private Limited Company" },
          { value: "Public Limited Company", label: "Public Limited Company" },
          { value: "Limited Liability Partnership", label: "Limited Liability Partnership" },
          { value: "Cooperative Society", label: "Cooperative Society" },
          { value: "Society", label: "Society" },
          { value: "Trust", label: "Trust" }
        ]
      },
      {
        name: "ctl00$ContentPlaceHolder1$txtPAN",
        label: "PAN Number",
        type: "text",
        required: true,
        pattern: "",
        maxLength: 10,
        placeholder: "ENTER PAN NUMBER",
        step: 2,
        validator: ""
      },
      {
        name: "ctl00$ContentPlaceHolder1$txtPANHolderName",
        label: "Name of PAN Holder",
        type: "text",
        required: true,
        pattern: "",
        maxLength: 100,
        placeholder: "Name as per PAN",
        step: 2,
        validator: ""
      },
      {
        name: "ctl00$ContentPlaceHolder1$txtDOB",
        label: "DOB or DOI as per PAN",
        type: "date",
        required: true,
        pattern: "",
        maxLength: -1,
        placeholder: "DD/MM/YYYY",
        step: 2,
        validator: ""
      }
    ]);
  };

  const fieldMapping: { [key: string]: string } = {
    'ctl00$ContentPlaceHolder1$txtPAN': 'txtPAN',
    'ctl00$ContentPlaceHolder1$ddlOrganisationType': 'ddlOrganisationType',
    'ctl00$ContentPlaceHolder1$txtPANHolderName': 'txtPANHolderName',
    'ctl00$ContentPlaceHolder1$txtDOB': 'txtDOB'
  };

  const getMappedFieldName = (scrapedName: string): string | null => {
    return fieldMapping[scrapedName] || null;
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    const mappedFieldName = getMappedFieldName(fieldName);
    if (mappedFieldName) {
      setValue(mappedFieldName as keyof PANFormData, value);
    }
  };

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

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  if (status === 'success') {
    return (
      <div className="pan-verification-container">
        <div className="verification-header">
          <h3>Registration Successful!</h3>
        </div>
        
        <div className="success-container">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h2 className="success-title">Udyam Registration Completed!</h2>
          
          <div className="registration-summary">
            <h4>Registration Summary:</h4>
            <div className="summary-item">
              <strong>Submission ID:</strong> {submissionId}
            </div>
            <div className="summary-item">
              <strong>Organisation Type:</strong> {formData.ddlOrganisationType}
            </div>
            <div className="summary-item">
              <strong>PAN Number:</strong> {formData.txtPAN}
            </div>
            <div className="summary-item">
              <strong>PAN Holder Name:</strong> {formData.txtPANHolderName}
            </div>
            <div className="summary-item">
              <strong>Date of Birth/Incorporation:</strong> {formData.txtDOB}
            </div>
          </div>
          
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <ul>
              <li>You will receive a confirmation email with your Udyam registration details</li>
              <li>Your Udyam certificate will be generated within 24-48 hours</li>
              <li>You can track your application status using the Submission ID above</li>
              <li>Keep this Submission ID safe for future reference</li>
            </ul>
          </div>
          
          <div className="success-actions">
            <button 
              className="print-button"
              onClick={() => window.print()}
            >
              Print Registration Details
            </button>
            <button 
              className="new-registration-button"
              onClick={() => window.location.reload()}
            >
              Start New Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pan-verification-container">
      <div className="verification-header">
        <h3>PAN Verification</h3>
      </div>

      <form onSubmit={handleSubmit(handlePANSubmit)} className="pan-form">
        {step2Fields
          .filter(field => field.type !== 'hidden' && field.type !== 'submit')
          .map((field) => (
            <DynamicFormField
              key={field.name}
              field={field}
              value={watch(getMappedFieldName(field.name) as keyof PANFormData)}
              onChange={handleFieldChange}
              error={errors[getMappedFieldName(field.name) as keyof PANFormData]?.message}
              register={register}
            />
          ))}

        <p className="pan-info">
          Please ensure that the PAN details match with the registered information.
        </p>

        {status === 'error' && <div className="error-alert">{message}</div>}

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Processing...' : 'Submit PAN Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
import React from 'react';
import type { FormField } from '../../types/types';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface DynamicFormFieldProps {
  field: FormField;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  register?: UseFormRegisterReturn;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  register
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = field.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    onChange(field.name, newValue);
  };

  const renderField = () => {
    const commonProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      maxLength: field.maxLength > 0 ? field.maxLength : undefined,
      pattern: field.pattern || undefined,
      required: field.required,
      className: `form-input ${error ? 'error' : ''}`,
      ...(register && { ...register })
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            {...commonProps}
            value={value || ''}
            onChange={handleChange}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            value={value || ''}
            onChange={handleChange}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={value || ''}
            onChange={handleChange}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="checkbox-container">
            <input
              type="checkbox"
              {...commonProps}
              checked={value || false}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor={field.name} className="checkbox-label">
              {field.label}
            </label>
          </div>
        );

      case 'hidden':
        return (
          <input
            type="hidden"
            {...commonProps}
            value={value || ''}
          />
        );

      default:
        return (
          <input
            type="text"
            {...commonProps}
            value={value || ''}
            onChange={handleChange}
          />
        );
    }
  };

  if (field.type === 'hidden') {
    return renderField();
  }

  return (
    <div className="form-group">
      <div className="form-row">
        {field.type !== 'checkbox' && (
          <div className="label-container">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
          </div>
        )}
        <div className={`input-container ${field.type === 'checkbox' ? 'checkbox-input-container' : ''}`}>
          {renderField()}
          {error && <span className="error-message">{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default DynamicFormField;

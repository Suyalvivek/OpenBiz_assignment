import React from 'react';
import '../../styles/ProgressTracker.css';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
}


const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="progress-tracker">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div 
            key={stepNumber} 
            className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-number">{stepNumber}</div>
            <div className="step-label">
              {stepNumber === 1 ? 'Aadhaar Verification' : 'PAN Verification'}
            </div>
          </div>
        );
      })}
      <div className="progress-line">
        <div 
          className="progress-line-fill" 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressTracker;
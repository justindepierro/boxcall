/**
 * Create Coach Account Page
 *
 * Standalone coach account creation for $9.99 one-time purchase.
 * Allows coaches to build personal playbooks and later join teams.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/auth-store';
import { Typography } from '../../components/design-system';
import { Button } from '../../components/ui/Button/Button';
import { Icon } from '../../components/ui/Icon/Icon';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../routes/paths';

import type { CoachAccountFormData, CoachAccountStep } from './types';
import { COACH_ACCOUNT_STEPS, DEFAULT_FORM_DATA } from './constants';
import {
  IntroStep,
  PersonalInfoStep,
  AddressInfoStep,
  CoachingInfoStep,
  TeamConnectionStep,
  PaymentStep,
  CompleteStep,
} from './components';

export const CreateCoachAccount: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const [currentStep, setCurrentStep] = useState<CoachAccountStep>('intro');
  const [formData, setFormData] = useState<CoachAccountFormData>({
    ...DEFAULT_FORM_DATA,
    email: user?.email || '',
  });

  const currentStepIndex = COACH_ACCOUNT_STEPS.findIndex(
    (step) => step.id === currentStep
  );
  const progress =
    ((currentStepIndex + 1) / COACH_ACCOUNT_STEPS.length) * 100;

  const handleNext = () => {
    const currentIndex = COACH_ACCOUNT_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex < COACH_ACCOUNT_STEPS.length - 1) {
      setCurrentStep(COACH_ACCOUNT_STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = COACH_ACCOUNT_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex > 0) {
      setCurrentStep(COACH_ACCOUNT_STEPS[currentIndex - 1].id);
    }
  };

  const handleFormChange = (data: Partial<CoachAccountFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    // TODO: Implement actual coach account creation logic
    console.info('🏃‍♂️ Creating coach account with data:', formData);

    if (isSuperAdmin) {
      console.info('🔓 Super admin coach account creation - bypassing payment');
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCurrentStep('complete');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return <IntroStep />;

      case 'personal-info':
        return (
          <PersonalInfoStep
            formData={formData}
            onFormChange={handleFormChange}
          />
        );

      case 'address-info':
        return (
          <AddressInfoStep
            formData={formData}
            onFormChange={handleFormChange}
          />
        );

      case 'coaching-info':
        return (
          <CoachingInfoStep
            formData={formData}
            onFormChange={handleFormChange}
          />
        );

      case 'team-connection':
        return (
          <TeamConnectionStep
            formData={formData}
            onFormChange={handleFormChange}
          />
        );

      case 'payment':
        return (
          <PaymentStep
            formData={formData}
            onFormChange={handleFormChange}
            isSuperAdmin={isSuperAdmin}
          />
        );

      case 'complete':
        return (
          <CompleteStep
            firstName={formData.firstName}
            onNavigateDashboard={() => navigate(ROUTES.DASHBOARD)}
            onNavigatePlaybook={() => navigate(ROUTES.PLAYBOOK)}
          />
        );

      default:
        return (
          <div className="text-center">
            <Typography variant="headline-lg" className="mb-4">
              Step: {currentStep}
            </Typography>
            <Typography variant="body-md" color="muted">
              This step is not yet implemented. Check back soon!
            </Typography>
          </div>
        );
    }
  };

  return (
    <div className="py-6">
      <div className="content-medium">
        {/* Progress Bar */}
        {currentStep !== 'intro' && currentStep !== 'complete' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body-sm" color="muted">
                Step {currentStepIndex + 1} of {COACH_ACCOUNT_STEPS.length}
              </Typography>
              <Typography variant="body-sm" color="muted">
                {Math.round(progress)}% Complete
              </Typography>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300 bg-accent0"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Typography variant="body-sm" className="mt-2 font-medium">
              {COACH_ACCOUNT_STEPS[currentStepIndex]?.title}
            </Typography>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-primary elevation-card border-muted rounded-lg p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep !== 'intro' && currentStep !== 'complete' && (
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              variant="ghost"
              size="sm"
              icon={<Icon name="chevron-left" size="sm" />}
            >
              Previous
            </Button>
            {currentStep === 'payment' ? (
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="sm"
                icon={<Icon name="check" size="sm" />}
                iconPosition="right"
              >
                Create Coach Account
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="primary"
                size="sm"
                icon={<Icon name="chevron-right" size="sm" />}
                iconPosition="right"
              >
                Next
              </Button>
            )}
          </div>
        )}

        {currentStep === 'intro' && (
          <div className="text-center">
            <Button onClick={handleNext} variant="primary" size="md">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

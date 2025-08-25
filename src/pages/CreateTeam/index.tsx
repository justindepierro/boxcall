import { TeamInfoStep } from "./steps/TeamInfoStep";
import { RoleAssignmentStep } from "./steps/RoleAssignmentStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { SchoolVerificationStep } from "./steps/SchoolVerificationStep";
import { OwnerInfoStep } from "./steps/OwnerInfoStep";
import { CoachInfoStep } from "./steps/CoachInfoStep";
import { FallbackInfoStep } from "./steps/FallbackInfoStep";
import { TeamDetailsStep } from "./steps/TeamDetailsStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CompleteStep } from "./steps/CompleteStep";
import { useCreateTeamForm } from "./hooks/useCreateTeamForm";

// Main orchestrator for CreateTeam workflow
const CreateTeam: React.FC = () => {
  const { step, formData, goToNextStep, goToPrevStep, updateField } =
    useCreateTeamForm();

  const handleSubmit = () => {
    // TODO: Integrate with teamApi service
    alert("Team submitted! (API integration pending)");
    goToNextStep();
  };

  const handleRestart = () => {
    window.location.reload(); // Or reset form state in hook
  };

  switch (step) {
    case 0:
      return (
        <TeamInfoStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
        />
      );
    case 1:
      return (
        <RoleAssignmentStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 2:
      return (
        <ContactInfoStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 3:
      return (
        <SchoolVerificationStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 4:
      return (
        <OwnerInfoStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 5:
      return (
        <CoachInfoStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 6:
      return (
        <FallbackInfoStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 7:
      return (
        <TeamDetailsStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 8:
      return (
        <PaymentStep
          formData={formData}
          updateField={updateField}
          next={goToNextStep}
          prev={goToPrevStep}
        />
      );
    case 9:
      return (
        <ReviewStep
          formData={formData}
          prev={goToPrevStep}
          submit={handleSubmit}
        />
      );
    case 10:
      return <CompleteStep restart={handleRestart} />;
    default:
      return <div>Unknown step</div>;
  }
};

export default CreateTeam;

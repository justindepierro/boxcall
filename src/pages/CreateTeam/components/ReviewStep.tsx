import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon/Icon";
import type {
  TeamCreationInput,
  DuplicateCheckResult,
} from "../../../services/teamService";

interface ReviewStepProps {
  formData: TeamCreationInput;
  duplicateCheckLoading: boolean;
  showDuplicateWarning: boolean;
  duplicateCheck: DuplicateCheckResult | null;
  createError: string | null;
  onDismissDuplicateWarning: () => void;
  onContactSupport: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  duplicateCheckLoading,
  showDuplicateWarning,
  duplicateCheck,
  createError,
  onDismissDuplicateWarning,
  onContactSupport,
}) => {
  return (
    <div className="space-y-md">
      <Typography variant="headline-md" className="mb-md">
        Review Your Team
      </Typography>

      {/* Duplicate Check Loading */}
      {duplicateCheckLoading && (
        <div className="bg-status-info-bg border border-blue-200 rounded-lg p-md">
          <div className="flex items-center gap-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <Typography variant="body-sm">
              Checking for similar teams...
            </Typography>
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {showDuplicateWarning && duplicateCheck && (
        <div className="bg-warning border border-orange-200 rounded-lg p-md">
          <div className="flex items-start gap-sm">
            <Icon
              name="alert-triangle"
              size="sm"
              color="warning"
              className="mt-0.5"
            />
            <div className="flex-1">
              <Typography variant="body-sm" className="font-medium mb-xs">
                Similar Team Found
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-sm">
                {duplicateCheck.warningMessage}
              </Typography>

              {duplicateCheck.similarTeams.length > 0 && (
                <div className="bg-secondary rounded-lg p-sm mb-sm">
                  <Typography variant="body-xs" className="font-medium mb-xs">
                    Similar Team:
                  </Typography>
                  {duplicateCheck.similarTeams.slice(0, 1).map((similar) => (
                    <div key={similar.teamId} className="text-sm">
                      <div className="font-medium">
                        {similar.schoolName} {similar.teamName}
                      </div>
                      {similar.schoolCity && similar.schoolState && (
                        <div className="text-secondary">
                          {similar.schoolCity}, {similar.schoolState}
                        </div>
                      )}
                      <div className="text-xs text-muted mt-xs">
                        Match reasons: {similar.matchReasons.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {duplicateCheck.isDuplicate ? (
                <div className="flex gap-xs">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onContactSupport}
                    icon={<Icon name="mail" size="xs" />}
                  >
                    Contact Support
                  </Button>
                </div>
              ) : (
                <div className="flex gap-xs">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onDismissDuplicateWarning}
                  >
                    This is Different
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onContactSupport}
                    icon={<Icon name="mail" size="xs" />}
                  >
                    I'm the New Coach
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-secondary p-md rounded-lg space-y-xs">
        <div>
          <span className="font-medium">School:</span> {formData.schoolName}
        </div>
        <div>
          <span className="font-medium">Team:</span> {formData.teamName}
        </div>
        <div>
          <span className="font-medium">Sport:</span> {formData.sport}
        </div>
        <div>
          <span className="font-medium">Season:</span> {formData.season}
        </div>
        {formData.schoolDistrict && (
          <div>
            <span className="font-medium">District:</span>{" "}
            {formData.schoolDistrict}
          </div>
        )}
        {formData.schoolAddress && (
          <div>
            <span className="font-medium">Address:</span>{" "}
            {formData.schoolAddress}
          </div>
        )}
        {formData.schoolCity && formData.schoolState && (
          <div>
            <span className="font-medium">Location:</span> {formData.schoolCity}
            , {formData.schoolState} {formData.schoolZip}
          </div>
        )}
      </div>

      {createError && !showDuplicateWarning && (
        <div className="bg-error-bg border border-error-200 text-error-600 px-md py-sm rounded-lg">
          {createError}
        </div>
      )}
    </div>
  );
};

ReviewStep.displayName = "ReviewStep";

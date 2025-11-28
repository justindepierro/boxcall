/**
 * FormationBuilderRouter - Smart Formation Builder Selector
 *
 * Routes users to the appropriate formation building experience:
 * - New users: Intuitive guided experience
 * - Power users: Advanced technical interface
 * - Can toggle between experiences
 */

import React, { useState } from "react";
import { IntuitiveFormationBuilder } from "./IntuitiveFormationBuilder";
import { FormationBuilderCanvas } from "./FormationBuilderCanvas";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon/Icon";
import type {
  FormationPlayerPosition,
  FormationCreationSource,
} from "../../../types/formation";

interface FormationBuilderRouterProps {
  playbookId: string;
  formationId?: string;
  formation?: any;
  creationSource?: FormationCreationSource;
  onSave: (
    players: FormationPlayerPosition[],
    personnel: string,
    creationSource?: FormationCreationSource
  ) => void;
  onCancel: () => void;
}

export const FormationBuilderRouter: React.FC<FormationBuilderRouterProps> = ({
  playbookId,
  formationId,
  formation,
  creationSource = "formation_builder",
  onSave,
  onCancel,
}) => {
  const [useIntuitiveMode, setUseIntuitiveMode] = useState(true);

  // For existing formations, default to advanced mode
  React.useEffect(() => {
    if (formationId || formation) {
      setUseIntuitiveMode(false);
    }
  }, [formationId, formation]);

  if (useIntuitiveMode) {
    return (
      <div className="h-full relative">
        {/* Mode Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseIntuitiveMode(false)}
            className="bg-surface-card/90 backdrop-blur-sm"
          >
            <Icon name="settings" size="sm" className="mr-2" />
            Advanced Mode
          </Button>
        </div>

        <IntuitiveFormationBuilder
          playbookId={playbookId}
          onSave={(players, personnel) =>
            onSave(players, personnel, creationSource)
          }
          onCancel={onCancel}
        />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUseIntuitiveMode(true)}
          className="bg-surface-card/90 backdrop-blur-sm"
        >
          <Icon name="sparkles" size="sm" className="mr-2" />
          Simple Mode
        </Button>
      </div>

      <FormationBuilderCanvas
        playbookId={playbookId}
        formationId={formationId}
        formation={formation}
        creationSource={creationSource}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  );
};

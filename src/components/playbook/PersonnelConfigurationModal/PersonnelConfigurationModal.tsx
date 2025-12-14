/**
 * PersonnelConfigurationModal Component
 *
 * Modal for managing personnel configurations (skill positions, badges)
 * Modularized Dec 2025 for maintainability
 */

import React from "react";
import { Icon } from "../../ui/Icon";
import { Typography } from "../../design-system/Typography";
import { BottomSheet } from "../../BottomSheet";
import { Modal } from "../../ui/Modal";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { useIsMobile } from "../../../hooks/useBreakpoint";
import { usePersonnelConfigHandlers } from "./usePersonnelConfigHandlers";
import { ConfigurationItem } from "./ConfigurationItem";
import {
  ConfigurationHeader,
  EmptyState,
  ActionButtons,
  LoadingContent,
} from "./ModalComponents";
import type { PersonnelConfigurationModalProps } from "./types";

export const PersonnelConfigurationModal: React.FC<
  PersonnelConfigurationModalProps
> = ({ isOpen, onClose, playbookId, configurations: configsProp, onSave = () => {} }) => {
  const isMobile = useIsMobile();

  const {
    localConfigurations,
    expandedConfigIds,
    customizerOpenIds,
    justSaved,
    isLoading,
    handleSave,
    addPersonnelConfiguration,
    toggleExpanded,
    toggleDefault,
    updatePersonnelConfigName,
    removePersonnelConfiguration,
    addSkillPlayer,
    removeSkillPlayer,
    updateBadgeCustomization,
    toggleCustomizer,
    updatePlayerLabel,
    updatePlayerPosition,
    toggleWildcatQB,
    getPersonnelSummary,
  } = usePersonnelConfigHandlers({
    playbookId,
    configurations: configsProp,
    onSave,
  });

  const renderContent = () => (
    <div className="space-y-6">
      <ConfigurationHeader onAddConfiguration={addPersonnelConfiguration} />

      {/* Personnel Configurations List */}
      <div className="space-y-3">
        {localConfigurations.map((config) => (
          <ConfigurationItem
            key={config.id}
            config={config}
            isExpanded={expandedConfigIds.has(config.id)}
            isCustomizerOpen={customizerOpenIds.has(config.id)}
            justSaved={justSaved}
            summary={getPersonnelSummary(config)}
            onToggleExpanded={() => toggleExpanded(config.id)}
            onToggleDefault={() => toggleDefault(config.id)}
            onRemove={() => removePersonnelConfiguration(config.id)}
            onUpdateName={(name) => updatePersonnelConfigName(config.id, name)}
            onToggleCustomizer={() => toggleCustomizer(config.id)}
            onUpdateBadgeCustomization={(customization) =>
              updateBadgeCustomization(config.id, customization)
            }
            onAddPlayer={() => addSkillPlayer(config.id)}
            onRemovePlayer={(playerId) =>
              removeSkillPlayer(config.id, playerId)
            }
            onUpdatePlayerLabel={(playerId, label) =>
              updatePlayerLabel(config.id, playerId, label)
            }
            onUpdatePlayerPosition={(playerId, position) =>
              updatePlayerPosition(config.id, playerId, position)
            }
            onToggleWildcatQB={(playerId) =>
              toggleWildcatQB(config.id, playerId)
            }
          />
        ))}

        {/* Empty State */}
        {localConfigurations.length === 0 && (
          <EmptyState onAddConfiguration={addPersonnelConfiguration} />
        )}
      </div>

      <ActionButtons
        justSaved={justSaved}
        onCancel={onClose}
        onSave={handleSave}
      />
    </div>
  );

  if (!isOpen) return null;

  // Show loading state while fetching data
  if (isLoading) {
    return isMobile ? (
      <BottomSheet snapPoints={[0.6]} initialSnapPoint={0} showHandle={true}>
        <LoadingContent />
      </BottomSheet>
    ) : (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Personnel Configuration"
        size="lg"
      >
        <LoadingContent />
      </Modal>
    );
  }

  // Mobile: BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        snapPoints={[0.15, 0.6, 0.95]}
        initialSnapPoint={2}
        showHandle={true}
        backdropOpacity={0.4}
      >
        <div className="px-4 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Icon name="users" className="w-5 h-5 text-pink-600" />
              </div>
              <Typography variant="headline-md">Personnel</Typography>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback("light");
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-tertiary"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {renderContent()}
        </div>
      </BottomSheet>
    );
  }

  // Desktop: Modal
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personnel Configurations"
      size="lg"
    >
      <div className="p-6">{renderContent()}</div>
    </Modal>
  );
};

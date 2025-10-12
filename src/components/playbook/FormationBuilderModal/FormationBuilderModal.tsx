/**
 * FormationBuilderModal - Tabbed Interface (Redesigned)
 * 
 * Unified formation management with three modes:
 * - Tab 1: Edit Details - Set personnel, category, tags, description
 * - Tab 2: Link Formations - Connect left/right variants
 * - Tab 3: Draw Formation - Visual canvas builder (Phase 3 - Coming Soon)
 * 
 * This gives coaches one place to manage all formation workflows.
 */

import React, { useState } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Button } from '../../ui/Button/Button';
import { Typography } from '../../design-system/Typography';
import { Link2, Pencil, Settings } from 'lucide-react';
import { FormationLinkingPanel } from '../../formations/FormationLinkingPanel';
import { FormationBuilderPanel } from '../../formations/FormationBuilderPanel';

interface FormationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  formationId?: string; // For editing existing formation
  onSaved?: () => void;
}

type TabType = 'edit' | 'link' | 'draw';

export function FormationBuilderModal({
  isOpen,
  onClose,
  playbookId,
  formationId,
  onSaved,
}: FormationBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('edit');

  // If we're editing a specific formation, default to edit tab
  React.useEffect(() => {
    if (formationId) {
      setActiveTab('edit');
    } else {
      setActiveTab('edit');
    }
  }, [formationId, isOpen]);

  const handleSuccess = () => {
    if (onSaved) {
      onSaved();
    }
    // Don't auto-close - let user continue working
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formation Manager"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-border-primary bg-surface-secondary">
          <button
            onClick={() => setActiveTab('edit')}
            className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors
              ${activeTab === 'edit' 
                ? 'bg-surface-primary text-text-primary border-b-2 border-primary-500' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'
              }
            `}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Edit Details</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors
              ${activeTab === 'link' 
                ? 'bg-surface-primary text-text-primary border-b-2 border-primary-500' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'
              }
            `}
          >
            <Link2 className="w-5 h-5" />
            <span className="font-medium">Link Formations</span>
          </button>
          
          <button
            onClick={() => setActiveTab('draw')}
            className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors relative
              ${activeTab === 'draw' 
                ? 'bg-surface-primary text-text-primary border-b-2 border-primary-500' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'
              }
            `}
          >
            <Pencil className="w-5 h-5" />
            <span className="font-medium">Draw Formation</span>
            <span className="ml-spacing-xs px-spacing-xs py-0.5 bg-warning-100 text-warning-700 text-xs rounded">
              Soon
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'edit' && (
            <FormationBuilderPanel
              playbookId={playbookId}
              onSuccess={handleSuccess}
            />
          )}

          {activeTab === 'link' && (
            <FormationLinkingPanel
              playbookId={playbookId}
              onSuccess={handleSuccess}
              initialLeftFormation={null}
              initialRightFormation={null}
            />
          )}

          {activeTab === 'draw' && (
            <div className="flex flex-col items-center justify-center h-full p-spacing-xl bg-surface-muted" style={{ minHeight: '500px' }}>
              <div className="text-center max-w-md space-y-spacing-md">
                <div className="text-6xl mb-spacing-md">✏️</div>
                <Typography variant="headline-lg" className="text-text-primary">
                  Visual Formation Builder
                </Typography>
                <Typography variant="body-md" className="text-text-secondary">
                  Drag-and-drop canvas for positioning players visually is coming soon!
                </Typography>
                <div className="mt-spacing-lg p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
                  <Typography variant="caption" className="text-text-muted">
                    <strong>Phase 3 Features (Coming Soon):</strong>
                  </Typography>
                  <ul className="mt-spacing-sm text-left text-text-secondary space-y-spacing-xs text-sm">
                    <li>• Drag players to position on field</li>
                    <li>• Personnel package integration</li>
                    <li>• Strength player marking</li>
                    <li>• Auto-create Left/Right variants</li>
                    <li>• Export to diagram templates</li>
                  </ul>
                </div>
                <div className="mt-spacing-md">
                  <Button
                    onClick={() => setActiveTab('link')}
                    variant="primary"
                  >
                    Try Formation Linking →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button/Button';
import { Icon } from '../ui/Icon/Icon';
import { Typography } from '../design-system/Typography';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  entityName: string;
  entityType?: 'personnel' | 'formation' | 'play';
  usage?: {
    playsCount?: number;
    formationsCount?: number;
  };
  isDeleting?: boolean;
}

/**
 * Delete Confirmation Dialog
 * 
 * Shows warnings when deleting entities that are in use.
 * Displays usage counts (plays, formations) before deletion.
 * 
 * Usage:
 * ```tsx
 * <DeleteConfirmationDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Personnel Configuration?"
 *   entityName="11 Personnel"
 *   entityType="personnel"
 *   usage={{ playsCount: 45, formationsCount: 8 }}
 *   isDeleting={isLoading}
 * />
 * ```
 */
export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityName,
  entityType = 'personnel',
  usage,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const hasUsage = (usage?.playsCount || 0) > 0 || (usage?.formationsCount || 0) > 0;
  const playsCount = usage?.playsCount || 0;
  const formationsCount = usage?.formationsCount || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type="alert"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Icon name="refresh-cw" className="animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Icon name="delete" className="mr-2" />
                Delete {entityType}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Entity name */}
        <Typography variant="body-md" className="text-text-secondary">
          Are you sure you want to delete{' '}
          <strong className="text-text-primary">{entityName}</strong>?
        </Typography>

        {/* Usage warning or safe message */}
        {hasUsage ? (
          <div className="p-4 bg-warning-bg border border-warning rounded-lg space-y-3">
            <Typography variant="body-md" className="font-semibold text-warning flex items-center gap-2">
              <Icon name="alert-triangle" className="flex-shrink-0" />
              This {entityType} is currently in use:
            </Typography>
            <ul className="space-y-2 ml-6 text-warning">
              {playsCount > 0 && (
                <li className="flex items-center gap-2">
                  <Icon name="file" className="flex-shrink-0" />
                  <span>
                    <strong>{playsCount}</strong> play{playsCount !== 1 ? 's' : ''}
                  </span>
                </li>
              )}
              {formationsCount > 0 && (
                <li className="flex items-center gap-2">
                  <Icon name="grid" className="flex-shrink-0" />
                  <span>
                    <strong>{formationsCount}</strong> formation
                    {formationsCount !== 1 ? 's' : ''}
                  </span>
                </li>
              )}
            </ul>
            <div className="mt-3 pt-3 border-t border-warning">
              <Typography variant="caption" className="text-warning flex items-center gap-1">
                <Icon name="info" className="flex-shrink-0" />
                These will lose their reference to this {entityType} but will not be deleted.
              </Typography>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-success-bg border border-success rounded-lg">
            <Typography variant="body-sm" className="text-success flex items-center gap-2">
              <Icon name="check-circle" className="flex-shrink-0" />
              This {entityType} is not currently in use and can be safely deleted.
            </Typography>
          </div>
        )}

        {/* Warning about permanent deletion */}
        <div className="p-3 bg-error-bg border border-error rounded-lg">
          <Typography variant="caption" className="text-error flex items-center gap-2">
            <Icon name="alert-triangle" className="flex-shrink-0" />
            <span>
              <strong>This action cannot be undone.</strong> The {entityType} will be permanently
              removed from your playbook.
            </span>
          </Typography>
        </div>
      </div>
    </Modal>
  );
}

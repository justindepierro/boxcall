/**
 * DELETE CONFIRMATION DIALOG - USAGE EXAMPLES
 * 
 * This file shows how to integrate the DeleteConfirmationDialog
 * into your delete workflows for Personnel and Formations.
 * 
 * Copy these patterns into your actual components.
 */

import { useState } from 'react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { PersonnelService } from '../../services/personnelService';
import { FormationService } from '../../services/formationService';
import { Button } from '../ui/Button/Button';
import { useToast } from '../../hooks/useToast';

// ============================================================================
// EXAMPLE 1: Delete Personnel Configuration
// ============================================================================

export function PersonnelDeleteExample() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<{
    playsCount: number;
    formationsCount: number;
  } | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Step 1: When user clicks delete, check usage first
  const handleDeleteClick = async (personnelId: string, personnelName: string) => {
    try {
      // Check where this personnel is being used
      const usage = await PersonnelService.checkPersonnelUsage(personnelId);
      
      // Store for dialog display
      setPersonnelToDelete({ id: personnelId, name: personnelName });
      setDeleteUsage(usage);
      setShowDeleteDialog(true);
    } catch (error) {
      console.error('Failed to check personnel usage:', error);
      toast.error('Failed to load usage information');
    }
  };

  // Step 2: User confirmed deletion
  const handleConfirmDelete = async () => {
    if (!personnelToDelete) return;

    setIsDeleting(true);
    try {
      await PersonnelService.deletePersonnelConfiguration(personnelToDelete.id);
      
      toast.success(`Personnel "${personnelToDelete.name}" deleted successfully`);
      setShowDeleteDialog(false);
      
      // Refresh your data here (e.g., refetch personnel list)
      // queryClient.invalidateQueries(['personnel', playbookId]);
      
    } catch (error) {
      console.error('Failed to delete personnel:', error);
      toast.error('Failed to delete personnel configuration');
    } finally {
      setIsDeleting(false);
    }
  };

  // Step 3: Render the delete button and dialog
  return (
    <div>
      {/* Your delete button */}
      <Button
        variant="danger"
        onClick={() => handleDeleteClick('personnel-id-123', '11 Personnel')}
      >
        Delete Personnel
      </Button>

      {/* The confirmation dialog */}
      {personnelToDelete && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Personnel Configuration?"
          entityName={personnelToDelete.name}
          entityType="personnel"
          usage={deleteUsage}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Delete Formation
// ============================================================================

export function FormationDeleteExample() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<{
    playsCount: number;
  } | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Step 1: When user clicks delete, check usage first
  const handleDeleteClick = async (formationId: string, formationName: string) => {
    try {
      // Check where this formation is being used
      const usage = await FormationService.checkFormationUsage(formationId);
      
      // Store for dialog display
      setFormationToDelete({ id: formationId, name: formationName });
      setDeleteUsage(usage);
      setShowDeleteDialog(true);
    } catch (error) {
      console.error('Failed to check formation usage:', error);
      toast.error('Failed to load usage information');
    }
  };

  // Step 2: User confirmed deletion
  const handleConfirmDelete = async () => {
    if (!formationToDelete) return;

    setIsDeleting(true);
    try {
      await FormationService.deleteFormation(formationToDelete.id);
      
      toast.success(`Formation "${formationToDelete.name}" deleted successfully`);
      setShowDeleteDialog(false);
      
      // Refresh your data here (e.g., refetch formations list)
      // queryClient.invalidateQueries(['formations', playbookId]);
      
    } catch (error) {
      console.error('Failed to delete formation:', error);
      toast.error('Failed to delete formation');
    } finally {
      setIsDeleting(false);
    }
  };

  // Step 3: Render the delete button and dialog
  return (
    <div>
      {/* Your delete button */}
      <Button
        variant="danger"
        onClick={() => handleDeleteClick('formation-id-456', 'I Formation')}
      >
        Delete Formation
      </Button>

      {/* The confirmation dialog */}
      {formationToDelete && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Formation?"
          entityName={formationToDelete.name}
          entityType="formation"
          usage={deleteUsage}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Delete with React Query Hooks
// ============================================================================

export function PersonnelDeleteWithHooksExample() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<{
    id: string;
    name: string;
    playbookId: string;
  } | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<{
    playsCount: number;
    formationsCount: number;
  } | undefined>(undefined);
  
  const toast = useToast();
  
  // If you have a delete mutation hook:
  // const deleteMutation = useDeletePersonnelConfiguration();

  const handleDeleteClick = async (
    personnelId: string,
    personnelName: string,
    playbookId: string
  ) => {
    try {
      const usage = await PersonnelService.checkPersonnelUsage(personnelId);
      setPersonnelToDelete({ id: personnelId, name: personnelName, playbookId });
      setDeleteUsage(usage);
      setShowDeleteDialog(true);
    } catch (err) {
      console.error('Failed to check usage:', err);
      toast.error('Failed to load usage information');
    }
  };

  const handleConfirmDelete = async () => {
    if (!personnelToDelete) return;

    try {
      // Using the mutation hook:
      // await deleteMutation.mutateAsync({
      //   id: personnelToDelete.id,
      //   playbookId: personnelToDelete.playbookId,
      // });

      // Or directly:
      await PersonnelService.deletePersonnelConfiguration(personnelToDelete.id);
      
      toast.success(`Personnel "${personnelToDelete.name}" deleted`);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error('Failed to delete personnel');
    }
  };

  return (
    <div>
      <Button
        variant="danger"
        onClick={() => handleDeleteClick('id-123', '11 Personnel', 'playbook-id')}
      >
        Delete
      </Button>

      {personnelToDelete && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Personnel Configuration?"
          entityName={personnelToDelete.name}
          entityType="personnel"
          usage={deleteUsage}
          isDeleting={false} // or deleteMutation.isPending
        />
      )}
    </div>
  );
}

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/**
 * TO INTEGRATE INTO YOUR COMPONENT:
 * 
 * 1. Import the dialog:
 *    import { DeleteConfirmationDialog } from '../common/DeleteConfirmationDialog';
 * 
 * 2. Import the service:
 *    import { PersonnelService } from '@services';
 *    // or
 *    import { FormationService } from '@services';
 * 
 * 3. Add state for dialog:
 *    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
 *    const [entityToDelete, setEntityToDelete] = useState<{ id: string; name: string } | null>(null);
 *    const [deleteUsage, setDeleteUsage] = useState<{ playsCount: number; ... } | undefined>();
 *    const [isDeleting, setIsDeleting] = useState(false);
 * 
 * 4. Replace your current delete handler:
 *    OLD: onClick={() => deletePersonnel(id)}
 *    NEW: onClick={() => handleDeleteClick(id, name)}
 * 
 * 5. Add the new handlers (copy from examples above):
 *    - handleDeleteClick() - checks usage, shows dialog
 *    - handleConfirmDelete() - actually deletes
 * 
 * 6. Add the dialog component to your JSX:
 *    <DeleteConfirmationDialog {...props} />
 * 
 * 7. Test the flow:
 *    - Click delete button
 *    - See usage warnings
 *    - Confirm deletion
 *    - See success toast
 */

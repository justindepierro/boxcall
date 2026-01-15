import { useCallback } from "react";
import {
  PracticeTemplateService,
  type PracticeScript,
} from "@services";
import { useToast } from "../../../../hooks/useToast";
import { error as logError } from "../../../../utils/logger";

interface UseTemplateHandlersProps {
  currentScript: PracticeScript | null;
  setCurrentScript: (script: PracticeScript | null) => void;
  setScriptName: (name: string) => void;
  setScriptDescription: (desc: string) => void;
  setIsEditing: (editing: boolean) => void;
  setShowTemplateModal: (show: boolean) => void;
  teamId: string;
}

export function useTemplateHandlers({
  currentScript,
  setCurrentScript,
  setScriptName,
  setScriptDescription,
  setIsEditing,
  setShowTemplateModal,
  teamId,
}: UseTemplateHandlersProps) {
  const toast = useToast();

  const handleSaveAsTemplate = useCallback(
    async (templateName: string, description?: string) => {
      if (!currentScript?.id) {
        toast.error("Please save the script first before creating a template");
        return;
      }

      try {
        await PracticeTemplateService.createTemplateFromScript(
          currentScript.id,
          {
          name: templateName,
          description,
          teamId,
          duration: currentScript.duration,
          isPublic: false,
          }
        );
        toast.success(`Template "${templateName}" created successfully`);
        setShowTemplateModal(false);
      } catch (error) {
        logError("Failed to create template:", error);
        toast.error("Failed to create template", "Please try again");
      }
    },
    [currentScript, teamId, toast, setShowTemplateModal]
  );

  const handleLoadFromTemplate = useCallback(
    async (templateId: string, scriptName: string) => {
      try {
        const newScript = await PracticeTemplateService.createScriptFromTemplate(
          templateId,
          scriptName
        );
        setCurrentScript(newScript);
        setScriptName(newScript.title || newScript.name || "");
        setScriptDescription(newScript.description || "");
        setIsEditing(true);
        toast.success(`Script created from template`);
        setShowTemplateModal(false);
      } catch (error) {
        logError("Failed to load template:", error);
        toast.error("Failed to load template", "Please try again");
      }
    },
    [
      toast,
      setCurrentScript,
      setScriptName,
      setScriptDescription,
      setIsEditing,
      setShowTemplateModal,
    ]
  );

  return {
    handleSaveAsTemplate,
    handleLoadFromTemplate,
  };
}

import React, { useEffect, useState } from "react";
import { Button } from "../../../ui/Button/Button";
import { Input } from "../../../ui/Input";
import { Icon } from "../../../ui/Icon";
import { Typography } from "../../../design-system/Typography";
import { PixiDiagramCanvas } from "./PixiDiagramCanvas";
import { useToast } from "../../../../hooks/useToast";
import type { UnifiedDiagramData } from "../types/UnifiedDiagramTypes";

interface TemplateEditorProps {
  initialTemplate?: UnifiedDiagramData | null;
  onSave: (data: UnifiedDiagramData) => Promise<void>;
  onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onCancel,
}) => {
  const toast = useToast();

  // Template state
  const [templateData, setTemplateData] = useState<UnifiedDiagramData | null>(
    initialTemplate || {
      id: `template-${Date.now()}`,
      type: "template",
      name: "",
      pixiData: {
        version: 2,
        players: [],
        routes: [],
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
      metadata: {
        play_name: "",
        formation: "",
        p_type: "",
        personnel: "",
        pref_front: "",
      },
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "",
    }
  );

  const [templateName, setTemplateName] = useState(initialTemplate?.name || "");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update template data when name changes
  useEffect(() => {
    if (templateData) {
      setTemplateData((prev) =>
        prev
          ? {
              ...prev,
              name: templateName,
              metadata: {
                ...prev.metadata,
                play_name: templateName,
              },
            }
          : null
      );
    }
  }, [templateName, templateData]);

  const handleDiagramChange = (data: UnifiedDiagramData) => {
    setTemplateData(data);
  };

  const handleSave = async () => {
    if (!templateData) return;
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(templateData);
      toast.success("Template saved successfully!");
    } catch (error) {
      console.error("[TemplateEditor] Failed to save template:", error);
      toast.error("Failed to save template. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!templateData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Typography variant="body-lg">Loading template...</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Typography variant="headline-md" className="font-semibold">
          {initialTemplate ? "Edit Template" : "Create Template"}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            disabled={isSaving || !templateName.trim()}
          >
            {isSaving ? (
              <>
                <Icon name="loader" className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="save" className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            disabled={isSaving}
          >
            <Icon name="close" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Template metadata form */}
        <div className="p-4 border-b border-border space-y-4">
          <div>
            <label className="text-sm font-semibold text-text-secondary mb-1 block">
              Template Name
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Power Run Template, Zone Coverage Template"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-text-secondary mb-1 block">
              Description (optional)
            </label>
            <Input
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Brief description of this template"
            />
          </div>
        </div>

        {/* Diagram canvas */}
        <div className="flex-1 relative">
          <PixiDiagramCanvas
            data={templateData}
            mode="edit"
            onChange={handleDiagramChange}
            showControls={true}
            interactive={true}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

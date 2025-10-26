/**
 * FormationEditor - Unified Formation Editing Mode
 *
 * Integrated formation editor within the diagram editor system.
 * Consolidates FormationBuilderModal, FormationBuilderPanel, and FormationBuilderCanvas
 * into a single, cohesive editing experience using Pixi.js components.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../../ui/Button/Button";
import { Typography } from "../../../design-system/Typography";
import { FormationBadge } from "../../FormationBadge";
import { FormationService } from "../../../../services/formationService";
import { PersonnelService } from "../../../../services/personnelService";
import { useToast } from "../../../../hooks/useToast";
import { PixiDiagramCanvas } from "./PixiDiagramCanvas";
import type {
  UnifiedDiagramData,
  DiagramCanvasProps,
} from "../types/UnifiedDiagramTypes";
import type { FieldDimensions } from "../core/CoordinateSystem";
import type {
  Formation,
  FormationPlayerPosition,
  FormationCategory,
  FormationType,
  StrengthType,
} from "../../../../types/formation";
import type { PersonnelConfiguration } from "../../../../types/personnel";
import { Save } from "lucide-react";

interface FormationEditorProps extends Omit<DiagramCanvasProps, "data"> {
  formationId?: string;
  formation?: Formation | null;
  playbookId: string;
  onSave?: (formation: Formation) => void;
  onCancel?: () => void;
  fieldDimensions?: FieldDimensions;
}

const FORMATION_CATEGORIES: { value: FormationCategory; label: string }[] = [
  { value: "spread", label: "Spread" },
  { value: "pro", label: "Pro Style" },
  { value: "power", label: "Power" },
  { value: "special", label: "Special Teams" },
  { value: "goal_line", label: "Goal Line" },
  { value: "short_yardage", label: "Short Yardage" },
];

const FORMATION_TYPES: { value: FormationType; label: string }[] = [
  { value: "I Formation", label: "I Formation" },
  { value: "Singleback", label: "Singleback" },
  { value: "Pistol", label: "Pistol" },
  { value: "Shotgun", label: "Shotgun" },
  { value: "Empty", label: "Empty" },
  { value: "Trips", label: "Trips" },
  { value: "Bunch", label: "Bunch" },
  { value: "Stack", label: "Stack" },
  { value: "Wing", label: "Wing" },
  { value: "Other", label: "Other" },
];

const STRENGTH_OPTIONS: { value: StrengthType; label: string; icon: string }[] =
  [
    { value: "left", label: "Left", icon: "←" },
    { value: "balanced", label: "Balanced", icon: "⚖️" },
    { value: "right", label: "Right", icon: "→" },
  ];

export const FormationEditor: React.FC<FormationEditorProps> = ({
  formationId,
  formation: initialFormation,
  playbookId,
  onSave,
  onCancel,
  fieldDimensions = { width: 53.333, height: 35, pixelsPerYard: 15 },
}) => {
  const [formation, setFormation] = useState<Formation | null>(
    initialFormation || null
  );
  const [diagramData, setDiagramData] = useState<UnifiedDiagramData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [personnelConfigs, setPersonnelConfigs] = useState<
    PersonnelConfiguration[]
  >([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");
  const [formationName, setFormationName] = useState("");
  const [formationCategory, setFormationCategory] =
    useState<FormationCategory>("spread");
  const [formationType, setFormationType] =
    useState<FormationType>("Singleback");
  const [formationStrength, setFormationStrength] =
    useState<StrengthType>("balanced");
  const [formationDescription, setFormationDescription] = useState("");

  const toast = useToast();

  // Load formation data when editing
  useEffect(() => {
    if (!formationId) {
      // New formation - initialize empty state
      setFormation(null);
      setFormationName("");
      setSelectedPersonnel("");
      setFormationDescription("");
      setDiagramData({
        id: `formation-${Date.now()}`,
        type: "formation",
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
      });
      return;
    }

    // Load existing formation
    const loadFormation = async () => {
      setIsLoading(true);
      try {
        const data = await FormationService.getFormationById(formationId);
        setFormation(data);
        setFormationName(data.name || "");
        setSelectedPersonnel(data.personnel_name || "");
        setFormationCategory(data.category || "spread");
        setFormationType(data.formation_type || "Singleback");
        setFormationStrength(data.run_strength || "balanced");
        setFormationDescription(data.description || "");

        // Convert formation to unified diagram data
        const unifiedData: UnifiedDiagramData = {
          id: data.id,
          type: "formation",
          name: data.name,
          pixiData: {
            version: 2,
            players:
              data.player_positions?.map((pos, index) => ({
                id: `player-${index}`,
                x: pos.x,
                y: pos.y,
                jerseyNumber: pos.jerseyNumber || pos.position || "1",
                team: "offense" as const,
                color: 0x4a7c59, // Default green
                role: pos.role,
                position: "regular" as const,
              })) || [],
            routes: [],
            meta: {
              createdAt: new Date(data.created_at).getTime(),
              updatedAt: new Date(data.updated_at).getTime(),
            },
          },
          metadata: {
            play_name: data.name || "",
            formation: data.formation_type || "",
            p_type: data.category || "",
            personnel: data.personnel_id || "",
            pref_front: "",
          },
          version: data.version,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          createdBy: data.created_by || "",
        };

        setDiagramData(unifiedData);
      } catch (error) {
        console.error("Failed to load formation:", error);
        toast.error("Failed to load formation");
      } finally {
        setIsLoading(false);
      }
    };

    loadFormation();
  }, [formationId, toast]);

  // Load personnel configurations
  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        const configs =
          await PersonnelService.getPersonnelConfigurations(playbookId);
        setPersonnelConfigs(configs);
      } catch (error) {
        console.error("Failed to load personnel configurations:", error);
      }
    };

    loadPersonnel();
  }, [playbookId]);

  // Handle diagram changes
  const handleDiagramChange = useCallback((data: UnifiedDiagramData) => {
    setDiagramData(data);
  }, []);

  // Save formation
  const handleSave = useCallback(async () => {
    if (!diagramData) return;

    // Validation
    if (!formationName.trim()) {
      toast.error("Formation name is required");
      return;
    }

    if (diagramData.pixiData.players.length === 0) {
      toast.error("Add at least one player to the formation");
      return;
    }

    if (diagramData.pixiData.players.length > 11) {
      toast.error("Formation cannot have more than 11 players");
      return;
    }

    setIsSaving(true);
    try {
      const playerPositions: FormationPlayerPosition[] =
        diagramData.pixiData.players.map((player) => ({
          position: player.role || player.jerseyNumber,
          x: player.x,
          y: player.y,
          label: selectedPersonnel,
          role: player.role,
          jerseyNumber: player.jerseyNumber,
        }));

      let savedFormation: Formation;

      if (formationId && formation) {
        // Update existing formation
        savedFormation = await FormationService.updateFormation(formationId, {
          name: formationName,
          player_positions: playerPositions,
          personnel_name: selectedPersonnel,
          category: formationCategory,
          formation_type: formationType,
          run_strength: formationStrength,
          description: formationDescription,
          creation_source: "formation_builder",
          creation_context: {
            user_action: "formation_editor_save",
            source_version: "2.0.0",
            active_mode: "formation",
          },
        });
      } else {
        // Create new formation
        savedFormation = await FormationService.createFormation({
          playbook_id: playbookId,
          name: formationName,
          player_positions: playerPositions,
          personnel_name: selectedPersonnel,
          category: formationCategory,
          formation_type: formationType,
          run_strength: formationStrength,
          description: formationDescription,
          creation_source: "formation_builder",
          creation_context: {
            user_action: "formation_editor_create",
            source_version: "2.0.0",
            active_mode: "formation",
          },
        });
      }

      toast.success(
        `Formation ${formationId ? "updated" : "created"} successfully`
      );
      onSave?.(savedFormation);
    } catch (error) {
      console.error("Failed to save formation:", error);
      toast.error(`Failed to ${formationId ? "update" : "create"} formation`);
    } finally {
      setIsSaving(false);
    }
  }, [
    diagramData,
    formationId,
    formation,
    formationName,
    selectedPersonnel,
    formationCategory,
    formationType,
    formationStrength,
    formationDescription,
    playbookId,
    toast,
    onSave,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 mx-auto"></div>
          <div className="text-secondary mt-2">Loading formation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-divider bg-surface">
        <div className="flex items-center gap-4">
          <Typography variant="headline-lg" className="text-primary">
            {formationId ? "Edit Formation" : "Create Formation"}
          </Typography>
          {formation && <FormationBadge formationId={formation.id} />}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !formationName.trim()}
            loading={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {formationId ? "Update" : "Create"} Formation
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Formation Properties Sidebar */}
        <div className="w-80 border-r border-divider bg-surface-muted p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <Typography variant="headline-md" className="text-primary mb-3">
                Formation Details
              </Typography>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Formation Name *
                  </label>
                  <input
                    type="text"
                    value={formationName}
                    onChange={(e) => setFormationName(e.target.value)}
                    className="w-full px-3 py-2 border border-divider rounded-md focus:ring-2 focus:ring-jade-500 focus:border-transparent"
                    placeholder="e.g., Spread Right 11 Personnel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Description
                  </label>
                  <textarea
                    value={formationDescription}
                    onChange={(e) => setFormationDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-divider rounded-md focus:ring-2 focus:ring-jade-500 focus:border-transparent"
                    placeholder="Optional description..."
                  />
                </div>
              </div>
            </div>

            {/* Formation Properties */}
            <div>
              <Typography variant="headline-md" className="text-primary mb-3">
                Formation Properties
              </Typography>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Category
                  </label>
                  <select
                    value={formationCategory}
                    onChange={(e) =>
                      setFormationCategory(e.target.value as FormationCategory)
                    }
                    className="w-full px-3 py-2 border border-divider rounded-md focus:ring-2 focus:ring-jade-500 focus:border-transparent"
                  >
                    {FORMATION_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Type
                  </label>
                  <select
                    value={formationType}
                    onChange={(e) =>
                      setFormationType(e.target.value as FormationType)
                    }
                    className="w-full px-3 py-2 border border-divider rounded-md focus:ring-2 focus:ring-jade-500 focus:border-transparent"
                  >
                    {FORMATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Strength
                  </label>
                  <div className="flex gap-2">
                    {STRENGTH_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormationStrength(option.value)}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                          formationStrength === option.value
                            ? "border-jade-500 bg-jade-50 text-jade-700"
                            : "border-divider hover:border-jade-300"
                        }`}
                      >
                        {option.icon} {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personnel Configuration */}
            <div>
              <Typography variant="headline-md" className="text-primary mb-3">
                Personnel Package
              </Typography>

              <div className="space-y-2">
                {personnelConfigs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => setSelectedPersonnel(config.name)}
                    className={`w-full text-left px-3 py-2 border rounded-md transition-colors ${
                      selectedPersonnel === config.name
                        ? "border-jade-500 bg-jade-50 text-jade-700"
                        : "border-divider hover:border-jade-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{config.name}</span>
                      <span className="text-sm text-secondary">
                        {config.players.length} players
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          {diagramData && (
            <>
              <PixiDiagramCanvas
                data={diagramData}
                mode="edit"
                width={800}
                height={600}
                fieldDimensions={fieldDimensions}
                onReady={() => {}} // Ready callback with no params
                onChange={handleDiagramChange}
                showControls={true}
                interactive={true}
                className="w-full h-full"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

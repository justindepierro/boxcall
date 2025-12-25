import React, { useCallback, useEffect, useState } from "react";
import { table } from "../data/supabase/db";
import type { AchievementDefinition } from "../services/achievementService";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Dropdown } from "../components/ui/Dropdown";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import type { BadgeVariant } from "../components/ui/Badge/Badge";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { ConfirmationModal } from "../components/ui/ConfirmationModal";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { useToast } from "../hooks/useToast";
import { logError } from "../utils/logger";
import { useActiveTeamStore } from "../stores/activeTeamStore";

type AchievementCategory =
  | "general"
  | "practice"
  | "game"
  | "social"
  | "milestone";

type AchievementTriggerType =
  | "action_count"
  | "streak"
  | "milestone"
  | "special";

type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface AchievementFormData {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  trigger_type: AchievementTriggerType;
  trigger_target: string;
  trigger_count: number;
  points: number;
  rarity: AchievementRarity;
}

const defaultFormData: AchievementFormData = {
  name: "",
  description: "",
  icon: "trophy",
  category: "general",
  trigger_type: "action_count",
  trigger_target: "",
  trigger_count: 1,
  points: 10,
  rarity: "common",
};

const categoryOptions = [
  { value: "general", label: "General" },
  { value: "practice", label: "Practice" },
  { value: "game", label: "Game" },
  { value: "social", label: "Social" },
  { value: "milestone", label: "Milestone" },
];

const triggerTypeOptions = [
  { value: "action_count", label: "Action Count" },
  { value: "streak", label: "Streak" },
  { value: "milestone", label: "Milestone" },
  { value: "special", label: "Special" },
];

const rarityOptions = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
];

const triggerTargetOptions = [
  { value: "play_created", label: "Play Created" },
  { value: "post_sent", label: "Post Sent" },
  { value: "player_added", label: "Player Added" },
  { value: "game_won", label: "Game Won" },
  { value: "game_won_streak", label: "Game Win Streak" },
  { value: "points_milestone", label: "Points Milestone" },
  { value: "achievements_earned", label: "Achievements Earned" },
];

const getRarityColor = (rarity: string): BadgeVariant => {
  if (rarity === "common") return "neutral";
  if (rarity === "uncommon") return "info";
  if (rarity === "rare") return "success";
  if (rarity === "epic") return "warning";
  if (rarity === "legendary") return "accent";
  return "neutral";
};

const buildAchievementCriteria = (formData: AchievementFormData) => ({
  trigger_type: formData.trigger_type,
  trigger_target: formData.trigger_target,
  trigger_count: formData.trigger_count,
  rarity: formData.rarity,
});

const buildInsertRow = (formData: AchievementFormData) => ({
  name: formData.name,
  description: formData.description || null,
  icon: formData.icon || null,
  category: formData.category,
  points: formData.points,
  is_active: true,
  criteria: buildAchievementCriteria(formData),
});

const buildUpdateRow = (formData: AchievementFormData) => ({
  name: formData.name,
  description: formData.description || null,
  icon: formData.icon || null,
  category: formData.category,
  points: formData.points,
  criteria: buildAchievementCriteria(formData),
});

const fetchAchievements = async (activeTeamId: string | null) => {
  let q = table("achievement_definitions")
    .select("*")
    .order("category", { ascending: true });

  if (activeTeamId) {
    q = q.or(`team_id.is.null,team_id.eq.${activeTeamId}`);
  } else {
    q = q.is("team_id", null);
  }

  const { data, error } = await q;

  if (error) throw error;
  return (data || []) as AchievementDefinition[];
};

const insertAchievement = async (
  formData: AchievementFormData,
  teamId: string | null
) => {
  const insertRow = buildInsertRow(formData);

  const { data, error } = await table("achievement_definitions")
    .insert([
      {
        ...insertRow,
        team_id: teamId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as AchievementDefinition;
};

const updateAchievement = async (params: {
  id: string;
  formData: AchievementFormData;
}) => {
  const { id, formData } = params;
  const updateRow = buildUpdateRow(formData);

  const { data, error } = await table("achievement_definitions")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AchievementDefinition;
};

const deleteAchievement = async (id: string) => {
  const { error } = await table("achievement_definitions")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

const parseUploadedAchievements = async (file: File) => {
  const text = await file.text();

  if (file.name.endsWith(".csv")) {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj as unknown as AchievementFormData;
    });
  }

  if (file.name.endsWith(".json")) {
    return JSON.parse(text) as AchievementFormData[];
  }

  return null;
};

interface AchievementAdminToolbarProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  onSeed: () => void;
  seedDisabled?: boolean;
}

const AchievementAdminToolbar: React.FC<AchievementAdminToolbarProps> = ({
  onUpload,
  onCreate,
  onSeed,
  seedDisabled,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Achievement Management
        </h1>
        <p className="text-secondary mt-2">
          Create and manage Xbox-style achievements for your users
        </p>
      </div>
      <div className="flex gap-4">
        <label className="inline-flex items-center px-4 py-2 border border-secondary rounded-lg shadow-sm text-sm font-medium text-secondary bg-primary hover:bg-secondary cursor-pointer">
          <Icon name="upload" className="w-4 h-4 mr-2" />
          Upload CSV/JSON
          <input
            type="file"
            accept=".csv,.json"
            onChange={onUpload}
            className="hidden"
          />
        </label>
        <Button onClick={onCreate}>
          <Icon name="plus" className="w-4 h-4 mr-2" />
          Create Achievement
        </Button>

        <Button variant="secondary" onClick={onSeed} disabled={seedDisabled}>
          <Icon name="sparkles" className="w-4 h-4 mr-2" />
          Seed Defaults
        </Button>
      </div>
    </div>
  );
};

interface AchievementGridProps {
  achievements: AchievementDefinition[];
  onEdit: (achievement: AchievementDefinition) => void;
  onDelete: (id: string) => void;
}

const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid-dashboard">
      {achievements.map((achievement) => {
        const criteria = (achievement.criteria ?? {}) as any;
        const rarity = (criteria.rarity ?? "common") as AchievementRarity;
        const triggerTarget = String(criteria.trigger_target ?? "");
        const triggerCount = Number(criteria.trigger_count ?? 1);

        return (
          <Card key={achievement.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Icon
                  name={(achievement.icon ?? "trophy") as any}
                  className="w-8 h-8 text-jade-600 mr-3"
                />
                <div>
                  <h3 className="font-semibold text-lg">{achievement.name}</h3>
                  <Badge variant={getRarityColor(rarity)} className="mt-1">
                    {rarity}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(achievement)}
                >
                  <Icon name="edit" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(achievement.id)}
                  className="text-error hover:text-error"
                >
                  <Icon name="delete" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-secondary text-sm mb-4">
              {achievement.description ?? ""}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Category:</span>
                <Badge variant="neutral">{achievement.category ?? ""}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Trigger:</span>
                <span>
                  {triggerTarget} ({triggerCount})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Points:</span>
                <span className="font-semibold text-jade-600">
                  {achievement.points ?? 0}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

interface AchievementEditorModalProps {
  isOpen: boolean;
  editingAchievement: AchievementDefinition | null;
  formData: AchievementFormData;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setFormData: React.Dispatch<React.SetStateAction<AchievementFormData>>;
}

const AchievementEditorModal: React.FC<AchievementEditorModalProps> = ({
  isOpen,
  editingAchievement,
  formData,
  saving,
  onClose,
  onSubmit,
  setFormData,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAchievement ? "Edit Achievement" : "Create Achievement"}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Achievement name"
          />
          <Input
            label="Icon"
            value={formData.icon}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, icon: e.target.value }))
            }
            placeholder="trophy"
          />
        </div>

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Achievement description"
        />

        <div className="grid grid-cols-2 gap-4">
          <Dropdown
            label="Category"
            value={formData.category}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value as any }))
            }
            options={categoryOptions}
          />
          <Dropdown
            label="Rarity"
            value={formData.rarity}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, rarity: value as any }))
            }
            options={rarityOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Dropdown
            label="Trigger Type"
            value={formData.trigger_type}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                trigger_type: value as any,
              }))
            }
            options={triggerTypeOptions}
          />
          <Dropdown
            label="Trigger Target"
            value={formData.trigger_target}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                trigger_target: value,
              }))
            }
            options={triggerTargetOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Trigger Count"
            type="number"
            value={formData.trigger_count.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                trigger_count: parseInt(e.target.value) || 1,
              }))
            }
          />
          <Input
            label="Points"
            type="number"
            value={formData.points.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                points: parseInt(e.target.value) || 10,
              }))
            }
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {(() => {
              if (saving) return "Saving...";
              if (editingAchievement) return "Update";
              return "Create";
            })()}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// eslint-disable-next-line max-lines-per-function
export const AchievementAdminPage: React.FC = () => {
  const toast = useToast();
  const activeTeamId = useActiveTeamStore((s) => s.activeTeamId);
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<AchievementDefinition | null>(null);
  const [formData, setFormData] =
    useState<AchievementFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    try {
      const data = await fetchAchievements(activeTeamId);
      setAchievements(data);
    } catch (error) {
      logError("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const created = await insertAchievement(formData, activeTeamId);
      setAchievements((prev) => [...prev, created]);
      setShowCreateModal(false);
      setFormData(defaultFormData);
    } catch (error) {
      logError("Error creating achievement:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!activeTeamId) {
      toast.error("Select a team before seeding achievements");
      return;
    }

    setSeeding(true);
    try {
      const { count, error: countError } = await table(
        "achievement_definitions"
      )
        .select("id", { count: "exact", head: true })
        .eq("team_id", activeTeamId);

      if (countError) throw countError;

      if ((count ?? 0) > 0) {
        toast.success("Defaults already seeded for this team");
        return;
      }

      const defaults = [
        {
          name: "First Play Created",
          description: "Create your first play",
          icon: "trophy",
          category: "general",
          points: 10,
          is_active: true,
          team_id: activeTeamId,
          criteria: {
            trigger_type: "action_count",
            trigger_target: "play_created",
            trigger_count: 1,
            rarity: "common",
          },
        },
        {
          name: "Playbook Builder",
          description: "Create 10 plays",
          icon: "clipboard",
          category: "practice",
          points: 25,
          is_active: true,
          team_id: activeTeamId,
          criteria: {
            trigger_type: "action_count",
            trigger_target: "play_created",
            trigger_count: 10,
            rarity: "uncommon",
          },
        },
        {
          name: "Team Bulletin Poster",
          description: "Post on the team bulletin",
          icon: "message",
          category: "social",
          points: 10,
          is_active: true,
          team_id: activeTeamId,
          criteria: {
            trigger_type: "action_count",
            trigger_target: "post_sent",
            trigger_count: 1,
            rarity: "common",
          },
        },
        {
          name: "Roster Growing",
          description: "Add 5 players to your roster",
          icon: "users",
          category: "general",
          points: 20,
          is_active: true,
          team_id: activeTeamId,
          criteria: {
            trigger_type: "action_count",
            trigger_target: "player_added",
            trigger_count: 5,
            rarity: "uncommon",
          },
        },
        {
          name: "Milestone: 10 Achievements",
          description: "Earn 10 achievements",
          icon: "star",
          category: "milestone",
          points: 50,
          is_active: true,
          team_id: activeTeamId,
          criteria: {
            trigger_type: "milestone",
            trigger_target: "achievements_earned",
            trigger_count: 10,
            rarity: "rare",
          },
        },
      ];

      const { data: inserted, error: insertError } = await table(
        "achievement_definitions"
      )
        .insert(defaults)
        .select();

      if (insertError) throw insertError;

      setAchievements((prev) => [...prev, ...(inserted || [])]);
      toast.success(`Seeded ${inserted?.length || 0} default achievements`);
    } catch (error) {
      logError("Error seeding default achievements:", error);
      toast.error("Failed to seed defaults. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAchievement) return;

    setSaving(true);
    try {
      const updated = await updateAchievement({
        id: editingAchievement.id,
        formData,
      });
      setAchievements((prev) =>
        prev.map((a) => (a.id === editingAchievement.id ? updated : a))
      );
      setEditingAchievement(null);
      setFormData(defaultFormData);
    } catch (error) {
      logError("Error updating achievement:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteAchievement(deleteId);
      setAchievements((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success("Achievement deleted successfully");
    } catch (error) {
      logError("Error deleting achievement:", error);
      toast.error("Failed to delete achievement. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (achievement: AchievementDefinition) => {
    const criteria = (achievement.criteria ?? {}) as any;

    setEditingAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description ?? "",
      icon: achievement.icon ?? "trophy",
      category: (achievement.category as AchievementCategory) ?? "general",
      trigger_type:
        (criteria.trigger_type as AchievementTriggerType) ?? "action_count",
      trigger_target: String(criteria.trigger_target ?? ""),
      trigger_count: Number(criteria.trigger_count ?? 1),
      points: achievement.points ?? 10,
      rarity: (criteria.rarity as AchievementRarity) ?? "common",
    });
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedAchievements(file);
      if (!parsed) {
        toast.error("Please upload a CSV or JSON file");
        return;
      }

      const rows = parsed.map(buildInsertRow);
      const { data: inserted, error } = await table("achievement_definitions")
        .insert(rows)
        .select();

      if (error) throw error;

      setAchievements((prev) => [...prev, ...(inserted || [])]);
      toast.success(
        `Successfully uploaded ${inserted?.length || 0} achievements`
      );
    } catch (error) {
      logError("Error uploading achievements:", error);
      toast.error(
        "Error uploading achievements. Please check the file format."
      );
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Achievements"
        subtitle="Fetching achievement definitions and settings..."
      />
    );
  }

  return (
    <div className="container-page container-padding">
      <AchievementAdminToolbar
        onUpload={handleBulkUpload}
        onCreate={() => setShowCreateModal(true)}
        onSeed={handleSeedDefaults}
        seedDisabled={seeding}
      />

      <AchievementGrid
        achievements={achievements}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AchievementEditorModal
        isOpen={showCreateModal || !!editingAchievement}
        editingAchievement={editingAchievement}
        formData={formData}
        saving={saving}
        setFormData={setFormData}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAchievement(null);
          setFormData(defaultFormData);
        }}
        onSubmit={editingAchievement ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Achievement"
        message="Are you sure you want to delete this achievement? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AchievementAdminPage;

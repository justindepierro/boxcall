import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { AchievementDefinition } from "../services/achievementService";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import type { BadgeVariant } from "../components/ui/Badge/Badge";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { LoadingScreen } from "../components/ui/LoadingScreen";

interface AchievementFormData {
  name: string;
  description: string;
  icon: string;
  category: AchievementDefinition["category"];
  trigger_type: AchievementDefinition["trigger_type"];
  trigger_target: string;
  trigger_count: number;
  points: number;
  rarity: AchievementDefinition["rarity"];
}

const defaultFormData: AchievementFormData = {
  name: "",
  description: "",
  icon: "trophy",
  category: "gameplay",
  trigger_type: "action_count",
  trigger_target: "",
  trigger_count: 1,
  points: 10,
  rarity: "common",
};

const categoryOptions = [
  { value: "gameplay", label: "Gameplay" },
  { value: "social", label: "Social" },
  { value: "teamwork", label: "Teamwork" },
  { value: "leadership", label: "Leadership" },
  { value: "milestone", label: "Milestone" },
  { value: "special", label: "Special" },
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

export const AchievementAdminPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<AchievementDefinition | null>(null);
  const [formData, setFormData] =
    useState<AchievementFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievement_definitions")
        .select("*")
        .order("category", { ascending: true })
        .order("rarity", { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("achievement_definitions")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setAchievements((prev) => [...prev, data]);
      setShowCreateModal(false);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Error creating achievement:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAchievement) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("achievement_definitions")
        .update(formData)
        .eq("id", editingAchievement.id)
        .select()
        .single();

      if (error) throw error;

      setAchievements((prev) =>
        prev.map((a) => (a.id === editingAchievement.id ? data : a))
      );
      setEditingAchievement(null);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Error updating achievement:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const { error } = await supabase
        .from("achievement_definitions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  };

  const handleEdit = (achievement: AchievementDefinition) => {
    setEditingAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      trigger_type: achievement.trigger_type,
      trigger_target: achievement.trigger_target,
      trigger_count: achievement.trigger_count || 1,
      points: achievement.points,
      rarity: achievement.rarity,
    });
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data: AchievementFormData[];

      if (file.name.endsWith(".csv")) {
        // Parse CSV
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));

        data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj as AchievementFormData;
        });
      } else if (file.name.endsWith(".json")) {
        // Parse JSON
        data = JSON.parse(text);
      } else {
        alert("Please upload a CSV or JSON file");
        return;
      }

      // Insert achievements
      const { data: inserted, error } = await supabase
        .from("achievement_definitions")
        .insert(data)
        .select();

      if (error) throw error;

      setAchievements((prev) => [...prev, ...(inserted || [])]);
      alert(`Successfully uploaded ${inserted?.length || 0} achievements`);
    } catch (error) {
      console.error("Error uploading achievements:", error);
      alert("Error uploading achievements. Please check the file format.");
    }
  };

  const getRarityColor = (rarity: string): BadgeVariant => {
    switch (rarity) {
      case "common":
        return "neutral";
      case "uncommon":
        return "info";
      case "rare":
        return "success";
      case "epic":
        return "warning";
      case "legendary":
        return "accent";
      default:
        return "neutral";
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Achievement Management
          </h1>
          <p className="text-text-secondary mt-2">
            Create and manage Xbox-style achievements for your users
          </p>
        </div>
        <div className="flex gap-4">
          <label className="inline-flex items-center px-4 py-2 border border-border-medium rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface-primary hover:bg-surface-secondary cursor-pointer">
            <Icon name="upload" className="w-4 h-4 mr-2" />
            Upload CSV/JSON
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Create Achievement
          </Button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Icon
                  name={achievement.icon as any}
                  className="w-8 h-8 text-jade-600 mr-3"
                />
                <div>
                  <h3 className="font-semibold text-lg">{achievement.name}</h3>
                  <Badge
                    variant={getRarityColor(achievement.rarity)}
                    className="mt-1"
                  >
                    {achievement.rarity}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(achievement)}
                >
                  <Icon name="edit" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(achievement.id)}
                  className="text-text-error hover:text-text-error"
                >
                  <Icon name="delete" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              {achievement.description}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Category:</span>
                <Badge variant="neutral">{achievement.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Trigger:</span>
                <span>
                  {achievement.trigger_target} ({achievement.trigger_count})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Points:</span>
                <span className="font-semibold text-jade-600">
                  {achievement.points}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingAchievement}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAchievement(null);
          setFormData(defaultFormData);
        }}
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
            <Select
              label="Category"
              value={formData.category}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value as any }))
              }
              options={categoryOptions}
            />
            <Select
              label="Rarity"
              value={formData.rarity}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, rarity: value as any }))
              }
              options={rarityOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Trigger Type"
              value={formData.trigger_type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, trigger_type: value as any }))
              }
              options={triggerTypeOptions}
            />
            <Select
              label="Trigger Target"
              value={formData.trigger_target}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  trigger_target: String(value),
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
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingAchievement(null);
                setFormData(defaultFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingAchievement ? handleUpdate : handleCreate}
              disabled={saving}
            >
              {saving ? "Saving..." : editingAchievement ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AchievementAdminPage;

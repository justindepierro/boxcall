// Server-backed playbook view preset types
export interface ServerPlaybookViewPreset {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  filters: {
    searchQuery?: string;
    formation?: string;
    playType?: string;
    category?: string;
    subcategory?: string;
  };
  created_at: string; // ISO from DB
  updated_at: string;
  archived: boolean;
}

export type CreateServerPlaybookViewPresetInput = {
  name: string;
  filters: ServerPlaybookViewPreset["filters"];
  team_id?: string | null;
};

export type UpdateServerPlaybookViewPresetInput = {
  id: string;
  name?: string;
  filters?: ServerPlaybookViewPreset["filters"];
  archived?: boolean;
};

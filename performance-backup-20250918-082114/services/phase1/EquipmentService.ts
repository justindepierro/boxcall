/**
 * Phase 1 Foundation - Equipment Service
 * Critical service required by practiceService.ts
 *
 * Manages team equipment inventory, checkout status, and maintenance tracking.
 */

import { supabase } from "../../lib/supabase";
import { BaseService } from "../base/BaseService";

import type {
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
} from "../../types/database";

export class EquipmentService extends BaseService<"equipment"> {
  constructor() {
    super(supabase, "equipment");
  }

  // Validation methods required by BaseService
  protected async validateCreate(data: EquipmentInsert): Promise<void> {
    if (!data.team_id) {
      throw new Error("Team ID is required");
    }
    if (!data.name) {
      throw new Error("Equipment name is required");
    }
    if (!data.category) {
      throw new Error("Equipment category is required");
    }
    if (data.quantity && data.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
  }

  protected async validateUpdate(
    _id: string,
    data: EquipmentUpdate
  ): Promise<void> {
    if (data.quantity && data.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
  }

  // Domain-specific methods for equipment management

  /**
   * Get all equipment for a team grouped by category
   */
  async getTeamEquipmentByCategory(
    teamId: string
  ): Promise<Record<string, Equipment[]>> {
    const equipment = await this.findMany({ team_id: teamId, is_active: true });

    return equipment.reduce(
      (acc, item) => {
        const category = item.category || "uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, Equipment[]>
    );
  }

  /**
   * Get available equipment for checkout
   */
  async getAvailableEquipment(
    teamId: string,
    category?: string
  ): Promise<Equipment[]> {
    const filters: Partial<Equipment> = {
      team_id: teamId,
      is_active: true,
      checkout_status: "available",
    };

    if (category) {
      filters.category = category;
    }

    return this.findMany(filters);
  }

  /**
   * Check out equipment to a user
   */
  async checkOut(equipmentId: string, _assignedTo: string): Promise<Equipment> {
    const equipment = await this.findById(equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    if (equipment.checkout_status !== "available") {
      throw new Error("Equipment is not available for checkout");
    }

    return this.update(equipmentId, {
      checkout_status: "checked_out",
      // assigned_to field would need to be added to schema
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Check in equipment
   */
  async checkIn(equipmentId: string): Promise<Equipment> {
    return this.update(equipmentId, {
      checkout_status: "available",
      // assigned_to: null would be set here
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Mark equipment for maintenance
   */
  async markForMaintenance(
    equipmentId: string,
    notes?: string
  ): Promise<Equipment> {
    const updateData: EquipmentUpdate = {
      checkout_status: "maintenance",
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    return this.update(equipmentId, updateData);
  }

  /**
   * Get equipment requiring maintenance
   */
  async getMaintenanceRequired(teamId: string): Promise<Equipment[]> {
    const { data, error } = await this.supabase
      .from("equipment")
      .select("*")
      .eq("team_id", teamId)
      .eq("checkout_status", "maintenance")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get equipment by condition
   */
  async getEquipmentByCondition(
    teamId: string,
    condition: "excellent" | "good" | "fair" | "poor"
  ): Promise<Equipment[]> {
    return this.findMany({
      team_id: teamId,
      condition,
      is_active: true,
    });
  }

  /**
   * Get equipment inventory summary
   */
  async getInventorySummary(teamId: string): Promise<{
    totalItems: number;
    totalValue: number;
    byCategory: Record<string, { count: number; value: number }>;
    byCondition: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const equipment = await this.findMany({ team_id: teamId, is_active: true });

    const summary = {
      totalItems: equipment.length,
      totalValue: 0,
      byCategory: {} as Record<string, { count: number; value: number }>,
      byCondition: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    equipment.forEach((item) => {
      // Total value
      if (item.cost) {
        summary.totalValue += Number(item.cost) * (item.quantity || 1);
      }

      // By category
      const category = item.category || "uncategorized";
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { count: 0, value: 0 };
      }
      summary.byCategory[category].count += item.quantity || 1;
      if (item.cost) {
        summary.byCategory[category].value +=
          Number(item.cost) * (item.quantity || 1);
      }

      // By condition
      const condition = item.condition || "unknown";
      summary.byCondition[condition] =
        (summary.byCondition[condition] || 0) + 1;

      // By status
      const status = item.checkout_status || "unknown";
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    });

    return summary;
  }

  /**
   * Search equipment by name or category
   */
  async searchEquipment(teamId: string, query: string): Promise<Equipment[]> {
    const { data, error } = await this.supabase
      .from("equipment")
      .select("*")
      .eq("team_id", teamId)
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  /**
   * Bulk import equipment from CSV data
   */
  async bulkImport(
    teamId: string,
    equipmentData: Array<{
      name: string;
      category: string;
      quantity?: number;
      condition?: "excellent" | "good" | "fair" | "poor";
      location?: string;
      cost?: number;
    }>,
    _createdBy: string
  ): Promise<Equipment[]> {
    const equipment = equipmentData.map((item) => ({
      team_id: teamId,
      name: item.name,
      category: item.category,
      quantity: item.quantity || 1,
      condition: item.condition || ("good" as const),
      location: item.location,
      cost: item.cost,
      // created_by would be set here if field exists in schema
    }));

    const results: Equipment[] = [];

    // Create equipment items sequentially
    for (const item of equipment) {
      try {
        const created = await this.create(item);
        results.push(created);
      } catch (error) {
        console.error(`Failed to create equipment ${item.name}:`, error);
        // Continue with remaining items
      }
    }

    return results;
  }

  /**
   * Retire old equipment
   */
  async retire(equipmentId: string, reason?: string): Promise<Equipment> {
    const updateData: EquipmentUpdate = {
      is_active: false,
      checkout_status: "maintenance", // Prevent further checkout
      updated_at: new Date().toISOString(),
    };

    if (reason) {
      const currentEquipment = await this.findById(equipmentId);
      const existingNotes = currentEquipment?.notes || "";
      updateData.notes = existingNotes
        ? `${existingNotes}\n\nRetired: ${reason}`
        : `Retired: ${reason}`;
    }

    return this.update(equipmentId, updateData);
  }
}

// Create singleton instance
export const equipmentService = new EquipmentService();

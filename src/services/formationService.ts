/**
 * Formation Service - Minimal Stub
 *
 * This is a temporary stub for the archived FormationService.
 * The formation system has been simplified and this service is no longer needed.
 * All methods throw errors to prevent accidental usage.
 */

export class FormationService {
  static async getFormationById(_id: string) {
    throw new Error(
      "FormationService has been archived. Formation system simplified."
    );
  }

  static async getFormationsByPlaybook(_playbookId: string) {
    return [];
  }

  static async getUnpairedFormations(_playbookId: string) {
    return [];
  }

  static async getStandaloneFormations(_playbookId: string) {
    return [];
  }

  static async getSuggestedMatches(_formationId: string, _playbookId: string) {
    return [];
  }

  static async linkExistingFormations(_leftId: string, _rightId: string) {
    throw new Error(
      "FormationService has been archived. Formation system simplified."
    );
  }

  static async markAsStandalone(_formationId: string) {
    throw new Error(
      "FormationService has been archived. Formation system simplified."
    );
  }

  static async updateFormation(_id: string, _data: any) {
    throw new Error(
      "FormationService has been archived. Formation system simplified."
    );
  }

  static async createFormation(_data: any) {
    throw new Error(
      "FormationService has been archived. Formation system simplified."
    );
  }

  static async deleteFormation(_id: string) {
    throw new Error(
      "FormationService has been archived. Formation system simplified."
    );
  }
}

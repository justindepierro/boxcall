import { describe, it, expect, vi, beforeEach } from "vitest";
import { ensureValidFormation } from "../formationGuard";
import { FormationService } from "../../services/formationService";

vi.mock("../../services/formationService");

const mockFormationService = FormationService as unknown as {
  getFormationById: ReturnType<typeof vi.fn>;
  getFormationsByPlaybook: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ensureValidFormation", () => {
  it("returns formation when formationId is valid", async () => {
    mockFormationService.getFormationById = vi.fn().mockResolvedValue({
      id: "formation-1",
      name: "Trips Right",
      playbook_id: "playbook-1",
    });

    const result = await ensureValidFormation({
      playbookId: "playbook-1",
      formationId: "formation-1",
    });

    expect(result).toEqual({
      formationId: "formation-1",
      formationName: "Trips Right",
    });
  });

  it("throws when formationId belongs to different playbook", async () => {
    mockFormationService.getFormationById = vi.fn().mockResolvedValue({
      id: "formation-1",
      name: "Trips Right",
      playbook_id: "other-playbook",
    });

    await expect(
      ensureValidFormation({
        playbookId: "playbook-1",
        formationId: "formation-1",
      })
    ).rejects.toThrow("Selected formation belongs to a different playbook.");
  });

  it("finds formation by name when custom not allowed", async () => {
    mockFormationService.getFormationById = vi
      .fn()
      .mockRejectedValue("not used");
    mockFormationService.getFormationsByPlaybook = vi
      .fn()
      .mockResolvedValue([{ id: "formation-2", name: "Trips Right" }]);

    const result = await ensureValidFormation({
      playbookId: "playbook-1",
      formationName: "Trips Right",
      allowCustom: false,
    });

    expect(result).toEqual({
      formationId: "formation-2",
      formationName: "Trips Right",
    });
  });

  it("throws when custom not allowed and formation missing", async () => {
    mockFormationService.getFormationById = vi
      .fn()
      .mockRejectedValue("not used");
    mockFormationService.getFormationsByPlaybook = vi
      .fn()
      .mockResolvedValue([{ id: "formation-2", name: "Trips Right" }]);

    await expect(
      ensureValidFormation({
        playbookId: "playbook-1",
        formationName: "Unknown Formation",
        allowCustom: false,
      })
    ).rejects.toThrow(
      'Formation "Unknown Formation" is not in your catalogue. Select an existing formation or create one in the Formation Builder.'
    );
  });

  it("returns trimmed formation when custom allowed", async () => {
    mockFormationService.getFormationById = vi
      .fn()
      .mockRejectedValue("not used");

    const result = await ensureValidFormation({
      playbookId: "playbook-1",
      formationName: "  Custom Formation  ",
      allowCustom: true,
    });

    expect(result).toEqual({
      formationName: "Custom Formation",
    });
  });

  it("validates personnel", async () => {
    mockFormationService.getFormationById = vi
      .fn()
      .mockRejectedValue("not used");

    await expect(
      ensureValidFormation({
        playbookId: "playbook-1",
        formationName: "Trips Right",
        allowCustom: true,
        personnel: "Trips",
      })
    ).rejects.toThrow();
  });
});

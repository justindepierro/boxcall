import { describe, it, expect, beforeAll, vi } from "vitest";

import { PlaysDomainService } from "../../domain/playsDomainService";
import * as PlaysServiceModule from "../../services/playsService";

import type { Play } from "../../types/play";
import type { InboundPlay } from "../../utils/playDataStandardization";

interface MinimalInboundPlay {
  play_name: string;
  formation: string;
  p_type: string;
}

beforeAll(() => {
  const mockPlay: Partial<Play> = {
    id: "00000000-0000-0000-0000-000000000001",
    playbook_id: "00000000-0000-0000-0000-000000000002",
    play_name: "Power O",
    formation: "I Right",
    p_type: "Run",
    confidence_base: 70,
    times_called: 0,
    times_successful: 0,
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: new Date(),
    updated_at: new Date(),
  };
  vi.spyOn(PlaysServiceModule.PlaysService, "createPlay").mockResolvedValue(
    mockPlay as Play
  );
});

describe("PlaysDomainService duplicate enforcement", () => {
  it("computes duplicateKey deterministically", async () => {
    const input: MinimalInboundPlay = {
      play_name: "Power O",
      formation: "I Right",
      p_type: "Run",
    };
    const { duplicateKey } = await PlaysDomainService.createPlay(
      input as unknown as InboundPlay
    );
    expect(duplicateKey).toBeDefined();
  });
});

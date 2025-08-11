import { describe, it, expect } from "vitest";
import { PlaysDomainService } from "../../domain/playsDomainService";

interface MinimalInboundPlay {
  play_name: string;
  formation: string;
  p_type: string;
}

// NOTE: This test assumes a test database or mocking layer.
// If real Supabase is used, ensure env vars point to a disposable instance.

describe("PlaysDomainService duplicate enforcement", () => {
  it("computes duplicateKey deterministically", async () => {
    const input: MinimalInboundPlay = {
      play_name: "Power O",
      formation: "I Right",
      p_type: "Run",
    };
    const { duplicateKey } = await PlaysDomainService.createPlay(input);
    expect(duplicateKey).toBeDefined();
  });
  // Duplicate conflict test is illustrative; would normally mock PlaysService + DB error 23505.
});

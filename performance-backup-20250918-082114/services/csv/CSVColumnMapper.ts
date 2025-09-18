/**
 * CSV Column Mapping Service
 *
 * Handles intelligent column detection and mapping for CSV imports
 */

import type { ColumnMappings } from "./types";

export class CSVColumnMapper {
  /**
   * Intelligent column mapping - maps various column names to our standard fields
   */
  static getColumnMappings(): ColumnMappings {
    return {
      // Core required fields
      formation: [
        "formation",
        "form",
        "format",
        "alignment",
        "formation_name",
        "formation name",
      ],
      play_name: [
        "play_name",
        "play name",
        "playname",
        "name",
        "play",
        "title",
      ],
      p_type: [
        "p_type",
        "p_Type",
        "play_type",
        "type",
        "category",
        "kind",
        "play type",
        "playtype",
      ],

      // Personnel and formation details
      personnel: [
        "personnel",
        "package",
        "grouping",
        "formation_personnel",
        "personnel group",
        "personnel_group",
      ],
      f_type: ["f_type", "formation_type", "form_type", "formtype", "formType"],
      f_dir: ["f_dir", "formation_direction", "form_dir", "direction"],

      // Tags and alignment
      ftag1: ["ftag1", "formation_tag1", "form_tag1"],
      ftag2: ["ftag2", "formation_tag2", "form_tag2"],
      ftag3: ["ftag3", "fTag3", "formation_tag3", "form_tag3"],
      back_align: ["back_align", "backfield_alignment", "back_alignment"],
      shift: ["shift", "formation_shift"],
      motion: ["motion", "pre_snap_motion"],

      // Play details
      one_word_play: [
        "one_word_play",
        "audible",
        "call",
        "quick_call",
        "signal",
        "code",
        "one word",
      ],
      p_tag1: ["p_tag1", "play_tag1"],
      p_tag2: ["p_tag2", "play_tag2"],
      play_dir: ["play_dir", "p_dir", "play_direction", "direction", "dir"],

      // Protection and blocking
      protection: ["protection", "prot", "pass_pro", "pass_protection"],
      p_str: [
        "p_str",
        "protection_strength",
        "blocking",
        "passStr",
        "pass_str",
      ],
      r_str: [
        "r_str",
        "route_strength",
        "route",
        "receiver_strength",
        "runStr",
        "run_str",
      ],

      // Key players
      key_player1: [
        "key_player1",
        "keyPlayer1",
        "key_player_1",
        "primary_player",
      ],
      key_player2: [
        "key_player2",
        "keyPlayer2",
        "key_player_2",
        "secondary_player",
      ],

      // Alignment details
      h_align: ["h_align", "hAlign", "h_alignment", "hot_receiver_align"],
      z_align: ["z_align", "zAlign", "z_alignment", "z_receiver_align"],

      // Route and concept details
      back_route: ["back_route", "backRoute", "running_back_route"],
      check_into: ["check_into", "check", "audible_to", "hot_route"],

      // Preferences
      pref_down: [
        "pref_down",
        "preferred_down",
        "down",
        "situation",
        "preferred down",
        "prefDown",
      ],
      pref_dis: [
        "pref_dis",
        "preferred_distance",
        "distance",
        "yardage",
        "preferred distance",
        "prefDis",
      ],
      pref_hash: [
        "pref_hash",
        "preferred_hash",
        "hash",
        "field_position",
        "prefHash",
      ],
      pref_cov: [
        "pref_cov",
        "preferred_coverage",
        "coverage",
        "prefDCov",
        "prefCov",
      ],
      pref_front: [
        "pref_front",
        "preferred_front",
        "front",
        "prefDFront",
        "prefFront",
      ],
      pref_blitz: [
        "pref_blitz",
        "preferred_blitz",
        "blitz",
        "PrefDBlitz",
        "prefBlitz",
      ],
      pref_situation: [
        "pref_situation",
        "preferred_situation",
        "prefSituation",
      ],
      pref_field_pos: [
        "pref_field_pos",
        "preferred_field_position",
        "prefFieldPos",
      ],

      // Success metrics
      confidence_base: ["confidence_base", "confidence", "base_confidence"],
      success_rate: ["success_rate", "success", "completion_rate"],
      times_called: ["times_called", "called", "usage_count"],
      times_successful: ["times_successful", "successful", "success_count"],

      // Media and metadata
      diagram_url: ["diagram_url", "diagram", "play_diagram"],
      video_url: ["video_url", "video", "play_video"],
      tags: ["tags", "labels", "categories"],

      // General notes
      notes: ["notes", "description", "details", "comments"],
    };
  }

  /**
   * Smart column detection - finds the best match for each column
   */
  static detectColumnMapping(headers: string[]): Record<string, string> {
    const mappings = this.getColumnMappings();
    const detected: Record<string, string> = {};

    headers.forEach((header) => {
      const originalHeader = header.trim();
      const cleanHeader = header
        .toLowerCase()
        .trim()
        .replace(/[_\s-]+/g, "_");

      let bestMatch = null;
      let bestScore = 0;

      // First, check for exact case-sensitive matches (for database field names)
      for (const [fieldName, variants] of Object.entries(mappings)) {
        if (variants.includes(originalHeader)) {
          detected[header] = fieldName;
          return; // Perfect match, no need to continue
        }
      }

      // Then find the best match based on specificity
      for (const [fieldName, variants] of Object.entries(mappings)) {
        for (const variant of variants) {
          const cleanVariant = variant.toLowerCase().replace(/[_\s-]+/g, "_");
          let score = 0;

          // Exact case-insensitive match gets highest score
          if (cleanHeader === cleanVariant) {
            score = 100;
          }
          // Exact substring match
          else if (cleanHeader.includes(cleanVariant)) {
            score = 80 - (cleanHeader.length - cleanVariant.length);
          }
          // Variant is substring of header
          else if (cleanVariant.includes(cleanHeader)) {
            score = 60 - (cleanVariant.length - cleanHeader.length);
          }
          // Partial word match
          else if (
            cleanHeader
              .split("_")
              .some(
                (part) =>
                  cleanVariant.split("_").includes(part) && part.length > 2
              )
          ) {
            score = 40;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = fieldName;
          }
        }
      }

      if (bestMatch && bestScore >= 40) {
        detected[header] = bestMatch;
      }
    });

    return detected;
  }
}

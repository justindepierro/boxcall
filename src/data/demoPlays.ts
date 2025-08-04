import type { Play } from "../types/play";
// Sample plays for demo purposes
export const DEMO_PLAYS: Play[] = [
  {
    id: "play_1",
    playbook_id: "playbook_1",
    formation: "Trips Right",
    f_dir: "Right",
    ftag1: "Far",
    back_align: "Deep",
    protection: "Half",
    play_name: "Traffic",
    one_word_play: "Traffic",
    p_type: "Pass",
    f_type: "Tight Bunch",
    confidence_base: 85,
    success_rate: 78,
    times_called: 12,
    times_successful: 9,
    diagram_url: "/assets/playDiagrams/traffic.png",
    tags: ["3rd Down", "Red Zone"],
    created_by: "user_1",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "play_2",
    playbook_id: "playbook_1",
    formation: "Empty",
    f_dir: "Left",
    ftag1: "eFar",
    shift: "Hag",
    protection: "Half Chip",
    play_name: "Sooners",
    one_word_play: "Sooners",
    p_type: "Pass",
    f_type: "Empty",
    p_dir: "Right",
    confidence_base: 75,
    success_rate: 67,
    times_called: 18,
    times_successful: 12,
    tags: ["3rd Down", "Quick Game"],
    created_by: "user_1",
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-10"),
  },
  {
    id: "play_3",
    playbook_id: "playbook_1",
    formation: "Deuce",
    f_dir: "Left",
    ftag1: "Flex",
    ftag2: "Far",
    play_name: "Honolulu",
    one_word_play: "Hawaii",
    p_type: "RPO",
    f_type: "Twins",
    p_dir: "Right",
    confidence_base: 90,
    success_rate: 82,
    times_called: 25,
    times_successful: 21,
    diagram_url: "/assets/playDiagrams/honolulu.png",
    tags: ["RPO", "Red Zone", "Goal Line"],
    created_by: "user_1",
    created_at: new Date("2024-01-08"),
    updated_at: new Date("2024-01-20"),
  },
  {
    id: "play_4",
    playbook_id: "playbook_1",
    formation: "Shotgun",
    f_dir: "Right",
    back_align: "Offset",
    protection: "Quick",
    play_name: "Smash Concept",
    one_word_play: "Smash",
    p_type: "Pass",
    f_type: "11P",
    p_dir: "Right",
    pref_down: "3",
    pref_dis: "Medium",
    pref_hash: "Right",
    confidence_base: 80,
    success_rate: 71,
    times_called: 14,
    times_successful: 10,
    tags: ["3rd Down", "Medium Yardage"],
    created_by: "user_1",
    created_at: new Date("2024-01-12"),
    updated_at: new Date("2024-01-12"),
  },
  {
    id: "play_5",
    playbook_id: "playbook_1",
    formation: "I-Formation",
    f_dir: "Right",
    back_align: "Deep",
    play_name: "Power O",
    one_word_play: "Power",
    p_type: "Run",
    f_type: "21P",
    p_dir: "Right",
    pref_down: "1",
    pref_dis: "Short",
    r_str: "Right",
    confidence_base: 88,
    success_rate: 85,
    times_called: 32,
    times_successful: 27,
    tags: ["Short Yardage", "Goal Line", "1st Down"],
    created_by: "user_1",
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "play_6",
    playbook_id: "playbook_1",
    formation: "Pistol",
    f_dir: "Left",
    back_align: "Deep",
    motion: "Jet",
    play_name: "Read Option",
    one_word_play: "Read",
    p_type: "RPO",
    f_type: "11P",
    p_dir: "Left",
    pref_down: "2",
    pref_dis: "Medium",
    confidence_base: 72,
    success_rate: 68,
    times_called: 16,
    times_successful: 11,
    tags: ["RPO", "2nd Down", "Option"],
    created_by: "user_1",
    created_at: new Date("2024-01-18"),
    updated_at: new Date("2024-01-18"),
  },
  {
    id: "play_7",
    playbook_id: "playbook_1",
    formation: "Gun",
    f_dir: "Spread",
    ftag1: "Wide",
    ftag2: "Trips",
    protection: "Big",
    play_name: "Four Verticals",
    // No one_word_play - this will test fallback logic
    p_type: "Pass",
    f_type: "11P",
    p_dir: "Middle",
    pref_down: "3",
    pref_dis: "Long",
    confidence_base: 68,
    success_rate: 62,
    times_called: 8,
    times_successful: 5,
    tags: ["3rd Down", "Deep Ball"],
    created_by: "user_1",
    created_at: new Date("2024-01-20"),
    updated_at: new Date("2024-01-20"),
  },
  {
    id: "play_8",
    playbook_id: "playbook_1",
    formation: "I-Form",
    f_dir: "Strong",
    back_align: "Deep",
    protection: "Max",
    play_name: "PA Boot Right",
    one_word_play: "Boot",
    p_type: "Play Action",
    f_type: "21P",
    p_dir: "Right",
    pref_down: "1",
    pref_dis: "Short",
    confidence_base: 82,
    success_rate: 71,
    times_called: 14,
    times_successful: 10,
    tags: ["Play Action", "Red Zone", "Goal Line"],
    created_by: "user_1",
    created_at: new Date("2024-01-22"),
    updated_at: new Date("2024-01-22"),
  },
];
// Helper function to get demo plays with optional filtering
export const getDemoPlays = (filters?: {
  formation?: string;
  playType?: string;
  down?: string;
  distance?: string;
  search?: string;
}): Play[] => {
  let plays = [...DEMO_PLAYS];
  if (filters?.formation) {
    plays = plays.filter((play) => play.formation === filters.formation);
  }
  if (filters?.playType) {
    plays = plays.filter((play) => play.p_type === filters.playType);
  }
  if (filters?.down) {
    plays = plays.filter((play) => play.pref_down === filters.down);
  }
  if (filters?.distance) {
    plays = plays.filter((play) => play.pref_dis === filters.distance);
  }
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    plays = plays.filter(
      (play) =>
        play.play_name.toLowerCase().includes(searchLower) ||
        play.formation.toLowerCase().includes(searchLower) ||
        play.one_word_play?.toLowerCase().includes(searchLower) ||
        play.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }
  return plays;
};

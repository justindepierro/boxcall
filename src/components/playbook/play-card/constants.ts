export const DEFAULT_FORMATION_SUGGESTIONS = [
  "Shotgun",
  "Pistol",
  "Wildcat",
  "Empty",
  "Trips Right",
  "Trips Left",
  "Bunch Right",
  "Bunch Left",
  "Stack Right",
  "Stack Left",
];

export const DEFAULT_PLAY_NAME_SUGGESTIONS = [
  "Slant",
  "Out",
  "Fade",
  "Post",
  "Corner",
  "Go Route",
  "Screen",
  "Draw",
  "Inside Zone",
  "Outside Zone",
  "Power",
  "Counter",
];

export const FORMATION_OPTIONS = [
  { value: "Empty", label: "Empty" },
  { value: "Shotgun", label: "Shotgun" },
  { value: "Pistol", label: "Pistol" },
  { value: "Wildcat", label: "Wildcat" },
  { value: "Trips Right", label: "Trips Right" },
  { value: "Trips Left", label: "Trips Left" },
  { value: "Bunch Right", label: "Bunch Right" },
  { value: "Bunch Left", label: "Bunch Left" },
  { value: "Stack Right", label: "Stack Right" },
  { value: "Stack Left", label: "Stack Left" },
];

export const PERSONNEL_OPTIONS = [
  { value: "10", label: "10 Personnel (1 RB, 0 TE)" },
  { value: "11", label: "11 Personnel (1 RB, 1 TE)" },
  { value: "12", label: "12 Personnel (1 RB, 2 TE)" },
  { value: "13", label: "13 Personnel (1 RB, 3 TE)" },
  { value: "20", label: "20 Personnel (2 RB, 0 TE)" },
  { value: "21", label: "21 Personnel (2 RB, 1 TE)" },
  { value: "22", label: "22 Personnel (2 RB, 2 TE)" },
];

// Re-export from source of truth
export { PLAY_TYPE_OPTIONS } from "../../../types/play";

export const DIRECTION_OPTIONS = [
  { value: "Left", label: "Left" },
  { value: "Right", label: "Right" },
  { value: "Middle", label: "Middle" },
  { value: "Stretch", label: "Stretch" },
];

export const DOWN_OPTIONS = [
  { value: "1st", label: "1st Down" },
  { value: "2nd", label: "2nd Down" },
  { value: "3rd", label: "3rd Down" },
  { value: "4th", label: "4th Down" },
];

export const DISTANCE_OPTIONS = [
  { value: "Short", label: "Short" },
  { value: "Medium", label: "Medium" },
  { value: "Long", label: "Long" },
];

export const HASH_OPTIONS = [
  { value: "Left", label: "Left Hash" },
  { value: "Right", label: "Right Hash" },
  { value: "Middle", label: "Middle" },
];

export const BACK_ALIGN_OPTIONS = [
  { value: "Near", label: "Near" },
  { value: "Far", label: "Far" },
  { value: "Flip", label: "Flip" },
  { value: "Same", label: "Same" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "Strong", label: "Strong" },
  { value: "Weak", label: "Weak" },
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
];

export const DIRECTION_RL_OPTIONS = [
  { value: "R", label: "Right" },
  { value: "L", label: "Left" },
];

export const getDirectionOptions = (format: "full" | "abbrev" | "letter") => {
  switch (format) {
    case "full":
      return [
        { value: "LEFT", label: "Left" },
        { value: "RIGHT", label: "Right" },
      ];
    case "abbrev":
      return [
        { value: "LEFT", label: "Lt" },
        { value: "RIGHT", label: "Rt" },
      ];
    case "letter":
      return [
        { value: "LEFT", label: "L" },
        { value: "RIGHT", label: "R" },
      ];
    default:
      return [
        { value: "LEFT", label: "Left" },
        { value: "RIGHT", label: "Right" },
      ];
  }
};

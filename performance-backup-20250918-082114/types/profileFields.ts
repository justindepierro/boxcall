export interface ProfileField {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "multi-select"
    | "url"
    | "email"
    | "phone";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  description?: string;
}

export interface RoleProfileConfig {
  basicFields: ProfileField[];
  athleticFields?: ProfileField[];
  academicFields?: ProfileField[];
  contactFields?: ProfileField[];
  professionalFields?: ProfileField[];
}

// Coach Profile Fields
export const COACH_PROFILE_CONFIG: RoleProfileConfig = {
  basicFields: [
    {
      key: "bio",
      label: "Bio",
      type: "textarea",
      placeholder: "Tell us about your coaching philosophy and experience...",
      description: "Share your background and approach to coaching",
    },
    {
      key: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "John Smith",
      required: true,
    },
    {
      key: "display_name",
      label: "Display Name",
      type: "text",
      placeholder: "Coach Smith",
      description: "How you prefer to be addressed by players",
    },
  ],
  professionalFields: [
    {
      key: "title",
      label: "Coaching Title",
      type: "select",
      options: [
        { value: "head_coach", label: "Head Coach" },
        { value: "assistant_coach", label: "Assistant Coach" },
        { value: "offensive_coordinator", label: "Offensive Coordinator" },
        { value: "defensive_coordinator", label: "Defensive Coordinator" },
        {
          value: "special_teams_coordinator",
          label: "Special Teams Coordinator",
        },
        { value: "position_coach", label: "Position Coach" },
        { value: "volunteer_coach", label: "Volunteer Coach" },
      ],
      required: true,
    },
    {
      key: "position_group",
      label: "Position Group",
      type: "select",
      options: [
        { value: "offense", label: "Offense" },
        { value: "defense", label: "Defense" },
        { value: "special_teams", label: "Special Teams" },
        { value: "general", label: "General/All" },
      ],
    },
    {
      key: "years_coaching",
      label: "Years Coaching",
      type: "number",
      validation: { min: 0, max: 50 },
    },
    {
      key: "certifications",
      label: "Certifications",
      type: "multi-select",
      options: [
        { value: "usa_football", label: "USA Football Certified" },
        { value: "cpr_first_aid", label: "CPR/First Aid" },
        { value: "concussion_protocol", label: "Concussion Protocol" },
        { value: "positive_coaching", label: "Positive Coaching Alliance" },
        { value: "nfhs", label: "NFHS Certified" },
      ],
    },
    {
      key: "education_background",
      label: "Education Background",
      type: "textarea",
      placeholder: "University, degree, relevant training...",
    },
    {
      key: "coaching_philosophy",
      label: "Coaching Philosophy",
      type: "textarea",
      placeholder:
        "Describe your approach to coaching and player development...",
    },
  ],
  contactFields: [
    {
      key: "phone",
      label: "Phone Number",
      type: "phone",
      placeholder: "(555) 123-4567",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "coach@example.com",
    },
    {
      key: "office_location",
      label: "Office Location",
      type: "text",
      placeholder: "Athletic Building, Room 101",
    },
    {
      key: "office_hours",
      label: "Office Hours",
      type: "text",
      placeholder: "Mon-Fri 9:00 AM - 5:00 PM",
    },
  ],
};

// Player Profile Fields
export const PLAYER_PROFILE_CONFIG: RoleProfileConfig = {
  basicFields: [
    {
      key: "bio",
      label: "Bio",
      type: "textarea",
      placeholder:
        "Tell us about yourself, your goals, and what motivates you...",
      description: "Share your story and aspirations",
    },
    {
      key: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      required: true,
    },
    {
      key: "display_name",
      label: "Display Name",
      type: "text",
      placeholder: "Johnny",
      description: "How you prefer to be called by teammates",
    },
  ],
  athleticFields: [
    {
      key: "jersey_number",
      label: "Jersey Number",
      type: "number",
      validation: { min: 0, max: 99 },
    },
    {
      key: "primary_position",
      label: "Primary Position",
      type: "select",
      options: [
        { value: "QB", label: "Quarterback (QB)" },
        { value: "RB", label: "Running Back (RB)" },
        { value: "FB", label: "Fullback (FB)" },
        { value: "WR", label: "Wide Receiver (WR)" },
        { value: "TE", label: "Tight End (TE)" },
        { value: "OT", label: "Offensive Tackle (OT)" },
        { value: "OG", label: "Offensive Guard (OG)" },
        { value: "C", label: "Center (C)" },
        { value: "DE", label: "Defensive End (DE)" },
        { value: "DT", label: "Defensive Tackle (DT)" },
        { value: "NT", label: "Nose Tackle (NT)" },
        { value: "OLB", label: "Outside Linebacker (OLB)" },
        { value: "ILB", label: "Inside Linebacker (ILB)" },
        { value: "MLB", label: "Middle Linebacker (MLB)" },
        { value: "CB", label: "Cornerback (CB)" },
        { value: "FS", label: "Free Safety (FS)" },
        { value: "SS", label: "Strong Safety (SS)" },
        { value: "K", label: "Kicker (K)" },
        { value: "P", label: "Punter (P)" },
        { value: "LS", label: "Long Snapper (LS)" },
      ],
      required: true,
    },
    {
      key: "secondary_positions",
      label: "Secondary Positions",
      type: "multi-select",
      options: [
        { value: "QB", label: "Quarterback (QB)" },
        { value: "RB", label: "Running Back (RB)" },
        { value: "FB", label: "Fullback (FB)" },
        { value: "WR", label: "Wide Receiver (WR)" },
        { value: "TE", label: "Tight End (TE)" },
        { value: "OT", label: "Offensive Tackle (OT)" },
        { value: "OG", label: "Offensive Guard (OG)" },
        { value: "C", label: "Center (C)" },
        { value: "DE", label: "Defensive End (DE)" },
        { value: "DT", label: "Defensive Tackle (DT)" },
        { value: "NT", label: "Nose Tackle (NT)" },
        { value: "OLB", label: "Outside Linebacker (OLB)" },
        { value: "ILB", label: "Inside Linebacker (ILB)" },
        { value: "MLB", label: "Middle Linebacker (MLB)" },
        { value: "CB", label: "Cornerback (CB)" },
        { value: "FS", label: "Free Safety (FS)" },
        { value: "SS", label: "Strong Safety (SS)" },
        { value: "K", label: "Kicker (K)" },
        { value: "P", label: "Punter (P)" },
        { value: "LS", label: "Long Snapper (LS)" },
      ],
      description: "Additional positions you can play",
    },
    {
      key: "height_inches",
      label: "Height (inches)",
      type: "number",
      placeholder: "72",
      validation: { min: 48, max: 96 },
      description: "Total height in inches (e.g., 6'0\" = 72 inches)",
    },
    {
      key: "weight_pounds",
      label: "Weight (lbs)",
      type: "number",
      placeholder: "180",
      validation: { min: 80, max: 400 },
    },
    {
      key: "dominant_hand",
      label: "Dominant Hand",
      type: "select",
      options: [
        { value: "right", label: "Right" },
        { value: "left", label: "Left" },
        { value: "ambidextrous", label: "Ambidextrous" },
      ],
    },
    {
      key: "years_playing_football",
      label: "Years Playing Football",
      type: "number",
      validation: { min: 0, max: 20 },
    },
    {
      key: "hudl_profile_url",
      label: "Hudl Profile Link",
      type: "url",
      placeholder: "https://www.hudl.com/profile/...",
      description: "Link to your Hudl highlight reel",
    },
    {
      key: "other_sports",
      label: "Other Sports",
      type: "multi-select",
      options: [
        { value: "basketball", label: "Basketball" },
        { value: "baseball", label: "Baseball" },
        { value: "track", label: "Track & Field" },
        { value: "wrestling", label: "Wrestling" },
        { value: "soccer", label: "Soccer" },
        { value: "lacrosse", label: "Lacrosse" },
        { value: "swimming", label: "Swimming" },
        { value: "tennis", label: "Tennis" },
        { value: "golf", label: "Golf" },
      ],
    },
  ],
  academicFields: [
    {
      key: "class_year",
      label: "Class Year",
      type: "select",
      options: [
        { value: "freshman", label: "Freshman" },
        { value: "sophomore", label: "Sophomore" },
        { value: "junior", label: "Junior" },
        { value: "senior", label: "Senior" },
        { value: "graduate", label: "Graduate Student" },
        { value: "redshirt", label: "Redshirt" },
      ],
    },
    {
      key: "graduation_year",
      label: "Graduation Year",
      type: "number",
      validation: {
        min: new Date().getFullYear(),
        max: new Date().getFullYear() + 10,
      },
    },
    {
      key: "gpa",
      label: "GPA",
      type: "number",
      validation: { min: 0, max: 4 },
      description: "Current Grade Point Average",
    },
    {
      key: "major",
      label: "Major/Field of Study",
      type: "text",
      placeholder: "Business Administration",
    },
  ],
  contactFields: [
    {
      key: "phone",
      label: "Phone Number",
      type: "phone",
      placeholder: "(555) 123-4567",
    },
    {
      key: "emergency_contact_name",
      label: "Emergency Contact Name",
      type: "text",
      placeholder: "Parent/Guardian Name",
      required: true,
    },
    {
      key: "emergency_contact_phone",
      label: "Emergency Contact Phone",
      type: "phone",
      placeholder: "(555) 123-4567",
      required: true,
    },
  ],
};

// Family Profile Fields
export const FAMILY_PROFILE_CONFIG: RoleProfileConfig = {
  basicFields: [
    {
      key: "bio",
      label: "Bio",
      type: "textarea",
      placeholder: "Tell us about yourself and your connection to the team...",
      description: "Share your role and involvement with the team",
    },
    {
      key: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Jane Smith",
      required: true,
    },
    {
      key: "display_name",
      label: "Display Name",
      type: "text",
      placeholder: "Mrs. Smith",
      description: "How you prefer to be addressed",
    },
  ],
  contactFields: [
    {
      key: "phone",
      label: "Phone Number",
      type: "phone",
      placeholder: "(555) 123-4567",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "parent@example.com",
    },
    {
      key: "relationship_to_player",
      label: "Relationship to Player",
      type: "select",
      options: [
        { value: "parent", label: "Parent" },
        { value: "guardian", label: "Guardian" },
        { value: "grandparent", label: "Grandparent" },
        { value: "sibling", label: "Sibling" },
        { value: "other_family", label: "Other Family Member" },
      ],
      required: true,
    },
    {
      key: "player_names",
      label: "Player Names",
      type: "text",
      placeholder: "John Smith, Mike Smith",
      description: "Names of players you are connected to",
    },
  ],
};

export function getProfileConfigForRole(role: string): RoleProfileConfig {
  switch (role) {
    case "coach":
    case "head_coach":
    case "assistant_coach":
      return COACH_PROFILE_CONFIG;
    case "player":
      return PLAYER_PROFILE_CONFIG;
    case "family":
    case "parent":
    case "guardian":
      return FAMILY_PROFILE_CONFIG;
    default:
      return PLAYER_PROFILE_CONFIG; // Default fallback
  }
}

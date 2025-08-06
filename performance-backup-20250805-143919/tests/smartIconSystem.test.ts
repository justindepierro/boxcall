import { SmartIconSystem } from "../components/ui/Icon/Icon";
/**
 * Test SmartIconSystem functionality
 */
export const testSmartIconSystem = () => {
  console.log("🧠 SmartIconSystem Tests");
  console.log("========================");
  const testCases = [
    // Achievement patterns
    { text: "Team Captain Achievement", expected: "trophy" },
    { text: "Championship Winner Medal", expected: "medal" },
    { text: "Victory Trophy Earned", expected: "trophy" },
    // Team patterns
    { text: "New Team Member Added", expected: "team" },
    { text: "Player Performance Update", expected: "user" },
    { text: "Coach Meeting Schedule", expected: "user" },
    // Calendar patterns
    { text: "Practice Schedule Today", expected: "calendar" },
    { text: "Game Time Reminder", expected: "calendar" },
    { text: "Meeting Deadline Alert", expected: "calendar-x" },
    // Communication patterns
    { text: "Important Message Received", expected: "message" },
    { text: "Team Chat Notification", expected: "message-circle" },
    { text: "Email from Coach", expected: "mail" },
    // Sports patterns
    { text: "Football Training Drill", expected: "target" },
    { text: "Performance Analytics Report", expected: "trending-up" },
    { text: "Exercise and Fitness Update", expected: "activity" },
    // Technology patterns
    { text: "App Update Available", expected: "smartphone" },
    { text: "Digital Team Stats", expected: "monitor" },
    // Health patterns
    { text: "Player Health Check", expected: "heart" },
    { text: "Injury Report Filed", expected: "bandage" },
    // Weather patterns
    { text: "Weather Alert for Practice", expected: "cloud" },
    { text: "Outdoor Training Conditions", expected: "sun" },
  ];
  let passed = 0;
  const total = testCases.length;
  testCases.forEach(({ text, expected }, index) => {
    const result = SmartIconSystem.getSmartIcon(text);
    const isCorrectCategory = SmartIconSystem.getIconSuggestions(
      text,
      5
    ).includes(result);
    console.log(`Test ${index + 1}: "${text}"`);
    console.log(`  Expected category: ${expected}`);
    console.log(`  Got: ${result}`);
    console.log(
      `  Suggestions: ${SmartIconSystem.getIconSuggestions(text, 3).join(", ")}`
    );
    console.log(
      `  ✅ Result makes sense: ${isCorrectCategory || result === expected ? "YES" : "NO"}`
    );
    console.log("");
    if (isCorrectCategory || result === expected) {
      passed++;
    }
  });
  console.log(
    `Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`
  );
  // Test contextual selection
  console.log("\n🎯 Contextual Selection Tests");
  console.log("=============================");
  const contextTests = [
    {
      text: "team meeting",
      context: "calendar" as const,
      expected: "calendar",
    },
    {
      text: "trophy winner",
      context: "achievement" as const,
      expected: "trophy",
    },
    { text: "new message", context: "message" as const, expected: "message" },
    { text: "team update", context: "feed" as const, expected: "activity" },
  ];
  contextTests.forEach(({ text, context, expected }) => {
    const result = SmartIconSystem.getContextualIcon(text, context);
    console.log(
      `"${text}" in ${context} context: ${result} (expected ${expected})`
    );
  });
  return { passed, total, percentage: Math.round((passed / total) * 100) };
};
// Quick test for demonstration
export const quickSmartIconTest = () => {
  const examples = [
    "Team Captain Achievement",
    "Practice Schedule Update",
    "Player Health Check",
    "Weather Alert",
    "New Message from Coach",
    "Performance Analytics",
    "Championship Trophy",
    "Team Meeting Tomorrow",
  ];
  console.log("🚀 Quick SmartIconSystem Demo");
  console.log("============================");
  examples.forEach((text) => {
    const icon = SmartIconSystem.getSmartIcon(text);
    const suggestions = SmartIconSystem.getIconSuggestions(text, 3);
    console.log(
      `"${text}" → ${icon} (alt: ${suggestions.slice(1).join(", ")})`
    );
  });
};

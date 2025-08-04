import React, { useState } from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import SmartIconDemo from "../components/demo/SmartIconDemo";
import { Icon, SmartIconSystem } from "../components/ui/Icon/Icon";
import type { IconName } from "../components/ui/Icon/Icon";
import {
  testSmartIconSystem,
  quickSmartIconTest,
} from "../tests/smartIconSystem.test";
interface TestResults {
  passed: number;
  total: number;
  percentage: number;
}
/**
 * Developer Playground - Super Admin Only
 *
 * Testing ground for new features, components, and systems
 * Only accessible by users with admin role
 */
export const Playground: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [quickTestOutput, setQuickTestOutput] = useState<string[]>([]);
  const runSmartIconTests = () => {
    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
      logs.push(args.join(" "));
      originalLog(...args);
    };
    try {
      const results = testSmartIconSystem();
      setTestResults(results);
    } finally {
      console.log = originalLog;
    }
  };
  const runQuickDemo = () => {
    // Capture console output for quick demo
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
      logs.push(args.join(" "));
      originalLog(...args);
    };
    try {
      quickSmartIconTest();
      setQuickTestOutput(logs);
    } finally {
      console.log = originalLog;
    }
  };
  const demoQueries = [
    "Team Captain Achievement",
    "Practice Schedule Update",
    "Player Health Check",
    "Weather Alert for Outdoor Practice",
    "New Message from Coach",
    "Performance Analytics Report",
    "Championship Trophy Winner",
    "Team Meeting Tomorrow",
    "Equipment Maintenance Required",
    "Nutrition and Meal Planning",
  ];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Icon name="wrench" size="lg" className="text-purple-600" />
            </div>
            <div>
              <Typography
                variant="headline-xl"
                className="text-gray-900 dark:text-white"
              >
                Developer Playground
              </Typography>
              <Typography variant="body-md" color="muted">
                Super Admin testing environment for new features and components
              </Typography>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon
                name="alert-triangle"
                size="sm"
                className="text-amber-600"
              />
              <Typography
                variant="body-sm"
                className="text-amber-800 dark:text-amber-200"
              >
                This playground is only visible to super admins. Perfect for
                testing SmartIconSystem and other experimental features.
              </Typography>
            </div>
          </div>
        </div>
        <div className="grid gap-8">
          {/* SmartIconSystem Interactive Demo */}
          <section>
            <Typography variant="headline-lg" className="mb-4">
              🧠 SmartIconSystem Interactive Demo
            </Typography>
            <SmartIconDemo />
          </section>
          {/* Quick Icon Tests */}
          <section>
            <Typography variant="headline-lg" className="mb-4">
              ⚡ Quick Icon Pattern Tests
            </Typography>
            <div className="grid gap-6">
              {/* Test Buttons */}
              <Card className="p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <button
                    onClick={runSmartIconTests}
                    className="flex items-center gap-2 px-4 py-2 bg-jade-600 text-white rounded-lg hover:bg-jade-700 transition-colors"
                  >
                    <Icon name="play" size="sm" />
                    Run Full Test Suite
                  </button>
                  <button
                    onClick={runQuickDemo}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Icon name="zap" size="sm" />
                    Quick Demo
                  </button>
                </div>
                {/* Test Results */}
                {testResults && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Typography
                      variant="body-md"
                      className="font-semibold mb-2"
                    >
                      Test Results: {testResults.passed}/{testResults.total} (
                      {testResults.percentage}% success)
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Icon
                        name={
                          testResults.percentage >= 80
                            ? "check-circle"
                            : "alert-triangle"
                        }
                        size="sm"
                        className={
                          testResults.percentage >= 80
                            ? "text-green-600"
                            : "text-amber-600"
                        }
                      />
                      <Typography variant="body-sm" color="muted">
                        {testResults.percentage >= 80
                          ? "Excellent pattern matching!"
                          : "Some patterns need refinement"}
                      </Typography>
                    </div>
                  </div>
                )}
                {/* Quick Demo Output */}
                {quickTestOutput.length > 0 && (
                  <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
                    {quickTestOutput.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                )}
              </Card>
              {/* Live Pattern Testing */}
              <Card className="p-6">
                <Typography variant="headline-md" className="mb-4">
                  Live Pattern Testing
                </Typography>
                <div className="grid gap-4">
                  {demoQueries.map((query, index) => {
                    const icon = SmartIconSystem.getSmartIcon(query);
                    const suggestions = SmartIconSystem.getIconSuggestions(
                      query,
                      3
                    );
                    const contexts = [
                      "feed",
                      "calendar",
                      "achievement",
                      "message",
                      "team",
                    ] as const;
                    return (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-jade-50 dark:bg-jade-900/20 rounded-lg">
                            <Icon
                              name={icon}
                              size="md"
                              className="text-jade-600"
                            />
                          </div>
                          <div className="flex-1">
                            <Typography
                              variant="body-md"
                              className="font-semibold"
                            >
                              "{query}"
                            </Typography>
                            <Typography variant="body-sm" color="muted">
                              Primary: {icon} | Alternatives:{" "}
                              {suggestions.slice(1).join(", ") || "none"}
                            </Typography>
                          </div>
                        </div>
                        {/* Context variations */}
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          {contexts.map((context) => {
                            const contextIcon =
                              SmartIconSystem.getContextualIcon(query, context);
                            return (
                              <div
                                key={context}
                                className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                              >
                                <Icon
                                  name={contextIcon}
                                  size="xs"
                                  className="text-gray-600"
                                />
                                <span className="capitalize">{context}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </section>
          {/* Icon Library Browser */}
          <section>
            <Typography variant="headline-lg" className="mb-4">
              🎨 Icon Library Browser
            </Typography>
            <Card className="p-6">
              <Typography variant="body-md" color="muted" className="mb-4">
                Browse all 300+ available icons in the SmartIconSystem
              </Typography>
              <div className="grid grid-cols-8 sm:grid-cols-12 lg:grid-cols-16 gap-4">
                {Object.keys(SmartIconSystem["contentPatterns"])
                  .slice(0, 48)
                  .map((pattern) => {
                    const icons =
                      SmartIconSystem["contentPatterns"][
                        pattern as keyof (typeof SmartIconSystem)["contentPatterns"]
                      ];
                    return icons?.slice(0, 1).map((iconName: IconName) => (
                      <div
                        key={iconName}
                        className="flex flex-col items-center gap-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title={`${iconName} (${pattern})`}
                      >
                        <Icon
                          name={iconName}
                          size="md"
                          className="text-gray-600"
                        />
                        <span className="text-xs text-gray-500 truncate w-full text-center">
                          {iconName}
                        </span>
                      </div>
                    ));
                  })}
              </div>
            </Card>
          </section>
          {/* System Status */}
          <section>
            <Typography variant="headline-lg" className="mb-4">
              📊 System Status
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="target" size="lg" className="text-jade-600" />
                  <Typography variant="headline-md">Icon Coverage</Typography>
                </div>
                <Typography
                  variant="body-lg"
                  className="font-bold text-jade-600 mb-1"
                >
                  300+ Icons
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Across 20+ categories with intelligent pattern matching
                </Typography>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="zap" size="lg" className="text-blue-600" />
                  <Typography variant="headline-md">Performance</Typography>
                </div>
                <Typography
                  variant="body-lg"
                  className="font-bold text-blue-600 mb-1"
                >
                  &lt;1ms
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Average icon selection time with client-side processing
                </Typography>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    name="check-circle"
                    size="lg"
                    className="text-green-600"
                  />
                  <Typography variant="headline-md">Accuracy</Typography>
                </div>
                <Typography
                  variant="body-lg"
                  className="font-bold text-green-600 mb-1"
                >
                  90%+
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Pattern matching accuracy in user testing
                </Typography>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
export default Playground;

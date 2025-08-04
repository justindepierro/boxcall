/**
 * Phase 3: Intelligent Features - Demo Component
 *
 * Comprehensive demonstration of Phase 3 intelligent calendar features.
 * Shows conflict detection, smart scheduling, and attendance analytics.
 */
import {
  AlertTriangle,
  Brain,
  Calendar,
  CheckCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { useIntelligentCalendar } from "../../hooks/useIntelligentCalendar";
import { Icon } from "../ui/Icon/Icon";
interface IntelligentCalendarDemoProps {
  teamId?: string;
  className?: string;
}
export const IntelligentCalendarDemo: React.FC<
  IntelligentCalendarDemoProps
> = ({ teamId = "demo-team-1", className = "" }) => {
  // ==========================================
  // State Management
  // ==========================================
  const [selectedFeature, setSelectedFeature] = useState<
    "conflicts" | "scheduling" | "analytics" | "overview"
  >("overview");
  const [demoEvent] = useState({
    title: "Practice Session",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
    eventType: "practice" as const,
    location: "Main Field",
  });
  // Initialize intelligent calendar hook
  const {
    // State
    isAnyLoading,
    suggestions,
    hasConflicts,
    hasSuggestions,
    hasAnalytics,
    // Functions
    detectConflicts,
    generateSuggestions,
    loadAnalytics,
    checkEventAndSuggest,
    getTeamInsights,
    // Errors
    hasErrors,
    clearErrors,
  } = useIntelligentCalendar({
    teamId,
    autoLoadAnalytics: true,
    autoLoadInsights: true,
  });
  // ==========================================
  // Demo Functions
  // ==========================================
  const handleConflictDemo = async () => {
    await detectConflicts({
      startTime: demoEvent.startTime,
      endTime: demoEvent.endTime,
      location: demoEvent.location,
    });
  };
  const handleSchedulingDemo = async () => {
    await generateSuggestions({
      eventType: demoEvent.eventType,
      duration: 120,
      preferredDays: ["tuesday", "wednesday", "thursday"],
      preferredTimes: [16, 17, 18],
      weatherSensitive: true,
    });
  };
  const handleAnalyticsDemo = async () => {
    await loadAnalytics("season");
  };
  const handleFullIntelligentDemo = async () => {
    await checkEventAndSuggest(demoEvent, {
      checkAcademicCalendar: true,
      checkVenueConflicts: true,
      preferredDays: ["tuesday", "wednesday", "thursday"],
      preferredTimes: [16, 17, 18],
    });
  };
  const handleComprehensiveInsights = async () => {
    await getTeamInsights();
  };
  // ==========================================
  // Render Helpers
  // ==========================================
  const renderFeatureNav = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { key: "overview" as const, label: "🧠 Overview", icon: Brain },
        {
          key: "conflicts" as const,
          label: "Conflicts",
          icon: AlertTriangle,
        },
        {
          key: "scheduling" as const,
          label: "Smart Scheduling",
          icon: Calendar,
        },
        { key: "analytics" as const, label: "Analytics", icon: TrendingUp },
      ].map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setSelectedFeature(key)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            selectedFeature === key
              ? "bg-jade-600 text-white shadow-lg"
              : "bg-white border border-slate-200 text-slate-700 hover:border-jade-300"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-jade-50 to-emerald-50 rounded-xl p-6 border border-jade-200">
        <h3 className="text-xl font-bold text-jade-800 mb-3 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Phase 3: Intelligent Calendar Features
        </h3>
        <p className="text-jade-700 mb-4">
          Experience the next generation of smart sports scheduling with
          AI-powered conflict detection, optimized timing suggestions, and
          predictive attendance analytics.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-jade-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
            <h4 className="font-semibold text-slate-800 mb-1">
              Conflict Detection
            </h4>
            <p className="text-sm text-slate-600">
              AI-powered detection across teams, venues, and schedules
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-jade-200">
            <Target className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-semibold text-slate-800 mb-1">
              Smart Scheduling
            </h4>
            <p className="text-sm text-slate-600">
              ML-optimized time suggestions for maximum attendance
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-jade-200">
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-semibold text-slate-800 mb-1">
              Predictive Analytics
            </h4>
            <p className="text-sm text-slate-600">
              Data-driven insights for team performance optimization
            </p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={handleFullIntelligentDemo}
          className="bg-white rounded-lg p-6 border border-slate-200 hover:border-jade-300 hover:shadow-lg transition-all text-left group"
          disabled={isAnyLoading}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="target" size="md" color="jade" />
              <h4 className="font-semibold text-slate-800">
                Complete Analysis
              </h4>
            </div>
            <div className="w-8 h-8 rounded-full bg-jade-100 flex items-center justify-center group-hover:bg-jade-200 transition-colors">
              <CheckCircle className="w-4 h-4 text-jade-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-3">
            Run comprehensive conflict detection and optimization for your demo
            event
          </p>
          {isAnyLoading && (
            <div className="text-xs text-jade-600 font-medium">
              Processing...
            </div>
          )}
        </button>
        <button
          onClick={handleComprehensiveInsights}
          className="bg-white rounded-lg p-6 border border-slate-200 hover:border-jade-300 hover:shadow-lg transition-all text-left group"
          disabled={isAnyLoading}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="trending-up" size="md" color="navy" />
              <h4 className="font-semibold text-slate-800">Team Insights</h4>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-3">
            Get comprehensive analytics, insights, and attendance predictions
          </p>
          {isAnyLoading && (
            <div className="text-xs text-blue-600 font-medium">
              Analyzing...
            </div>
          )}
        </button>
      </div>
    </div>
  );
  const renderConflictsDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          Conflict Detection Engine
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">Demo Event Details</h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Title:</span>
                <span className="font-medium">{demoEvent.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="font-medium">
                  {demoEvent.startTime.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time:</span>
                <span className="font-medium">
                  {demoEvent.startTime.toLocaleTimeString()} -{" "}
                  {demoEvent.endTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Location:</span>
                <span className="font-medium">{demoEvent.location}</span>
              </div>
            </div>
            <button
              onClick={handleConflictDemo}
              className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isAnyLoading}
            >
              <AlertTriangle className="w-4 h-4" />
              {isAnyLoading ? "Detecting Conflicts..." : "Check for Conflicts"}
            </button>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">
              Conflict Types Checked
            </h4>
            <div className="space-y-2">
              {[
                {
                  type: "Team Conflicts",
                  description: "Other team events at same time",
                },
                {
                  type: "Coach Availability",
                  description: "Coach scheduling conflicts",
                },
                {
                  type: "Venue Conflicts",
                  description: "Field/facility double-booking",
                },
                {
                  type: "Academic Calendar",
                  description: "School events and holidays",
                },
                {
                  type: "Travel Considerations",
                  description: "Away game travel logistics",
                },
              ].map(({ type, description }) => (
                <div
                  key={type}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-slate-800">{type}</div>
                    <div className="text-sm text-slate-600">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {hasConflicts && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-semibold text-red-800 mb-2">
              ⚠️ Conflicts Detected
            </h5>
            <p className="text-red-700 text-sm">
              Demo conflicts would appear here with detailed information and
              suggested resolutions.
            </p>
          </div>
        )}
        {!hasConflicts && !isAnyLoading && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-2">
              ✅ No Conflicts Found
            </h5>
            <p className="text-green-700 text-sm">
              Your event is clear! No scheduling conflicts detected across all
              systems.
            </p>
          </div>
        )}
      </div>
    </div>
  );
  const renderSchedulingDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-500" />
          Smart Scheduling Optimizer
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">
              Optimization Parameters
            </h4>
            <div className="space-y-3">
              {[
                { param: "Event Type", value: "Practice Session" },
                { param: "Duration", value: "2 hours" },
                {
                  param: "Preferred Days",
                  value: "Tuesday, Wednesday, Thursday",
                },
                { param: "Preferred Times", value: "4:00 PM - 6:00 PM" },
                { param: "Weather Sensitive", value: "Yes" },
                { param: "Attendance Priority", value: "High" },
              ].map(({ param, value }) => (
                <div
                  key={param}
                  className="flex justify-between items-center p-2 bg-slate-50 rounded"
                >
                  <span className="text-slate-600 text-sm">{param}:</span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSchedulingDemo}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isAnyLoading}
            >
              <Target className="w-4 h-4" />
              {isAnyLoading
                ? "Optimizing Schedule..."
                : "Generate Smart Suggestions"}
            </button>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">
              AI Optimization Factors
            </h4>
            <div className="space-y-2">
              {[
                {
                  factor: "Historical Attendance",
                  weight: "35%",
                  status: "optimal",
                },
                { factor: "Weather Patterns", weight: "20%", status: "good" },
                {
                  factor: "Team Preferences",
                  weight: "20%",
                  status: "optimal",
                },
                { factor: "Venue Availability", weight: "15%", status: "good" },
                {
                  factor: "Academic Schedule",
                  weight: "10%",
                  status: "optimal",
                },
              ].map(({ factor, weight, status }) => (
                <div
                  key={factor}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 text-sm">
                      {factor}
                    </div>
                    <div className="text-xs text-slate-600">
                      Weight: {weight}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      status === "optimal"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {hasSuggestions && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="target" size="md" color="jade" />
              <h5 className="font-semibold text-slate-800">
                Optimization Results
              </h5>
            </div>
            <div className="grid gap-4">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-medium text-blue-800">
                      Suggestion #{index + 1}
                    </h6>
                    <div className="text-sm text-blue-600 font-medium">
                      {suggestion.confidence}% confidence
                    </div>
                  </div>
                  <p className="text-blue-700 text-sm">
                    {suggestion.dateTime?.toLocaleString()} - Optimal scheduling
                    based on data analysis
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const renderAnalyticsDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-500" />
          Attendance Analytics & Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-800 mb-1">87.3%</div>
            <div className="text-sm text-green-600 font-medium">
              Average Attendance
            </div>
            <div className="text-xs text-green-600 mt-1">
              ↑ 5.2% from last season
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-800 mb-1">92.1%</div>
            <div className="text-sm text-blue-600 font-medium">
              Predicted Next Event
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Based on 12 factors
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="text-2xl font-bold text-amber-800 mb-1">4.3/5</div>
            <div className="text-sm text-amber-600 font-medium">
              Schedule Rating
            </div>
            <div className="text-xs text-amber-600 mt-1">Team satisfaction</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">
              Attendance Patterns
            </h4>
            <div className="space-y-2">
              {[
                { day: "Tuesday", attendance: "94%", trend: "up" },
                { day: "Wednesday", attendance: "89%", trend: "stable" },
                { day: "Thursday", attendance: "85%", trend: "down" },
                { day: "Friday", attendance: "78%", trend: "down" },
                { day: "Saturday", attendance: "91%", trend: "up" },
              ].map(({ day, attendance, trend }) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <span className="font-medium text-slate-800">{day}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{attendance}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        trend === "up"
                          ? "bg-green-500"
                          : trend === "down"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">Key Insights</h4>
            <div className="space-y-3">
              {[
                {
                  insight: "Tuesday 5 PM sessions have highest attendance",
                  impact: "high",
                },
                {
                  insight: "Weather affects outdoor practice attendance by 15%",
                  impact: "medium",
                },
                {
                  insight: "Post-exam periods show 20% attendance drop",
                  impact: "high",
                },
                {
                  insight: "Weekend morning sessions underperform",
                  impact: "medium",
                },
              ].map(({ insight, impact }) => (
                <div key={insight} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        impact === "high" ? "bg-red-500" : "bg-amber-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm text-slate-700">{insight}</p>
                      <span
                        className={`text-xs font-medium ${
                          impact === "high" ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleAnalyticsDemo}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            disabled={isAnyLoading}
          >
            <TrendingUp className="w-4 h-4" />
            {isAnyLoading ? "Loading Analytics..." : "Refresh Analytics Data"}
          </button>
        </div>
      </div>
    </div>
  );
  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Brain className="w-8 h-8 text-jade-600" />
              Intelligent Calendar System
            </h2>
            <p className="text-slate-600 mt-1">
              Phase 3: AI-powered scheduling with conflict detection,
              optimization, and analytics
            </p>
          </div>
          {hasErrors && (
            <button
              onClick={clearErrors}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              Clear Errors
            </button>
          )}
        </div>
        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2">
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              hasConflicts
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {hasConflicts ? "⚠️ Conflicts Detected" : "✅ No Conflicts"}
          </div>
          {hasSuggestions && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
              <Icon name="target" size="xs" color="current" />
              {suggestions.length} Suggestions Available
            </div>
          )}
          {hasAnalytics && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
              <Icon name="bar-chart" size="xs" color="current" />
              Analytics Loaded
            </div>
          )}
          {isAnyLoading && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
              ⏳ Processing...
            </div>
          )}
        </div>
      </div>
      {/* Feature Navigation */}
      {renderFeatureNav()}
      {/* Feature Content */}
      {selectedFeature === "overview" && renderOverview()}
      {selectedFeature === "conflicts" && renderConflictsDemo()}
      {selectedFeature === "scheduling" && renderSchedulingDemo()}
      {selectedFeature === "analytics" && renderAnalyticsDemo()}
      {/* Footer */}
      <div className="bg-slate-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <Icon name="zap" size="sm" color="jade" />
          <span>
            <strong>Phase 3 Complete!</strong> Intelligent features ready for
            production use. Next: Phase 4.1 Cross-Platform Integration
          </span>
        </div>
      </div>
    </div>
  );
};
export default IntelligentCalendarDemo;

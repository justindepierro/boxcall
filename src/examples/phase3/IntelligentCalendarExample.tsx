/**
 * Phase 3: Intelligent Features - Usage Example
 *
 * Example implementation showing how to integrate Phase 3 intelligent calendar features
 */
import React from "react";
import { IntelligentCalendarDemo } from "../components/demo";
/**
 * Example usage of Phase 3 Intelligent Calendar System
 *
 * This example shows:
 * - Complete AI-powered conflict detection
 * - Smart scheduling optimization with ML recommendations
 * - Predictive attendance analytics
 * - Interactive demo interface
 */
export const Phase3Example: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🧠 Phase 3: Intelligent Features
          </h1>
          <p className="text-xl text-slate-600">
            Experience the next generation of sports team scheduling with
            AI-powered intelligence
          </p>
        </div>
        {/* Intelligent Calendar Demo */}
        <IntelligentCalendarDemo teamId="demo-team-1" className="mb-8" />
        {/* Integration Notes */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            📋 Integration Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                🏗️ Architecture
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  • <strong>ConflictDetectionService:</strong> AI-powered
                  conflict analysis
                </li>
                <li>
                  • <strong>SmartSchedulingOptimizer:</strong> ML-based timing
                  recommendations
                </li>
                <li>
                  • <strong>AttendanceAnalyticsService:</strong> Predictive
                  attendance modeling
                </li>
                <li>
                  • <strong>IntelligentCalendarService:</strong> Unified
                  orchestration layer
                </li>
                <li>
                  • <strong>useIntelligentCalendar:</strong> React hook for
                  frontend integration
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                🔧 Implementation
              </h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <pre className="text-xs text-slate-600 overflow-x-auto">
                  {`import { useIntelligentCalendar } from './hooks/useIntelligentCalendar';
const { 
  detectConflicts, 
  generateSuggestions, 
  loadAnalytics 
} = useIntelligentCalendar({
  teamId: 'your-team-id',
  autoLoadAnalytics: true
});
// Detect conflicts
await detectConflicts({
  startTime: eventStartTime,
  endTime: eventEndTime,
  location: venue
});
// Get AI suggestions
await generateSuggestions({
  eventType: 'practice',
  duration: 120,
  preferredDays: ['tuesday', 'thursday'],
  weatherSensitive: true
});`}
                </pre>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              🚀 Next Steps
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Phase 4.1</h4>
                <p className="text-sm text-blue-700">
                  Cross-Platform Integration
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Phase 4.2</h4>
                <p className="text-sm text-green-700">Mobile Optimization</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Phase 5</h4>
                <p className="text-sm text-purple-700">Advanced Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Phase3Example;

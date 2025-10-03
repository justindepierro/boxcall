/**
 * Premium Feature Examples
 *
 * Demonstrates how to use subscription-based feature gates
 * throughout the application using our permission system.
 */

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  useComprehensivePermissions as usePermissions,
  PremiumGate,
} from "../../hooks/useComprehensivePermissions";
import {
  Crown,
  Lock,
  Zap,
  BarChart3,
  Download,
  Users,
  Video,
  Brain,
  Sparkles,
} from "lucide-react";

/**
 * Premium Feature Card - Shows a feature with subscription gate
 */
interface PremiumFeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  requiresPremium?: boolean;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  title,
  description,
  icon,
  children,
  requiresPremium = true,
}) => {
  const { isPremium } = usePermissions();

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {requiresPremium && (
          <Badge
            className={
              isPremium
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800"
            }
          >
            {isPremium ? (
              <>
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Premium Required
              </>
            )}
          </Badge>
        )}
      </div>

      {requiresPremium ? (
        <PremiumGate
          fallback={
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-2">Premium Feature</p>
              <p className="text-sm text-gray-500 mb-4">
                Upgrade to access this feature
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          }
        >
          {children}
        </PremiumGate>
      ) : (
        children
      )}
    </Card>
  );
};

/**
 * Advanced Analytics Example
 */
const AdvancedAnalytics: React.FC = () => {
  const { can } = usePermissions();

  return (
    <PremiumFeature
      title="Advanced Analytics"
      description="Deep insights into team and player performance"
      icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
      requiresPremium={!can("canUseAdvancedStats")}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">87%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">+15%</div>
            <div className="text-sm text-gray-600">Improvement</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">342</div>
            <div className="text-sm text-gray-600">Total Plays</div>
          </div>
        </div>
        <Button className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Export Detailed Report
        </Button>
      </div>
    </PremiumFeature>
  );
};

/**
 * AI Features Example
 */
const AIFeatures: React.FC = () => {
  const { can } = usePermissions();

  return (
    <PremiumFeature
      title="AI-Powered Insights"
      description="Get intelligent suggestions and automated analysis"
      icon={<Brain className="w-5 h-5 text-purple-600" />}
      requiresPremium={!can("canUseAIFeatures")}
    >
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">AI Suggestion</span>
          </div>
          <p className="text-sm text-purple-800">
            "Based on your team's performance, consider running more short
            passing plays in the red zone."
          </p>
        </div>
        <Button variant="outline" className="w-full">
          <Zap className="w-4 h-4 mr-2" />
          Generate Play Recommendations
        </Button>
      </div>
    </PremiumFeature>
  );
};

/**
 * Video Analysis Example
 */
const VideoAnalysis: React.FC = () => {
  const { can } = usePermissions();

  return (
    <PremiumFeature
      title="Video Analysis"
      description="Upload and analyze game footage with AI"
      icon={<Video className="w-5 h-5 text-red-600" />}
      requiresPremium={!can("canAccessVideoAnalysis")}
    >
      <div className="space-y-4">
        <div className="bg-gray-100 aspect-video rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Upload game footage</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Upload Video
          </Button>
          <Button className="flex-1">
            <Brain className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
      </div>
    </PremiumFeature>
  );
};

/**
 * Team Limits Example
 */
const TeamLimits: React.FC = () => {
  const { app } = usePermissions();

  if (!app) return null;

  const { maxTeamsOwned, maxPlayersPerTeam } = app;
  const isUnlimited = maxTeamsOwned === -1;

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Team Limits</h3>
          <p className="text-sm text-gray-600">Current subscription limits</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Max Teams</span>
          <Badge
            className={
              isUnlimited
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }
          >
            {isUnlimited ? "Unlimited" : maxTeamsOwned}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Max Players per Team</span>
          <Badge
            className={
              maxPlayersPerTeam === -1
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }
          >
            {maxPlayersPerTeam === -1 ? "Unlimited" : maxPlayersPerTeam}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

/**
 * Complete Premium Features Demo
 */
export const PremiumFeaturesDemo: React.FC = () => {
  const { isPremium, loading } = usePermissions();

  if (loading) {
    return <div className="text-center py-8">Loading subscription info...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Premium Features
        </h1>
        <p className="text-gray-600">
          {isPremium
            ? "You have access to all premium features!"
            : "Upgrade to unlock powerful features for your team"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdvancedAnalytics />
        <AIFeatures />
        <VideoAnalysis />
        <TeamLimits />
      </div>

      {!isPremium && (
        <Card className="p-6 text-center bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-900 mb-2">
            Unlock All Premium Features
          </h3>
          <p className="text-purple-700 mb-4">
            Get advanced analytics, AI insights, video analysis, and unlimited
            team management
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PremiumFeaturesDemo;

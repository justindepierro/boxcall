/**
 * Multi-Badge Demo Component
 * 
 * Demonstrates the multi-badge system with sample data
 * showing how admin, role, and subscription badges work together.
 */

import React from 'react';
import { Card } from '../ui/Card';
import { MultiBadgeDisplay } from '../ui/MultiBadgeDisplay';

export const MultiBadgeDemo: React.FC = () => {
  const userExamples = [
    {
      name: "Justin DePierro (You)",
      isAdmin: true,
      appRole: "head_coach",
      subscriptionTier: "premium",
      description: "Platform admin with head coach role and premium subscription"
    },
    {
      name: "John Coach",
      isAdmin: false,
      appRole: "coach",
      subscriptionTier: "premium",
      description: "Coach with premium subscription"
    },
    {
      name: "Sarah Coach",
      isAdmin: false,
      appRole: "free_coach",
      subscriptionTier: "free",
      description: "Free coach with basic features"
    },
    {
      name: "Mike Player",
      isAdmin: false,
      appRole: "player",
      subscriptionTier: "free",
      description: "Regular player"
    },
    {
      name: "Lisa Admin",
      isAdmin: true,
      appRole: "player",
      subscriptionTier: "premium",
      description: "Admin with player role (dev team member)"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Multi-Badge System Demo
        </h1>
        <p className="text-gray-600">
          Shows how users can have multiple badges for admin status, roles, and subscriptions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userExamples.map((user, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.description}</p>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Badges:</div>
                <MultiBadgeDisplay
                  isAdmin={user.isAdmin}
                  appRole={user.appRole}
                  subscriptionTier={user.subscriptionTier}
                  size="sm"
                  layout="wrap"
                />
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div>• is_admin: {user.isAdmin ? 'true' : 'false'}</div>
                <div>• app_role: {user.appRole}</div>
                <div>• subscription_tier: {user.subscriptionTier}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Platform Admin Badge</strong>: Shows when is_admin = true (red badge with shield)</li>
          <li>• <strong>Role Badge</strong>: Shows the user's app_role (coach, player, etc. with different colors)</li>
          <li>• <strong>Subscription Badge</strong>: Shows premium/pro tiers (hidden for free tier)</li>
          <li>• <strong>Multiple Badges</strong>: Users can have all three types simultaneously</li>
          <li>• <strong>Responsive Layout</strong>: Badges wrap nicely on smaller screens</li>
        </ul>
      </Card>
    </div>
  );
};

export default MultiBadgeDemo;
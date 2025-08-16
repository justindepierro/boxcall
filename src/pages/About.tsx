import React from "react";

import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import Icon from "../components/ui/Icon/Icon";
/**
 * About - Information about BoxCall platform
 * Available to all users
 *
 * Features:
 * - Platform overview and features
 * - Help and documentation
 * - Support and contact information
 * - Version and updates
 */
export const About: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-text-primary">
            About BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Learn more about the BoxCall platform and get help
          </Typography>
        </div>
        {/* About Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Platform Overview */}
          <Card className="p-6">
            <Icon
              name="trending-up"
              size="xl"
              className="text-interaction-jade mb-4"
            />
            <Typography variant="headline-md" className="mb-3">
              Platform Overview
            </Typography>
            <Typography variant="body-md" color="muted">
              BoxCall is a comprehensive team management platform designed for
              coaches, players, and families. Streamline communication, organize
              plays, manage schedules, and build stronger teams.
            </Typography>
          </Card>
          {/* Features */}
          <Card className="p-6">
            <Icon name="star" size="xl" className="text-yellow-500 mb-4" />
            <Typography variant="headline-md" className="mb-3">
              Key Features
            </Typography>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• Team communication and bulletin boards</li>
              <li>• Digital playbook and strategy tools</li>
              <li>• Calendar and schedule management</li>
              <li>• Live game communication (BoxCall)</li>
              <li>• Role-based access and permissions</li>
            </ul>
          </Card>
          {/* Support */}
          <Card className="p-6">
            <Icon name="users" size="xl" className="text-text-secondary mb-4" />
            <Typography variant="headline-md" className="mb-3">
              Support & Help
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Need help getting started or have questions? We're here to support
              your team's success.
            </Typography>
            <div className="surface-subtle dark:bg-blue-900/20 border border-subtle dark:border-blue-800 rounded-lg p-3">
              <Typography
                variant="body-sm"
                className="text-blue-700 dark:text-blue-300 flex items-center"
              >
                <Icon name="mail" size="sm" className="mr-2" />
                Support: help@boxcall.com
              </Typography>
            </div>
          </Card>
          {/* Version Info */}
          <Card className="p-6">
            <div className="mb-4">
              <Icon name="target" size="xl" color="primary" />
            </div>
            <Typography variant="headline-md" className="mb-3">
              Version Information
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              You're using the latest version of BoxCall with all the newest
              features and improvements.
            </Typography>
            <div className="surface-subtle dark:bg-green-900/20 border border-subtle dark:border-green-800 rounded-lg p-3">
              <Typography
                variant="body-sm"
                className="text-green-700 dark:text-green-300"
              >
                Version 1.0.0 - Beta Release
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default About;

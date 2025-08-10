import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { Button } from "../components/ui/Button/Button";
/**
 * Templates - Coach resource hub with downloadable templates and import tools
 * Available to coaches only
 *
 * Features:
 * - CSV templates for data import (playbook, roster, scripts)
 * - PDF/PNG playbook diagrams and formations
 * - Playscript maker and upload tools
 * - Data import/export utilities
 */
export const Templates: React.FC = () => {
  const downloadTemplate = (_templateName: string) => {
    // Mock download functionality - would implement actual file download
    // In real implementation: trigger file download
  };
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography
            variant="headline-xl"
            className="text-text-primary"
          >
            Coach Templates & Resources
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Downloadable templates and import tools to streamline your coaching
            workflow
          </Typography>
        </div>
        {/* Data Import Templates */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="bar-chart" size="xl" color="primary" />
            <Typography variant="headline-md" as="h3" className="text-jade-600">
              Data Import Templates
            </Typography>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Roster Import */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="users"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Roster Import</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                CSV template for importing team rosters with player details,
                positions, and contact information.
              </Typography>
              <Button
                onClick={() => {
                  // TODO: Implement template action
                }}
                variant="primary"
                size="sm"
                fullWidth
              >
                Download CSV Template
              </Button>
            </Card>
            {/* Playbook Import */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="book"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Playbook Import</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Structured CSV format for importing plays, formations, and
                strategic information into your digital playbook.
              </Typography>
              <Button
                onClick={() => downloadTemplate("playbook-import.csv")}
                variant="primary"
                size="sm"
                fullWidth
              >
                Download CSV Template
              </Button>
            </Card>
            {/* Playscript Import */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="file"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Playscript Maker</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                CSV template for creating and uploading detailed play scripts
                with timing, formations, and player assignments.
              </Typography>
              <Button
                onClick={() => downloadTemplate("playscript-template.csv")}
                variant="primary"
                size="sm"
                fullWidth
              >
                Download CSV Template
              </Button>
            </Card>
          </div>
        </div>
        {/* Visual Resources */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="activity" size="xl" color="primary" />
            <Typography variant="headline-lg">Visual Resources</Typography>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Playbook Diagrams */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="target"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Playbook Diagrams</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Professional play diagrams in PDF and PNG formats.
                Ready-to-print formations for offensive and defensive
                strategies.
              </Typography>
              <div className="space-y-2">
                <Button
                  onClick={() => downloadTemplate("offensive-plays.pdf")}
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  Download Offensive Plays (PDF)
                </Button>
                <Button
                  onClick={() => downloadTemplate("defensive-formations.png")}
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  Download Defensive Formations (PNG)
                </Button>
              </div>
            </Card>
            {/* Formation Templates */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-3">
                  <Icon name="zap" size="xl" color="primary" />
                </div>
                <Typography variant="headline-md">
                  Formation Templates
                </Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Blank formation templates for creating custom plays. Available
                in multiple formats for easy editing and printing.
              </Typography>
              <div className="space-y-2">
                <Button
                  onClick={() => downloadTemplate("blank-formations.pdf")}
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  Download Blank Templates (PDF)
                </Button>
                <Button
                  onClick={() => downloadTemplate("formation-builder.png")}
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  Download Builder Template (PNG)
                </Button>
              </div>
            </Card>
          </div>
        </div>
        {/* Import Tools */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="settings" size="xl" color="primary" />
            <Typography variant="headline-lg">Coaching Tools</Typography>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Practice Planner */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="clock"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Practice Planner</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Advanced practice planning tool with drag-and-drop scheduling,
                timing controls, and drill management for efficient practices.
              </Typography>
              <Button
                onClick={() => {
                  // TODO: Open practice planner
                }}
                variant="primary"
                size="sm"
                fullWidth
              >
                Open Practice Planner
              </Button>
            </Card>
            {/* Data Import Wizard */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="upload"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">
                  Data Import Wizard
                </Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Step-by-step wizard for importing CSV data into BoxCall.
                Validates data and prevents common import errors.
              </Typography>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Icon name="zap" size="sm" color="info" />
                  <Typography
                    variant="body-sm"
                    className="text-blue-700 dark:text-blue-300"
                  >
                    Coming Soon - Smart import wizard
                  </Typography>
                </div>
              </div>
            </Card>
            {/* Bulk Data Export */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="download"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Bulk Export</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Export your team data, plays, and scripts to CSV format for
                backup or transfer to other systems.
              </Typography>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Icon name="zap" size="sm" color="success" />
                  <Typography
                    variant="body-sm"
                    className="text-green-700 dark:text-green-300"
                  >
                    Coming Soon - One-click exports
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
        {/* Advanced Tools */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="settings" size="xl" color="primary" />
            <Typography variant="headline-lg">Advanced Tools</Typography>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Template Builder */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="settings"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">Template Builder</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Create custom CSV templates based on your specific team needs
                and data structure requirements.
              </Typography>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Icon name="zap" size="sm" color="current" />
                  <Typography
                    variant="body-sm"
                    className="text-purple-700 dark:text-purple-300"
                  >
                    Coming Soon - Custom template builder
                  </Typography>
                </div>
              </div>
            </Card>
            {/* API Integration */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Icon
                  name="database"
                  size="xl"
                  color="secondary"
                  className="mr-3"
                />
                <Typography variant="headline-md">API Integration</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Connect BoxCall with your existing systems using our API. Sync
                data automatically and build custom integrations.
              </Typography>
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Icon name="zap" size="sm" color="current" />
                  <Typography
                    variant="body-sm"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Coming Soon - Developer tools
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
        {/* Quick Start Guide */}
        <Card className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Icon name="book" size="xl" color="primary" />
          </div>
          <Typography variant="headline-lg" className="mb-4">
            Quick Start Guide
          </Typography>
          <Typography
            variant="body-lg"
            color="muted"
            className="mb-6 max-w-3xl mx-auto"
          >
            New to BoxCall? Download our comprehensive guide that shows you how
            to use these templates effectively, import your existing data, and
            set up your team for success.
          </Typography>
          <div className="space-y-3">
            <Button
              onClick={() => downloadTemplate("boxcall-quick-start-guide.pdf")}
              variant="primary"
              size="md"
            >
              Download Quick Start Guide (PDF)
            </Button>
            <div className="text-sm text-text-secondary">
              Includes step-by-step instructions and best practices
            </div>
          </div>
        </Card>
        {/* Help Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Typography variant="headline-md" className="mb-4">
            Need Help with Templates?
          </Typography>
          <Typography variant="body-md" color="muted" className="mb-4">
            Having trouble with data import or need a custom template? Our
            support team is here to help you get your coaching workflow
            optimized.
          </Typography>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">
              Contact Support
            </Button>
            <Button variant="ghost" size="sm">
              Video Tutorials
            </Button>
            <Button variant="success" size="sm">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Templates;

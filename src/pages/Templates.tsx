import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";

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
  const downloadTemplate = (templateName: string) => {
    // Mock download functionality - would implement actual file download
    console.log(`Downloading template: ${templateName}`);
    // In real implementation: trigger file download
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-gray-900 dark:text-white">
            Coach Templates & Resources
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Downloadable templates and import tools to streamline your coaching workflow
          </Typography>
        </div>

        {/* Data Import Templates */}
        <div className="mb-8">
          <Typography variant="headline-lg" className="mb-6">
            📊 Data Import Templates
          </Typography>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Roster Import */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">👥</div>
                <Typography variant="headline-md">Roster Import</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                CSV template for importing team rosters with player details, 
                positions, and contact information.
              </Typography>
              <button 
                onClick={() => downloadTemplate('roster-import.csv')}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                Download CSV Template
              </button>
            </Card>

            {/* Playbook Import */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">📖</div>
                <Typography variant="headline-md">Playbook Import</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Structured CSV format for importing plays, formations, 
                and strategic information into your digital playbook.
              </Typography>
              <button 
                onClick={() => downloadTemplate('playbook-import.csv')}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium"
              >
                Download CSV Template
              </button>
            </Card>

            {/* Playscript Import */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">📝</div>
                <Typography variant="headline-md">Playscript Maker</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                CSV template for creating and uploading detailed play scripts 
                with timing, formations, and player assignments.
              </Typography>
              <button 
                onClick={() => downloadTemplate('playscript-template.csv')}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 text-sm font-medium"
              >
                Download CSV Template
              </button>
            </Card>
          </div>
        </div>

        {/* Visual Resources */}
        <div className="mb-8">
          <Typography variant="headline-lg" className="mb-6">
            🎨 Visual Resources
          </Typography>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Playbook Diagrams */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏈</div>
                <Typography variant="headline-md">Playbook Diagrams</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Professional play diagrams in PDF and PNG formats. Ready-to-print 
                formations for offensive and defensive strategies.
              </Typography>
              <div className="space-y-2">
                <button 
                  onClick={() => downloadTemplate('offensive-plays.pdf')}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Download Offensive Plays (PDF)
                </button>
                <button 
                  onClick={() => downloadTemplate('defensive-formations.png')}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  Download Defensive Formations (PNG)
                </button>
              </div>
            </Card>

            {/* Formation Templates */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">⚡</div>
                <Typography variant="headline-md">Formation Templates</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Blank formation templates for creating custom plays. 
                Available in multiple formats for easy editing and printing.
              </Typography>
              <div className="space-y-2">
                <button 
                  onClick={() => downloadTemplate('blank-formations.pdf')}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium"
                >
                  Download Blank Templates (PDF)
                </button>
                <button 
                  onClick={() => downloadTemplate('formation-builder.png')}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium"
                >
                  Download Builder Template (PNG)
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Import Tools */}
        <div className="mb-8">
          <Typography variant="headline-lg" className="mb-6">
            🛠️ Coaching Tools
          </Typography>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Practice Planner */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">⏱️</div>
                <Typography variant="headline-md">Practice Planner</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Advanced practice planning tool with drag-and-drop scheduling, 
                timing controls, and drill management for efficient practices.
              </Typography>
              <button 
                onClick={() => console.log('Navigate to practice planner')}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-sm font-medium"
              >
                Open Practice Planner
              </button>
            </Card>

            {/* Data Import Wizard */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">⬆️</div>
                <Typography variant="headline-md">Data Import Wizard</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Step-by-step wizard for importing CSV data into BoxCall. 
                Validates data and prevents common import errors.
              </Typography>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <Typography variant="body-sm" className="text-blue-700 dark:text-blue-300">
                  🚀 Coming Soon - Smart import wizard
                </Typography>
              </div>
            </Card>

            {/* Bulk Data Export */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">⬇️</div>
                <Typography variant="headline-md">Bulk Export</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Export your team data, plays, and scripts to CSV format 
                for backup or transfer to other systems.
              </Typography>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <Typography variant="body-sm" className="text-green-700 dark:text-green-300">
                  🚀 Coming Soon - One-click exports
                </Typography>
              </div>
            </Card>
          </div>
        </div>

        {/* Advanced Tools */}
        <div className="mb-8">
          <Typography variant="headline-lg" className="mb-6">
            🔧 Advanced Tools
          </Typography>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Template Builder */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏗️</div>
                <Typography variant="headline-md">Template Builder</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Create custom CSV templates based on your specific team 
                needs and data structure requirements.
              </Typography>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <Typography variant="body-sm" className="text-purple-700 dark:text-purple-300">
                  🚀 Coming Soon - Custom template builder
                </Typography>
              </div>
            </Card>

            {/* API Integration */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🔗</div>
                <Typography variant="headline-md">API Integration</Typography>
              </div>
              <Typography variant="body-md" color="muted" className="mb-4">
                Connect BoxCall with your existing systems using our API. 
                Sync data automatically and build custom integrations.
              </Typography>
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <Typography variant="body-sm" className="text-gray-700 dark:text-gray-300">
                  🚀 Coming Soon - Developer tools
                </Typography>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="p-6 text-center">
          <div className="text-4xl mb-4">📚</div>
          <Typography variant="headline-lg" className="mb-4">
            Quick Start Guide
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6 max-w-3xl mx-auto">
            New to BoxCall? Download our comprehensive guide that shows you how to 
            use these templates effectively, import your existing data, and set up 
            your team for success.
          </Typography>
          <div className="space-y-3">
            <button 
              onClick={() => downloadTemplate('boxcall-quick-start-guide.pdf')}
              className="bg-jade-500 text-white px-6 py-3 rounded-lg hover:bg-jade-600 text-sm font-medium"
            >
              Download Quick Start Guide (PDF)
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
            Having trouble with data import or need a custom template? Our support 
            team is here to help you get your coaching workflow optimized.
          </Typography>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium">
              Contact Support
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm font-medium">
              Video Tutorials
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;

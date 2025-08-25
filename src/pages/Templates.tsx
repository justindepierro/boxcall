import React from "react";
import { Layout } from "../components/layout/Layout";

import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon/Icon";
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
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Typography variant="headline-xl" className="text-text-primary">
              Coach Templates & Resources
            </Typography>
            <Typography variant="body-lg" color="muted" className="mt-2">
              Downloadable templates and import tools to streamline your
              coaching workflow
            </Typography>
          </div>
          {/* Data Import Templates */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="bar-chart" size="xl" color="jade" />
              <Typography
                variant="headline-md"
                as="h3"
                className="text-jade-600"
              >
                Data Import Templates
              </Typography>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Roster Import */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Icon name="users" size="xl" color="jade" className="mr-3" />
                  <Typography variant="headline-md">Roster Import</Typography>
                </div>
                <Typography variant="body-md" color="muted" className="mb-4">
                  CSV template for importing team rosters with player details,
                  positions, and contact information.
                </Typography>
                <Button
                  onClick={() => {}}
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
                  <Icon name="book" size="xl" color="jade" className="mr-3" />
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
                  <Icon name="file" size="xl" color="jade" className="mr-3" />
                  <Typography variant="headline-md">
                    Playscript Maker
                  </Typography>
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
          {/* ...rest of page content... */}
        </div>
      </div>
    </Layout>
  );
};
export default Templates;

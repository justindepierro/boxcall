// import React from "react"; // Not needed for React 17+
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import Icon from "../components/ui/Icon/Icon";

export default function About() {
  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-8">
        <Typography variant="headline-xl" className="text-text-primary">
          About BoxCall
        </Typography>
        <Typography variant="body-lg" color="muted" className="mt-2">
          Learn more about the BoxCall platform and get help
        </Typography>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="about-section">
          <Typography variant="headline-lg" className="mb-2">
            About BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted">
            BoxCall is a modern football management platform...
          </Typography>
        </section>
        <section className="team-section">
          <Typography variant="headline-md" className="mb-2">
            Our Team
          </Typography>
          <Typography variant="body-lg" color="muted">
            Meet the passionate team behind BoxCall...
          </Typography>
        </section>
      </div>
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
        <Icon
          name="users"
          size="xl"
          className="text-text-secondary mb-4"
        />
        <Typography variant="headline-md" className="mb-3">
          Support & Help
        </Typography>
        <Typography variant="body-md" color="muted" className="mb-4">
          Need help getting started or have questions? We're here to
          support your team's success.
        </Typography>
        <div className="surface-subtle dark:bg-blue-900/20 border border-subtle dark:border-blue-800 rounded-lg p-3 mb-2">
          <Typography
            variant="body-sm"
            className="text-blue-700 dark:text-blue-300 flex items-center"
          >
            <Icon name="mail" size="sm" className="mr-2" />
            Support: help@boxcall.com
          </Typography>
        </div>
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
  );
}

import React from "react";
import { Typography } from "../components/design-system/Typography";
import Card from "../components/ui/Card/Card";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { usePracticeTemplates } from "../hooks/usePractice";

/**
 * Templates Page
 *
 * Displays available practice templates and resources for coaches
 */
export const TemplatesPage: React.FC = () => {
  const { templates, loading } = usePracticeTemplates("1"); // Default team ID

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <Typography variant="headline-lg" as="h1">
          Templates & Resources
        </Typography>
        <Typography
          variant="body-lg"
          className="text-text-secondary max-w-2xl mx-auto"
        >
          Access pre-built templates, sample plays, and coaching resources to
          accelerate your team's success.
        </Typography>
      </div>

      {/* Practice Templates Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="file" size="lg" className="text-jade-600" />
          <Typography variant="headline-md" as="h2">
            Practice Templates
          </Typography>
        </div>

        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <Typography variant="headline-sm" as="h3" className="mb-2">
                  {template.name}
                </Typography>
                <Typography
                  variant="body-sm"
                  className="text-text-secondary mb-4"
                >
                  {template.description}
                </Typography>
                <Button variant="secondary" size="sm" className="w-full">
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon
              name="file"
              size="lg"
              className="text-text-secondary mx-auto mb-4"
            />
            <Typography variant="body-md" className="text-text-secondary">
              No practice templates available yet.
            </Typography>
          </div>
        )}
      </Card>

      {/* Resources Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="book" size="lg" className="text-jade-600" />
          <Typography variant="headline-md" as="h2">
            Coaching Resources
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <Typography variant="headline-sm" as="h3" className="mb-2">
              CSV Import Guide
            </Typography>
            <Typography variant="body-sm" className="text-text-secondary mb-4">
              Learn how to import your existing plays and data into BoxCall.
            </Typography>
            <Button variant="outline" size="sm">
              View Guide
            </Button>
          </Card>

          <Card className="p-4">
            <Typography variant="headline-sm" as="h3" className="mb-2">
              Best Practices
            </Typography>
            <Typography variant="body-sm" className="text-text-secondary mb-4">
              Tips and strategies for effective coaching with BoxCall.
            </Typography>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default TemplatesPage;

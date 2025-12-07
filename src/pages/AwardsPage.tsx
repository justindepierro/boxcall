import React from "react";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system";

const AwardsPage: React.FC = React.memo(function AwardsPage() {
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Awards & Recognition
          </Typography>
          <Typography variant="body" className="text-secondary">
            Celebrate your team's achievements.
          </Typography>
        </header>
        <Card className="p-6">
          <Typography variant="body-lg">
            Award management tools are coming soon. In the meantime, coaches can
            track accomplishments manually and share highlights in the Team
            Bulletin.
          </Typography>
        </Card>
      </div>
    </div>
  );
});

AwardsPage.displayName = "AwardsPage";

export default AwardsPage;

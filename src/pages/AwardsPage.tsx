import { PageLayout } from "../components/layout/PageLayout";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system";
import { Aurora } from "../components/ui/Aurora";

const AwardsPage: React.FC = () => {
  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="Awards & Recognition"
        subtitle="Celebrate your team's achievements."
        variant="detail"
      >
        <Card className="p-6">
          <Typography variant="body-lg">
            Award management tools are coming soon. In the meantime, coaches can
            track accomplishments manually and share highlights in the Team
            Bulletin.
          </Typography>
        </Card>
      </PageLayout>
    </Aurora>
  );
};

export default AwardsPage;

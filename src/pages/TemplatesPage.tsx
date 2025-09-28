import { PageLayout } from "../components/layout/PageLayout";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system";

const TemplatesPage: React.FC = () => {
  return (
    <PageLayout
      title="Templates"
      subtitle="Reusable practice, planning, and communication templates."
      variant="detail"
    >
      <Card className="p-6">
        <Typography variant="body-lg">
          We're building a library of ready-made templates for playbooks,
          practices, and team communication. Stay tuned for updates, and let us
          know which templates would help your staff most.
        </Typography>
      </Card>
    </PageLayout>
  );
};

export default TemplatesPage;

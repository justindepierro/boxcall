import React from "react";
import { Typography } from "../../components/design-system/Typography";

interface ProfileActivityProps {
  activities: Array<{ id: string; description: string; date: string }>;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({
  activities,
}) => {
  if (!activities || activities.length === 0) {
    return <Typography variant="body-md">No recent activity.</Typography>;
  }
  return (
    <div className="space-y-4">
      <Typography variant="headline-md">Recent Activity</Typography>
      {activities.map((activity) => (
        <div key={activity.id} className="p-3 border rounded-md">
          <Typography variant="body-md">{activity.description}</Typography>
          <Typography variant="body-sm" color="muted">
            {activity.date}
          </Typography>
        </div>
      ))}
    </div>
  );
};

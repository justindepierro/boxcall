/**
 * ReadReceipts Component
 * 
 * Displays read receipt information for announcements
 * Shows who has viewed and percentage viewed
 * Coaches can see detailed list of viewers/non-viewers
 */

import { useState, useEffect, useCallback } from "react";
import { AnnouncementViewsService, type ReadReceiptStats } from "../../services/announcementViewsService";
import { Eye, Users, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface ReadReceiptsProps {
  announcementId: string;
  teamId: string;
  isCoach?: boolean;
}

export function ReadReceipts({ announcementId, teamId, isCoach = false }: ReadReceiptsProps) {
  const [stats, setStats] = useState<ReadReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const data = await AnnouncementViewsService.getReadReceipts(announcementId, teamId);
    setStats(data);
    setLoading(false);
  }, [announcementId, teamId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Eye className="w-4 h-4 animate-pulse" />
        <span>Loading views...</span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { viewed_count, total_members, view_percentage, viewers, non_viewers } = stats;

  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Eye className="w-4 h-4" />
          <span>
            <strong className="text-primary">{viewed_count}</strong> of{" "}
            <strong className="text-primary">{total_members}</strong> viewed
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex-1 max-w-xs">
          <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${view_percentage}%` }}
            />
          </div>
        </div>

        <span className="text-sm font-medium text-primary">
          {view_percentage}%
        </span>

        {/* Toggle Details (Coaches Only) */}
        {isCoach && total_members > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            aria-expanded={showDetails}
          >
            <Users className="w-4 h-4" />
            <span>Details</span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Detailed View (Coaches Only) */}
      {isCoach && showDetails && (
        <div className="mt-3 p-4 bg-surface-secondary rounded-lg space-y-4">
          {/* Viewers */}
          {viewers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-success-600" />
                Viewed ({viewers.length})
              </h4>
              <ul className="space-y-1">
                {viewers.map((viewer) => (
                  <li
                    key={viewer.user_id}
                    className="text-sm flex items-center justify-between py-1 px-2 hover:bg-white rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{viewer.user_name}</span>
                      <span className="text-xs text-muted capitalize">
                        ({viewer.user_role})
                      </span>
                    </div>
                    <time className="text-xs text-muted" dateTime={viewer.viewed_at}>
                      {format(new Date(viewer.viewed_at), "MMM d 'at' h:mm a")}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Non-Viewers */}
          {non_viewers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted opacity-50" />
                Not Yet Viewed ({non_viewers.length})
              </h4>
              <ul className="space-y-1">
                {non_viewers.map((member) => (
                  <li
                    key={member.user_id}
                    className="text-sm flex items-center gap-2 py-1 px-2 hover:bg-white rounded"
                  >
                    <span className="text-muted">{member.user_name}</span>
                    <span className="text-xs text-muted capitalize">
                      ({member.user_role})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No Members */}
          {total_members === 0 && (
            <p className="text-sm text-muted text-center py-4">
              No active team members to track
            </p>
          )}
        </div>
      )}
    </div>
  );
}

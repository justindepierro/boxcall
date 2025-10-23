import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useActiveTeamStore } from "../stores/activeTeamStore";

/**
 * Syncs :teamId URL param into the active team store whenever it appears.
 * Renders nothing.
 */
export const TeamParamSync: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const setActiveTeamId = useActiveTeamStore((s) => s.setActiveTeamId);

  useEffect(() => {
    const tid = params.teamId;
    if (tid) setActiveTeamId(tid);
  }, [location.pathname, params.teamId, setActiveTeamId]);

  return null;
};

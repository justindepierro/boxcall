import { useEffect, useState } from "react";
import {
  DashboardService,
  type DashboardData,
  type UserTeamData,
} from "../services/dashboardService";
/**
 * Hook for dashboard data management
 * Provides data for Personal Dashboard components
 */
export const useDashboardData = (userId: string | undefined) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isCancelled = false;
    const fetchDashboardData = async () => {
      if (!userId) {
        setDashboardData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await DashboardService.getDashboardData(userId);
        if (!isCancelled) {
          setDashboardData(data);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard data"
          );
          setDashboardData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    fetchDashboardData();
    return () => {
      isCancelled = true;
    };
  }, [userId]);
  const refreshDashboard = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await DashboardService.getDashboardData(userId);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };
  return {
    dashboardData,
    userTeams: dashboardData?.userTeams || [],
    activeTeams: dashboardData?.activeTeams || [],
    totalTeams: dashboardData?.totalTeams || 0,
    recentActivity: dashboardData?.recentActivity || [],
    loading,
    error,
    refreshDashboard,
  };
};
/**
 * Hook for getting user's team memberships
 */
export const useUserTeams = (userId: string | undefined) => {
  const [userTeams, setUserTeams] = useState<UserTeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isCancelled = false;
    const fetchUserTeams = async () => {
      if (!userId) {
        setUserTeams([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const teams = await DashboardService.getUserTeams(userId);
        if (!isCancelled) {
          setUserTeams(teams);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load teams");
          setUserTeams([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    fetchUserTeams();
    return () => {
      isCancelled = true;
    };
  }, [userId]);
  const primaryTeam =
    userTeams.length > 0 ? DashboardService.getPrimaryTeam(userTeams) : null;
  return {
    userTeams,
    primaryTeam,
    teamCount: userTeams.length,
    loading,
    error,
  };
};

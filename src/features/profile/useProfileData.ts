import { useAuthLoading, useAuthProfile } from "../../app/auth-store";

export function useProfileData() {
  const profile = useAuthProfile();
  const loading = useAuthLoading();
  return { profile, loading };
}

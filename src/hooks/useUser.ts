"use client";

import { trpc } from "@/trpc/client";

/**
 * Custom hook for user-related operations
 * Provides a clean interface for components to interact with user data
 */
export function useUser() {
  const profileQuery = trpc.user.getProfile.useQuery();
  const basicInfoQuery = trpc.user.getBasicInfo.useQuery();
  const statsQuery = trpc.user.getStats.useQuery();
  
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      // Invalidate and refetch profile data after successful update
      profileQuery.refetch();
      basicInfoQuery.refetch();
    },
  });

  return {
    // Profile data
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    
    // Basic info (for navbars, etc.)
    basicInfo: basicInfoQuery.data,
    isBasicInfoLoading: basicInfoQuery.isLoading,
    basicInfoError: basicInfoQuery.error,
    
    // Stats data
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    
    // Mutations
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
    
    // Refetch functions
    refetchProfile: profileQuery.refetch,
    refetchBasicInfo: basicInfoQuery.refetch,
    refetchStats: statsQuery.refetch,
  };
}

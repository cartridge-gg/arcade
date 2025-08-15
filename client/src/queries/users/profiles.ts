import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface UserProfile {
  address: string;
  username?: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    gamesPlayed: number;
    achievementsEarned: number;
    totalPoints: number;
    rank?: number;
  };
}

async function fetchUserProfile(address: string): Promise<UserProfile> {
  // TODO: Replace with actual API call
  // This would fetch comprehensive user profile data
  throw new Error('TODO: implement me at users/profiles.ts - Need to integrate API for fetching user profile');
}

export function useUserProfileQuery(address: string) {
  return useQuery({
    queryKey: queryKeys.users.profile(address),
    queryFn: () => fetchUserProfile(address),
    enabled: !!address,
    ...queryConfigs.users,
  });
}

// Query for multiple user profiles
export function useUserProfilesQuery(addresses: string[]) {
  return useQuery({
    queryKey: [...queryKeys.users.all, 'profiles', addresses],
    queryFn: async () => {
      // Fetch multiple profiles in parallel
      const profiles = await Promise.all(
        addresses.map(addr => fetchUserProfile(addr))
      );
      return profiles;
    },
    enabled: addresses.length > 0,
    ...queryConfigs.users,
  });
}
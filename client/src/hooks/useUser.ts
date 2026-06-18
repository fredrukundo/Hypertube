"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, getAllUsers } from "@/services/user.service";
import { User, UpdateUserData } from "@/types/user.types";
import { useAuthStore } from "@/store/auth.store";
import { getToken } from "@/services/auth.service";
import { getCurrentUser } from "@/services/user.service";

// Get Public User Profile 
export function usePublicUser(userId: string | number) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      try {
        return await getUserProfile(userId);
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// Get Current User (Own Profile)
export function useCurrentUser() {
  const { user, setUser } = useAuthStore();
  const token = getToken();

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    },
    enabled: !!token,
  });
}

// Update User Profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateUserData) => {
      if (!user?.id) throw new Error("Not authenticated");
      return updateUserProfile(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

// Get All Users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    staleTime: 10 * 60 * 1000,
  });
}
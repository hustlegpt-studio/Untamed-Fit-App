import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "./use-auth";

export function useUserWorkoutSessions(date?: string) {
  const { data: user } = useAuth();
  const userId = user?.id || 1; // Default to 1 for testing

  return useQuery({
    queryKey: [api.userWorkoutSessions.list.path, userId, date],
    queryFn: async () => {
      const url = new URL(api.userWorkoutSessions.list.path, window.location.origin);
      url.searchParams.append("userId", userId.toString());
      if (date) {
        url.searchParams.append("date", date);
      }
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workout sessions");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useCreateUserWorkoutSession() {
  const { data: user } = useAuth();
  const userId = user?.id || 1;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
      const res = await fetch(api.userWorkoutSessions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sessionData, userId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create workout session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userWorkoutSessions.list.path] });
    },
  });
}

export function useUpdateUserWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(buildUrl(api.userWorkoutSessions.update.path, { id }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update workout session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userWorkoutSessions.list.path] });
    },
  });
}

export function useDeleteUserWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.userWorkoutSessions.delete.path, { id }), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete workout session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userWorkoutSessions.list.path] });
    },
  });
}

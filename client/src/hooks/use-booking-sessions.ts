import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useBookingSessions(date?: string, traineeEmail?: string) {
  return useQuery({
    queryKey: [api.bookingSessions.list.path, date, traineeEmail],
    queryFn: async () => {
      const url = new URL(api.bookingSessions.list.path, window.location.origin);
      if (date) {
        url.searchParams.append("date", date);
      }
      if (traineeEmail) {
        url.searchParams.append("traineeEmail", traineeEmail);
      }

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch booking sessions");
      return res.json();
    },
  });
}

export function useBookingSessionsByTrainee(traineeEmail: string) {
  return useBookingSessions(undefined, traineeEmail);
}

export function useBookingSessionsByDate(date: string) {
  return useBookingSessions(date, undefined);
}

export function useCreateBookingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: any) => {
      const res = await fetch(api.bookingSessions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create booking session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookingSessions.list.path] });
    },
  });
}

export function useUpdateBookingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(buildUrl(api.bookingSessions.update.path, { id }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update booking session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookingSessions.list.path] });
    },
  });
}

export function useDeleteBookingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.bookingSessions.delete.path, { id }), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete booking session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookingSessions.list.path] });
    },
  });
}

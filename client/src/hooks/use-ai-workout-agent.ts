import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface AIWorkoutResponse {
  message: string;
  plan?: Array<{
    day: string;
    workout: {
      name: string;
      bodyPart: string;
      reps: number;
      sets: number;
      duration: number;
      type: string;
    };
  }>;
  workout?: any;
  completed?: boolean;
  needsMoreInfo?: boolean;
  missingFields?: string[];
  response?: string;
}

export function useAIWorkoutAgent() {
  const { data: user } = useAuth();
  const userId = user?.id || 1;

  return useMutation({
    mutationFn: async (data: { message: string; targetDate?: string }) => {
      const res = await fetch('/api/ai/workout-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          userId,
          targetDate: data.targetDate,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to process AI request');
      }

      return res.json() as Promise<AIWorkoutResponse>;
    },
  });
}

export function useResetConversation() {
  const { data: user } = useAuth();
  const userId = user?.id || 1;

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/reset-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to reset conversation');
      }

      return res.json();
    },
  });
}

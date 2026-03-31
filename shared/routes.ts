import { z } from "zod";
import { insertUserSchema, insertWorkoutSchema, insertProgressLogSchema, insertChallengeSchema, users, workouts, progressLogs, challenges } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/auth/login" as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      }
    },
    register: {
      method: "POST" as const,
      path: "/api/auth/register" as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      }
    }
  },
  workouts: {
    list: {
      method: "GET" as const,
      path: "/api/workouts" as const,
      input: z.object({
        category: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof workouts.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/workouts/:id" as const,
      responses: {
        200: z.custom<typeof workouts.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/workouts" as const,
      input: insertWorkoutSchema,
      responses: {
        201: z.custom<typeof workouts.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  progress: {
    list: {
      method: "GET" as const,
      path: "/api/progress" as const,
      responses: {
        200: z.array(z.custom<typeof progressLogs.$inferSelect>()),
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/progress" as const,
      input: insertProgressLogSchema,
      responses: {
        201: z.custom<typeof progressLogs.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  challenges: {
    list: {
      method: "GET" as const,
      path: "/api/challenges" as const,
      responses: {
        200: z.array(z.custom<typeof challenges.$inferSelect>()),
      }
    }
  },
  settings: {
    update: {
      method: "PUT" as const,
      path: "/api/settings" as const,
      input: z.object({
        blindMode: z.boolean().optional(),
        voiceCues: z.boolean().optional(),
        theme: z.string().optional(),
        subscriptionTier: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

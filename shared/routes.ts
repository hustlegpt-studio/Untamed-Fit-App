import { z } from "zod";
import { insertUserSchema, insertWorkoutSchema, insertProgressLogSchema, insertChallengeSchema, insertUserWorkoutSessionSchema, insertBookingSessionSchema, users, workouts, progressLogs, challenges } from "./schema";

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
  userWorkoutSessions: {
    list: {
      method: "GET" as const,
      path: "/api/user-workout-sessions" as const,
      input: z.object({
        userId: z.number(),
        date: z.string().optional(),
      }),
      responses: {
        200: z.array(z.custom<any>()),
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/user-workout-sessions" as const,
      input: insertUserWorkoutSessionSchema,
      responses: {
        201: z.custom<any>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: "PUT" as const,
      path: "/api/user-workout-sessions/:id" as const,
      input: z.object({
        isCompleted: z.boolean().optional(),
        reps: z.number().optional(),
        sets: z.number().optional(),
        duration: z.number().optional(),
      }),
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/user-workout-sessions/:id" as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      }
    }
  },
  bookingSessions: {
    list: {
      method: "GET" as const,
      path: "/api/booking-sessions" as const,
      input: z.object({
        date: z.string().optional(),
        traineeEmail: z.string().optional(),
      }),
      responses: {
        200: z.array(z.custom<any>()),
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/booking-sessions" as const,
      input: insertBookingSessionSchema,
      responses: {
        201: z.custom<any>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: "PUT" as const,
      path: "/api/booking-sessions/:id" as const,
      input: z.object({
        status: z.enum(["booked", "cancelled", "completed"]).optional(),
        notes: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        duration: z.string().optional(),
        type: z.string().optional(),
      }),
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/booking-sessions/:id" as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
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

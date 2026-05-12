import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { saveSurveyResponse, getAllSurveyResponses, getSurveyResponseCount } from "./db";
import { nanoid } from "nanoid";
import { syncSurveySubmissionToGas } from "./_core/surveySync";
import { serialize } from "cookie";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
  return next({ ctx });
});

function countValues(responses: { answers: unknown }[], questionId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    const answers = r.answers as Record<string, unknown>;
    const val = answers[questionId];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        counts[v] = (counts[v] || 0) + 1;
      }
    } else if (typeof val === "string" && val.trim()) {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return counts;
}

function toChartData(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const expired = serialize(COOKIE_NAME, "", {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0),
      });
      ctx.res.setHeader("Set-Cookie", expired);
      return { success: true } as const;
    }),
  }),

  survey: router({
    submit: publicProcedure
      .input(z.object({
        answers: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.null()])),
        sessionId: z.string().optional(),
        respondent: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(4),
          message: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const sessionId = input.sessionId || nanoid();
        const respondent = input.respondent
          ? {
              name: input.respondent.name.trim(),
              email: input.respondent.email.trim(),
              phone: input.respondent.phone.trim(),
              message: (input.respondent.message ?? "").trim(),
            }
          : null;

        const answersWithRespondent = {
          ...input.answers,
          respondentName: respondent?.name ?? null,
          respondentEmail: respondent?.email ?? null,
          respondentPhone: respondent?.phone ?? null,
          respondentMessage: respondent?.message || null,
        } as Record<string, string | string[] | null>;

        const completedAt = new Date();
        await saveSurveyResponse({
          sessionId,
          answers: answersWithRespondent,
          completedAt,
          createdAt: new Date(),
        });

        if (respondent) {
          await syncSurveySubmissionToGas({
            sessionId,
            submittedAtIso: completedAt.toISOString(),
            answers: input.answers,
            respondent,
          });
        }

        return { success: true, sessionId };
      }),

    count: publicProcedure.query(async () => {
      const count = await getSurveyResponseCount();
      return { count };
    }),
  }),

  admin: router({
    getResponses: adminProcedure.query(async () => {
      const responses = await getAllSurveyResponses();
      return responses;
    }),

    getStats: adminProcedure.query(async () => {
      const responses = await getAllSurveyResponses();
      const total = responses.length;

      if (total === 0) {
        return {
          total: 0,
          genre: [],
          pays: [],
          secteur: [],
          poste: [],
          intentionRetour: [],
          horizonRetour: [],
          freins: [],
          villeMaroc: [],
          confianceEco: [],
          submissionsByDay: [],
        };
      }

      // Soumissions par jour (30 derniers jours)
      const dayMap: Record<string, number> = {};
      for (const r of responses) {
        const day = new Date(r.completedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
        dayMap[day] = (dayMap[day] || 0) + 1;
      }
      const submissionsByDay = Object.entries(dayMap)
        .map(([date, count]) => ({ date, count }))
        .slice(-30);

      return {
        total,
        genre: toChartData(countValues(responses, "q1")),
        pays: toChartData(countValues(responses, "q5")),
        secteur: toChartData(countValues(responses, "q6")),
        poste: toChartData(countValues(responses, "q7")),
        intentionRetour: toChartData(countValues(responses, "q8")),
        horizonRetour: toChartData(countValues(responses, "q9")),
        freins: toChartData(countValues(responses, "q11")).slice(0, 8),
        villeMaroc: toChartData(countValues(responses, "q18")),
        confianceEco: toChartData(countValues(responses, "q19")),
        submissionsByDay,
      };
    }),

    exportCsv: adminProcedure.query(async () => {
      const responses = await getAllSurveyResponses();
      if (responses.length === 0) return { csv: "" };

      const allKeys = new Set<string>();
      responses.forEach(r => {
        const answers = r.answers as Record<string, unknown>;
        Object.keys(answers).forEach(k => allKeys.add(k));
      });

      const headers = ["id", "sessionId", "completedAt", ...Array.from(allKeys)];
      const rows = responses.map(r => {
        const answers = r.answers as Record<string, unknown>;
        const base = [r.id, r.sessionId, r.completedAt.toISOString()];
        const answerValues = Array.from(allKeys).map(k => {
          const val = answers[k];
          if (Array.isArray(val)) return `"${val.join('; ')}"`;
          if (val === null || val === undefined) return "";
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        return [...base, ...answerValues].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      return { csv };
    }),
  }),
});

export type AppRouter = typeof appRouter;

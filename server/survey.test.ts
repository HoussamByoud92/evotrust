import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  saveSurveyResponse: vi.fn().mockResolvedValue(undefined),
  getAllSurveyResponses: vi.fn().mockResolvedValue([
    {
      id: 1,
      sessionId: "test-session-123",
      answers: { q1: "Femme", q2: "Célibataire, sans enfant" },
      completedAt: new Date("2026-01-15T10:00:00Z"),
      createdAt: new Date("2026-01-15T10:00:00Z"),
    },
  ]),
  getSurveyResponseCount: vi.fn().mockResolvedValue(1),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@evotrust.ma",
      name: "Admin EVOTRUST",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("survey.submit", () => {
  it("soumet des réponses avec succès et retourne un sessionId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.submit({
      answers: { q1: "Femme", q2: "Célibataire, sans enfant", q3: "Marocaine" },
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBeDefined();
    expect(typeof result.sessionId).toBe("string");
  });

  it("accepte un sessionId personnalisé", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.submit({
      answers: { q1: "Homme" },
      sessionId: "custom-session-id",
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe("custom-session-id");
  });
});

describe("survey.count", () => {
  it("retourne le nombre de réponses", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.count();
    expect(result.count).toBe(1);
  });
});

describe("admin.getResponses", () => {
  it("retourne les réponses pour un admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getResponses();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].sessionId).toBe("test-session-123");
  });

  it("refuse l'accès à un utilisateur non-admin", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getResponses()).rejects.toThrow();
  });

  it("refuse l'accès à un utilisateur non connecté", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getResponses()).rejects.toThrow();
  });
});

describe("admin.exportCsv", () => {
  it("génère un CSV valide pour un admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.exportCsv();
    expect(result.csv).toBeDefined();
    expect(result.csv).toContain("sessionId");
    expect(result.csv).toContain("test-session-123");
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon");

import { NextRequest } from "next/server";
import { GET as getResultHandler } from "../app/api/results/[id]/route";
import { PATCH as patchFeaturedHandler } from "../app/api/featured/[id]/route";
import { POST as uploadUrlHandler } from "../app/api/upload-url/route";

// Mock Supabase
const { mockSupabaseAdmin, mockAuthSupabase } = vi.hoisted(() => {
  return {
    mockSupabaseAdmin: {
      from: vi.fn(),
      storage: {
        from: vi.fn(),
      },
    },
    mockAuthSupabase: {
      auth: {
        getUser: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabaseAdmin,
}));

vi.mock("@/lib/supabase/auth-server", () => ({
  createClient: async () => mockAuthSupabase,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => mockAuthSupabase,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => mockSupabaseAdmin,
}));

vi.mock("next/headers", () => ({
  cookies: () => ({
    getAll: () => [],
  }),
}));

vi.mock("@/lib/analyzer/results-store", () => ({
  resultsStore: {
    getResult: vi.fn(),
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimiter: {
    check: vi.fn(),
  },
}));

describe("HostWhere Security Audits Concept Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("API /api/results/[id]", () => {
    it("allows public access to github analyses", async () => {
      const { resultsStore } = await import("@/lib/analyzer/results-store");
      (resultsStore.getResult as unknown as any).mockResolvedValue({ id: "github-test" });

      const req = new NextRequest("http://localhost/api/results/github-test");
      const res = await getResultHandler(req, { params: Promise.resolve({ id: "github-test" }) });

      expect(res.status).toBe(200);
    });

    it("denies access to a private ZIP analysis if unauthenticated", async () => {
      const { resultsStore } = await import("@/lib/analyzer/results-store");
      (resultsStore.getResult as unknown as any).mockResolvedValue({ id: "zip-123" });

      mockSupabaseAdmin.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { user_id: "user-123" } }),
      });

      mockAuthSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const req = new NextRequest("http://localhost/api/results/zip-123");
      const res = await getResultHandler(req, { params: Promise.resolve({ id: "zip-123" }) });

      expect(res.status).toBe(403);
    });

    it("denies access to a private ZIP analysis if user mismatch", async () => {
      const { resultsStore } = await import("@/lib/analyzer/results-store");
      (resultsStore.getResult as unknown as any).mockResolvedValue({ id: "zip-123" });

      mockSupabaseAdmin.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { user_id: "user-123" } }),
      });

      mockAuthSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-456" } } });

      const req = new NextRequest("http://localhost/api/results/zip-123");
      const res = await getResultHandler(req, { params: Promise.resolve({ id: "zip-123" }) });

      expect(res.status).toBe(403);
    });

    it("allows access to a private ZIP analysis if user owns it", async () => {
      const { resultsStore } = await import("@/lib/analyzer/results-store");
      (resultsStore.getResult as unknown as any).mockResolvedValue({ id: "zip-123" });

      mockSupabaseAdmin.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { user_id: "user-123" } }),
      });

      mockAuthSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      const req = new NextRequest("http://localhost/api/results/zip-123");
      const res = await getResultHandler(req, { params: Promise.resolve({ id: "zip-123" }) });

      expect(res.status).toBe(200);
    });
  });

  describe("API /api/featured/[id]", () => {
    it("denies PATCH request if user does not own the project", async () => {
      mockAuthSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      mockSupabaseAdmin.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { owner_id: "user-456" } }),
      });

      const req = new NextRequest("http://localhost/api/featured/123", {
        method: "PATCH",
        body: JSON.stringify({ website_url: "https://test.com" }),
      });
      const res = await patchFeaturedHandler(req, { params: Promise.resolve({ id: "123" }) });

      expect(res.status).toBe(403);
    });

    it("allows PATCH request if user owns the project", async () => {
      mockAuthSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      mockSupabaseAdmin.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { owner_id: "user-123" } }),
      });

      const req = new NextRequest("http://localhost/api/featured/123", {
        method: "PATCH",
        body: JSON.stringify({ website_url: "https://test.com" }),
      });
      const res = await patchFeaturedHandler(req, { params: Promise.resolve({ id: "123" }) });

      expect(res.status).toBe(200);
    });
  });

  describe("API /api/upload-url", () => {
    it("enforces rate limiting on upload URL generation", async () => {
      const { rateLimiter } = await import("@/lib/rate-limit");
      (rateLimiter.check as unknown as any).mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now(),
      });

      const req = new NextRequest("http://localhost/api/upload-url", {
        method: "POST",
        body: JSON.stringify({ filePath: "uploads/test.zip" }),
      });
      
      const res = await uploadUrlHandler(req);
      expect(res.status).toBe(429);
    });
  });
});

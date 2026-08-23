import { AnalysisResult } from "./types";
import { getSupabaseAdminClient } from "../supabase/server";

export interface ResultsStore {
  storeResult(result: AnalysisResult): Promise<void>;
  getResult(id: string): Promise<AnalysisResult | null>;
  deleteResult(id: string): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// In-Memory Results Store
// ─────────────────────────────────────────────────────────────

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_ENTRIES = 100;

interface CacheEntry {
  result: AnalysisResult;
  expiresAt: number;
}

export class InMemoryResultsStore implements ResultsStore {
  private cache = new Map<string, CacheEntry>();

  private evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  async storeResult(result: AnalysisResult): Promise<void> {
    this.evictExpired();

    // If at capacity, remove the oldest entry
    if (this.cache.size >= MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(result.id, {
      result,
      expiresAt: Date.now() + TTL_MS,
    });
  }

  async getResult(id: string): Promise<AnalysisResult | null> {
    this.evictExpired();
    const entry = this.cache.get(id);
    if (!entry) return null;
    return entry.result;
  }

  async deleteResult(id: string): Promise<void> {
    this.cache.delete(id);
  }
}

export class SupabaseResultsStore implements ResultsStore {
  async storeResult(result: AnalysisResult): Promise<void> {
    const supabase = getSupabaseAdminClient();
    const expiresAt = new Date(Date.now() + TTL_MS).toISOString();

    const { error } = await supabase
      .from("analysis_results")
      .upsert({
        id: result.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: result as any, // Supabase expects JSON compatible types
        expires_at: expiresAt,
      });

    if (error) {
      console.error("Failed to store result in Supabase:", error);
      throw new Error("Failed to store analysis result.");
    }
  }

  async getResult(id: string): Promise<AnalysisResult | null> {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("analysis_results")
      .select("result, expires_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    const expiresAt = new Date(data.expires_at).getTime();
    if (Date.now() > expiresAt) {
      // Clean up expired result
      await this.deleteResult(id);
      return null;
    }

    return data.result as AnalysisResult;
  }

  async deleteResult(id: string): Promise<void> {
    const supabase = getSupabaseAdminClient();
    await supabase.from("analysis_results").delete().eq("id", id);
  }
}

// Factory
export function createResultsStore(): ResultsStore {
  // Use Supabase by default in production
  let provider = process.env.RESULTS_STORE;
  if (!provider && process.env.NODE_ENV === "production") {
    provider = "supabase";
  } else if (!provider) {
    provider = "in-memory";
  }

  if (provider === "supabase") {
    return new SupabaseResultsStore();
  }
  
  if (provider === "redis") {
    throw new Error("Redis ResultsStore not implemented yet. Use RESULTS_STORE=in-memory or supabase");
  }
  
  return new InMemoryResultsStore();
}

// Global instance
export const resultsStore = createResultsStore();

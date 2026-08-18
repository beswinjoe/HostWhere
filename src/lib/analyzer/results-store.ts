import { AnalysisResult } from "./types";

export interface ResultsStore {
  storeResult(result: AnalysisResult): Promise<void>;
  getResult(id: string): Promise<AnalysisResult | null>;
  deleteResult(id: string): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// In-Memory Results Store
// ─────────────────────────────────────────────────────────────

const TTL_MS = 60 * 60 * 1000; // 1 hour
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

// Factory
export function createResultsStore(): ResultsStore {
  const provider = process.env.RESULTS_STORE || "in-memory";
  if (provider === "redis") {
    throw new Error("Redis ResultsStore not implemented yet. Use RESULTS_STORE=in-memory");
  }
  return new InMemoryResultsStore();
}

// Global instance
export const resultsStore = createResultsStore();

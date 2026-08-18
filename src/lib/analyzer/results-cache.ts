import { AnalysisResult } from "./types";

// ─────────────────────────────────────────────────────────────
// In-Memory Results Cache
// Results expire after 1 hour. Max 100 entries.
// ─────────────────────────────────────────────────────────────

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 100;

interface CacheEntry {
  result: AnalysisResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}

export function storeResult(result: AnalysisResult): void {
  evictExpired();

  // If at capacity, remove the oldest entry
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(result.id, {
    result,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function getResult(id: string): AnalysisResult | null {
  evictExpired();
  const entry = cache.get(id);
  if (!entry) return null;
  return entry.result;
}

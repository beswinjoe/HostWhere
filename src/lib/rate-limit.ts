export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimiter {
  check(ip: string): Promise<RateLimitResult>;
}

// ─────────────────────────────────────────────────────────────
// In-Memory Rate Limiter
// ─────────────────────────────────────────────────────────────

interface TokenBucket {
  count10m: number;
  count24h: number;
  lastReset10m: number;
  lastReset24h: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private store = new Map<string, TokenBucket>();

  // Default limits: 5 per 10m, 20 per 24h
  private readonly LIMIT_10M = parseInt(process.env.RATE_LIMIT_10M || "5", 10);
  private readonly LIMIT_24H = parseInt(process.env.RATE_LIMIT_24H || "20", 10);
  
  private readonly WINDOW_10M = 10 * 60 * 1000;
  private readonly WINDOW_24H = 24 * 60 * 60 * 1000;

  async check(ip: string): Promise<RateLimitResult> {
    const now = Date.now();
    let bucket = this.store.get(ip);

    if (!bucket) {
      bucket = {
        count10m: 0,
        count24h: 0,
        lastReset10m: now,
        lastReset24h: now,
      };
      this.store.set(ip, bucket);
    }

    // Reset windows if elapsed
    if (now - bucket.lastReset10m > this.WINDOW_10M) {
      bucket.count10m = 0;
      bucket.lastReset10m = now;
    }
    if (now - bucket.lastReset24h > this.WINDOW_24H) {
      bucket.count24h = 0;
      bucket.lastReset24h = now;
    }

    // Check limits
    if (bucket.count10m >= this.LIMIT_10M) {
      return {
        success: false,
        limit: this.LIMIT_10M,
        remaining: 0,
        reset: bucket.lastReset10m + this.WINDOW_10M,
      };
    }

    if (bucket.count24h >= this.LIMIT_24H) {
      return {
        success: false,
        limit: this.LIMIT_24H,
        remaining: 0,
        reset: bucket.lastReset24h + this.WINDOW_24H,
      };
    }

    // Increment
    bucket.count10m++;
    bucket.count24h++;

    return {
      success: true,
      limit: this.LIMIT_10M,
      remaining: this.LIMIT_10M - bucket.count10m,
      reset: bucket.lastReset10m + this.WINDOW_10M,
    };
  }

  // Periodic cleanup to prevent memory leaks for unique IPs
  public cleanup() {
    const now = Date.now();
    for (const [ip, bucket] of this.store.entries()) {
      if (now - bucket.lastReset24h > this.WINDOW_24H) {
        this.store.delete(ip);
      }
    }
  }
}

// Global instance (can be swapped with RedisRateLimiter later)
export const rateLimiter = new InMemoryRateLimiter();

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);
}

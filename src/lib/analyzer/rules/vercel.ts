import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateVercel(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Vercel handles Next.js perfectly
  if (profile.framework === "nextjs") {
    passes.push({
      rule: "framework-support",
      description: "First-class Next.js support",
      passed: true,
    });
  } else if (profile.staticSite) {
    passes.push({
      rule: "framework-support",
      description: "Static sites are fully supported",
      passed: true,
    });
  } else if (profile.framework) {
    passes.push({
      rule: "framework-support",
      description: `Supports ${profile.framework} via serverless functions or static export`,
      passed: true,
    });
  }

  // 1. Persistent Processes (Blocker)
  if (profile.requiresPersistentProcess) {
    blockers.push({
      rule: "no-persistent-process",
      reason: "Vercel uses Serverless Functions which have a maximum execution time. Long-running processes like Discord bots, persistent game servers, or raw TCP servers will be killed and are not supported.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("persistent") || e.file === "Procfile"),
      suggestion: "Use a PaaS like Railway, Render, or a VPS.",
    });
  } else {
    passes.push({
      rule: "stateless-execution",
      description: "Application appears to be stateless, fitting the serverless model.",
      passed: true,
    });
  }

  // 2. WebSockets (Blocker/Warning depending on framework)
  if (profile.usesWebSockets) {
    if (profile.framework === "nextjs") {
       warnings.push({
        rule: "websockets",
        reason: "Vercel does not support persistent WebSocket connections natively in its serverless functions. You can use external providers like Pusher, Ably, or Supabase Realtime, but native socket.io or ws servers won't work correctly.",
        severity: "warning",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("websocket")),
      });
    } else {
      blockers.push({
        rule: "websockets",
        reason: "Vercel serverless functions cannot maintain persistent WebSocket connections.",
        severity: "blocker",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("websocket")),
        suggestion: "Use an external WebSocket service (Pusher/Ably) or switch to a platform like Railway or Render.",
      });
    }
  }

  // 3. Background Workers (Blocker)
  if (profile.usesWorkers) {
    blockers.push({
      rule: "background-workers",
      reason: "Vercel does not support persistent background workers (like Celery, Bull, or Sidekiq) natively. Serverless functions cannot run continuously in the background.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("worker") || e.snippet?.toLowerCase().includes("queue")),
      suggestion: "Use a PaaS that supports worker processes (Render, Railway), or use serverless-friendly queue services like Inngest, Upstash QStash, or Vercel Cron Jobs.",
    });
  }

  // 4. Cron Jobs (Warning - Vercel supports them but requires specific config)
  if (profile.usesCron) {
    warnings.push({
      rule: "cron-jobs",
      reason: "Vercel supports cron jobs, but they must be configured via vercel.json. In-memory schedulers like node-cron will not work.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("cron")),
      suggestion: "Migrate cron jobs to Vercel Cron syntax in vercel.json.",
    });
  }

  // 5. Databases (Warning - Needs external DB)
  if (profile.databases.length > 0 && !profile.databases.includes("sqlite")) {
      warnings.push({
        rule: "external-database",
        reason: "Vercel is stateless. You must host your database externally (e.g., Supabase, Neon, PlanetScale, MongoDB Atlas). Connection limits might apply to Serverless functions.",
        severity: "warning",
        evidence: profile.evidence.filter(e => profile.databases.some(db => e.snippet?.toLowerCase().includes(db))),
        suggestion: "Ensure you use connection pooling (like PgBouncer) or connectionless protocols (like PlanetScale serverless driver).",
      });
  } else if (profile.databases.includes("sqlite")) {
       blockers.push({
        rule: "sqlite-database",
        reason: "SQLite requires a persistent file system. Vercel's file system is ephemeral (read-only and wiped between invocations). SQLite will not work.",
        severity: "blocker",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
        suggestion: "Migrate to a serverless-friendly database like Turso (libsql), Neon, or Supabase.",
      });
  }

  // Calculate score and status
  let score = 100;
  score -= blockers.length * 30;
  score -= warnings.length * 10;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  if (status === "incompatible") {
      recommendations.push("Consider deploying to Railway, Render, or a VPS which support long-running processes and native WebSockets.");
  }

  return {
    platform: PLATFORMS.vercel,
    status,
    score,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

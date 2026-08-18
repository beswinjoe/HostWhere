import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateCloudflare(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Cloudflare uses V8 isolates, not Node.js
  if (profile.runtime === "node") {
    warnings.push({
      rule: "node-apis",
      reason: "Cloudflare Workers run on V8 isolates, not Node.js. Many Node.js built-in APIs (like fs, child_process) and native modules are not supported, though some compatibility is provided via polyfills.",
      severity: "warning",
      evidence: [],
      suggestion: "Ensure you use Edge-compatible libraries.",
    });
  }

  if (profile.runtime === "python" || profile.runtime === "ruby" || profile.runtime === "go" || profile.runtime === "java" || profile.runtime === "php" || profile.runtime === "dotnet") {
       blockers.push({
        rule: "unsupported-runtime",
        reason: `Cloudflare Workers support JavaScript/TypeScript, Rust (via WASM), and some Python (via Pyodide). ${profile.runtime} is not natively supported for standard web servers.`,
        severity: "blocker",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes(profile.runtime)),
      });
  }

  // 1. Persistent Processes (Blocker)
  if (profile.requiresPersistentProcess) {
    blockers.push({
      rule: "no-persistent-process",
      reason: "Cloudflare Workers are event-driven and strictly ephemeral.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("persistent")),
    });
  }

  // 2. WebSockets (Supported, but via Durable Objects/WebSockets API)
  if (profile.usesWebSockets) {
     warnings.push({
        rule: "websockets",
        reason: "Cloudflare supports WebSockets, but requires using their specific WebSocket API or Durable Objects. Standard socket.io or ws libraries will not work directly.",
        severity: "warning",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("websocket")),
      });
  }

  // 3. Background Workers (Warning)
  if (profile.usesWorkers) {
     blockers.push({
      rule: "background-workers",
      reason: "Standard worker queues like Bull or Celery don't work. You must use Cloudflare Queues.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("worker") || e.snippet?.toLowerCase().includes("queue")),
    });
  }

  // 4. Prisma / Databases (Warning)
  if (profile.databases.length > 0) {
      warnings.push({
        rule: "database-connections",
        reason: "Cloudflare Workers cannot establish direct raw TCP connections to traditional databases easily. You usually need an HTTP-based driver (like PlanetScale serverless, Supabase REST) or Cloudflare's Hyperdrive/D1.",
        severity: "warning",
        evidence: profile.evidence.filter(e => profile.databases.some(db => e.snippet?.toLowerCase().includes(db))),
      });
  }

  // Calculate score and status
  let score = 100;
  score -= blockers.length * 30;
  score -= warnings.length * 15;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  let why = "";
  if (status === "incompatible") {
    why = `Cloudflare Workers are incompatible because this project requires ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `Cloudflare can host this project, but there are limitations regarding ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `Cloudflare Workers are an excellent fit for this Edge-compatible project.`;
  }

  return {
    platform: PLATFORMS.cloudflare,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

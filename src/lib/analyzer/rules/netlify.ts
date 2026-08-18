import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateNetlify(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Support for Static/Frameworks
  if (profile.staticSite) {
    passes.push({
      rule: "static-site",
      description: "Excellent support for static sites and Jamstack",
      passed: true,
    });
  } else if (profile.framework) {
    passes.push({
      rule: "framework-support",
      description: `Supports ${profile.framework} via Netlify Functions or static export`,
      passed: true,
    });
  }

  // 1. Persistent Processes (Blocker)
  if (profile.requiresPersistentProcess) {
    blockers.push({
      rule: "no-persistent-process",
      reason: "Netlify uses Serverless Functions (AWS Lambda). Long-running processes like bots or custom servers are not supported as functions time out.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("persistent")),
    });
  }

  // 2. WebSockets (Blocker)
  if (profile.usesWebSockets) {
      blockers.push({
        rule: "websockets",
        reason: "Netlify Functions cannot maintain persistent WebSocket connections.",
        severity: "blocker",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("websocket")),
        suggestion: "Use an external WebSocket service or migrate to a PaaS.",
      });
  }

  // 3. Background Workers (Blocker)
  if (profile.usesWorkers) {
    blockers.push({
      rule: "background-workers",
      reason: "Netlify does not support persistent background workers. Netlify Background Functions can run up to 15 minutes, but are not full daemon processes.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("worker") || e.snippet?.toLowerCase().includes("queue")),
    });
  }
  
  // 4. Cron Jobs (Warning)
  if (profile.usesCron) {
    warnings.push({
      rule: "cron-jobs",
      reason: "In-memory schedulers won't work. You must use Netlify Scheduled Functions.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("cron")),
    });
  }

  // 5. SQLite (Blocker)
  if (profile.databases.includes("sqlite")) {
       blockers.push({
        rule: "sqlite-database",
        reason: "SQLite requires a persistent file system. Netlify's file system is ephemeral.",
        severity: "blocker",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
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

  return {
    platform: PLATFORMS.netlify,
    status,
    score,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

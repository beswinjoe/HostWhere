import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateRender(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Render supports Web Services, Background Workers, and Static Sites
  
  if (profile.usesDocker) {
     passes.push({
      rule: "docker-support",
      description: "Render has excellent native support for deploying from Dockerfiles.",
      passed: true,
    });
  }

  // 1. Persistent Processes (Pass)
  if (profile.requiresPersistentProcess) {
     passes.push({
      rule: "persistent-process",
      description: "Render Web Services fully support persistent, long-running processes.",
      passed: true,
    });
  }

  // 2. WebSockets (Pass)
  if (profile.usesWebSockets) {
     passes.push({
      rule: "websockets",
      description: "Native WebSockets are fully supported.",
      passed: true,
    });
  }

  // 3. Background Workers (Pass)
  if (profile.usesWorkers) {
     passes.push({
      rule: "background-workers",
      description: "Render has dedicated Background Worker service types for queues and tasks.",
      passed: true,
    });
  }

  // 4. Databases (Pass/Warning)
  if (profile.databases.includes("postgresql")) {
      passes.push({
      rule: "managed-postgres",
      description: "Render provides Managed PostgreSQL.",
      passed: true,
    });
  }
  if (profile.databases.includes("redis")) {
      passes.push({
      rule: "managed-redis",
      description: "Render provides Managed Redis.",
      passed: true,
    });
  }
  
  // 5. SQLite (Warning)
  if (profile.databases.includes("sqlite")) {
      warnings.push({
        rule: "sqlite-disk",
        reason: "You must attach a persistent Disk to your Render Web Service to use SQLite, otherwise data is lost on redeploy.",
        severity: "warning",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
        suggestion: "Configure a Render Disk in your dashboard or render.yaml.",
      });
  }

  // Free Tier Sleep (Warning)
  if (profile.requiresPersistentProcess || profile.usesWebSockets) {
       warnings.push({
        rule: "free-tier-sleep",
        reason: "Note: Render's Free tier spins down web services after 15 minutes of inactivity. For bots or persistent sockets, you need a paid tier.",
        severity: "warning",
        evidence: [],
      });
  }

  let score = 100;
  score -= blockers.length * 30;
  score -= warnings.length * 5;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  return {
    platform: PLATFORMS.render,
    status,
    score,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

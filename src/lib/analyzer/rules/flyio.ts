import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateFlyIo(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Fly.io deploys Docker containers, so anything Dockerized works
  
  if (profile.usesDocker) {
     passes.push({
      rule: "docker-support",
      description: "Fly.io natively runs Docker containers.",
      passed: true,
    });
  } else {
     passes.push({
      rule: "buildpacks",
      description: "Fly.io uses Buildpacks to automatically detect and build standard runtimes.",
      passed: true,
    });
  }

  // 1. Persistent Processes (Pass)
  if (profile.requiresPersistentProcess) {
     passes.push({
      rule: "persistent-process",
      description: "Fly.io fully supports persistent, long-running processes.",
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
      description: "You can run background worker processes.",
      passed: true,
    });
  }

  // 4. Databases (Pass)
  if (profile.databases.includes("postgresql")) {
      passes.push({
      rule: "managed-postgres",
      description: "Fly.io provides managed PostgreSQL clusters.",
      passed: true,
    });
  }
  if (profile.databases.includes("redis")) {
      passes.push({
      rule: "managed-redis",
      description: "Fly.io provides Upstash Redis.",
      passed: true,
    });
  }
  
  // 5. SQLite (Pass, but needs config)
  if (profile.databases.includes("sqlite")) {
      warnings.push({
        rule: "sqlite-volume",
        reason: "Fly.io supports SQLite extremely well (like LiteFS), but you MUST provision and mount a Fly Volume to persist the data.",
        severity: "warning",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
        suggestion: "Ensure your fly.toml configures a mount for a Fly Volume.",
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
    platform: PLATFORMS.flyio,
    status,
    score,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

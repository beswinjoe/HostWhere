import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateRailway(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Railway supports almost everything
  
  if (profile.usesDocker) {
     passes.push({
      rule: "docker-support",
      description: "Railway has excellent native support for Dockerfiles.",
      passed: true,
    });
  } else {
     passes.push({
      rule: "nixpacks-support",
      description: "Railway uses Nixpacks, which automatically detects and builds most runtimes without a Dockerfile.",
      passed: true,
    });
  }

  // 1. Persistent Processes (Pass)
  if (profile.requiresPersistentProcess) {
     passes.push({
      rule: "persistent-process",
      description: "Railway fully supports persistent, long-running processes like bots and game servers.",
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
      description: "You can easily run background workers as separate services within your Railway project.",
      passed: true,
    });
  }

  // 4. Databases (Pass)
  if (profile.databases.length > 0) {
      passes.push({
      rule: "databases",
      description: "Railway provides managed PostgreSQL, MySQL, Redis, and MongoDB, or you can connect external ones.",
      passed: true,
    });
  }
  
  // 5. SQLite (Warning)
  if (profile.databases.includes("sqlite")) {
      warnings.push({
        rule: "sqlite-volume",
        reason: "While supported, you MUST attach a persistent Volume to your service in Railway, otherwise your SQLite database will be wiped on every deployment.",
        severity: "warning",
        evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
        suggestion: "Ensure you add a Volume and configure your SQLite path to point to it.",
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
    platform: PLATFORMS.railway,
    status,
    score,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

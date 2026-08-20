import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateZerops(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // Zerops supports most containerized and runtime-based workloads.
  
  if (profile.usesDocker) {
    passes.push({
      rule: "docker-support",
      description: "Zerops natively supports deploying Dockerfiles and Docker Compose-like services.",
      passed: true,
    });
  } else if (profile.runtime !== "unknown") {
    passes.push({
      rule: "runtime-support",
      description: `Zerops provides native managed runtimes for ${profile.runtime}.`,
      passed: true,
    });
  }

  // 1. Persistent Processes (Pass)
  if (profile.requiresPersistentProcess) {
    passes.push({
      rule: "persistent-process",
      description: "Zerops fully supports long-running persistent services.",
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
      description: "You can run background workers as dedicated services in Zerops.",
      passed: true,
    });
  }

  // 4. Cron Jobs (Pass)
  if (profile.usesCron) {
    passes.push({
      rule: "cron-jobs",
      description: "Cron jobs are supported through long-running services or specific configurations.",
      passed: true,
    });
  }

  // 5. Databases (Pass/Warning)
  if (profile.databases.length > 0) {
    passes.push({
      rule: "databases",
      description: "Zerops provides fully managed MariaDB, PostgreSQL, MySQL, and Redis services.",
      passed: true,
    });
  }
  
  if (profile.databases.includes("sqlite")) {
    warnings.push({
      rule: "sqlite-volume",
      reason: "To use SQLite on Zerops, you must attach persistent storage to your service, otherwise the database will be ephemeral.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Make sure you configure shared or persistent storage in your zerops.yml.",
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

  let why = "";
  if (status === "incompatible") {
    why = `Zerops is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `Zerops is a great choice, but be aware of limitations regarding ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `Zerops fully supports the persistent processes, databases, and environments required by this project.`;
  }

  return {
    platform: PLATFORMS.zerops,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

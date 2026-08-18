import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateAzure(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  if (profile.requiresPersistentProcess) {
    passes.push({
      rule: "persistent-process",
      description: "Azure App Service supports persistent Always On background processes (WebJobs/Workers).",
      passed: true,
    });
  }

  if (profile.usesWebSockets) {
    passes.push({
      rule: "websockets",
      description: "Azure App Service fully supports WebSockets.",
      passed: true,
    });
  }

  if (profile.databases.includes("sqlite")) {
    warnings.push({
      rule: "sqlite-network-share",
      reason: "Azure App Service uses a network share for the filesystem. SQLite will work but might suffer from locking issues and poor performance under concurrency.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Migrate to Azure SQL or CosmosDB.",
    });
  }

  if (profile.usesDocker) {
    passes.push({
      rule: "docker",
      description: "App Service for Containers natively supports Docker workloads.",
      passed: true,
    });
  }

  let score = 90; // Default slightly lower due to config complexity
  score -= blockers.length * 30;
  score -= warnings.length * 10;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  let why = "";
  if (status === "incompatible") {
    why = `Azure App Service is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `Azure App Service will work, but beware of ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `Azure App Service is a solid, enterprise-ready PaaS for this application.`;
  }

  return {
    platform: PLATFORMS.azure,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

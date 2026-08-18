import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateGoogleCloud(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  if (profile.requiresPersistentProcess) {
    warnings.push({
      rule: "stateless-containers",
      reason: "Google Cloud Run scales to zero. For background workers or bots, you must configure 'min-instances: 1' and 'CPU always allocated', which increases costs.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("persistent")),
      suggestion: "Enable 'CPU always allocated' in Cloud Run settings.",
    });
  }

  if (profile.usesWebSockets) {
    passes.push({
      rule: "websockets",
      description: "Cloud Run supports WebSockets, provided 'CPU always allocated' is enabled.",
      passed: true,
    });
  }

  if (profile.databases.includes("sqlite")) {
    blockers.push({
      rule: "sqlite-ephemeral",
      reason: "Cloud Run instances are ephemeral. SQLite data will be lost.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Use Cloud SQL.",
    });
  }

  if (profile.usesDocker) {
    passes.push({
      rule: "docker",
      description: "Cloud Run deploys containers natively.",
      passed: true,
    });
  }

  let score = 90; // Default slightly lower due to config complexity
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
    why = `Google Cloud Run is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `Google Cloud Run can host this, but requires specific configuration for ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `Google Cloud Run is an excellent, scalable container platform for this project.`;
  }

  return {
    platform: PLATFORMS.googlecloud,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}

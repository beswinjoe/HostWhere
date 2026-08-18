import { ProjectFiles, ProjectProfile, PlatformCompatibility, AnalysisResult, Requirement } from "./types";

// Detectors
import { frameworkDetector } from "./detectors/frameworkDetector";
import { runtimeDetector } from "./detectors/runtimeDetector";
import { dependencyDetector } from "./detectors/dependencyDetector";
import { databaseDetector } from "./detectors/databaseDetector";
import { websocketDetector } from "./detectors/websocketDetector";
import { workerDetector } from "./detectors/workerDetector";
import { dockerDetector } from "./detectors/dockerDetector";
import { cronDetector } from "./detectors/cronDetector";
import { monorepoDetector } from "./detectors/monorepoDetector";
import { persistentProcessDetector } from "./detectors/persistentProcessDetector";
import { environmentDetector } from "./detectors/environmentDetector";
import { staticSiteDetector } from "./detectors/staticSiteDetector";

// Rules
import { evaluateVercel } from "./rules/vercel";
import { evaluateNetlify } from "./rules/netlify";
import { evaluateCloudflare } from "./rules/cloudflare";
import { evaluateRailway } from "./rules/railway";
import { evaluateRender } from "./rules/render";
import { evaluateFlyIo } from "./rules/flyio";
import { evaluateDocker } from "./rules/docker";
import { evaluateHeroku } from "./rules/heroku";
import { evaluateDigitalOcean } from "./rules/digitalocean";
import { evaluateKoyeb } from "./rules/koyeb";
import { evaluateAWS } from "./rules/aws";
import { evaluateGoogleCloud } from "./rules/googlecloud";
import { evaluateAzure } from "./rules/azure";

export async function analyzeProject(files: ProjectFiles, projectName: string = "uploaded-project"): Promise<AnalysisResult> {
  // 1. Run all detectors
  const frameworkRes = frameworkDetector(files);
  const runtimeRes = runtimeDetector(files);
  const dependencyRes = dependencyDetector(files);
  const databaseRes = databaseDetector(files);
  const websocketRes = websocketDetector(files);
  const workerRes = workerDetector(files);
  const dockerRes = dockerDetector(files);
  const cronRes = cronDetector(files);
  const monorepoRes = monorepoDetector(files);
  const persistentRes = persistentProcessDetector(files);
  const envRes = environmentDetector(files);
  const staticSiteRes = staticSiteDetector(files);

  // 2. Compile detected requirements
  const detectedRequirements: Requirement[] = [];
  
  if (databaseRes.databases?.length) {
    detectedRequirements.push({
      name: "Database Connection",
      description: `Connects to: ${databaseRes.databases.join(", ")}`,
      critical: true,
      evidence: databaseRes.evidence || [],
    });
  }

  if (persistentRes.requiresPersistentProcess) {
    detectedRequirements.push({
      name: "Persistent Process",
      description: "Requires a continuously running server or daemon.",
      critical: true,
      evidence: persistentRes.evidence || [],
    });
  }

  if (websocketRes.usesWebSockets) {
    detectedRequirements.push({
      name: "WebSockets",
      description: "Uses persistent WebSocket connections.",
      critical: false, // Not always critical depending on platform
      evidence: websocketRes.evidence || [],
    });
  }

  if (workerRes.usesWorkers) {
    detectedRequirements.push({
      name: "Background Workers",
      description: "Uses background queues or worker processes.",
      critical: true,
      evidence: workerRes.evidence || [],
    });
  }

  if (dockerRes.usesDocker) {
    detectedRequirements.push({
      name: "Docker",
      description: "Provides a Dockerfile for containerized deployment.",
      critical: false,
      evidence: dockerRes.evidence || [],
    });
  }

  if (cronRes.usesCron) {
    detectedRequirements.push({
      name: "Cron / Scheduled Jobs",
      description: "Runs periodic scheduled tasks.",
      critical: false,
      evidence: cronRes.evidence || [],
    });
  }

  // 3. Compute Deployment Type & Confidence
  let deploymentType: ProjectProfile["deploymentType"] = "Unknown";
  let confidenceScore = 0;
  let confidenceReason = "";

  if (persistentRes.requiresPersistentProcess) {
    if (workerRes.usesWorkers) {
      deploymentType = "Background worker";
    } else {
      deploymentType = "Long-running server";
    }
  } else if (staticSiteRes.staticSite) {
    deploymentType = "Static frontend";
  } else if (dockerRes.usesDocker) {
    deploymentType = "Docker service";
  } else if (frameworkRes.framework === "nextjs" || frameworkRes.framework === "nuxt" || frameworkRes.framework === "sveltekit") {
    deploymentType = "Serverless application";
  } else if (runtimeRes.runtime !== "unknown") {
    deploymentType = "Long-running server"; // fallback for standard express/flask apps
  }

  // Calculate confidence based on evidence quality
  const hasPackageJSON = dependencyRes.evidence?.some(e => e.file === "package.json");
  const hasRequirements = dependencyRes.evidence?.some(e => e.file === "requirements.txt" || e.file === "pyproject.toml" || e.file === "Pipfile");
  const hasDockerfile = dockerRes.evidence?.some(e => e.file.toLowerCase().includes("dockerfile"));
  
  if (hasPackageJSON || hasRequirements || hasDockerfile) {
    confidenceScore = 95;
    confidenceReason = "High confidence: Core configuration files (package.json, requirements.txt, or Dockerfile) were found and analyzed.";
  } else if (runtimeRes.runtime !== "unknown" && frameworkRes.framework !== "unknown") {
    confidenceScore = 75;
    confidenceReason = "Moderate confidence: Found recognizable source files, but explicit deployment configuration is missing.";
  } else if (runtimeRes.runtime !== "unknown") {
    confidenceScore = 50;
    confidenceReason = "Low confidence: Only generic language files found. Configuration is highly ambiguous.";
  } else {
    confidenceScore = 20;
    confidenceReason = "Very low confidence: Unrecognized project structure.";
  }

  // 4. Build the Project Profile
  const profile: ProjectProfile = {
    framework: frameworkRes.framework || null,
    language: runtimeRes.language || "unknown",
    runtime: runtimeRes.runtime || "unknown",
    packageManager: dependencyRes.packageManager || "unknown",
    dependencies: dependencyRes.dependencies || [],
    buildCommand: dependencyRes.buildCommand || null,
    startCommand: dependencyRes.startCommand || null,
    databases: databaseRes.databases || [],
    usesWebSockets: !!websocketRes.usesWebSockets,
    usesWorkers: !!workerRes.usesWorkers,
    usesCron: !!cronRes.usesCron,
    requiresPersistentProcess: !!persistentRes.requiresPersistentProcess,
    usesDocker: !!dockerRes.usesDocker,
    monorepo: monorepoRes.monorepo || null,
    environmentVariables: envRes.environmentVariables || [],
    staticSite: !!staticSiteRes.staticSite,
    nodeVersion: runtimeRes.nodeVersion || null,
    pythonVersion: runtimeRes.pythonVersion || null,
    detectedRequirements,
    deploymentType,
    confidenceScore,
    confidenceReason,
    evidence: [
      ...(frameworkRes.evidence || []),
      ...(runtimeRes.evidence || []),
      ...(dependencyRes.evidence || []),
      ...(databaseRes.evidence || []),
      ...(websocketRes.evidence || []),
      ...(workerRes.evidence || []),
      ...(dockerRes.evidence || []),
      ...(cronRes.evidence || []),
      ...(monorepoRes.evidence || []),
      ...(persistentRes.evidence || []),
      ...(envRes.evidence || []),
      ...(staticSiteRes.evidence || []),
    ],
  };

  // 5. Run rules engine against platforms
  const platforms: PlatformCompatibility[] = [
    evaluateVercel(profile),
    evaluateNetlify(profile),
    evaluateCloudflare(profile),
    evaluateRailway(profile),
    evaluateRender(profile),
    evaluateFlyIo(profile),
    evaluateDocker(profile),
    evaluateHeroku(profile),
    evaluateDigitalOcean(profile),
    evaluateKoyeb(profile),
    evaluateAWS(profile),
    evaluateGoogleCloud(profile),
    evaluateAzure(profile),
  ];

  // 6. Return full result
  return {
    id: generateId(),
    profile,
    platforms: platforms.sort((a, b) => b.score - a.score), // Sort by score descending
    analyzedAt: new Date().toISOString(),
    fileCount: files.size,
    projectName,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

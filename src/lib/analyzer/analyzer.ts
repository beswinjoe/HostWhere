import { 
  ProjectFiles, 
  AnalysisResult, 
  ProjectProfile, 
  Requirement,
  Evidence,
  PlatformCompatibility
} from "./types";

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
import { evaluateZerops } from "./rules/zerops";

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

  const calcConf = (evidence: Evidence[]): "High" | "Medium" | "Low" => {
    const sum = evidence.reduce((acc, e) => acc + (e.confidence || 0), 0);
    if (sum >= 80) return "High";
    if (sum >= 50) return "Medium";
    return "Low";
  };
  
  if (databaseRes.databases?.length) {
    const ev = databaseRes.evidence || [];
    detectedRequirements.push({
      name: "Database Connection",
      description: `Connects to: ${databaseRes.databases.join(", ")}`,
      critical: true,
      evidence: ev,
      confidence: calcConf(ev),
    });
  }

  if (persistentRes.requiresPersistentProcess) {
    const ev = persistentRes.evidence || [];
    detectedRequirements.push({
      name: "Persistent Process",
      description: "Requires a continuously running server or daemon.",
      critical: true,
      evidence: ev,
      confidence: calcConf(ev),
    });
  }

  if (websocketRes.usesWebSockets) {
    const ev = websocketRes.evidence || [];
    detectedRequirements.push({
      name: "WebSockets",
      description: "Uses persistent WebSocket connections.",
      critical: false, // Not always critical depending on platform
      evidence: ev,
      confidence: calcConf(ev),
    });
  }

  if (workerRes.usesWorkers) {
    const ev = workerRes.evidence || [];
    detectedRequirements.push({
      name: "Background Workers",
      description: "Uses background queues or worker processes.",
      critical: true,
      evidence: ev,
      confidence: calcConf(ev),
    });
  }

  if (dockerRes.usesDocker) {
    const ev = dockerRes.evidence || [];
    detectedRequirements.push({
      name: "Docker",
      description: "Provides a Dockerfile for containerized deployment.",
      critical: false,
      evidence: ev,
      confidence: calcConf(ev),
    });
  }

  if (cronRes.usesCron) {
    const ev = cronRes.evidence || [];
    detectedRequirements.push({
      name: "Cron / Scheduled Jobs",
      description: "Runs periodic scheduled tasks.",
      critical: false,
      evidence: ev,
      confidence: calcConf(ev),
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
    evaluateZerops(profile),
  ];

  // Debug Output
  if (process.env.NODE_ENV === "development") {
    console.log(`\n=== DEBUG ANALYZER: ${projectName} ===`);
    console.log("WEBSOCKET DETECTOR");
    console.log("detected:", profile.usesWebSockets);
    console.log("evidence:", JSON.stringify(websocketRes.evidence, null, 2));

    console.log("\nWORKER DETECTOR");
    console.log("detected:", profile.usesWorkers);
    console.log("evidence:", JSON.stringify(workerRes.evidence, null, 2));

    console.log("\nPERSISTENT PROCESS");
    console.log("detected:", profile.requiresPersistentProcess);
    console.log("evidence:", JSON.stringify(persistentRes.evidence, null, 2));
    console.log("========================================\n");
  }

  // 6. Compute Deployment Readiness
  let drScore = 100;
  const drItems: { label: string; status: "success" | "warning" | "error" | "info"; description?: string }[] = [];

  if (profile.framework !== "unknown" && profile.framework !== null) {
    drItems.push({ label: "Framework detected", status: "success", description: `Found ${profile.framework}` });
  } else if (profile.runtime !== "unknown") {
    drItems.push({ label: "Runtime detected", status: "success", description: `Found ${profile.runtime}` });
  } else {
    drItems.push({ label: "Framework/Runtime", status: "error", description: "Could not identify standard framework or runtime." });
    drScore -= 20;
  }

  if (profile.buildCommand) {
    drItems.push({ label: "Build configuration detected", status: "success", description: `Build command: ${profile.buildCommand}` });
  } else if (profile.framework !== "unknown" && profile.framework !== null) {
    drItems.push({ label: "Build configuration", status: "info", description: "Default framework build will be used." });
  }

  if (profile.startCommand) {
    drItems.push({ label: "Start command detected", status: "success", description: `Start command: ${profile.startCommand}` });
  } else if (profile.staticSite) {
    drItems.push({ label: "Start command", status: "info", description: "Static site does not require a start command." });
  } else if (profile.requiresPersistentProcess) {
    drItems.push({ label: "Start command missing", status: "warning", description: "A start command is highly recommended for persistent processes." });
    drScore -= 5;
  }

  if (profile.usesDocker) {
    drItems.push({ label: "Dockerfile detected", status: "success" });
  }

  if (profile.environmentVariables.length > 0) {
    drItems.push({ label: "Environment variables required", status: "warning", description: `Detected ${profile.environmentVariables.length} missing variables.` });
    drScore -= 5;
  }

  if (profile.databases.length > 0) {
    drItems.push({ label: "Database detected", status: "success", description: `Found: ${profile.databases.join(", ")}` });
  }

  if (profile.requiresPersistentProcess) {
    drItems.push({ label: "Persistent process detected", status: "warning", description: "Requires specialized hosting platform." });
    drScore -= 5;
  }

  if (profile.usesWebSockets) {
    drItems.push({ label: "WebSockets detected", status: "warning", description: "Requires real-time connection support." });
    drScore -= 5;
  }

  if (profile.usesWorkers) {
    drItems.push({ label: "Background worker detected", status: "warning", description: "Requires worker instance support." });
    drScore -= 5;
  }

  if (profile.usesCron) {
    drItems.push({ label: "Cron/scheduled job detected", status: "info" });
  }

  let drLabel = "Ready for deployment";
  if (drScore < 80) drLabel = "Action Required";
  else if (drScore < 100) drLabel = "Ready with minor configuration";

  const deploymentReadiness = {
    score: drScore,
    label: drLabel,
    items: drItems,
  };

  // 7. Return full result
  return {
    id: generateId(),
    profile,
    platforms: platforms.sort((a, b) => b.score - a.score), // Sort by score descending
    deploymentReadiness,
    analyzedAt: new Date().toISOString(),
    fileCount: files.size,
    projectName,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

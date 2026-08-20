// ─────────────────────────────────────────────────────────────
// HostWhere Analysis Engine — Core Types
// ─────────────────────────────────────────────────────────────

/** Map of relative file paths to their text content */
export type ProjectFiles = Map<string, string>;

// ── Enums & Literals ──────────────────────────────────────────

export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "ruby"
  | "go"
  | "rust"
  | "java"
  | "csharp"
  | "php"
  | "unknown";

export type Runtime =
  | "node"
  | "deno"
  | "bun"
  | "python"
  | "ruby"
  | "go"
  | "rust"
  | "java"
  | "dotnet"
  | "php"
  | "static"
  | "unknown";

export type DeploymentType =
  | "Static frontend"
  | "Serverless application"
  | "Long-running server"
  | "Background worker"
  | "Docker service"
  | "Unknown";

export type PackageManager =
  | "npm"
  | "yarn"
  | "pnpm"
  | "bun"
  | "pip"
  | "poetry"
  | "pipenv"
  | "bundler"
  | "cargo"
  | "go-modules"
  | "composer"
  | "maven"
  | "gradle"
  | "none"
  | "unknown";

export type DetectedFramework =
  | "nextjs"
  | "react"
  | "vue"
  | "nuxt"
  | "svelte"
  | "sveltekit"
  | "angular"
  | "astro"
  | "gatsby"
  | "remix"
  | "express"
  | "fastify"
  | "nestjs"
  | "hono"
  | "koa"
  | "flask"
  | "django"
  | "fastapi"
  | "rails"
  | "spring"
  | "laravel"
  | "hugo"
  | "jekyll"
  | "eleventy"
  | "vite"
  | "static-html"
  | "unknown";

export type Database =
  | "postgresql"
  | "mysql"
  | "mongodb"
  | "redis"
  | "sqlite"
  | "dynamodb"
  | "supabase"
  | "firebase"
  | "planetscale"
  | "unknown";

export type PlatformId =
  | "vercel"
  | "netlify"
  | "cloudflare"
  | "railway"
  | "render"
  | "flyio"
  | "docker"
  | "heroku"
  | "digitalocean"
  | "koyeb"
  | "aws"
  | "googlecloud"
  | "azure"
  | "zerops";

export type CompatibilityStatus = "compatible" | "possible" | "incompatible";
export type IssueSeverity = "blocker" | "warning";

// ── Core Interfaces ───────────────────────────────────────────

export interface Dependency {
  name: string;
  version?: string;
  isDev: boolean;
}

export interface MonorepoInfo {
  type: "npm-workspaces" | "yarn-workspaces" | "pnpm-workspaces" | "turborepo" | "nx" | "lerna";
  packages: string[];
}

export interface Evidence {
  file: string;
  line?: number;
  snippet?: string;
  type: "dependency" | "config" | "source" | "file-presence" | "pattern";
  confidence?: number;
}

export interface Requirement {
  name: string;
  description: string;
  critical: boolean;
  evidence: Evidence[];
  confidence?: "High" | "Medium" | "Low";
}

// ── Project Profile ───────────────────────────────────────────

export interface ProjectProfile {
  framework: DetectedFramework | null;
  language: Language;
  runtime: Runtime;
  packageManager: PackageManager;
  dependencies: Dependency[];
  buildCommand: string | null;
  startCommand: string | null;
  databases: Database[];
  usesWebSockets: boolean;
  usesWorkers: boolean;
  usesCron: boolean;
  requiresPersistentProcess: boolean;
  usesDocker: boolean;
  monorepo: MonorepoInfo | null;
  environmentVariables: string[];
  detectedRequirements: Requirement[];
  staticSite: boolean;
  nodeVersion: string | null;
  pythonVersion: string | null;
  evidence: Evidence[];
  deploymentType: DeploymentType;
  confidenceScore: number;
  confidenceReason: string;
}

// ── Compatibility Results ─────────────────────────────────────

export interface CompatibilityIssue {
  rule: string;
  reason: string;
  evidence: Evidence[];
  severity: IssueSeverity;
  suggestion?: string;
}

export interface CompatibilityCheck {
  rule: string;
  description: string;
  passed: boolean;
}

export interface PlatformCompatibility {
  platform: PlatformInfo;
  status: CompatibilityStatus;
  score: number;
  why: string;
  blockers: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  passes: CompatibilityCheck[];
  recommendations: string[];
}

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: "serverless" | "paas" | "container" | "vps";
  verified?: boolean;
}

export type AnalysisSource =
  | { type: "github"; url: string }
  | { type: "storage"; storagePath: string; projectName: string; size: number };

export interface DeploymentChecklist {
  label: string;
  status: "success" | "warning" | "error" | "info";
  description?: string;
}

export interface DeploymentReadiness {
  score: number;
  label: string;
  items: DeploymentChecklist[];
}

// ── Analysis Result ───────────────────────────────────────────

export interface AnalysisResult {
  id: string;
  profile: ProjectProfile;
  platforms: PlatformCompatibility[];
  deploymentReadiness: DeploymentReadiness;
  analyzedAt: string;
  fileCount: number;
  projectName: string;
}

// ── Detector Interface ────────────────────────────────────────

export type DetectorResult = Partial<ProjectProfile>;

export type Detector = (files: ProjectFiles) => DetectorResult;

// ── Platform Rule Interface ───────────────────────────────────

export type PlatformRule = (profile: ProjectProfile) => PlatformCompatibility;

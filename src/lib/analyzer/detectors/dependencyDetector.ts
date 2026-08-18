import type { ProjectFiles, DetectorResult, Dependency, PackageManager, Evidence } from "../types";

export function dependencyDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  const dependencies: Dependency[] = [];
  let packageManager: PackageManager = "unknown";
  let buildCommand: string | null = null;
  let startCommand: string | null = null;

  // ── Node.js package manager & dependencies ──
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;

      // Detect package manager
      if (files.has("pnpm-lock.yaml") || files.has("pnpm-workspace.yaml")) {
        packageManager = "pnpm";
      } else if (files.has("yarn.lock")) {
        packageManager = "yarn";
      } else if (files.has("bun.lock") || files.has("bun.lockb")) {
        packageManager = "bun";
      } else if (files.has("package-lock.json")) {
        packageManager = "npm";
      } else {
        // Check packageManager field
        const pmField = pkg.packageManager as string | undefined;
        if (pmField) {
          if (pmField.startsWith("pnpm")) packageManager = "pnpm";
          else if (pmField.startsWith("yarn")) packageManager = "yarn";
          else if (pmField.startsWith("bun")) packageManager = "bun";
          else packageManager = "npm";
        } else {
          packageManager = "npm";
        }
      }

      evidence.push({
        file: "package.json",
        type: "config",
        snippet: `Package manager: ${packageManager}`,
      });

      // Extract dependencies
      const deps = (pkg.dependencies || {}) as Record<string, string>;
      const devDeps = (pkg.devDependencies || {}) as Record<string, string>;

      for (const [name, version] of Object.entries(deps)) {
        dependencies.push({ name, version, isDev: false });
      }
      for (const [name, version] of Object.entries(devDeps)) {
        dependencies.push({ name, version, isDev: true });
      }

      // Extract scripts
      const scripts = (pkg.scripts || {}) as Record<string, string>;
      buildCommand = scripts.build || null;
      startCommand = scripts.start || scripts.dev || null;

      if (buildCommand) {
        evidence.push({
          file: "package.json",
          type: "config",
          snippet: `Build command: "${buildCommand}"`,
        });
      }
      if (startCommand) {
        evidence.push({
          file: "package.json",
          type: "config",
          snippet: `Start command: "${scripts.start || scripts.dev}"`,
        });
      }
    } catch {
      // Invalid JSON
    }
  }

  // ── Python dependencies ──
  const requirementsTxt = files.get("requirements.txt");
  if (requirementsTxt) {
    if (packageManager === "unknown") packageManager = "pip";
    const lines = requirementsTxt.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("-"));
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+)(?:[=<>!~]+(.+))?/);
      if (match) {
        dependencies.push({ name: match[1], version: match[2]?.trim(), isDev: false });
      }
    }
    evidence.push({
      file: "requirements.txt",
      type: "config",
      snippet: `${lines.length} Python dependencies`,
    });
  }

  const pyprojectToml = files.get("pyproject.toml");
  if (pyprojectToml) {
    if (pyprojectToml.includes("[tool.poetry]")) {
      packageManager = "poetry";
    } else if (packageManager === "unknown") {
      packageManager = "pip";
    }
  }

  const pipfile = files.get("Pipfile");
  if (pipfile) {
    packageManager = "pipenv";
    evidence.push({ file: "Pipfile", type: "config", snippet: "Pipenv detected" });
  }

  // ── Ruby dependencies ──
  if (files.has("Gemfile")) {
    if (packageManager === "unknown") packageManager = "bundler";
    const gemfile = files.get("Gemfile")!;
    const gemMatches = gemfile.matchAll(/gem\s+['"]([^'"]+)['"]/g);
    for (const match of gemMatches) {
      dependencies.push({ name: match[1], isDev: false });
    }
    evidence.push({ file: "Gemfile", type: "config", snippet: "Ruby Bundler dependencies" });
  }

  // ── Go dependencies ──
  if (files.has("go.mod")) {
    if (packageManager === "unknown") packageManager = "go-modules";
    evidence.push({ file: "go.mod", type: "config", snippet: "Go modules detected" });
  }

  // ── Rust dependencies ──
  if (files.has("Cargo.toml")) {
    if (packageManager === "unknown") packageManager = "cargo";
    evidence.push({ file: "Cargo.toml", type: "config", snippet: "Cargo dependencies" });
  }

  // ── PHP dependencies ──
  if (files.has("composer.json")) {
    if (packageManager === "unknown") packageManager = "composer";
    evidence.push({ file: "composer.json", type: "config", snippet: "Composer dependencies" });
  }

  // ── Java dependencies ──
  if (files.has("pom.xml")) {
    if (packageManager === "unknown") packageManager = "maven";
  } else if (files.has("build.gradle") || files.has("build.gradle.kts")) {
    if (packageManager === "unknown") packageManager = "gradle";
  }

  // No package manager detected
  if (packageManager === "unknown" && !pkgContent && !requirementsTxt) {
    packageManager = "none";
  }

  return {
    dependencies,
    packageManager,
    buildCommand,
    startCommand,
    evidence,
  };
}

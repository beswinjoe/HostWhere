import type { ProjectFiles, DetectorResult, DetectedFramework, Evidence } from "../types";

/** Helper to safely parse JSON from a file */
function safeParseJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Get all dependency names from package.json */
function getDependencyNames(pkg: Record<string, unknown>): string[] {
  const deps = Object.keys((pkg.dependencies as Record<string, string>) || {});
  const devDeps = Object.keys((pkg.devDependencies as Record<string, string>) || {});
  return [...deps, ...devDeps];
}

interface FrameworkMatch {
  framework: DetectedFramework;
  dependency?: string;
  configFiles?: string[];
  priority: number;
}

const FRAMEWORK_MATCHES: FrameworkMatch[] = [
  // Full-stack frameworks (higher priority)
  { framework: "nextjs", dependency: "next", priority: 100 },
  { framework: "nuxt", dependency: "nuxt", priority: 100 },
  { framework: "sveltekit", dependency: "@sveltejs/kit", priority: 100 },
  { framework: "remix", dependency: "@remix-run/react", priority: 100 },
  { framework: "astro", dependency: "astro", priority: 95 },
  { framework: "gatsby", dependency: "gatsby", priority: 95 },

  // Backend frameworks
  { framework: "nestjs", dependency: "@nestjs/core", priority: 90 },
  { framework: "express", dependency: "express", priority: 80 },
  { framework: "fastify", dependency: "fastify", priority: 80 },
  { framework: "hono", dependency: "hono", priority: 80 },
  { framework: "koa", dependency: "koa", priority: 80 },

  // Frontend frameworks
  { framework: "angular", dependency: "@angular/core", priority: 85 },
  { framework: "svelte", dependency: "svelte", priority: 70 },
  { framework: "vue", dependency: "vue", priority: 70 },
  { framework: "react", dependency: "react", priority: 60 },
  { framework: "vite", dependency: "vite", priority: 50 },

  // Static site generators
  { framework: "eleventy", dependency: "@11ty/eleventy", priority: 85 },
];

/** Config file patterns for frameworks without npm deps */
const CONFIG_FRAMEWORK_MAP: Record<string, DetectedFramework> = {
  "next.config.js": "nextjs",
  "next.config.ts": "nextjs",
  "next.config.mjs": "nextjs",
  "nuxt.config.js": "nuxt",
  "nuxt.config.ts": "nuxt",
  "svelte.config.js": "sveltekit",
  "svelte.config.ts": "sveltekit",
  "astro.config.mjs": "astro",
  "astro.config.ts": "astro",
  "gatsby-config.js": "gatsby",
  "gatsby-config.ts": "gatsby",
  "angular.json": "angular",
  ".eleventy.js": "eleventy",
  "eleventy.config.js": "eleventy",
  "vite.config.js": "vite",
  "vite.config.ts": "vite",
};

/** Python framework detection patterns */
const PYTHON_FRAMEWORK_PATTERNS: Array<{ pattern: string; framework: DetectedFramework }> = [
  { pattern: "django", framework: "django" },
  { pattern: "Django", framework: "django" },
  { pattern: "flask", framework: "flask" },
  { pattern: "Flask", framework: "flask" },
  { pattern: "fastapi", framework: "fastapi" },
  { pattern: "FastAPI", framework: "fastapi" },
];

/** Ruby framework detection */
function detectRubyFramework(files: ProjectFiles): DetectedFramework | null {
  const gemfile = files.get("Gemfile");
  if (gemfile && gemfile.includes("rails")) return "rails";
  if (gemfile && gemfile.includes("jekyll")) return "jekyll";
  return null;
}

/** Detect Hugo static site generator */
function detectHugo(files: ProjectFiles): boolean {
  for (const path of files.keys()) {
    if (path === "hugo.toml" || path === "hugo.yaml" || path === "hugo.json" || path === "config.toml") {
      const content = files.get(path) || "";
      if (content.includes("baseURL") || content.includes("baseurl")) return true;
    }
  }
  return false;
}

export function frameworkDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let detectedFramework: DetectedFramework | null = null;
  let highestPriority = -1;

  // Check package.json for JS/TS frameworks
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    const pkg = safeParseJson(pkgContent);
    if (pkg) {
      const allDeps = getDependencyNames(pkg);

      for (const match of FRAMEWORK_MATCHES) {
        if (match.dependency && allDeps.includes(match.dependency) && match.priority > highestPriority) {
          detectedFramework = match.framework;
          highestPriority = match.priority;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `"${match.dependency}" found in dependencies`,
          });
        }
      }
    }
  }

  // Check config files
  for (const [configFile, framework] of Object.entries(CONFIG_FRAMEWORK_MAP)) {
    if (files.has(configFile)) {
      evidence.push({
        file: configFile,
        type: "config",
        snippet: `Configuration file detected`,
      });
      // Config files override dependency-only detection for the same framework
      if (!detectedFramework || FRAMEWORK_MATCHES.find(m => m.framework === framework)?.priority || 0 >= highestPriority) {
        detectedFramework = framework;
      }
    }
  }

  // Check Python frameworks
  const requirementsTxt = files.get("requirements.txt");
  const pyprojectToml = files.get("pyproject.toml");
  const pipfile = files.get("Pipfile");
  const pythonDepsContent = [requirementsTxt, pyprojectToml, pipfile].filter(Boolean).join("\n");

  if (pythonDepsContent) {
    for (const { pattern, framework } of PYTHON_FRAMEWORK_PATTERNS) {
      if (pythonDepsContent.includes(pattern)) {
        detectedFramework = framework;
        evidence.push({
          file: requirementsTxt ? "requirements.txt" : pyprojectToml ? "pyproject.toml" : "Pipfile",
          type: "dependency",
          snippet: `${pattern} found in Python dependencies`,
        });
        break;
      }
    }
  }

  // Check Ruby/Go frameworks
  const rubyFramework = detectRubyFramework(files);
  if (rubyFramework) {
    detectedFramework = rubyFramework;
    evidence.push({ file: "Gemfile", type: "dependency", snippet: `${rubyFramework} detected` });
  }

  if (detectHugo(files)) {
    detectedFramework = "hugo";
    evidence.push({ file: "hugo.toml", type: "config", snippet: "Hugo configuration detected" });
  }

  // Check for static HTML
  if (!detectedFramework) {
    const hasHtmlFiles = [...files.keys()].some(
      f => f.endsWith(".html") && !f.includes("node_modules") && !f.includes("dist/")
    );
    if (hasHtmlFiles && !pkgContent) {
      detectedFramework = "static-html";
      evidence.push({ file: "index.html", type: "file-presence", snippet: "Static HTML files detected" });
    }
  }

  return {
    framework: detectedFramework,
    evidence,
  };
}

import type { ProjectFiles, DetectorResult, Evidence, DetectedFramework } from "../types";

const STATIC_SITE_GENERATORS: DetectedFramework[] = [
  "astro", "gatsby", "hugo", "jekyll", "eleventy", "static-html",
];

const STATIC_FRAMEWORKS_WITH_SSG: DetectedFramework[] = [
  "nextjs", "nuxt", "sveltekit",
];

export function staticSiteDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let staticSite = false;

  // Check if it's a pure static HTML project
  const hasPackageJson = files.has("package.json");
  const filePaths = [...files.keys()];
  const htmlFiles = filePaths.filter(f => f.endsWith(".html") && !f.includes("node_modules"));
  const jsFiles = filePaths.filter(f => (f.endsWith(".js") || f.endsWith(".ts")) && !f.includes("node_modules"));

  if (htmlFiles.length > 0 && !hasPackageJson) {
    staticSite = true;
    evidence.push({
      file: htmlFiles[0],
      type: "file-presence",
      snippet: `${htmlFiles.length} HTML file(s) with no package.json — pure static site`,
    });
  }

  // Check for static export configuration in Next.js
  if (hasPackageJson) {
    const nextConfig = files.get("next.config.js") || files.get("next.config.ts") || files.get("next.config.mjs");
    if (nextConfig) {
      if (nextConfig.includes("output") && nextConfig.includes("export")) {
        staticSite = true;
        evidence.push({
          file: "next.config.js",
          type: "config",
          snippet: 'Next.js configured with output: "export" (static export)',
        });
      }
    }
  }

  // Check build script output for static hints
  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(files.get("package.json")!) as Record<string, unknown>;
      const scripts = (pkg.scripts || {}) as Record<string, string>;
      const allDeps = [
        ...Object.keys((pkg.dependencies || {}) as Record<string, string>),
        ...Object.keys((pkg.devDependencies || {}) as Record<string, string>),
      ];

      // Check for static site generators
      for (const dep of allDeps) {
        if (dep === "gatsby" || dep === "@11ty/eleventy" || dep === "astro") {
          staticSite = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Static site generator: ${dep}`,
          });
        }
      }

      // Check build scripts for static generation commands
      if (scripts.build) {
        if (
          scripts.build.includes("gatsby build") ||
          scripts.build.includes("astro build") ||
          scripts.build.includes("eleventy") ||
          scripts.build.includes("next export") ||
          scripts.build.includes("vite build")
        ) {
          evidence.push({
            file: "package.json",
            type: "config",
            snippet: `Build script suggests static output: "${scripts.build}"`,
          });
        }
      }

      // Check if it's a React SPA (no server-side framework)
      if (allDeps.includes("react") && !allDeps.includes("next") && !allDeps.includes("remix") && !allDeps.includes("express")) {
        if (allDeps.includes("vite") || allDeps.includes("react-scripts")) {
          staticSite = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: "React SPA (client-side only, can be served statically)",
          });
        }
      }

      // Vue SPA without Nuxt
      if (allDeps.includes("vue") && !allDeps.includes("nuxt") && !allDeps.includes("express")) {
        if (allDeps.includes("vite") || allDeps.includes("@vue/cli-service")) {
          staticSite = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: "Vue SPA (client-side only, can be served statically)",
          });
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  return {
    staticSite,
    evidence,
  };
}

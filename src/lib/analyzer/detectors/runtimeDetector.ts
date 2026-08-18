import type { ProjectFiles, DetectorResult, Runtime, Language, Evidence } from "../types";

export function runtimeDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let runtime: Runtime = "unknown";
  let language: Language = "unknown";
  let nodeVersion: string | null = null;
  let pythonVersion: string | null = null;

  const filePaths = [...files.keys()];

  // ── Check package.json for Node.js ──
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
      runtime = "node";
      language = "typescript";

      // Check for TypeScript
      const hasTs = filePaths.some(f => f.endsWith(".ts") || f.endsWith(".tsx"));
      const hasTsConfig = files.has("tsconfig.json");
      if (!hasTs && !hasTsConfig) {
        language = "javascript";
      }

      // Check engines for node version
      const engines = pkg.engines as Record<string, string> | undefined;
      if (engines?.node) {
        nodeVersion = engines.node;
        evidence.push({
          file: "package.json",
          type: "config",
          snippet: `"engines": { "node": "${engines.node}" }`,
        });
      }

      // Check .nvmrc / .node-version
      const nvmrc = files.get(".nvmrc");
      if (nvmrc) {
        nodeVersion = nodeVersion || nvmrc.trim();
        evidence.push({
          file: ".nvmrc",
          type: "config",
          snippet: nvmrc.trim(),
        });
      }
      const nodeVersionFile = files.get(".node-version");
      if (nodeVersionFile) {
        nodeVersion = nodeVersion || nodeVersionFile.trim();
        evidence.push({
          file: ".node-version",
          type: "config",
          snippet: nodeVersionFile.trim(),
        });
      }

      // Check for Bun
      if (files.has("bun.lock") || files.has("bun.lockb") || files.has("bunfig.toml")) {
        runtime = "bun";
        evidence.push({
          file: files.has("bun.lock") ? "bun.lock" : "bunfig.toml",
          type: "file-presence",
          snippet: "Bun runtime detected",
        });
      }

      // Check for Deno
      if (files.has("deno.json") || files.has("deno.jsonc") || files.has("deno.lock")) {
        runtime = "deno";
        evidence.push({
          file: "deno.json",
          type: "config",
          snippet: "Deno runtime detected",
        });
      }

      evidence.push({
        file: "package.json",
        type: "config",
        snippet: `Node.js project detected`,
      });
    } catch {
      // Invalid package.json, continue
    }
  }

  // ── Python detection ──
  const pythonFiles = ["requirements.txt", "pyproject.toml", "Pipfile", "setup.py", "setup.cfg"];
  const hasPythonFiles = pythonFiles.some(f => files.has(f));
  const hasPyFiles = filePaths.some(f => f.endsWith(".py"));

  if (hasPythonFiles || hasPyFiles) {
    if (runtime === "unknown") {
      runtime = "python";
      language = "python";
    }

    // Check for Python version
    const pyprojectToml = files.get("pyproject.toml");
    if (pyprojectToml) {
      const versionMatch = pyprojectToml.match(/python_requires\s*=\s*"([^"]+)"/);
      const runtimeMatch = pyprojectToml.match(/requires-python\s*=\s*"([^"]+)"/);
      if (versionMatch || runtimeMatch) {
        pythonVersion = (versionMatch || runtimeMatch)?.[1] || null;
        evidence.push({
          file: "pyproject.toml",
          type: "config",
          snippet: `Python version: ${pythonVersion}`,
        });
      }
    }

    const runtimeTxt = files.get("runtime.txt");
    if (runtimeTxt) {
      const match = runtimeTxt.match(/python-(\S+)/);
      if (match) {
        pythonVersion = pythonVersion || match[1];
        evidence.push({
          file: "runtime.txt",
          type: "config",
          snippet: runtimeTxt.trim(),
        });
      }
    }

    evidence.push({
      file: hasPythonFiles ? pythonFiles.find(f => files.has(f))! : filePaths.find(f => f.endsWith(".py"))!,
      type: "file-presence",
      snippet: "Python project detected",
    });
  }

  // ── Ruby detection ──
  if (files.has("Gemfile") || filePaths.some(f => f.endsWith(".rb"))) {
    if (runtime === "unknown") {
      runtime = "ruby";
      language = "ruby";
      evidence.push({ file: "Gemfile", type: "file-presence", snippet: "Ruby project detected" });
    }
  }

  // ── Go detection ──
  if (files.has("go.mod") || filePaths.some(f => f.endsWith(".go"))) {
    if (runtime === "unknown") {
      runtime = "go";
      language = "go";
      evidence.push({ file: "go.mod", type: "file-presence", snippet: "Go project detected" });
    }
  }

  // ── Rust detection ──
  if (files.has("Cargo.toml") || filePaths.some(f => f.endsWith(".rs"))) {
    if (runtime === "unknown") {
      runtime = "rust";
      language = "rust";
      evidence.push({ file: "Cargo.toml", type: "file-presence", snippet: "Rust project detected" });
    }
  }

  // ── Java detection ──
  if (files.has("pom.xml") || files.has("build.gradle") || files.has("build.gradle.kts")) {
    if (runtime === "unknown") {
      runtime = "java";
      language = "java";
      evidence.push({ file: "pom.xml", type: "file-presence", snippet: "Java project detected" });
    }
  }

  // ── .NET detection ──
  if (filePaths.some(f => f.endsWith(".csproj") || f.endsWith(".fsproj") || f.endsWith(".sln"))) {
    if (runtime === "unknown") {
      runtime = "dotnet";
      language = "csharp";
      evidence.push({
        file: filePaths.find(f => f.endsWith(".csproj") || f.endsWith(".sln"))!,
        type: "file-presence",
        snippet: ".NET project detected",
      });
    }
  }

  // ── PHP detection ──
  if (files.has("composer.json") || filePaths.some(f => f.endsWith(".php"))) {
    if (runtime === "unknown") {
      runtime = "php";
      language = "php";
      evidence.push({ file: "composer.json", type: "file-presence", snippet: "PHP project detected" });
    }
  }

  // ── Static detection ──
  if (runtime === "unknown") {
    const hasOnlyHtml = filePaths.some(f => f.endsWith(".html"));
    const hasCss = filePaths.some(f => f.endsWith(".css"));
    if (hasOnlyHtml || hasCss) {
      runtime = "static";
      language = "javascript";
      evidence.push({
        file: filePaths.find(f => f.endsWith(".html")) || "index.html",
        type: "file-presence",
        snippet: "Static site detected",
      });
    }
  }

  return {
    runtime,
    language,
    nodeVersion,
    pythonVersion,
    evidence,
  };
}

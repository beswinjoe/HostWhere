import { NextRequest } from "next/server";
import { extractZipSafely, sanitizeProjectName } from "@/lib/analyzer/zip-handler";
import { analyzeProject } from "@/lib/analyzer/analyzer";
import { resultsStore } from "@/lib/analyzer/results-store";
import { rateLimiter } from "@/lib/rate-limit";
import { analytics } from "@/lib/analytics";

export const runtime = "nodejs";
export const maxDuration = 60;

// 50MB max upload
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Known safe errors that can be exposed to the user
const SAFE_ERROR_MESSAGES = [
  "No file uploaded",
  "Only .zip files",
  "File too large",
  "empty or contains only ignored files",
  "Invalid path",
  "Archive contains too many files",
  "Uncompressed size exceeds limit",
  "Suspicious compression ratio",
  "Invalid GitHub URL",
  "Repository not found",
  "Repository archive is too large",
  "Failed to fetch repository",
];

function isSafeError(message: string): boolean {
  return SAFE_ERROR_MESSAGES.some((safeMsg) => message.includes(safeMsg));
}

function getIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || 
         request.headers.get("x-real-ip") || 
         "unknown-ip";
}

async function fetchGithubRepoMetadata(url: string): Promise<{ owner: string, repo: string, defaultBranch: string, sha: string }> {
  const match = url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?/);
  if (!match) {
    throw new Error("Invalid GitHub URL. Must be in the format https://github.com/owner/repo");
  }
  
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  
  // Use GitHub API to get default branch and latest commit SHA
  const headers: HeadersInit = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    throw new Error("Repository not found. Please ensure it is public.");
  }
  
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";
  
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${defaultBranch}`, { headers });
  if (!commitRes.ok) {
    throw new Error("Failed to fetch repository commit information.");
  }
  
  const commitData = await commitRes.json();
  return { owner, repo, defaultBranch, sha: commitData.sha };
}

async function fetchGithubRepoBuffer(owner: string, repo: string, branch: string): Promise<{ buffer: Buffer; projectName: string }> {
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  const response = await fetch(zipUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch repository ZIP from GitHub (${response.status}).`);
  }
  
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
    throw new Error("Repository archive is too large. Maximum size is 50MB.");
  }
  
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("Repository archive is too large. Maximum size is 50MB.");
  }
  
  return {
    buffer: Buffer.from(arrayBuffer),
    projectName: `${owner}-${repo}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    analytics.track({ name: "analysis_started" });

    // 1. Rate Limiting
    const ip = getIp(request);
    const rateLimit = await rateLimiter.check(ip);
    
    if (!rateLimit.success) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const githubUrl = formData.get("githubUrl");

    let buffer: Buffer;
    let projectName: string;
    let cacheKey: string | null = null;

    if (githubUrl && typeof githubUrl === "string") {
      analytics.track({ name: "github_analysis", properties: { repo: githubUrl } });
      
      // Handle GitHub URL with Caching
      const meta = await fetchGithubRepoMetadata(githubUrl);
      cacheKey = `github-${meta.owner}-${meta.repo}-${meta.sha.substring(0, 7)}`;
      
      // Check cache before downloading ZIP
      const cached = await resultsStore.getResult(cacheKey);
      if (cached) {
        return Response.json({ id: cached.id, result: cached });
      }

      const repoData = await fetchGithubRepoBuffer(meta.owner, meta.repo, meta.defaultBranch);
      buffer = repoData.buffer;
      projectName = sanitizeProjectName(repoData.projectName);
    } else if (file && file instanceof File) {
      analytics.track({ name: "zip_analysis" });
      
      // Handle File Upload
      if (!file.name.endsWith(".zip")) {
        throw new Error("Only .zip files are supported.");
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      projectName = sanitizeProjectName(file.name);
    } else {
      throw new Error("No file or GitHub URL provided. Please upload a ZIP file or provide a public GitHub URL.");
    }

    // Extract and analyze
    const files = await extractZipSafely(buffer);

    if (files.size === 0) {
      throw new Error("The ZIP file appears to be empty or contains only ignored files (e.g., node_modules).");
    }

    const result = await analyzeProject(files, projectName);
    
    // Override ID if we have a GitHub cache key
    if (cacheKey) {
      result.id = cacheKey;
    }

    // Store in cache for retrieval
    await resultsStore.storeResult(result);

    analytics.trackAnalysisCompleted({
      language: result.profile.language,
      framework: result.profile.framework,
      deploymentType: result.profile.deploymentType,
      topPlatform: result.platforms[0]?.platform.name || "None",
    });

    return Response.json({ id: result.id, result });

  } catch (error: unknown) {
    analytics.track({ name: "analysis_failed" });
    
    // Determine if it's a known safe error to expose to the client
    const rawMessage = error instanceof Error ? error.message : String(error);
    
    // Log detailed error internally
    console.error(`[API Error] Analyze:`, error);

    const safeMessage = isSafeError(rawMessage) 
      ? rawMessage 
      : "Analysis failed due to an internal error. Please try again.";

    return Response.json(
      { error: safeMessage },
      { status: 400 } // Use 400 for bad input, hide 500 internals
    );
  }
}

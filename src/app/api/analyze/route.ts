import { NextRequest } from "next/server";
import { extractZipSafely, sanitizeProjectName } from "@/lib/analyzer/zip-handler";
import { analyzeProject } from "@/lib/analyzer/analyzer";
import { resultsStore } from "@/lib/analyzer/results-store";
import { rateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

async function fetchGithubRepoBuffer(url: string): Promise<{ buffer: Buffer; projectName: string }> {
  // Extract owner and repo from https://github.com/owner/repo
  const match = url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?/);
  if (!match) {
    throw new Error("Invalid GitHub URL. Must be in the format https://github.com/owner/repo");
  }
  
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  
  // Try main first
  let zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
  let response = await fetch(zipUrl);
  
  // If 404, try master
  if (response.status === 404) {
    zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
    response = await fetch(zipUrl);
  }
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository not found. Please ensure it is public and has a 'main' or 'master' branch.`);
    }
    throw new Error(`Failed to fetch repository from GitHub (${response.status}).`);
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

    if (githubUrl && typeof githubUrl === "string") {
      // Handle GitHub URL
      const repoData = await fetchGithubRepoBuffer(githubUrl);
      buffer = repoData.buffer;
      projectName = sanitizeProjectName(repoData.projectName);
    } else if (file && file instanceof File) {
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

    // Store in cache for retrieval
    await resultsStore.storeResult(result);

    return Response.json({ id: result.id, result });

  } catch (error: unknown) {
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

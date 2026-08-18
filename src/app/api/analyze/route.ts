import { NextRequest } from "next/server";
import { extractZipSafely } from "@/lib/analyzer/zip-handler";
import { analyzeProject } from "@/lib/analyzer/analyzer";
import { storeResult } from "@/lib/analyzer/results-cache";

export const runtime = "nodejs";

// 50MB max upload
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "No file uploaded. Please upload a ZIP file." },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".zip")) {
      return Response.json(
        { error: "Only .zip files are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }

    // Extract the project name from the zip file name
    const projectName = file.name.replace(/\.zip$/, "");

    // Read the file into a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract and analyze
    const files = await extractZipSafely(buffer);

    if (files.size === 0) {
      return Response.json(
        { error: "The ZIP file appears to be empty or contains only ignored files (e.g., node_modules)." },
        { status: 400 }
      );
    }

    const result = await analyzeProject(files, projectName);

    // Store in cache for retrieval
    storeResult(result);

    return Response.json({ id: result.id, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred during analysis.";
    console.error("Analysis error:", error);

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { getResult } from "@/lib/analyzer/results-cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = getResult(id);

  if (!result) {
    return Response.json(
      { error: "Result not found or expired. Please re-analyze your project." },
      { status: 404 }
    );
  }

  return Response.json({ result });
}

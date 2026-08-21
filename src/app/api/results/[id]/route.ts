import { NextRequest } from "next/server";
import { resultsStore } from "@/lib/analyzer/results-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await resultsStore.getResult(id);

  if (!result) {
    return Response.json(
      { error: "Result not found or expired. Please re-analyze your project." },
      { status: 404 }
    );
  }

  return Response.json({ result });
}

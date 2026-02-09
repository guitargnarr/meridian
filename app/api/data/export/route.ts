import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_STATE_METRICS } from "@/lib/overlay-data";
import { metricsToRows, generateCSV, generateJSON } from "@/lib/export";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") || "csv";
  const rows = metricsToRows(FALLBACK_STATE_METRICS);

  if (format === "json") {
    return NextResponse.json(rows, {
      headers: {
        "Content-Disposition": 'attachment; filename="meridian-state-data.json"',
      },
    });
  }

  const csv = generateCSV(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meridian-state-data.csv"',
    },
  });
}

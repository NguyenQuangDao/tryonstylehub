import { CostTracker } from "@/lib/cost-optimizer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = CostTracker.getStats();
    const detailed = CostTracker.getDetailedStats();

    return NextResponse.json({
      stats,
      detailed: detailed.slice(-50), // Last 50 entries
    });
  } catch (error) {
    console.error("Cost stats error:", error);
    return NextResponse.json(
      { error: "Không thể lấy thống kê chi phí" },
      { status: 500 }
    );
  }
}


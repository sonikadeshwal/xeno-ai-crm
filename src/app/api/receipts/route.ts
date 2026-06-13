import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommunicationLog from "@/models/CommunicationLog";
import Campaign from "@/models/Campaign";

export async function POST(req: Request) {
  await connectDB();
  const { logId, campaignId, status } = await req.json();

  await CommunicationLog.findByIdAndUpdate(logId, { status });

  // Update campaign stats
  const statMap: Record<string, string> = {
    DELIVERED: "stats.delivered",
    FAILED: "stats.failed",
    OPENED: "stats.opened",
    CLICKED: "stats.clicked",
  };

  if (statMap[status]) {
    await Campaign.findByIdAndUpdate(campaignId, { $inc: { [statMap[status]]: 1 } });
  }

  // Check if campaign is complete
  const campaign = await Campaign.findById(campaignId);
  if (campaign) {
    const done = campaign.stats.delivered + campaign.stats.failed;
    if (done >= campaign.stats.total) {
      await Campaign.findByIdAndUpdate(campaignId, { status: "completed" });
    }
  }

  return NextResponse.json({ ok: true });
}

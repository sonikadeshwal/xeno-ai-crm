import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Segment from "@/models/Segment";
import Customer from "@/models/Customer";
import CommunicationLog from "@/models/CommunicationLog";

export async function GET() {
  await connectDB();
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  // Build audience
  const segment = await Segment.findById(body.segmentId);
  if (!segment) return NextResponse.json({ error: "Segment not found" }, { status: 404 });

  const campaign = await Campaign.create({
    ...body,
    status: "sent",
    stats: { total: segment.audienceSize, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 },
  });

  // Get matching customers — simplified: use all for now
  const customers = await Customer.find().limit(segment.audienceSize);

  // Create communication logs and call vendor stub
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  for (const customer of customers) {
    const log = await CommunicationLog.create({
      campaignId: campaign._id,
      customerId: customer._id,
      customerEmail: customer.email,
      message: body.message.replace("{{name}}", customer.name),
      channel: body.channel,
      status: "PENDING",
      vendorMessageId: `vmsg_${Math.random().toString(36).slice(2)}`,
    });

    // Call vendor stub async (fire and forget)
    fetch(`${baseUrl}/api/vendor/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logId: log._id.toString(),
        campaignId: campaign._id.toString(),
        recipient: customer.email,
        message: log.message,
        channel: body.channel,
        vendorMessageId: log.vendorMessageId,
      }),
    }).catch(() => {});
  }

  await Campaign.findByIdAndUpdate(campaign._id, { "stats.sent": customers.length });

  return NextResponse.json(campaign, { status: 201 });
}

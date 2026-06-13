import { NextResponse } from "next/server";

const STATUSES = ["DELIVERED", "DELIVERED", "DELIVERED", "FAILED", "OPENED", "CLICKED"];

export async function POST(req: Request) {
  const body = await req.json();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Simulate async delay (100-800ms) then callback
  const delay = Math.floor(Math.random() * 700) + 100;
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

  setTimeout(() => {
    fetch(`${baseUrl}/api/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logId: body.logId,
        campaignId: body.campaignId,
        vendorMessageId: body.vendorMessageId,
        status,
      }),
    }).catch(() => {});
  }, delay);

  return NextResponse.json({ accepted: true });
}

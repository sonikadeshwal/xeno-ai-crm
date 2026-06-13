import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { campaignId } = await req.json();
  await connectDB();

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { stats, name, channel, message } = campaign;
  const deliveryRate = stats.total ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0;
  const clickRate = stats.delivered ? ((stats.clicked / stats.delivered) * 100).toFixed(1) : 0;

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: `You are a campaign analyst. Given campaign stats, write a 3-4 sentence plain-English performance summary and 1-2 actionable recommendations. Be concise and direct.`,
      },
      {
        role: "user",
        content: `Campaign: "${name}" via ${channel}
Message: "${message}"
Stats: Total=${stats.total}, Sent=${stats.sent}, Delivered=${stats.delivered}, Failed=${stats.failed}, Opened=${stats.opened}, Clicked=${stats.clicked}
Delivery Rate: ${deliveryRate}%, Click Rate: ${clickRate}%`,
      },
    ],
  });

  const insights = completion.choices[0].message.content;
  await Campaign.findByIdAndUpdate(campaignId, { aiInsights: insights });

  return NextResponse.json({ insights });
}

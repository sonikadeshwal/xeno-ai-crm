import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Campaign from "@/models/Campaign";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  await connectDB();

  const [totalCustomers, highChurn, totalCampaigns] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ churnRisk: "High" }),
    Campaign.countDocuments(),
  ]);

  const recentCampaigns = await Campaign.find().sort({ createdAt: -1 }).limit(3);
  const topSpenders = await Customer.find().sort({ totalSpend: -1 }).limit(5);

  const context = {
    totalCustomers,
    highChurnCustomers: highChurn,
    totalCampaigns,
    recentCampaigns: recentCampaigns.map((c) => ({
      name: c.name,
      channel: c.channel,
      delivered: c.stats.delivered,
      clicked: c.stats.clicked,
    })),
    topSpendersAvgSpend:
      topSpenders.reduce((s, c) => s + c.totalSpend, 0) / (topSpenders.length || 1),
  };

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: `You are an AI campaign strategist for a retail CRM.
Given customer data, suggest 2-3 campaign ideas. For each return:
- name: campaign name
- targetSegment: who to target (plain English)
- suggestedRules: array of segment rules [{field, operator, value, logic}]
- message: suggested message with {{name}} placeholder
- channel: EMAIL, SMS, or WHATSAPP
- reasoning: 1 sentence why
Return ONLY a JSON array. No markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Customer data snapshot: ${JSON.stringify(context)}`,
      },
    ],
  });

  const text = completion.choices[0].message.content || "[]";
  try {
    const plans = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ plans, context });
  } catch {
    return NextResponse.json({ plans: [], context });
  }
}

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { segmentDescription, channel, brandName } = await req.json();

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: `You are a marketing copywriter for ${brandName || "a retail brand"}. 
Write a short, personalized ${channel} message for the given customer segment.
Use {{name}} as a placeholder for the customer name.
Keep it under 160 characters for SMS, under 300 for others.
Return ONLY the message text, no explanation.`,
      },
      { role: "user", content: `Segment: ${segmentDescription}` },
    ],
  });

  return NextResponse.json({ message: completion.choices[0].message.content });
}

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: `You are a CRM assistant. Convert natural language into segment rules JSON.
Fields: totalSpend (number), visitCount (number), lastVisit (date string), churnRisk (string: High/Medium/Low), tags (array).
Operators: gt, lt, eq, gte, lte, contains.
Logic: AND or OR.
Return ONLY a JSON array of rules like:
[{"field":"totalSpend","operator":"gt","value":500,"logic":"AND"}]
No explanation, no markdown.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices[0].message.content || "[]";
  try {
    const rules = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ rules: [] });
  }
}

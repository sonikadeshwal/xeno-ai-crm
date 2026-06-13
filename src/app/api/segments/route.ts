import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Segment from "@/models/Segment";
import Customer from "@/models/Customer";

function buildMongoQuery(rules: any[]) {
  const andRules: any[] = [];
  const orRules: any[] = [];

  for (const rule of rules) {
    let condition: any = {};
    const val = isNaN(Number(rule.value)) ? rule.value : Number(rule.value);
    if (rule.operator === "gt") condition[rule.field] = { $gt: val };
    else if (rule.operator === "lt") condition[rule.field] = { $lt: val };
    else if (rule.operator === "eq") condition[rule.field] = val;
    else if (rule.operator === "gte") condition[rule.field] = { $gte: val };
    else if (rule.operator === "lte") condition[rule.field] = { $lte: val };
    else if (rule.operator === "contains") condition[rule.field] = { $regex: val, $options: "i" };

    if (rule.logic === "OR") orRules.push(condition);
    else andRules.push(condition);
  }

  if (orRules.length && andRules.length) return { $and: [{ $and: andRules }, { $or: orRules }] };
  if (orRules.length) return { $or: orRules };
  return { $and: andRules };
}

export async function GET() {
  await connectDB();
  const segments = await Segment.find().sort({ createdAt: -1 });
  return NextResponse.json(segments);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const query = buildMongoQuery(body.rules || []);
  const audienceSize = await Customer.countDocuments(query);
  const segment = await Segment.create({ ...body, audienceSize });
  return NextResponse.json(segment, { status: 201 });
}

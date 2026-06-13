import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET() {
  await connectDB();
  const customers = await Customer.find().sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  // Support bulk array or single
  if (Array.isArray(body)) {
    const result = await Customer.insertMany(body, { ordered: false }).catch((e) => e);
    return NextResponse.json({ inserted: result?.length ?? 0 });
  }
  const customer = await Customer.create(body);
  return NextResponse.json(customer, { status: 201 });
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Customer from "@/models/Customer";

export async function GET() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const orders = Array.isArray(body) ? body : [body];

  const created = await Order.insertMany(orders, { ordered: false }).catch((e) => e);

  // Update customer spend + visitCount
  for (const order of orders) {
    await Customer.findOneAndUpdate(
      { email: order.customerEmail },
      {
        $inc: { totalSpend: order.amount, visitCount: 1 },
        $set: { lastVisit: order.createdAt || new Date() },
      }
    );
  }

  return NextResponse.json({ inserted: created?.length ?? 0 });
}

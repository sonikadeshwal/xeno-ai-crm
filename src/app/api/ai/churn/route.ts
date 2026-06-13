import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function POST() {
  await connectDB();
  const customers = await Customer.find();
  const now = new Date();

  for (const customer of customers) {
    const daysSinceVisit = customer.lastVisit
      ? (now.getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    let churnRisk: "High" | "Medium" | "Low" = "Low";
    if (daysSinceVisit > 90 || customer.visitCount < 2) churnRisk = "High";
    else if (daysSinceVisit > 45 || customer.visitCount < 5) churnRisk = "Medium";

    await Customer.findByIdAndUpdate(customer._id, { churnRisk });
  }

  const summary = await Customer.aggregate([
    { $group: { _id: "$churnRisk", count: { $sum: 1 } } },
  ]);

  return NextResponse.json({ updated: customers.length, summary });
}

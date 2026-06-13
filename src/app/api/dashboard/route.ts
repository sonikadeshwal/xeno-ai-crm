import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Campaign from "@/models/Campaign";
import Segment from "@/models/Segment";

export async function GET() {
  await connectDB();
  const [customers, orders, campaigns, segments] = await Promise.all([
    Customer.countDocuments(),
    Order.countDocuments(),
    Campaign.countDocuments(),
    Segment.countDocuments(),
  ]);

  const recentCampaigns = await Campaign.find().sort({ createdAt: -1 }).limit(5);
  const churnBreakdown = await Customer.aggregate([
    { $group: { _id: "$churnRisk", count: { $sum: 1 } } },
  ]);

  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return NextResponse.json({
    stats: {
      customers,
      orders,
      campaigns,
      segments,
      revenue: totalRevenue[0]?.total || 0,
    },
    recentCampaigns,
    churnBreakdown,
  });
}

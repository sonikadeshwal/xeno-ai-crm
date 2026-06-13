"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-slate-400">Loading...</div>;

  const { stats, recentCampaigns, churnBreakdown } = data;

  const statCards = [
    { label: "Total Customers", value: stats.customers, icon: "👥" },
    { label: "Total Orders", value: stats.orders, icon: "🛍️" },
    { label: "Campaigns", value: stats.campaigns, icon: "📣" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: "💰" },
  ];

  const churnMap: Record<string, number> = {};
  churnBreakdown.forEach((b: any) => { churnMap[b._id] = b.count; });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your CRM at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base">Churn Risk Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["High", "Medium", "Low", "Unknown"].map((r) => (
              <div key={r} className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    r === "High" ? "border-red-500 text-red-400" :
                    r === "Medium" ? "border-yellow-500 text-yellow-400" :
                    r === "Low" ? "border-green-500 text-green-400" :
                    "border-slate-500 text-slate-400"
                  }
                >
                  {r}
                </Badge>
                <span className="text-white font-semibold">{churnMap[r] || 0} customers</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCampaigns.length === 0 && (
              <p className="text-slate-400 text-sm">No campaigns yet</p>
            )}
            {recentCampaigns.map((c: any) => (
              <div key={c._id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.channel} · {c.stats?.delivered || 0} delivered</div>
                </div>
                <Badge
                  className={
                    c.status === "completed" ? "bg-green-900 text-green-300" :
                    c.status === "sent" ? "bg-blue-900 text-blue-300" :
                    "bg-slate-700 text-slate-300"
                  }
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

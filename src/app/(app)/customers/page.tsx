"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SAMPLE_CUSTOMERS = Array.from({ length: 20 }, (_, i) => ({
  name: ["Priya Sharma","Rahul Gupta","Anjali Singh","Vikram Nair","Sneha Patel",
         "Arjun Mehta","Divya Iyer","Karan Kapoor","Neha Joshi","Rohan Das",
         "Pooja Reddy","Amit Kumar","Riya Shah","Suresh Verma","Kavya Rao",
         "Nikhil Tiwari","Meera Pillai","Aakash Malhotra","Sunita Yadav","Tarun Bose"][i],
  email: `user${i + 1}@example.com`,
  phone: `98${String(10000000 + i * 1234567).slice(0, 8)}`,
  totalSpend: Math.floor(Math.random() * 20000) + 500,
  visitCount: Math.floor(Math.random() * 30) + 1,
  lastVisit: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [churnLoading, setChurnLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }

  async function seedSample() {
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SAMPLE_CUSTOMERS),
    });
    load();
  }

  async function runChurn() {
    setChurnLoading(true);
    await fetch("/api/ai/churn", { method: "POST" });
    setChurnLoading(false);
    load();
  }

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{customers.length} total customers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={seedSample} variant="outline" className="border-slate-600 text-slate-300">
            + Seed Sample Data
          </Button>
          <Button onClick={runChurn} disabled={churnLoading} className="bg-indigo-600 hover:bg-indigo-700">
            {churnLoading ? "Scoring..." : "🤖 Run Churn Scoring"}
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-slate-900 border-slate-700 text-white max-w-sm"
      />

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-sm">No customers yet. Seed sample data to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-2 pr-4">Name</th>
                    <th className="text-left py-2 pr-4">Email</th>
                    <th className="text-right py-2 pr-4">Spend</th>
                    <th className="text-right py-2 pr-4">Visits</th>
                    <th className="text-left py-2">Churn Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-2 pr-4 font-medium text-white">{c.name}</td>
                      <td className="py-2 pr-4 text-slate-400">{c.email}</td>
                      <td className="py-2 pr-4 text-right text-green-400">₹{c.totalSpend?.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-slate-300">{c.visitCount}</td>
                      <td className="py-2">
                        <Badge
                          className={
                            c.churnRisk === "High" ? "bg-red-900 text-red-300" :
                            c.churnRisk === "Medium" ? "bg-yellow-900 text-yellow-300" :
                            c.churnRisk === "Low" ? "bg-green-900 text-green-300" :
                            "bg-slate-700 text-slate-400"
                          }
                        >
                          {c.churnRisk || "Unknown"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

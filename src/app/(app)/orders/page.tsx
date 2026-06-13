"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ITEMS = ["Kurta", "Jeans", "Sneakers", "Saree", "Watch", "Bag", "Sunglasses", "Jacket"];

function genOrders(customers: any[]) {
  return customers.flatMap((c: any) =>
    Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => ({
      customerEmail: c.email,
      customerId: c._id,
      amount: Math.floor(Math.random() * 3000) + 200,
      items: [ITEMS[Math.floor(Math.random() * ITEMS.length)]],
      status: "completed",
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    }))
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders");
    setOrders(await res.json());
    setLoading(false);
  }

  async function seedOrders() {
    const custRes = await fetch("/api/customers");
    const customers = await custRes.json();
    if (!customers.length) return alert("Seed customers first!");
    const orders = genOrders(customers);
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orders),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <Button onClick={seedOrders} variant="outline" className="border-slate-600 text-slate-300">
          + Seed Sample Orders
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? <p className="text-slate-400 text-sm">Loading...</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 pr-4">Customer</th>
                  <th className="text-left py-2 pr-4">Items</th>
                  <th className="text-right py-2 pr-4">Amount</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 pr-4 text-slate-300">{o.customerEmail}</td>
                    <td className="py-2 pr-4 text-slate-400">{o.items?.join(", ")}</td>
                    <td className="py-2 pr-4 text-right text-green-400">₹{o.amount}</td>
                    <td className="py-2 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

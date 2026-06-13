"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", segmentId: "", message: "", channel: "EMAIL" });
  const [aiLoading, setAiLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [insightLoading, setInsightLoading] = useState<string | null>(null);

  async function load() {
    const [c, s] = await Promise.all([fetch("/api/campaigns"), fetch("/api/segments")]);
    setCampaigns(await c.json());
    setSegments(await s.json());
  }

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  async function generateMessage() {
    if (!form.segmentId) return alert("Select a segment first");
    setAiLoading(true);
    const seg = segments.find((s) => s._id === form.segmentId);
    const res = await fetch("/api/ai/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmentDescription: seg?.name + " " + seg?.description, channel: form.channel }),
    });
    const data = await res.json();
    setForm((f) => ({ ...f, message: data.message || "" }));
    setAiLoading(false);
  }

  async function send() {
    if (!form.name || !form.segmentId || !form.message) return alert("Fill all fields");
    setSending(true);
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    setForm({ name: "", segmentId: "", message: "", channel: "EMAIL" });
    load();
  }

  async function getInsights(campaignId: string) {
    setInsightLoading(campaignId);
    const res = await fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    const data = await res.json();
    setInsights((prev) => ({ ...prev, [campaignId]: data.insights }));
    setInsightLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="text-slate-400 text-sm mt-1">Create and track campaigns · auto-refreshes every 5s</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">New Campaign</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Campaign name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white" />

          <div className="flex gap-3">
            <Select value={form.segmentId} onValueChange={(v) => setForm({ ...form, segmentId: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white flex-1">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((s) => (
                  <SelectItem key={s._id} value={s._id}>{s.name} ({s.audienceSize})</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMAIL">📧 Email</SelectItem>
                <SelectItem value="SMS">💬 SMS</SelectItem>
                <SelectItem value="WHATSAPP">📱 WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Message</span>
              <Button size="sm" variant="outline" onClick={generateMessage} disabled={aiLoading}
                className="border-slate-700 text-slate-300 text-xs h-7">
                {aiLoading ? "Generating..." : "🤖 AI Write"}
              </Button>
            </div>
            <Textarea value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your message or use AI to generate one. Use {{name}} for personalization."
              className="bg-slate-800 border-slate-700 text-white resize-none" rows={3} />
          </div>

          <Button onClick={send} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700">
            {sending ? "Sending..." : "🚀 Launch Campaign"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {campaigns.map((c) => (
          <Card key={c._id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.channel} · {new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <Badge className={c.status === "completed" ? "bg-green-900 text-green-300" : c.status === "sent" ? "bg-blue-900 text-blue-300" : "bg-slate-700 text-slate-300"}>
                  {c.status}
                </Badge>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[["Total", c.stats?.total], ["Sent", c.stats?.sent], ["Delivered", c.stats?.delivered], ["Failed", c.stats?.failed], ["Clicked", c.stats?.clicked]].map(([label, val]) => (
                  <div key={label} className="bg-slate-800 rounded p-2">
                    <div className="text-white font-bold text-base">{val || 0}</div>
                    <div className="text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-400 italic">"{c.message?.slice(0, 100)}{c.message?.length > 100 ? "..." : ""}"</p>

              {insights[c._id] ? (
                <div className="bg-indigo-950 border border-indigo-800 rounded p-3 text-sm text-indigo-200">
                  <div className="font-medium mb-1">🤖 AI Insights</div>
                  {insights[c._id]}
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => getInsights(c._id)}
                  disabled={insightLoading === c._id}
                  className="border-slate-700 text-slate-300 text-xs h-7">
                  {insightLoading === c._id ? "Analyzing..." : "🤖 Get AI Insights"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

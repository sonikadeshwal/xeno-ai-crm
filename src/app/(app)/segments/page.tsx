"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const FIELDS = ["totalSpend", "visitCount", "churnRisk", "lastVisit"];
const OPERATORS = ["gt", "lt", "eq", "gte", "lte", "contains"];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState([{ field: "totalSpend", operator: "gt", value: "1000", logic: "AND" }]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/segments");
    setSegments(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function generateFromAI() {
    setAiLoading(true);
    const res = await fetch("/api/ai/segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: aiPrompt }),
    });
    const data = await res.json();
    if (data.rules?.length) setRules(data.rules);
    setAiLoading(false);
  }

  function updateRule(i: number, key: string, val: string) {
    setRules((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  }

  async function save() {
    if (!name) return alert("Enter a segment name");
    setSaving(true);
    await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, rules }),
    });
    setSaving(false);
    setName(""); setDescription(""); setRules([{ field: "totalSpend", operator: "gt", value: "1000", logic: "AND" }]);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Segments</h1>
        <p className="text-slate-400 text-sm mt-1">Define audience groups with rules or AI</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">Create Segment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Segment name" value={name} onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white" />
          <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white" />

          <div className="border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">🤖 AI Rule Generator</span>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder='e.g. "Customers who spent more than ₹5000 and visited less than 3 times"'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm resize-none"
                rows={2}
              />
              <Button onClick={generateFromAI} disabled={aiLoading || !aiPrompt}
                className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                {aiLoading ? "..." : "Generate"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-400 font-medium">Rules</div>
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-2 items-center">
                {i > 0 && (
                  <Select value={rule.logic} onValueChange={(v) => updateRule(i, "logic", v)}>
                    <SelectTrigger className="w-20 bg-slate-800 border-slate-700 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Select value={rule.field} onValueChange={(v) => updateRule(i, "field", v)}>
                  <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={rule.operator} onValueChange={(v) => updateRule(i, "operator", v)}>
                  <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={rule.value} onChange={(e) => updateRule(i, "value", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-xs w-28" placeholder="value" />
                <button onClick={() => setRules((r) => r.filter((_, idx) => idx !== i))}
                  className="text-slate-500 hover:text-red-400 text-xs">✕</button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setRules([...rules, { field: "totalSpend", operator: "gt", value: "", logic: "AND" }])}
              className="border-slate-700 text-slate-400 text-xs">
              + Add Rule
            </Button>
          </div>

          <Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? "Saving..." : "Save Segment"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {segments.map((s) => (
          <Card key={s._id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{s.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.description || `${s.rules?.length || 0} rules`}</div>
              </div>
              <Badge className="bg-indigo-900 text-indigo-300">{s.audienceSize} customers</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

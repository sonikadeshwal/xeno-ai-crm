"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    if (isRegister) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Registration failed");
        setLoading(false);
        return;
      }
    }
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-900 text-white">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">⚡</div>
          <CardTitle className="text-2xl font-bold text-white">Xeno CRM</CardTitle>
          <p className="text-slate-400 text-sm">AI-Native Campaign Intelligence</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {isRegister && (
            <div className="space-y-1">
              <Label className="text-slate-300">Name</Label>
              <Input
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-slate-300">Email</Label>
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-slate-300">Password</Label>
            <Input
              className="bg-slate-800 border-slate-600 text-white"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </Button>
          <p className="text-center text-sm text-slate-400">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="text-indigo-400 underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Sign in" : "Register"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

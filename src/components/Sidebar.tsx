"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/orders", label: "Orders", icon: "🛍️" },
  { href: "/segments", label: "Segments", icon: "🎯" },
  { href: "/campaigns", label: "Campaigns", icon: "📣" },
  { href: "/autopilot", label: "AI Autopilot", icon: "🤖" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
      <div className="p-5 border-b border-slate-800">
        <div className="text-xl font-bold flex items-center gap-2">
          <span>⚡</span> Xeno CRM
        </div>
        <div className="text-xs text-slate-400 mt-0.5">AI-Native Intelligence</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              path === item.href
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}

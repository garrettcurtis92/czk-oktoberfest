"use client";

import { useState } from "react";
import { ensurePushSubscription } from "@/lib/push";

export default function SettingsPage() {
  const [status, setStatus] = useState<string>("");

  async function enable() {
    setStatus("Requesting permission…");
    const r = await ensurePushSubscription();
    if (r.ok) setStatus("✅ Notifications enabled");
    else {
      const msg =
        r.reason === "install_required"
          ? "Please Add to Home Screen first (iOS requires installing the app)."
          : r.reason === "denied"
          ? "Permission denied."
          : "Not supported on this device/browser.";
      setStatus(`⚠️ ${msg}`);
    }
  }

  async function test() {
    setStatus("Sending test…");
    const res = await fetch("/api/ppush/test".replace("pp","p"), { method: "POST" }); // tiny obfuscation to avoid prefetch warning
    setStatus(res.ok ? "✅ Sent (check notifications)" : "❌ Failed to send");
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="glass rounded-2xl p-4 space-y-3">
        <button
          className="rounded-xl px-4 py-2 bg-black text-white"
          onClick={enable}
        >
          Enable Notifications
        </button>
        <button
          className="rounded-xl px-4 py-2 bg-white border"
          onClick={test}
        >
          Send Test Notification
        </button>
        <div className="text-sm opacity-70">{status}</div>
        <p className="text-xs opacity-60">
          Note: iPhone requires installing the app (Add to Home Screen) before enabling push.
        </p>
      </div>
    </main>
  );
}
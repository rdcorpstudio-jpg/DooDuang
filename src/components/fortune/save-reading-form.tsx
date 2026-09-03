"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { SacredButton } from "@/components/ui/sacred-button";
import { sacredInputClassName } from "@/components/ui/sacred-form";

export function SaveReadingForm({ token }: { token: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window === "undefined" || !token ? "" : `${window.location.origin}/r/${token}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/fortune/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ส่งเมลไม่สำเร็จ");
      }
      setStatus("sent");
      setMessage("ส่งลิงก์ไปที่เมลแล้ว เปิดเมื่อไหร่ก็ได้");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "ส่งเมลไม่สำเร็จ");
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!token) {
    return (
      <p className="text-center text-[11px] text-purple-400/45">
        ดูผลบนหน้านี้ได้เลย แต่ยังบันทึกลิงก์ดูซ้ำไม่ได้
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-purple-light/20 bg-brand-purple-dark/30 p-4 text-left">
      <div className="mb-3 flex items-center gap-2 text-purple-100/85">
        <Mail className="h-4 w-4 text-amber-200/70" />
        <p className="text-[13px] font-medium">ส่งลิงก์ดูผลซ้ำเข้าเมล</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={sacredInputClassName}
          autoComplete="email"
        />
        <SacredButton type="submit" disabled={status === "sending"}>
          {status === "sending" ? "กำลังส่ง..." : "ส่งลิงก์เข้าเมล"}
        </SacredButton>
      </form>
      {message && (
        <p
          className={`mt-3 text-center text-[11px] ${
            status === "error" ? "text-red-300/80" : "text-amber-100/70"
          }`}
        >
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 w-full text-center text-[11px] text-purple-300/55 transition-colors hover:text-purple-100/80"
      >
        {copied ? "คัดลอกลิงก์แล้ว" : "หรือคัดลอกลิงก์เก็บไว้เอง"}
      </button>
    </div>
  );
}

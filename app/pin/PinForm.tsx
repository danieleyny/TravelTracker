"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PinForm({ next }: { next: string }) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const router = useRouter();

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[i] = d;
    setDigits(arr);
    if (d && i < 3) refs[i + 1].current?.focus();
    if (arr.every((x) => x.length === 1)) submit(arr.join(""));
  }

  async function submit(code: string) {
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setErr("Wrong code.");
        setDigits(["", "", "", ""]);
        refs[0].current?.focus();
        setSubmitting(false);
        return;
      }
      router.push(next || "/");
      router.refresh();
    } catch {
      setErr("Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
            className="!h-14 !w-12 text-center text-2xl font-semibold tracking-widest"
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
            }}
            disabled={submitting}
          />
        ))}
      </div>
      {err && <p className="mt-4 text-center text-sm text-red-600">{err}</p>}
    </div>
  );
}

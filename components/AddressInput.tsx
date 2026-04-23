"use client";
import { useEffect, useRef, useState } from "react";

export type AddressPick = { label: string; lat: number; lon: number };

export default function AddressInput({
  value,
  onChange,
  onPick,
  placeholder,
  id,
}: {
  value: string;
  onChange: (text: string) => void;
  onPick?: (pick: AddressPick) => void;
  placeholder?: string;
  id?: string;
}) {
  const [suggestions, setSuggestions] = useState<AddressPick[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (!focused || q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = (await res.json()) as AddressPick[];
        setSuggestions(data.slice(0, 6));
        setOpen(true);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [value, focused]);

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => { setFocused(false); setOpen(false); }, 150)}
      />
      {open && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-black/10 bg-white shadow-lg">
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-black/40">Searching…</li>
          )}
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.label);
                  onPick?.(s);
                  setOpen(false);
                }}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-black/5"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

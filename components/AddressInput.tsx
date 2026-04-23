"use client";
import { useEffect, useRef, useState } from "react";

type Suggestion = { display_name: string };

export default function AddressInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (!focused || q.length < 4) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = (await res.json()) as Suggestion[];
        setSuggestions(data.slice(0, 5));
        setOpen(true);
      } catch {
        /* aborted */
      }
    }, 350);
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
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-black/10 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.display_name);
                  setOpen(false);
                }}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-black/5"
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

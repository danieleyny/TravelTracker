"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Trips" },
  { href: "/vehicles", label: "Vehicles" },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {tabs.map((t) => {
          const active = path === t.href || (t.href !== "/" && path.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex-1 py-3 text-center text-sm font-medium ${
                active ? "text-ink" : "text-black/40"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

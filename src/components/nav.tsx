"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio", icon: "⬜" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/pagos", label: "Pagos", icon: "💰" },
  { href: "/facturacion", label: "Facturación", icon: "🧾" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen flex flex-col bg-[#1a3d2b] text-white shrink-0">
      <div className="px-5 py-6 border-b border-[#2d6a4f]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥑</span>
          <div>
            <div className="font-bold text-[#f47c3a] text-base leading-tight">La Paltería</div>
            <div className="text-[10px] text-[#52b788] uppercase tracking-widest">Sistema interno</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#f47c3a] text-white"
                  : "text-[#a8d5be] hover:bg-[#2d6a4f] hover:text-white"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#2d6a4f] text-[10px] text-[#52b788]">
        Castelar · Buenos Aires
      </div>
    </aside>
  );
}

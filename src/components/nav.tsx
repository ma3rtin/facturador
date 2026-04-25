"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/clientes", label: "Clientes" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/pagos", label: "Pagos" },
  { href: "/facturacion", label: "Facturación" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="w-48 min-h-screen flex flex-col shrink-0 bg-[#1a3d2b]">
      <div className="px-5 py-7 border-b border-[#2d6a4f]">
        <div className="text-white font-bold text-sm tracking-wide">La Paltería</div>
        <div className="text-[#52b788] text-[10px] tracking-widest uppercase mt-0.5">Facturador</div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-[#ea580c] text-white font-medium"
                  : "text-[#a8d5be] hover:bg-[#2d6a4f] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

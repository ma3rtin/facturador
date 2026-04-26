"use client";

import { useTransition } from "react";
import { actualizarEstadoPedido } from "@/actions/pedidos";
import type { EstadoPedido } from "@/generated/prisma/enums";

const ESTADOS: { value: EstadoPedido; label: string; color: string }[] = [
  { value: "PENDIENTE",   label: "Pendiente",   color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  { value: "EN_PROCESO",  label: "En proceso",  color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "ENTREGADO",   label: "Entregado",   color: "bg-green-50 text-green-700 border-green-200" },
  { value: "CANCELADO",   label: "Cancelado",   color: "bg-red-50 text-red-500 border-red-200" },
];

export function PedidoEstadoSelect({ pedidoId, estado }: { pedidoId: string; estado: EstadoPedido }) {
  const [pending, startTransition] = useTransition();
  const current = ESTADOS.find((e) => e.value === estado)!;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as EstadoPedido;
    if (next === estado) return;
    startTransition(() => { actualizarEstadoPedido(pedidoId, next); });
  }

  return (
    <select
      value={estado}
      onChange={handleChange}
      disabled={pending}
      className={`px-2 py-0.5 rounded-full text-xs font-medium border appearance-none cursor-pointer focus:outline-none disabled:opacity-60 ${current.color}`}
    >
      {ESTADOS.map((e) => (
        <option key={e.value} value={e.value}>{e.label}</option>
      ))}
    </select>
  );
}

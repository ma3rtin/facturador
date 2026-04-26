import { getPedidos } from "@/actions/pedidos";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { PedidoEstadoSelect } from "@/components/pedido-estado-select";
import type { EstadoPedido } from "@/generated/prisma/enums";

const estadoColor: Record<string, string> = {
  PENDIENTE: "bg-yellow-50 text-yellow-600",
  EN_PROCESO: "bg-blue-50 text-blue-600",
  ENTREGADO: "bg-green-50 text-green-700",
  CANCELADO: "bg-red-50 text-red-500",
};

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default async function PedidosPage() {
  const pedidos = await getPedidos();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const pedidosHoy = pedidos.filter((p) => new Date(p.fecha) >= hoy);
  const pedidosAnteriores = pedidos.filter((p) => new Date(p.fecha) < hoy);

  const renderTabla = (lista: typeof pedidos) => (
    <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
            <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Cliente</th>
            <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Fecha</th>
            <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Items</th>
            <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Estado</th>
            <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Total</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-[#dde6de] hover:bg-[#f7faf7] transition-colors ${i === lista.length - 1 ? "border-0" : ""}`}
            >
              <td className="px-5 py-3.5 font-medium text-[#1a2419]">{p.cliente.razonSocial}</td>
              <td className="px-5 py-3.5 text-[#5a6b5c]">
                {new Date(p.fecha).toLocaleDateString("es-AR")}
              </td>
              <td className="px-5 py-3.5 text-[#5a6b5c]">{p.items.length} ítem{p.items.length !== 1 ? "s" : ""}</td>
              <td className="px-5 py-3.5">
                <PedidoEstadoSelect pedidoId={p.id} estado={p.estado as EstadoPedido} />
              </td>
              <td className="px-5 py-3.5 text-right font-semibold text-[#1a2419]">
                ${p.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3.5 text-right">
                <Link href={`/pedidos/${p.id}`} className="text-[#ea580c] text-xs font-medium hover:underline">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2419]">Pedidos</h1>
          <p className="text-[#5a6b5c] text-sm mt-0.5">{pedidosHoy.length} pedidos hoy</p>
        </div>
        <Link
          href="/pedidos/nuevo"
          className="bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors"
        >
          + Nuevo pedido
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#dde6de] p-16 text-center shadow-sm">
          <ClipboardList className="mx-auto mb-4 text-[#9aab9d]" size={40} />
          <p className="text-[#5a6b5c]">No hay pedidos todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {pedidosHoy.length > 0 && (
            <div>
              <h2 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-3">Hoy</h2>
              {renderTabla(pedidosHoy)}
            </div>
          )}
          {pedidosAnteriores.length > 0 && (
            <div>
              <h2 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-3">Anteriores</h2>
              {renderTabla(pedidosAnteriores)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { getPedidos } from "@/actions/pedidos";
import Link from "next/link";

const estadoColor: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
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
    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
            <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Cliente</th>
            <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Fecha</th>
            <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Items</th>
            <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Estado</th>
            <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">Total</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-[#f3f4f6] hover:bg-[#fdf8f0] transition-colors ${i === lista.length - 1 ? "border-0" : ""}`}
            >
              <td className="px-5 py-3.5 font-medium text-[#1a3d2b]">{p.cliente.razonSocial}</td>
              <td className="px-5 py-3.5 text-[#6b7280]">
                {new Date(p.fecha).toLocaleDateString("es-AR")}
              </td>
              <td className="px-5 py-3.5 text-[#6b7280]">{p.items.length} ítem{p.items.length !== 1 ? "s" : ""}</td>
              <td className="px-5 py-3.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[p.estado]}`}>
                  {estadoLabel[p.estado]}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right font-semibold">
                ${p.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3.5 text-right">
                <Link href={`/facturacion/nueva?pedidoId=${p.id}`} className="text-[#f47c3a] text-xs font-medium hover:underline">
                  Facturar
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
          <h1 className="text-2xl font-bold text-[#1a3d2b]">Pedidos</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">{pedidosHoy.length} pedidos hoy</p>
        </div>
        <Link
          href="/pedidos/nuevo"
          className="bg-[#f47c3a] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors"
        >
          + Nuevo pedido
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#6b7280]">No hay pedidos todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {pedidosHoy.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#2d6a4f] uppercase tracking-wider mb-3">Hoy</h2>
              {renderTabla(pedidosHoy)}
            </div>
          )}
          {pedidosAnteriores.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Anteriores</h2>
              {renderTabla(pedidosAnteriores)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

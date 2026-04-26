import { getPedido } from "@/actions/pedidos";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PedidoEstadoSelect } from "@/components/pedido-estado-select";
import type { EstadoPedido } from "@/generated/prisma/enums";

const estadoFactura: Record<string, string> = {
  BORRADOR: "bg-yellow-50 text-yellow-600",
  EMITIDA:  "bg-green-50 text-green-700",
  ANULADA:  "bg-red-50 text-red-500",
};

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await getPedido(id);
  if (!pedido) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-[#5a6b5c] mb-4">
        <Link href="/pedidos" className="hover:text-[#ea580c]">Pedidos</Link>
        <span>/</span>
        <span className="text-[#1a2419] font-medium">{pedido.cliente.razonSocial}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2419]">{pedido.cliente.razonSocial}</h1>
          <p className="text-[#5a6b5c] text-sm mt-0.5">
            {new Date(pedido.fecha).toLocaleDateString("es-AR", { dateStyle: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PedidoEstadoSelect pedidoId={pedido.id} estado={pedido.estado as EstadoPedido} />
          {pedido.estado !== "CANCELADO" && pedido.estado !== "ENTREGADO" && (
            <Link
              href={`/facturacion/nueva?clienteId=${pedido.clienteId}&pedidoId=${pedido.id}`}
              className="bg-[#ea580c] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors"
            >
              Generar factura
            </Link>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
              <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Producto</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Cant.</th>
              <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Unidad</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Precio unit.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item, i) => (
              <tr key={item.id} className={`border-b border-[#dde6de] ${i === pedido.items.length - 1 ? "border-0" : ""}`}>
                <td className="px-5 py-3.5 font-medium text-[#1a2419]">{item.descripcion}</td>
                <td className="px-5 py-3.5 text-right text-[#5a6b5c]">{item.cantidad}</td>
                <td className="px-5 py-3.5 text-[#5a6b5c]">{item.unidadMedida}</td>
                <td className="px-5 py-3.5 text-right text-[#5a6b5c]">${item.precioUnitario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-[#1a2419]">${item.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-6">
        <span className="text-lg font-bold text-[#1a2419]">
          Total: ${pedido.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {pedido.observaciones && (
        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm mb-5">
          <h3 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-2">Observaciones</h3>
          <p className="text-sm text-[#5a6b5c]">{pedido.observaciones}</p>
        </div>
      )}

      {/* Facturas vinculadas */}
      {pedido.facturas.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-[#f2f5f2] border-b border-[#dde6de]">
            <h3 className="text-sm font-semibold text-[#9aab9d]">Facturas vinculadas</h3>
          </div>
          {pedido.facturas.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-5 py-3.5 border-b border-[#dde6de] last:border-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#1a2419]">
                  {f.tipoFactura} {String(f.puntoVenta).padStart(5, "0")}-{String(f.numeroComprobante ?? 0).padStart(8, "0")}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoFactura[f.estado]}`}>
                  {f.estado.charAt(0) + f.estado.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-sm text-[#1a2419]">${f.importeTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                <Link href={`/facturacion/${f.id}`} className="text-[#ea580c] text-xs font-medium hover:underline">Ver</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

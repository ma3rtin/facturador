import { getCliente } from "@/actions/clientes";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-4">
        <Link href="/clientes" className="hover:text-[#f47c3a]">Clientes</Link>
        <span>/</span>
        <span className="text-[#1a3d2b] font-medium">{cliente.razonSocial}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3d2b]">{cliente.razonSocial}</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">{cliente.cuit ?? cliente.dni ?? "Sin CUIT/DNI"}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/facturacion/nueva?clienteId=${cliente.id}`}
            className="bg-[#f47c3a] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors"
          >
            + Facturar
          </Link>
          <Link
            href={`/pagos/nuevo?clienteId=${cliente.id}`}
            className="bg-[#2d6a4f] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#1a3d2b] transition-colors"
          >
            + Pago
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
          <div className="text-xs text-[#6b7280] mb-1">Saldo pendiente</div>
          <div className={`text-xl font-bold ${cliente.saldoPendiente > 0 ? "text-red-500" : "text-[#2d6a4f]"}`}>
            ${cliente.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
          <div className="text-xs text-[#6b7280] mb-1">Pedidos</div>
          <div className="text-xl font-bold text-[#1a3d2b]">{cliente.pedidos.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
          <div className="text-xs text-[#6b7280] mb-1">Facturas</div>
          <div className="text-xl font-bold text-[#1a3d2b]">{cliente.facturas.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a3d2b] mb-3">Datos</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Condición IVA</dt>
              <dd className="font-medium">{cliente.condicionIVA.replace(/_/g, " ")}</dd>
            </div>
            {cliente.domicilio && (
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Domicilio</dt>
                <dd className="font-medium text-right max-w-[200px]">{cliente.domicilio}</dd>
              </div>
            )}
            {cliente.zona && (
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Zona</dt>
                <dd className="font-medium">{cliente.zona}</dd>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Teléfono</dt>
                <dd className="font-medium">{cliente.telefono}</dd>
              </div>
            )}
            {cliente.email && (
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Email</dt>
                <dd className="font-medium">{cliente.email}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a3d2b] mb-3">Últimos pagos</h2>
          {cliente.pagos.length === 0 ? (
            <p className="text-sm text-[#6b7280]">Sin pagos registrados</p>
          ) : (
            <div className="flex flex-col gap-2">
              {cliente.pagos.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">
                    {new Date(p.fecha).toLocaleDateString("es-AR")} {p.concepto && `· ${p.concepto}`}
                  </span>
                  <span className="font-medium text-[#2d6a4f]">
                    ${p.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f3f4f6] flex justify-between items-center">
          <h2 className="font-semibold text-[#1a3d2b]">Últimos pedidos</h2>
          <Link href={`/pedidos/nuevo?clienteId=${cliente.id}`} className="text-[#f47c3a] text-sm font-medium hover:underline">
            + Nuevo pedido
          </Link>
        </div>
        {cliente.pedidos.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#6b7280]">Sin pedidos</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="text-left px-5 py-2.5 font-medium text-[#6b7280]">Fecha</th>
                <th className="text-left px-5 py-2.5 font-medium text-[#6b7280]">Estado</th>
                <th className="text-right px-5 py-2.5 font-medium text-[#6b7280]">Total</th>
              </tr>
            </thead>
            <tbody>
              {cliente.pedidos.map((p) => (
                <tr key={p.id} className="border-t border-[#f3f4f6]">
                  <td className="px-5 py-3">{new Date(p.fecha).toLocaleDateString("es-AR")}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[p.estado]}`}>
                      {estadoLabel[p.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    ${p.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

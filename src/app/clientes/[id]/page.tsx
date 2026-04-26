import { getCliente } from "@/actions/clientes";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#5a6b5c] mb-4">
        <Link href="/clientes" className="hover:text-[#ea580c]">Clientes</Link>
        <span>/</span>
        <span className="text-[#1a2419] font-medium">{cliente.razonSocial}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2419]">{cliente.razonSocial}</h1>
          <p className="text-[#5a6b5c] text-sm mt-0.5">{cliente.cuit ?? cliente.dni ?? "Sin CUIT/DNI"}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/facturacion/nueva?clienteId=${cliente.id}`}
            className="bg-[#ea580c] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors"
          >
            + Facturar
          </Link>
          <Link
            href={`/pagos/nuevo?clienteId=${cliente.id}`}
            className="bg-[#16a34a] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#15803d] transition-colors"
          >
            + Pago
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#dde6de] p-4 shadow-sm">
          <div className="text-xs text-[#5a6b5c] mb-1">Saldo pendiente</div>
          <div className={`text-xl font-bold ${cliente.saldoPendiente > 0 ? "text-red-500" : "text-[#16a34a]"}`}>
            ${cliente.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde6de] p-4 shadow-sm">
          <div className="text-xs text-[#5a6b5c] mb-1">Pedidos</div>
          <div className="text-xl font-bold text-[#1a2419]">{cliente.pedidos.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde6de] p-4 shadow-sm">
          <div className="text-xs text-[#5a6b5c] mb-1">Facturas</div>
          <div className="text-xl font-bold text-[#1a2419]">{cliente.facturas.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a2419] mb-3">Datos</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#5a6b5c]">Condición IVA</dt>
              <dd className="font-medium text-[#1a2419]">{cliente.condicionIVA.replace(/_/g, " ")}</dd>
            </div>
            {cliente.domicilio && (
              <div className="flex justify-between">
                <dt className="text-[#5a6b5c]">Domicilio</dt>
                <dd className="font-medium text-right max-w-[200px] text-[#1a2419]">{cliente.domicilio}</dd>
              </div>
            )}
            {cliente.zona && (
              <div className="flex justify-between">
                <dt className="text-[#5a6b5c]">Zona</dt>
                <dd className="font-medium text-[#1a2419]">{cliente.zona}</dd>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex justify-between">
                <dt className="text-[#5a6b5c]">Teléfono</dt>
                <dd className="font-medium text-[#1a2419]">{cliente.telefono}</dd>
              </div>
            )}
            {cliente.email && (
              <div className="flex justify-between">
                <dt className="text-[#5a6b5c]">Email</dt>
                <dd className="font-medium text-[#1a2419]">{cliente.email}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a2419] mb-3">Últimos pagos</h2>
          {cliente.pagos.length === 0 ? (
            <p className="text-sm text-[#5a6b5c]">Sin pagos registrados</p>
          ) : (
            <div className="flex flex-col gap-2">
              {cliente.pagos.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-[#5a6b5c]">
                    {new Date(p.fecha).toLocaleDateString("es-AR")} {p.concepto && `· ${p.concepto}`}
                  </span>
                  <span className="font-medium text-[#16a34a]">
                    ${p.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#dde6de] flex justify-between items-center">
          <h2 className="font-semibold text-[#1a2419]">Últimos pedidos</h2>
          <Link href={`/pedidos/nuevo?clienteId=${cliente.id}`} className="text-[#ea580c] text-sm font-medium hover:underline">
            + Nuevo pedido
          </Link>
        </div>
        {cliente.pedidos.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#5a6b5c]">Sin pedidos</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f2f5f2]">
                <th className="text-left px-5 py-2.5 font-medium text-[#9aab9d]">Fecha</th>
                <th className="text-left px-5 py-2.5 font-medium text-[#9aab9d]">Estado</th>
                <th className="text-right px-5 py-2.5 font-medium text-[#9aab9d]">Total</th>
              </tr>
            </thead>
            <tbody>
              {cliente.pedidos.map((p) => (
                <tr key={p.id} className="border-t border-[#dde6de] hover:bg-[#f7faf7] transition-colors">
                  <td className="px-5 py-3 text-[#1a2419]">{new Date(p.fecha).toLocaleDateString("es-AR")}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[p.estado]}`}>
                      {estadoLabel[p.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-[#1a2419]">
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

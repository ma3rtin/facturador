import { getFacturas } from "@/actions/facturas";
import Link from "next/link";

const estadoColor: Record<string, string> = {
  BORRADOR: "bg-yellow-100 text-yellow-700",
  EMITIDA: "bg-green-100 text-green-700",
  ANULADA: "bg-red-100 text-red-700",
};

export default async function FacturacionPage() {
  const facturas = await getFacturas();

  const totalEmitido = facturas
    .filter((f) => f.estado === "EMITIDA")
    .reduce((acc, f) => acc + f.importeTotal, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3d2b]">Facturación</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">
            {facturas.length} facturas · ${totalEmitido.toLocaleString("es-AR", { minimumFractionDigits: 2 })} emitido
          </p>
        </div>
        <Link
          href="/facturacion/nueva"
          className="bg-[#f47c3a] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors"
        >
          + Nueva factura
        </Link>
      </div>

      {facturas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-16 text-center">
          <div className="text-5xl mb-4">🧾</div>
          <p className="text-[#6b7280]">No hay facturas todavía.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Comprobante</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Cliente</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Fecha</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Estado</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">CAE</th>
                <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">Total</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-b border-[#f3f4f6] hover:bg-[#fdf8f0] transition-colors ${i === facturas.length - 1 ? "border-0" : ""}`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#1a3d2b]">
                    {f.tipoFactura} {String(f.puntoVenta).padStart(5, "0")}-{String(f.numeroComprobante ?? 0).padStart(8, "0")}
                  </td>
                  <td className="px-5 py-3.5 font-medium">{f.cliente.razonSocial}</td>
                  <td className="px-5 py-3.5 text-[#6b7280]">{new Date(f.fecha).toLocaleDateString("es-AR")}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[f.estado]}`}>
                      {f.estado.charAt(0) + f.estado.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#6b7280]">
                    {f.cae ?? <span className="text-yellow-600">Pendiente</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold">
                    ${f.importeTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/facturacion/${f.id}`} className="text-[#f47c3a] hover:underline font-medium">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

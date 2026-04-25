import { getFacturas } from "@/actions/facturas";
import Link from "next/link";
import { Receipt } from "lucide-react";

const estadoColor: Record<string, string> = {
  BORRADOR: "bg-yellow-50 text-yellow-600",
  EMITIDA: "bg-green-50 text-green-700",
  ANULADA: "bg-red-50 text-red-500",
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
          <h1 className="text-2xl font-bold text-[#1a2419]">Facturación</h1>
          <p className="text-[#5a6b5c] text-sm mt-0.5">
            {facturas.length} facturas · ${totalEmitido.toLocaleString("es-AR", { minimumFractionDigits: 2 })} emitido
          </p>
        </div>
        <Link
          href="/facturacion/nueva"
          className="bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors"
        >
          + Nueva factura
        </Link>
      </div>

      {facturas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#dde6de] p-16 text-center shadow-sm">
          <Receipt className="mx-auto mb-4 text-[#9aab9d]" size={40} />
          <p className="text-[#5a6b5c]">No hay facturas todavía.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Comprobante</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Cliente</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Fecha</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Estado</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">CAE</th>
                <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Total</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-b border-[#dde6de] hover:bg-[#f7faf7] transition-colors ${i === facturas.length - 1 ? "border-0" : ""}`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#1a2419]">
                    {f.tipoFactura} {String(f.puntoVenta).padStart(5, "0")}-{String(f.numeroComprobante ?? 0).padStart(8, "0")}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#1a2419]">{f.cliente.razonSocial}</td>
                  <td className="px-5 py-3.5 text-[#5a6b5c]">{new Date(f.fecha).toLocaleDateString("es-AR")}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[f.estado]}`}>
                      {f.estado.charAt(0) + f.estado.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#5a6b5c]">
                    {f.cae ?? <span className="text-yellow-600">Pendiente</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-[#1a2419]">
                    ${f.importeTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/facturacion/${f.id}`} className="text-[#ea580c] hover:underline font-medium">
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

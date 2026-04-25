import { getFactura } from "@/actions/facturas";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) notFound();

  const estadoColor = {
    BORRADOR: "bg-yellow-100 text-yellow-700",
    EMITIDA: "bg-green-100 text-green-700",
    ANULADA: "bg-red-100 text-red-700",
  }[factura.estado];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-4">
        <Link href="/facturacion" className="hover:text-[#f47c3a]">Facturación</Link>
        <span>/</span>
        <span className="font-mono text-[#1a3d2b] font-medium">
          {factura.tipoFactura} {String(factura.puntoVenta).padStart(5, "0")}-{String(factura.numeroComprobante ?? 0).padStart(8, "0")}
        </span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1a3d2b]">
              Factura {factura.tipoFactura}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor}`}>
              {factura.estado.charAt(0) + factura.estado.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-[#6b7280] text-sm mt-0.5">
            {new Date(factura.fecha).toLocaleDateString("es-AR", { dateStyle: "long" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
          <h3 className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Cliente</h3>
          <div className="font-semibold text-[#1a3d2b]">{factura.cliente.razonSocial}</div>
          {factura.cliente.cuit && (
            <div className="text-sm text-[#6b7280] font-mono mt-0.5">CUIT: {factura.cliente.cuit}</div>
          )}
          {factura.cliente.domicilio && (
            <div className="text-sm text-[#6b7280] mt-0.5">{factura.cliente.domicilio}</div>
          )}
          <div className="text-xs text-[#2d6a4f] mt-1">
            {factura.cliente.condicionIVA.replace(/_/g, " ")}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
          <h3 className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Comprobante</h3>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Tipo</dt>
              <dd className="font-bold text-[#1a3d2b]">Factura {factura.tipoFactura}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Punto de venta</dt>
              <dd className="font-mono">{String(factura.puntoVenta).padStart(5, "0")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Número</dt>
              <dd className="font-mono">{String(factura.numeroComprobante ?? 0).padStart(8, "0")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7280]">Condición venta</dt>
              <dd>{factura.condicionVenta}</dd>
            </div>
          </dl>
        </div>
      </div>

      {factura.cae && (
        <div className="bg-[#f0faf4] border border-[#52b788] rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#2d6a4f] font-semibold uppercase tracking-wider">CAE N°</div>
            <div className="font-mono font-bold text-[#1a3d2b] text-lg">{factura.cae}</div>
          </div>
          {factura.caeFechaVto && (
            <div className="text-right">
              <div className="text-xs text-[#2d6a4f]">Vto. CAE</div>
              <div className="font-medium text-[#1a3d2b]">
                {new Date(factura.caeFechaVto).toLocaleDateString("es-AR")}
              </div>
            </div>
          )}
        </div>
      )}

      {factura.estado === "BORRADOR" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-sm text-yellow-700">
          Esta factura está en borrador. La integración con AFIP/ARCA para obtener el CAE estará disponible próximamente.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Producto / Servicio</th>
              <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">Cant.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">Precio unit.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">% Bonif.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">IVA</th>
              <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">Subtotal c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {factura.items.map((item, i) => (
              <tr key={item.id} className={`border-b border-[#f3f4f6] ${i === factura.items.length - 1 ? "border-0" : ""}`}>
                <td className="px-5 py-3.5 font-medium">{item.descripcion}</td>
                <td className="px-5 py-3.5 text-right">{item.cantidad} {item.unidadMedida}</td>
                <td className="px-5 py-3.5 text-right">${item.precioUnitario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5 text-right">{item.bonificacion}%</td>
                <td className="px-5 py-3.5 text-right">{item.alicuotaIVA}%</td>
                <td className="px-5 py-3.5 text-right font-semibold">
                  ${item.subtotalConIVA.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm w-72 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-[#6b7280]">
            <span>Importe neto gravado</span>
            <span>${factura.importeNeto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[#6b7280]">
            <span>IVA</span>
            <span>${factura.importeIVA.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[#1a3d2b] pt-2 border-t border-[#e5e7eb]">
            <span>Total</span>
            <span>${factura.importeTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

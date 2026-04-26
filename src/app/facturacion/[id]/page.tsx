import { getFactura } from "@/actions/facturas";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmitirFacturaButton } from "@/components/emitir-factura-button";

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) notFound();

  const estadoColor = {
    BORRADOR: "bg-yellow-50 text-yellow-600",
    EMITIDA: "bg-green-50 text-green-700",
    ANULADA: "bg-red-50 text-red-500",
  }[factura.estado];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#5a6b5c] mb-4">
        <Link href="/facturacion" className="hover:text-[#ea580c]">Facturación</Link>
        <span>/</span>
        <span className="font-mono text-[#1a2419] font-medium">
          {factura.tipoFactura} {String(factura.puntoVenta).padStart(5, "0")}-{String(factura.numeroComprobante ?? 0).padStart(8, "0")}
        </span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1a2419]">
              Factura {factura.tipoFactura}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor}`}>
              {factura.estado.charAt(0) + factura.estado.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-[#5a6b5c] text-sm mt-0.5">
            {new Date(factura.fecha).toLocaleDateString("es-AR", { dateStyle: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {factura.estado === "BORRADOR" && <EmitirFacturaButton facturaId={factura.id} />}
          <a
            href={`/api/facturas/${factura.id}/pdf`}
            target="_blank"
            className="flex items-center gap-2 bg-white border border-[#dde6de] px-4 py-2 rounded-xl text-sm font-medium text-[#5a6b5c] hover:text-[#1a2419] hover:border-[#1a2419] transition-colors"
          >
            Descargar PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <h3 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-3">Cliente</h3>
          <div className="font-semibold text-[#1a2419]">{factura.cliente.razonSocial}</div>
          {factura.cliente.cuit && (
            <div className="text-sm text-[#5a6b5c] font-mono mt-0.5">CUIT: {factura.cliente.cuit}</div>
          )}
          {factura.cliente.domicilio && (
            <div className="text-sm text-[#5a6b5c] mt-0.5">{factura.cliente.domicilio}</div>
          )}
          <div className="text-xs text-[#16a34a] mt-1">
            {factura.cliente.condicionIVA.replace(/_/g, " ")}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <h3 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-3">Comprobante</h3>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#5a6b5c]">Tipo</dt>
              <dd className="font-bold text-[#1a2419]">Factura {factura.tipoFactura}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#5a6b5c]">Punto de venta</dt>
              <dd className="font-mono text-[#1a2419]">{String(factura.puntoVenta).padStart(5, "0")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#5a6b5c]">Número</dt>
              <dd className="font-mono text-[#1a2419]">{String(factura.numeroComprobante ?? 0).padStart(8, "0")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#5a6b5c]">Condición venta</dt>
              <dd className="text-[#1a2419]">{factura.condicionVenta}</dd>
            </div>
          </dl>
        </div>
      </div>

      {factura.cae && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-[#9aab9d] text-xs uppercase tracking-widest font-semibold">CAE N°</div>
            <div className="font-mono font-bold text-[#1a2419] text-lg">{factura.cae}</div>
          </div>
          {factura.caeFechaVto && (
            <div className="text-right">
              <div className="text-xs text-[#5a6b5c]">Vto. CAE</div>
              <div className="font-medium text-[#1a2419]">
                {new Date(factura.caeFechaVto).toLocaleDateString("es-AR")}
              </div>
            </div>
          )}
        </div>
      )}

      {factura.estado === "BORRADOR" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-sm text-yellow-600">
          Esta factura está en borrador. La integración con AFIP/ARCA para obtener el CAE estará disponible próximamente.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden mb-6 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
              <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Producto / Servicio</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Cant.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Precio unit.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">% Bonif.</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">IVA</th>
              <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Subtotal c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {factura.items.map((item, i) => (
              <tr key={item.id} className={`border-b border-[#dde6de] hover:bg-[#f7faf7] transition-colors ${i === factura.items.length - 1 ? "border-0" : ""}`}>
                <td className="px-5 py-3.5 font-medium text-[#1a2419]">{item.descripcion}</td>
                <td className="px-5 py-3.5 text-right text-[#5a6b5c]">{item.cantidad} {item.unidadMedida}</td>
                <td className="px-5 py-3.5 text-right text-[#5a6b5c]">${item.precioUnitario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5 text-right text-[#5a6b5c]">{item.bonificacion}%</td>
                <td className="px-5 py-3.5 text-right text-[#5a6b5c]">{item.alicuotaIVA}%</td>
                <td className="px-5 py-3.5 text-right font-semibold text-[#1a2419]">
                  ${item.subtotalConIVA.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 w-72 flex flex-col gap-2 text-sm shadow-sm">
          <div className="flex justify-between text-[#5a6b5c]">
            <span>Importe neto gravado</span>
            <span>${factura.importeNeto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[#5a6b5c]">
            <span>IVA</span>
            <span>${factura.importeIVA.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[#1a2419] pt-2 border-t border-[#dde6de]">
            <span>Total</span>
            <span>${factura.importeTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

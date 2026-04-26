"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { crearFactura } from "@/actions/facturas";
import { getClientes } from "@/actions/clientes";
import { getPedido } from "@/actions/pedidos";
import { TipoFactura } from "@/generated/prisma/enums";

type Cliente = { id: string; razonSocial: string; cuit: string | null; condicionIVA: string };
type Item = {
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  alicuotaIVA: number;
  bonificacion: number;
};

const ALICUOTAS = [0, 2.5, 5, 10.5, 21, 27];

const TIPOS_FACTURA: { value: TipoFactura; label: string; desc: string }[] = [
  { value: "A", label: "Factura A", desc: "Entre responsables inscriptos" },
  { value: "B", label: "Factura B", desc: "A consumidores finales / monotributistas" },
  { value: "C", label: "Factura C", desc: "Emitida por monotributistas" },
  { value: "M", label: "Factura M", desc: "Factura M (AFIP)" },
  { value: "X", label: "Recibo X", desc: "Sin discriminar IVA" },
];

function NuevaFacturaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteIdParam = searchParams.get("clienteId") ?? "";
  const pedidoIdParam = searchParams.get("pedidoId") ?? "";

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState(clienteIdParam);
  const [pedidoId] = useState(pedidoIdParam || undefined);
  const [tipoFactura, setTipoFactura] = useState<TipoFactura>("B");
  const [puntoVenta, setPuntoVenta] = useState(1);
  const [condicionVenta, setCondicionVenta] = useState("Contado");
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<Item[]>([
    { descripcion: "", cantidad: 1, unidadMedida: "unidades", precioUnitario: 0, alicuotaIVA: 21, bonificacion: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes().then((data) => setClientes(data as Cliente[]));
  }, []);

  useEffect(() => {
    if (!pedidoIdParam) return;
    getPedido(pedidoIdParam).then((pedido) => {
      if (!pedido) return;
      setClienteId(pedido.clienteId);
      setItems(
        pedido.items.map((item) => ({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          unidadMedida: item.unidadMedida,
          precioUnitario: item.precioUnitario,
          alicuotaIVA: 21,
          bonificacion: 0,
        }))
      );
    });
  }, [pedidoIdParam]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { descripcion: "", cantidad: 1, unidadMedida: "unidades", precioUnitario: 0, alicuotaIVA: 21, bonificacion: 0 },
    ]);
  }

  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const importeNeto = items.reduce((acc, item) => {
    const sub = item.precioUnitario * item.cantidad * (1 - item.bonificacion / 100);
    return acc + sub;
  }, 0);

  const importeIVA = items.reduce((acc, item) => {
    const sub = item.precioUnitario * item.cantidad * (1 - item.bonificacion / 100);
    return acc + sub * (item.alicuotaIVA / 100);
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || items.some((i) => !i.descripcion)) return;
    setLoading(true);
    try {
      const factura = await crearFactura({
        clienteId,
        pedidoId,
        tipoFactura,
        puntoVenta,
        condicionVenta,
        observaciones: observaciones || undefined,
        items,
      });
      router.push(`/facturacion/${factura.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-[#1a2419] mb-6">Nueva factura</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a2419] mb-4">Tipo de comprobante</h2>
          <div className="grid grid-cols-5 gap-2">
            {TIPOS_FACTURA.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipoFactura(t.value)}
                className={`border-2 rounded-xl p-3 text-center transition-colors ${
                  tipoFactura === t.value
                    ? "border-[#ea580c] bg-[#ea580c]/10"
                    : "border-[#dde6de] hover:border-[#16a34a] hover:bg-[#f7faf7]"
                }`}
              >
                <div className="text-xl font-bold text-[#1a2419]">{t.value}</div>
                <div className="text-[10px] text-[#5a6b5c] mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a2419] mb-4">Datos del comprobante</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2419] mb-1">Cliente *</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="w-full bg-white border border-[#dde6de] rounded-lg px-3 py-2 text-sm text-[#1a2419] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              >
                <option value="">Seleccionar...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razonSocial}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2419] mb-1">Punto de venta</label>
              <input
                type="number"
                min="1"
                value={puntoVenta}
                onChange={(e) => setPuntoVenta(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-[#dde6de] rounded-lg px-3 py-2 text-sm text-[#1a2419] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2419] mb-1">Condición de venta</label>
              <select
                value={condicionVenta}
                onChange={(e) => setCondicionVenta(e.target.value)}
                className="w-full bg-white border border-[#dde6de] rounded-lg px-3 py-2 text-sm text-[#1a2419] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              >
                <option>Contado</option>
                <option>Cuenta corriente</option>
                <option>Cheque</option>
                <option>Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2419] mb-1">Observaciones</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full bg-white border border-[#dde6de] rounded-lg px-3 py-2 text-sm text-[#1a2419] placeholder-[#9aab9d] focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde6de] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-[#1a2419]">Ítems</h2>
            <button type="button" onClick={addItem} className="text-sm text-[#ea580c] font-medium hover:underline">
              + Agregar ítem
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9aab9d] text-xs border-b border-[#dde6de]">
                  <th className="pb-2 pr-2 font-medium w-[30%]">Descripción</th>
                  <th className="pb-2 pr-2 font-medium">Cant.</th>
                  <th className="pb-2 pr-2 font-medium">Unidad</th>
                  <th className="pb-2 pr-2 font-medium">Precio unit.</th>
                  <th className="pb-2 pr-2 font-medium">% Bonif.</th>
                  <th className="pb-2 pr-2 font-medium">Alícuota IVA</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                  <th className="pb-2 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const sub = item.precioUnitario * item.cantidad * (1 - item.bonificacion / 100);
                  return (
                    <tr key={i} className="border-b border-[#dde6de]">
                      <td className="py-2 pr-2">
                        <input
                          value={item.descripcion}
                          onChange={(e) => updateItem(i, "descripcion", e.target.value)}
                          required
                          placeholder="Paltas Hass"
                          className="w-full bg-white border border-[#dde6de] rounded px-2 py-1.5 text-xs text-[#1a2419] placeholder-[#9aab9d] focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number" min="0.01" step="0.01"
                          value={item.cantidad}
                          onChange={(e) => updateItem(i, "cantidad", parseFloat(e.target.value) || 0)}
                          className="w-16 bg-white border border-[#dde6de] rounded px-2 py-1.5 text-xs text-[#1a2419] focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={item.unidadMedida}
                          onChange={(e) => updateItem(i, "unidadMedida", e.target.value)}
                          className="bg-white border border-[#dde6de] rounded px-2 py-1.5 text-xs text-[#1a2419] focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                        >
                          <option>unidades</option>
                          <option>kg</option>
                          <option>cajones</option>
                          <option>bolsas</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number" min="0" step="0.01"
                          value={item.precioUnitario}
                          onChange={(e) => updateItem(i, "precioUnitario", parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border border-[#dde6de] rounded px-2 py-1.5 text-xs text-[#1a2419] focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number" min="0" max="100"
                          value={item.bonificacion}
                          onChange={(e) => updateItem(i, "bonificacion", parseFloat(e.target.value) || 0)}
                          className="w-14 bg-white border border-[#dde6de] rounded px-2 py-1.5 text-xs text-[#1a2419] focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={item.alicuotaIVA}
                          onChange={(e) => updateItem(i, "alicuotaIVA", parseFloat(e.target.value))}
                          className="bg-white border border-[#dde6de] rounded px-2 py-1.5 text-xs text-[#1a2419] focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                        >
                          {ALICUOTAS.map((a) => (
                            <option key={a} value={a}>{a}%</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 text-right font-mono text-xs font-medium text-[#1a2419]">
                        ${sub.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 pl-2">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-600 text-lg leading-none">×</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-[#dde6de] flex justify-end gap-8 text-sm">
            <div className="text-right flex flex-col gap-1">
              <div className="flex justify-between gap-8 text-[#5a6b5c]">
                <span>Neto gravado:</span>
                <span>${importeNeto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between gap-8 text-[#5a6b5c]">
                <span>IVA:</span>
                <span>${importeIVA.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between gap-8 text-lg font-bold text-[#1a2419] pt-1 border-t border-[#dde6de]">
                <span>Total:</span>
                <span>${(importeNeto + importeIVA).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!clienteId || loading}
            className="bg-[#ea580c] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear factura"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-[#dde6de] px-6 py-2.5 rounded-xl font-medium text-sm text-[#5a6b5c] hover:text-[#1a2419] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevaFacturaPage() {
  return (
    <Suspense>
      <NuevaFacturaForm />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { crearPedido } from "@/actions/pedidos";
import { getClientes } from "@/actions/clientes";

type Cliente = { id: string; razonSocial: string };
type Item = { descripcion: string; cantidad: number; unidadMedida: string; precioUnitario: number };

function NuevoPedidoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteIdParam = searchParams.get("clienteId") ?? "";

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState(clienteIdParam);
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<Item[]>([
    { descripcion: "", cantidad: 1, unidadMedida: "unidades", precioUnitario: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes().then(setClientes);
  }, []);

  function addItem() {
    setItems((prev) => [...prev, { descripcion: "", cantidad: 1, unidadMedida: "unidades", precioUnitario: 0 }]);
  }

  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const total = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || items.some((i) => !i.descripcion)) return;
    setLoading(true);
    try {
      await crearPedido({ clienteId, observaciones: observaciones || undefined, items });
      router.push("/pedidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1a3d2b] mb-6">Nuevo pedido</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1a3d2b] mb-1">Cliente *</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.razonSocial}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a3d2b] mb-1">Observaciones</label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-[#1a3d2b]">Ítems del pedido</h2>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-[#f47c3a] font-medium hover:underline"
            >
              + Agregar ítem
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  {i === 0 && <label className="block text-xs text-[#6b7280] mb-1">Descripción</label>}
                  <input
                    value={item.descripcion}
                    onChange={(e) => updateItem(i, "descripcion", e.target.value)}
                    required
                    placeholder="Paltas Hass"
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-[#6b7280] mb-1">Cantidad</label>}
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.cantidad}
                    onChange={(e) => updateItem(i, "cantidad", parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-[#6b7280] mb-1">Unidad</label>}
                  <select
                    value={item.unidadMedida}
                    onChange={(e) => updateItem(i, "unidadMedida", e.target.value)}
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
                  >
                    <option>unidades</option>
                    <option>kg</option>
                    <option>cajones</option>
                    <option>bolsas</option>
                  </select>
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs text-[#6b7280] mb-1">Precio unit.</label>}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) => updateItem(i, "precioUnitario", parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
                  />
                </div>
                <div className="col-span-1 flex justify-end pb-0.5">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#f3f4f6] flex justify-end">
            <span className="text-lg font-bold text-[#1a3d2b]">
              Total: ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!clienteId || loading}
            className="bg-[#f47c3a] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar pedido"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-[#e5e7eb] px-6 py-2.5 rounded-xl font-medium text-sm text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevoPedidoPage() {
  return (
    <Suspense>
      <NuevoPedidoForm />
    </Suspense>
  );
}

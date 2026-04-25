"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { registrarPago } from "@/actions/pagos";
import { getClientes } from "@/actions/clientes";

type Cliente = { id: string; razonSocial: string; saldoPendiente: number };

function NuevoPagoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteIdParam = searchParams.get("clienteId") ?? "";

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState(clienteIdParam);
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [comprobante, setComprobante] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes().then((data) => setClientes(data as Cliente[]));
  }, []);

  const clienteSeleccionado = clientes.find((c) => c.id === clienteId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !monto) return;
    setLoading(true);
    try {
      await registrarPago({
        clienteId,
        monto: parseFloat(monto),
        concepto: concepto || undefined,
        comprobante: comprobante || undefined,
      });
      router.push("/pagos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-[#1a3d2b] mb-6">Registrar pago</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm flex flex-col gap-4">
        <div>
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

        {clienteSeleccionado && clienteSeleccionado.saldoPendiente > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
            <span className="text-red-600 font-medium">Saldo pendiente: </span>
            <span className="text-red-700 font-bold">
              ${clienteSeleccionado.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#1a3d2b] mb-1">Monto *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              placeholder="0.00"
              className="w-full border border-[#e5e7eb] rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a3d2b] mb-1">Concepto</label>
          <input
            type="text"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Pago factura #123, seña, etc."
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a3d2b] mb-1">N° Comprobante</label>
          <input
            type="text"
            value={comprobante}
            onChange={(e) => setComprobante(e.target.value)}
            placeholder="Recibo, transferencia, etc."
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!clienteId || !monto || loading}
            className="bg-[#f47c3a] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Registrar pago"}
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

export default function NuevoPagoPage() {
  return (
    <Suspense>
      <NuevoPagoForm />
    </Suspense>
  );
}

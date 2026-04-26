"use client";

import { useState } from "react";
import { emitirFactura } from "@/actions/facturas";

export function EmitirFacturaButton({ facturaId }: { facturaId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmitir() {
    if (!confirm("¿Confirmar emisión de la factura a AFIP? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    setError(null);
    try {
      await emitirFactura(facturaId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleEmitir}
        disabled={loading}
        className="bg-[#16a34a] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Emitiendo..." : "Emitir a AFIP"}
      </button>
      {error && (
        <p className="text-xs text-red-500 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}

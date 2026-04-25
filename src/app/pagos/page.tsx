import { getPagosSemana, getPagos, getClientesConDeuda } from "@/actions/pagos";
import Link from "next/link";

export default async function PagosPage() {
  const [pagosSemana, todosLosPagos, clientesConDeuda] = await Promise.all([
    getPagosSemana(),
    getPagos(),
    getClientesConDeuda(),
  ]);

  const totalSemana = pagosSemana.reduce((acc, p) => acc + p.monto, 0);
  const deudaTotal = clientesConDeuda.reduce((acc, c) => acc + c.saldoPendiente, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2419]">Pagos</h1>
          <p className="text-[#5a6b5c] text-sm mt-0.5">Control de cobros y deudas</p>
        </div>
        <Link
          href="/pagos/nuevo"
          className="bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors"
        >
          + Registrar pago
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#16a34a] text-white rounded-2xl p-5">
          <div className="text-sm opacity-70 mb-1">Cobrado esta semana</div>
          <div className="text-2xl font-bold">${totalSemana.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
          <div className="text-xs opacity-60 mt-1">{pagosSemana.length} pagos</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="text-sm text-red-500 mb-1">Deuda total</div>
          <div className="text-2xl font-bold text-red-500">${deudaTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-red-500/70 mt-1">{clientesConDeuda.length} clientes</div>
        </div>
        <div className="bg-white border border-[#dde6de] rounded-2xl p-5 shadow-sm">
          <div className="text-sm text-[#5a6b5c] mb-1">Total pagos histórico</div>
          <div className="text-2xl font-bold text-[#1a2419]">
            ${todosLosPagos.reduce((acc, p) => acc + p.monto, 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#5a6b5c] mt-1">{todosLosPagos.length} pagos</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-3">Pagos esta semana</h2>
          <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
            {pagosSemana.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5a6b5c]">Sin pagos esta semana</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#9aab9d]">Cliente</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#9aab9d]">Fecha</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-[#9aab9d]">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosSemana.map((p, i) => (
                    <tr key={p.id} className={`border-b border-[#dde6de] hover:bg-[#f7faf7] transition-colors ${i === pagosSemana.length - 1 ? "border-0" : ""}`}>
                      <td className="px-4 py-3 font-medium text-[#1a2419]">{p.cliente.razonSocial}</td>
                      <td className="px-4 py-3 text-[#5a6b5c]">{new Date(p.fecha).toLocaleDateString("es-AR")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#16a34a]">
                        ${p.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-[#9aab9d] text-xs uppercase tracking-widest mb-3">Clientes con deuda</h2>
          <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
            {clientesConDeuda.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5a6b5c]">Sin deudas pendientes</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#9aab9d]">Cliente</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-[#9aab9d]">Saldo</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {clientesConDeuda.map((c, i) => (
                    <tr key={c.id} className={`border-b border-[#dde6de] hover:bg-[#f7faf7] transition-colors ${i === clientesConDeuda.length - 1 ? "border-0" : ""}`}>
                      <td className="px-4 py-3 font-medium text-[#1a2419]">{c.razonSocial}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-500">
                        ${c.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/pagos/nuevo?clienteId=${c.id}`} className="text-[#ea580c] text-xs font-medium hover:underline">
                          Cobrar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

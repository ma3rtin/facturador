import { getClientes } from "@/actions/clientes";
import Link from "next/link";

const condicionLabel: Record<string, string> = {
  RESPONSABLE_INSCRIPTO: "Resp. Inscripto",
  MONOTRIBUTISTA: "Monotributista",
  EXENTO: "Exento",
  CONSUMIDOR_FINAL: "Cons. Final",
  NO_RESPONSABLE: "No Responsable",
};

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3d2b]">Clientes</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">{clientes.length} clientes registrados</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-[#f47c3a] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-[#6b7280]">No hay clientes todavía.</p>
          <Link href="/clientes/nuevo" className="mt-4 inline-block text-[#f47c3a] font-medium hover:underline">
            Agregar el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Razón Social</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">CUIT</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Condición IVA</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1a3d2b]">Zona</th>
                <th className="text-right px-5 py-3 font-semibold text-[#1a3d2b]">Saldo</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-[#f3f4f6] hover:bg-[#fdf8f0] transition-colors ${i === clientes.length - 1 ? "border-0" : ""}`}
                >
                  <td className="px-5 py-3.5 font-medium text-[#1a3d2b]">{c.razonSocial}</td>
                  <td className="px-5 py-3.5 text-[#6b7280] font-mono text-xs">{c.cuit ?? c.dni ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-[#f0faf4] text-[#2d6a4f] px-2 py-0.5 rounded-full text-xs font-medium">
                      {condicionLabel[c.condicionIVA]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#6b7280]">{c.zona ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={c.saldoPendiente > 0 ? "text-red-500 font-semibold" : "text-[#2d6a4f] font-medium"}>
                      ${c.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/clientes/${c.id}`} className="text-[#f47c3a] hover:underline font-medium">
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

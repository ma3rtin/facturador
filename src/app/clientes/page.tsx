import { getClientes } from "@/actions/clientes";
import Link from "next/link";
import { Users } from "lucide-react";

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
          <h1 className="text-2xl font-bold text-[#1a2419]">Clientes</h1>
          <p className="text-[#5a6b5c] text-sm mt-0.5">{clientes.length} clientes registrados</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#c2410c] transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#dde6de] p-16 text-center shadow-sm">
          <Users className="mx-auto mb-4 text-[#9aab9d]" size={40} />
          <p className="text-[#5a6b5c]">No hay clientes todavía.</p>
          <Link href="/clientes/nuevo" className="mt-4 inline-block text-[#ea580c] font-medium hover:underline">
            Agregar el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#dde6de] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f2f5f2] border-b border-[#dde6de]">
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Razón Social</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">CUIT</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Condición IVA</th>
                <th className="text-left px-5 py-3 font-semibold text-[#9aab9d]">Zona</th>
                <th className="text-right px-5 py-3 font-semibold text-[#9aab9d]">Saldo</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-[#dde6de] hover:bg-[#f7faf7] transition-colors ${i === clientes.length - 1 ? "border-0" : ""}`}
                >
                  <td className="px-5 py-3.5 font-medium text-[#1a2419]">{c.razonSocial}</td>
                  <td className="px-5 py-3.5 text-[#5a6b5c] font-mono text-xs">{c.cuit ?? c.dni ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {condicionLabel[c.condicionIVA]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#5a6b5c]">{c.zona ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={c.saldoPendiente > 0 ? "text-red-500 font-semibold" : "text-[#16a34a] font-medium"}>
                      ${c.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/clientes/${c.id}`} className="text-[#ea580c] hover:underline font-medium">
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

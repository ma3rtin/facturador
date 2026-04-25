import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalClientes, pedidosHoy, clientesConDeuda, facturasEmitidas] =
    await Promise.all([
      prisma.cliente.count(),
      prisma.pedido.count({
        where: { fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.cliente.aggregate({
        _sum: { saldoPendiente: true },
        where: { saldoPendiente: { gt: 0 } },
      }),
      prisma.factura.count({ where: { estado: "EMITIDA" } }),
    ]);

  return {
    totalClientes,
    pedidosHoy,
    deudaTotal: clientesConDeuda._sum.saldoPendiente ?? 0,
    facturasEmitidas,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <p className="text-[#9aab9d] text-xs uppercase tracking-widest mb-1">Panel general</p>
        <h1 className="text-3xl font-bold text-[#1a2419]">La Paltería</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href="/clientes" className="group bg-white border border-[#dde6de] rounded-xl p-6 hover:border-[#16a34a]/40 transition-colors shadow-sm">
          <div className="text-[#9aab9d] text-xs uppercase tracking-wider mb-3">Clientes</div>
          <div className="text-4xl font-bold text-[#1a2419] tabular-nums">{stats.totalClientes}</div>
        </Link>

        <Link href="/pedidos" className="group bg-white border border-[#dde6de] rounded-xl p-6 hover:border-[#16a34a]/40 transition-colors shadow-sm">
          <div className="text-[#9aab9d] text-xs uppercase tracking-wider mb-3">Pedidos hoy</div>
          <div className="text-4xl font-bold text-[#1a2419] tabular-nums">{stats.pedidosHoy}</div>
        </Link>

        <Link href="/pagos" className="group bg-white border border-[#dde6de] rounded-xl p-6 hover:border-[#ea580c]/40 transition-colors shadow-sm">
          <div className="text-[#9aab9d] text-xs uppercase tracking-wider mb-3">Deuda pendiente</div>
          <div className="text-4xl font-bold text-[#ea580c] tabular-nums">
            ${stats.deudaTotal.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </div>
        </Link>

        <Link href="/facturacion" className="group bg-white border border-[#dde6de] rounded-xl p-6 hover:border-[#16a34a]/40 transition-colors shadow-sm">
          <div className="text-[#9aab9d] text-xs uppercase tracking-wider mb-3">Facturas emitidas</div>
          <div className="text-4xl font-bold text-[#1a2419] tabular-nums">{stats.facturasEmitidas}</div>
        </Link>
      </div>

      <div className="border-t border-[#dde6de] pt-8">
        <p className="text-[#9aab9d] text-xs uppercase tracking-widest mb-4">Acciones rápidas</p>
        <div className="flex gap-3 flex-wrap">
          {[
            { href: "/clientes/nuevo", label: "Nuevo cliente" },
            { href: "/pedidos/nuevo", label: "Nuevo pedido" },
            { href: "/pagos/nuevo", label: "Registrar pago" },
            { href: "/facturacion/nueva", label: "Nueva factura" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white border border-[#dde6de] text-[#1a2419] text-sm px-4 py-2 rounded-lg hover:border-[#16a34a]/50 hover:text-[#16a34a] transition-colors shadow-sm"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

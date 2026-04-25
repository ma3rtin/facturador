import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalClientes, pedidosHoy, clientesConDeuda, facturasEmitidas] =
    await Promise.all([
      prisma.cliente.count(),
      prisma.pedido.count({
        where: {
          fecha: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
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

  const cards = [
    {
      label: "Clientes",
      value: stats.totalClientes,
      icon: "👥",
      href: "/clientes",
      color: "bg-[#1a3d2b]",
    },
    {
      label: "Pedidos hoy",
      value: stats.pedidosHoy,
      icon: "📋",
      href: "/pedidos",
      color: "bg-[#2d6a4f]",
    },
    {
      label: "Deuda total",
      value: `$${stats.deudaTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      icon: "💰",
      href: "/pagos",
      color: "bg-[#f47c3a]",
    },
    {
      label: "Facturas emitidas",
      value: stats.facturasEmitidas,
      icon: "🧾",
      href: "/facturacion",
      color: "bg-[#52b788]",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a3d2b]">Bienvenido 🥑</h1>
        <p className="text-[#6b7280] mt-1">Resumen del sistema — La Paltería</p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-10 max-w-3xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.color} text-white rounded-2xl p-6 flex items-center gap-5 hover:opacity-90 transition-opacity shadow-sm`}
          >
            <span className="text-4xl">{card.icon}</span>
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm opacity-80">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb]">
          <h2 className="font-semibold text-[#1a3d2b] mb-4">Accesos rápidos</h2>
          <div className="flex flex-col gap-2">
            <Link href="/clientes/nuevo" className="text-sm text-[#f47c3a] hover:underline font-medium">
              + Nuevo cliente
            </Link>
            <Link href="/pedidos/nuevo" className="text-sm text-[#f47c3a] hover:underline font-medium">
              + Nuevo pedido
            </Link>
            <Link href="/pagos/nuevo" className="text-sm text-[#f47c3a] hover:underline font-medium">
              + Registrar pago
            </Link>
            <Link href="/facturacion/nueva" className="text-sm text-[#f47c3a] hover:underline font-medium">
              + Nueva factura
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb]">
          <h2 className="font-semibold text-[#1a3d2b] mb-4">Sistema</h2>
          <div className="flex flex-col gap-1 text-sm text-[#6b7280]">
            <span>Distribuidora de Paltas</span>
            <span>Castelar, Buenos Aires</span>
            <span className="mt-2 text-xs bg-[#fdf8f0] rounded px-2 py-1 text-[#2d6a4f] font-medium w-fit border border-[#52b788]">
              AFIP · Pendiente de configuración
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import { EstadoPedido } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function getPedidosDelDia() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  return prisma.pedido.findMany({
    where: { fecha: { gte: hoy, lt: manana } },
    include: { cliente: true, items: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPedidos() {
  return prisma.pedido.findMany({
    include: { cliente: true, items: true },
    orderBy: { fecha: "desc" },
    take: 100,
  });
}

export async function crearPedido(data: {
  clienteId: string;
  observaciones?: string;
  items: {
    descripcion: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
  }[];
}) {
  const total = data.items.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0
  );

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: data.clienteId,
      observaciones: data.observaciones,
      total,
      items: {
        create: data.items.map((item) => ({
          ...item,
          subtotal: item.cantidad * item.precioUnitario,
        })),
      },
    },
    include: { items: true, cliente: true },
  });

  revalidatePath("/pedidos");
  return pedido;
}

export async function getPedido(id: string) {
  return prisma.pedido.findUnique({
    where: { id },
    include: { cliente: true, items: true, facturas: { select: { id: true, tipoFactura: true, puntoVenta: true, numeroComprobante: true, estado: true, importeTotal: true } } },
  });
}

export async function actualizarEstadoPedido(id: string, estado: EstadoPedido) {
  const pedido = await prisma.pedido.update({ where: { id }, data: { estado } });
  revalidatePath("/pedidos");
  return pedido;
}

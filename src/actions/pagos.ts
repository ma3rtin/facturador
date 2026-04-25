"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPagos() {
  return prisma.pago.findMany({
    include: { cliente: true },
    orderBy: { fecha: "desc" },
    take: 100,
  });
}

export async function getPagosSemana() {
  const lunes = new Date();
  lunes.setDate(lunes.getDate() - lunes.getDay() + 1);
  lunes.setHours(0, 0, 0, 0);

  return prisma.pago.findMany({
    where: { fecha: { gte: lunes } },
    include: { cliente: true },
    orderBy: { fecha: "desc" },
  });
}

export async function registrarPago(data: {
  clienteId: string;
  monto: number;
  concepto?: string;
  comprobante?: string;
}) {
  const pago = await prisma.pago.create({ data });

  await prisma.cliente.update({
    where: { id: data.clienteId },
    data: { saldoPendiente: { decrement: data.monto } },
  });

  revalidatePath("/pagos");
  revalidatePath(`/clientes/${data.clienteId}`);
  return pago;
}

export async function getClientesConDeuda() {
  return prisma.cliente.findMany({
    where: { saldoPendiente: { gt: 0 } },
    orderBy: { saldoPendiente: "desc" },
  });
}

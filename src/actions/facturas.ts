"use server";

import { prisma } from "@/lib/prisma";
import { TipoFactura } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function getFacturas() {
  return prisma.factura.findMany({
    include: { cliente: true, items: true },
    orderBy: { fecha: "desc" },
    take: 100,
  });
}

export async function getFactura(id: string) {
  return prisma.factura.findUnique({
    where: { id },
    include: { cliente: true, items: true },
  });
}

export async function crearFactura(data: {
  clienteId: string;
  pedidoId?: string;
  tipoFactura: TipoFactura;
  puntoVenta: number;
  condicionVenta: string;
  observaciones?: string;
  items: {
    descripcion: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
    alicuotaIVA: number;
    bonificacion: number;
  }[];
}) {
  let importeNeto = 0;
  let importeIVA = 0;

  const itemsConCalculo = data.items.map((item) => {
    const subtotal =
      item.precioUnitario * item.cantidad * (1 - item.bonificacion / 100);
    const ivaItem = subtotal * (item.alicuotaIVA / 100);
    importeNeto += subtotal;
    importeIVA += ivaItem;
    return {
      ...item,
      subtotal,
      subtotalConIVA: subtotal + ivaItem,
    };
  });

  const ultimo = await prisma.factura.findFirst({
    where: {
      tipoFactura: data.tipoFactura,
      puntoVenta: data.puntoVenta,
    },
    orderBy: { numeroComprobante: "desc" },
  });

  const numeroComprobante = (ultimo?.numeroComprobante ?? 0) + 1;

  const factura = await prisma.factura.create({
    data: {
      clienteId: data.clienteId,
      pedidoId: data.pedidoId,
      tipoFactura: data.tipoFactura,
      puntoVenta: data.puntoVenta,
      numeroComprobante,
      condicionVenta: data.condicionVenta,
      observaciones: data.observaciones,
      importeNeto,
      importeIVA,
      importeTotal: importeNeto + importeIVA,
      estado: "BORRADOR",
      items: { create: itemsConCalculo },
    },
    include: { cliente: true, items: true },
  });

  await prisma.cliente.update({
    where: { id: data.clienteId },
    data: { saldoPendiente: { increment: importeNeto + importeIVA } },
  });

  revalidatePath("/facturacion");
  return factura;
}

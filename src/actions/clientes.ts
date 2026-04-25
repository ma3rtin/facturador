"use server";

import { prisma } from "@/lib/prisma";
import { CondicionIVA } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function getClientes() {
  return prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } });
}

export async function getCliente(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      pedidos: { orderBy: { fecha: "desc" }, take: 10 },
      pagos: { orderBy: { fecha: "desc" }, take: 10 },
      facturas: { orderBy: { fecha: "desc" }, take: 10 },
    },
  });
}

export async function crearCliente(data: {
  razonSocial: string;
  cuit?: string;
  dni?: string;
  condicionIVA: CondicionIVA;
  domicilio?: string;
  zona?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
}) {
  const cliente = await prisma.cliente.create({ data });
  revalidatePath("/clientes");
  return cliente;
}

export async function actualizarCliente(
  id: string,
  data: {
    razonSocial?: string;
    cuit?: string;
    dni?: string;
    condicionIVA?: CondicionIVA;
    domicilio?: string;
    zona?: string;
    telefono?: string;
    email?: string;
    observaciones?: string;
  }
) {
  const cliente = await prisma.cliente.update({ where: { id }, data });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return cliente;
}

export async function eliminarCliente(id: string) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/clientes");
}

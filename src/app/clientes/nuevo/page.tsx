"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCliente } from "@/actions/clientes";
import { CondicionIVA } from "@/generated/prisma/enums";

const condicionOpciones: { value: CondicionIVA; label: string }[] = [
  { value: "RESPONSABLE_INSCRIPTO", label: "IVA Responsable Inscripto" },
  { value: "MONOTRIBUTISTA", label: "Monotributista" },
  { value: "EXENTO", label: "Exento" },
  { value: "CONSUMIDOR_FINAL", label: "Consumidor Final" },
  { value: "NO_RESPONSABLE", label: "No Responsable" },
];

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    razonSocial: "",
    cuit: "",
    dni: "",
    condicionIVA: "CONSUMIDOR_FINAL" as CondicionIVA,
    domicilio: "",
    zona: "",
    telefono: "",
    email: "",
    observaciones: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const cliente = await crearCliente({
        ...form,
        cuit: form.cuit || undefined,
        dni: form.dni || undefined,
        domicilio: form.domicilio || undefined,
        zona: form.zona || undefined,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
        observaciones: form.observaciones || undefined,
      });
      router.push(`/clientes/${cliente.id}`);
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-[#1a3d2b] mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a3d2b]">Nuevo cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm flex flex-col gap-4">
        {field("Razón Social / Nombre *", "razonSocial", "text", "Ej: Juan García")}

        <div className="grid grid-cols-2 gap-4">
          {field("CUIT", "cuit", "text", "20-12345678-9")}
          {field("DNI", "dni", "text", "12.345.678")}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a3d2b] mb-1">Condición frente al IVA</label>
          <select
            value={form.condicionIVA}
            onChange={(e) => setForm((f) => ({ ...f, condicionIVA: e.target.value as CondicionIVA }))}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
          >
            {condicionOpciones.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {field("Domicilio", "domicilio", "text", "Av. Corrientes 1234, CABA")}

        <div className="grid grid-cols-2 gap-4">
          {field("Zona", "zona", "text", "Zona Norte")}
          {field("Teléfono", "telefono", "tel", "11 1234-5678")}
        </div>

        {field("Email", "email", "email", "cliente@ejemplo.com")}

        <div>
          <label className="block text-sm font-medium text-[#1a3d2b] mb-1">Observaciones</label>
          <textarea
            value={form.observaciones}
            onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
            rows={3}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!form.razonSocial || loading}
            className="bg-[#f47c3a] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e06828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar cliente"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-[#e5e7eb] px-6 py-2.5 rounded-xl font-medium text-sm text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

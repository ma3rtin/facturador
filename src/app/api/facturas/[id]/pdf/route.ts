import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ReactElement } from "react";
import { getFactura } from "@/actions/facturas";
import { FacturaPDF } from "@/lib/pdf/factura-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) return new Response("Not found", { status: 404 });

  const pv = String(factura.puntoVenta).padStart(5, "0");
  const num = String(factura.numeroComprobante ?? 0).padStart(8, "0");
  const filename = `factura-${factura.tipoFactura}-${pv}-${num}.pdf`;

  const element = createElement(FacturaPDF, { factura }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

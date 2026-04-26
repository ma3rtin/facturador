import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

type ItemFactura = {
  id: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  alicuotaIVA: number;
  bonificacion: number;
  subtotal: number;
  subtotalConIVA: number;
};

type FacturaPDFData = {
  tipoFactura: string;
  puntoVenta: number;
  numeroComprobante: number | null;
  fecha: Date;
  condicionVenta: string;
  estado: string;
  cae: string | null;
  caeFechaVto: Date | null;
  importeNeto: number;
  importeIVA: number;
  importeTotal: number;
  observaciones: string | null;
  cliente: {
    razonSocial: string;
    cuit: string | null;
    domicilio: string | null;
    condicionIVA: string;
  };
  items: ItemFactura[];
};

type Props = {
  factura: FacturaPDFData;
  emisor?: {
    razonSocial: string;
    cuit: string;
    domicilio: string;
    condicionIVA: string;
    iibb: string;
    inicioActividades: string;
  };
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 8, padding: 40, color: "#1a2419", backgroundColor: "#ffffff" },

  // Header
  headerRow: { flexDirection: "row", borderBottom: "2pt solid #1a3d2b", paddingBottom: 10, marginBottom: 10 },
  emisorCol: { flex: 1, paddingRight: 10 },
  typeBox: { width: 70, borderLeft: "1pt solid #1a3d2b", borderRight: "1pt solid #1a3d2b", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  comprobanteCol: { width: 180, paddingLeft: 10 },

  emisorName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#1a3d2b", marginBottom: 3 },
  emisorLine: { marginBottom: 2, color: "#5a6b5c" },
  typeLabel: { fontSize: 7, color: "#5a6b5c", textAlign: "center", marginBottom: 2 },
  typeLetter: { fontSize: 48, fontFamily: "Helvetica-Bold", color: "#1a3d2b", textAlign: "center", lineHeight: 1 },
  typeOriginal: { fontSize: 7, color: "#5a6b5c", textAlign: "center", marginTop: 2, borderTop: "0.5pt solid #dde6de", paddingTop: 3 },
  compTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a3d2b", marginBottom: 5 },
  compRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  compLabel: { color: "#5a6b5c" },
  compValue: { fontFamily: "Helvetica-Bold" },

  // Receptor
  receptorBox: { borderTop: "0.5pt solid #dde6de", paddingTop: 8, marginBottom: 10 },
  receptorTitle: { fontSize: 7, color: "#9aab9d", textTransform: "uppercase", marginBottom: 5 },
  receptorRow: { flexDirection: "row", marginBottom: 2 },
  receptorLabel: { width: 60, color: "#5a6b5c" },
  receptorValue: { flex: 1, fontFamily: "Helvetica-Bold" },

  // Items table
  tableHeader: { flexDirection: "row", backgroundColor: "#f2f5f2", paddingVertical: 5, paddingHorizontal: 6, borderTop: "0.5pt solid #dde6de", borderBottom: "0.5pt solid #dde6de", marginBottom: 0 },
  tableHeaderCell: { color: "#9aab9d", fontFamily: "Helvetica-Bold", fontSize: 7 },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottom: "0.5pt solid #f2f5f2" },
  tableCell: { fontSize: 8 },

  colDesc: { flex: 1 },
  colCant: { width: 35, textAlign: "right" },
  colUnit: { width: 45, textAlign: "center" },
  colPrecio: { width: 60, textAlign: "right" },
  colBonif: { width: 40, textAlign: "right" },
  colIva: { width: 35, textAlign: "right" },
  colSubtotal: { width: 65, textAlign: "right" },

  // Totals
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6 },
  totalsBox: { width: 220, borderTop: "0.5pt solid #dde6de", paddingTop: 8 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  totalLabel: { color: "#5a6b5c" },
  totalValue: { fontFamily: "Helvetica-Bold" },
  grandTotalLine: { flexDirection: "row", justifyContent: "space-between", borderTop: "1pt solid #1a3d2b", marginTop: 4, paddingTop: 4 },
  grandTotalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a3d2b" },
  grandTotalValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a3d2b" },

  // Observaciones
  obsBox: { marginTop: 8, paddingTop: 6, borderTop: "0.5pt solid #dde6de" },
  obsLabel: { color: "#9aab9d", fontSize: 7, marginBottom: 2 },
  obsText: { color: "#5a6b5c" },

  // CAE box
  caeBox: { marginTop: 14, flexDirection: "row", border: "1pt solid #1a3d2b", padding: 8, alignItems: "center" },
  caeLabel: { fontSize: 7, color: "#9aab9d", textTransform: "uppercase", marginBottom: 2 },
  caeValue: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#1a3d2b" },
  caeVtoLabel: { fontSize: 7, color: "#9aab9d", marginBottom: 2 },
  caeVtoValue: { fontFamily: "Helvetica-Bold" },
  caeSpacer: { flex: 1 },
  borradorBanner: { marginTop: 14, padding: 8, backgroundColor: "#fefce8", border: "1pt solid #fde047", textAlign: "center", color: "#a16207", fontSize: 9 },
});

const fmt = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("es-AR");
const padPV = (n: number) => String(n).padStart(5, "0");
const padNum = (n: number | null) => String(n ?? 0).padStart(8, "0");

const DEFAULT_EMISOR = {
  razonSocial: process.env.EMISOR_RAZON_SOCIAL ?? "La Paltería",
  cuit: process.env.EMISOR_CUIT ?? "—",
  domicilio: process.env.EMISOR_DOMICILIO ?? "—",
  condicionIVA: process.env.EMISOR_CONDICION_IVA ?? "Monotributista",
  iibb: process.env.EMISOR_IIBB ?? "—",
  inicioActividades: process.env.EMISOR_INICIO_ACTIVIDADES ?? "—",
};

export function FacturaPDF({ factura, emisor = DEFAULT_EMISOR }: Props) {
  const nroComprobante = `${padPV(factura.puntoVenta)}-${padNum(factura.numeroComprobante)}`;
  const tipoLabel = {
    A: "Factura A", B: "Factura B", C: "Factura C", M: "Factura M", X: "Recibo X",
  }[factura.tipoFactura] ?? `Comprobante ${factura.tipoFactura}`;

  return (
    <Document title={`${tipoLabel} ${nroComprobante}`}>
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.headerRow}>
          <View style={s.emisorCol}>
            <Text style={s.emisorName}>{emisor.razonSocial}</Text>
            <Text style={s.emisorLine}>{emisor.domicilio}</Text>
            <Text style={s.emisorLine}>CUIT: {emisor.cuit}</Text>
            <Text style={s.emisorLine}>Ingresos Brutos: {emisor.iibb}</Text>
            <Text style={s.emisorLine}>Inicio actividades: {emisor.inicioActividades}</Text>
            <Text style={s.emisorLine}>Condición IVA: {emisor.condicionIVA}</Text>
          </View>

          <View style={s.typeBox}>
            <Text style={s.typeLabel}>COD.</Text>
            <Text style={s.typeLetter}>{factura.tipoFactura}</Text>
            <Text style={s.typeOriginal}>ORIGINAL</Text>
          </View>

          <View style={s.comprobanteCol}>
            <Text style={s.compTitle}>{tipoLabel}</Text>
            <View style={s.compRow}>
              <Text style={s.compLabel}>Punto de venta:</Text>
              <Text style={s.compValue}>{padPV(factura.puntoVenta)}</Text>
            </View>
            <View style={s.compRow}>
              <Text style={s.compLabel}>Comprobante N°:</Text>
              <Text style={s.compValue}>{padNum(factura.numeroComprobante)}</Text>
            </View>
            <View style={s.compRow}>
              <Text style={s.compLabel}>Fecha:</Text>
              <Text style={s.compValue}>{fmtDate(factura.fecha)}</Text>
            </View>
            <View style={s.compRow}>
              <Text style={s.compLabel}>Cond. de venta:</Text>
              <Text style={s.compValue}>{factura.condicionVenta}</Text>
            </View>
          </View>
        </View>

        {/* RECEPTOR */}
        <View style={s.receptorBox}>
          <Text style={s.receptorTitle}>Datos del receptor</Text>
          <View style={s.receptorRow}>
            <Text style={s.receptorLabel}>Razón social:</Text>
            <Text style={s.receptorValue}>{factura.cliente.razonSocial}</Text>
          </View>
          {factura.cliente.domicilio ? (
            <View style={s.receptorRow}>
              <Text style={s.receptorLabel}>Domicilio:</Text>
              <Text style={s.receptorValue}>{factura.cliente.domicilio}</Text>
            </View>
          ) : null}
          <View style={s.receptorRow}>
            <Text style={s.receptorLabel}>CUIT:</Text>
            <Text style={s.receptorValue}>{factura.cliente.cuit ?? "—"}</Text>
            <Text style={[s.receptorLabel, { marginLeft: 20 }]}>Cond. IVA:</Text>
            <Text style={s.receptorValue}>{factura.cliente.condicionIVA.replace(/_/g, " ")}</Text>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, s.colDesc]}>Descripción</Text>
          <Text style={[s.tableHeaderCell, s.colCant]}>Cant.</Text>
          <Text style={[s.tableHeaderCell, s.colUnit]}>Unidad</Text>
          <Text style={[s.tableHeaderCell, s.colPrecio]}>P. Unit.</Text>
          <Text style={[s.tableHeaderCell, s.colBonif]}>Bonif.</Text>
          <Text style={[s.tableHeaderCell, s.colIva]}>IVA</Text>
          <Text style={[s.tableHeaderCell, s.colSubtotal]}>Subtotal</Text>
        </View>
        {factura.items.map((item) => (
          <View key={item.id} style={s.tableRow}>
            <Text style={[s.tableCell, s.colDesc]}>{item.descripcion}</Text>
            <Text style={[s.tableCell, s.colCant]}>{item.cantidad}</Text>
            <Text style={[s.tableCell, s.colUnit]}>{item.unidadMedida}</Text>
            <Text style={[s.tableCell, s.colPrecio]}>${fmt(item.precioUnitario)}</Text>
            <Text style={[s.tableCell, s.colBonif]}>{item.bonificacion}%</Text>
            <Text style={[s.tableCell, s.colIva]}>{item.alicuotaIVA}%</Text>
            <Text style={[s.tableCell, s.colSubtotal]}>${fmt(item.subtotalConIVA)}</Text>
          </View>
        ))}

        {/* TOTALS */}
        <View style={s.totalsRow}>
          <View style={s.totalsBox}>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>Importe neto gravado</Text>
              <Text style={s.totalValue}>${fmt(factura.importeNeto)}</Text>
            </View>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>IVA</Text>
              <Text style={s.totalValue}>${fmt(factura.importeIVA)}</Text>
            </View>
            <View style={s.grandTotalLine}>
              <Text style={s.grandTotalLabel}>TOTAL</Text>
              <Text style={s.grandTotalValue}>${fmt(factura.importeTotal)}</Text>
            </View>
          </View>
        </View>

        {/* OBSERVACIONES */}
        {factura.observaciones ? (
          <View style={s.obsBox}>
            <Text style={s.obsLabel}>Observaciones</Text>
            <Text style={s.obsText}>{factura.observaciones}</Text>
          </View>
        ) : null}

        {/* CAE */}
        {factura.cae ? (
          <View style={s.caeBox}>
            <View>
              <Text style={s.caeLabel}>CAE N°</Text>
              <Text style={s.caeValue}>{factura.cae}</Text>
            </View>
            <View style={s.caeSpacer} />
            {factura.caeFechaVto ? (
              <View>
                <Text style={s.caeVtoLabel}>Fecha Vto. CAE</Text>
                <Text style={s.caeVtoValue}>{fmtDate(factura.caeFechaVto)}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={s.borradorBanner}>
            <Text>BORRADOR — Este comprobante no tiene CAE. No tiene validez fiscal.</Text>
          </View>
        )}

      </Page>
    </Document>
  );
}

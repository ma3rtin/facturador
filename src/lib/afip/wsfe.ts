import { getTicketAcceso } from "./wsaa";

const WSFE_URL = {
  production:   "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
  homologacion: "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
};

// Códigos AFIP para tipo de comprobante
const CBTE_TIPO: Record<string, number> = {
  A: 1,
  B: 6,
  C: 11,
  M: 51,
};

// Códigos AFIP para alícuota IVA
const IVA_ID: Record<number, number> = {
  0:    3,
  2.5:  9,
  5:    8,
  10.5: 4,
  21:   5,
  27:   6,
};

export interface SolicitudCAE {
  tipoFactura: string;
  puntoVenta: number;
  numeroComprobante: number;
  fecha: Date;
  cuit: string | null;
  importeNeto: number;
  importeIVA: number;
  importeTotal: number;
  items: {
    alicuotaIVA: number;
    subtotal: number;
  }[];
}

export interface ResultadoCAE {
  cae: string;
  caeFechaVto: Date;
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

function fmtFecha(d: Date): string {
  const dd = String(new Date(d).getDate()).padStart(2, "0");
  const mm = String(new Date(d).getMonth() + 1).padStart(2, "0");
  const yyyy = new Date(d).getFullYear();
  return `${yyyy}${mm}${dd}`;
}

function buildIvaXml(items: SolicitudCAE["items"]): string {
  // Agrupa los ítems por alícuota y suma bases e importes
  const grupos = new Map<number, { base: number; importe: number }>();
  for (const item of items) {
    const id = IVA_ID[item.alicuotaIVA] ?? 5;
    const existing = grupos.get(id) ?? { base: 0, importe: 0 };
    grupos.set(id, {
      base: existing.base + item.subtotal,
      importe: existing.importe + item.subtotal * (item.alicuotaIVA / 100),
    });
  }

  return Array.from(grupos.entries())
    .map(([id, { base, importe }]) => `
              <ar:AlicIva>
                <ar:Id>${id}</ar:Id>
                <ar:BaseImp>${fmt2(base)}</ar:BaseImp>
                <ar:Importe>${fmt2(importe)}</ar:Importe>
              </ar:AlicIva>`)
    .join("");
}

function buildSoapRequest(
  token: string,
  sign: string,
  cuit: string,
  sol: SolicitudCAE
): string {
  const cbteTipo = CBTE_TIPO[sol.tipoFactura];
  if (!cbteTipo) throw new Error(`Tipo de factura no soportado por WSFE: ${sol.tipoFactura}`);

  const docTipo = sol.cuit ? 80 : 99;
  const docNro  = sol.cuit ? sol.cuit.replace(/-/g, "") : "0";

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECAESolicitar>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${cuit.replace(/-/g, "")}</ar:Cuit>
      </ar:Auth>
      <ar:FeCAEReq>
        <ar:FeCabReq>
          <ar:CantReg>1</ar:CantReg>
          <ar:PtoVta>${sol.puntoVenta}</ar:PtoVta>
          <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
        </ar:FeCabReq>
        <ar:FeDetReq>
          <ar:FECAEDetRequest>
            <ar:Concepto>1</ar:Concepto>
            <ar:DocTipo>${docTipo}</ar:DocTipo>
            <ar:DocNro>${docNro}</ar:DocNro>
            <ar:CbteDesde>${sol.numeroComprobante}</ar:CbteDesde>
            <ar:CbteHasta>${sol.numeroComprobante}</ar:CbteHasta>
            <ar:CbteFch>${fmtFecha(sol.fecha)}</ar:CbteFch>
            <ar:ImpTotal>${fmt2(sol.importeTotal)}</ar:ImpTotal>
            <ar:ImpTotConc>0.00</ar:ImpTotConc>
            <ar:ImpNeto>${fmt2(sol.importeNeto)}</ar:ImpNeto>
            <ar:ImpOpEx>0.00</ar:ImpOpEx>
            <ar:ImpTrib>0.00</ar:ImpTrib>
            <ar:ImpIVA>${fmt2(sol.importeIVA)}</ar:ImpIVA>
            <ar:MonId>PES</ar:MonId>
            <ar:MonCotiz>1</ar:MonCotiz>
            <ar:Iva>${buildIvaXml(sol.items)}</ar:Iva>
          </ar:FECAEDetRequest>
        </ar:FeDetReq>
      </ar:FeCAEReq>
    </ar:FECAESolicitar>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function parseCAEResponse(xml: string): ResultadoCAE {
  const resultado = xml.match(/<Resultado>([\s\S]*?)<\/Resultado>/)?.[1]?.trim();
  if (resultado !== "A") {
    const obs = xml.match(/<Msg>([\s\S]*?)<\/Msg>/g)
      ?.map((m) => m.replace(/<\/?Msg>/g, "").trim())
      .join("; ");
    throw new Error(`WSFE rechazó la solicitud. ${obs ?? xml}`);
  }

  const cae     = xml.match(/<CAE>([\s\S]*?)<\/CAE>/)?.[1]?.trim();
  const fchVto  = xml.match(/<CAEFchVto>([\s\S]*?)<\/CAEFchVto>/)?.[1]?.trim();

  if (!cae || !fchVto) throw new Error(`WSFE no devolvió CAE.\nRespuesta: ${xml}`);

  // fchVto viene como YYYYMMDD
  const year  = parseInt(fchVto.slice(0, 4));
  const month = parseInt(fchVto.slice(4, 6)) - 1;
  const day   = parseInt(fchVto.slice(6, 8));

  return { cae, caeFechaVto: new Date(year, month, day) };
}

export async function solicitarCAE(sol: SolicitudCAE): Promise<ResultadoCAE> {
  const emisorCuit = process.env.AFIP_CUIT;
  if (!emisorCuit) throw new Error("AFIP_CUIT no configurado en variables de entorno");

  const { token, sign } = await getTicketAcceso("wsfe");
  const env = (process.env.AFIP_ENV === "production" ? "production" : "homologacion") as keyof typeof WSFE_URL;

  const soapBody = buildSoapRequest(token, sign, emisorCuit, sol);

  const res = await fetch(WSFE_URL[env], {
    method: "POST",
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      "SOAPAction": "http://ar.gov.afip.dif.FEV1/FECAESolicitar",
    },
    body: soapBody,
  });

  const xml = await res.text();
  return parseCAEResponse(xml);
}

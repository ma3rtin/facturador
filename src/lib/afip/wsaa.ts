import * as forge from "node-forge";

const WSAA_URL = {
  production:   "https://wsaa.afip.gov.ar/ws/services/LoginCms",
  homologacion: "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
};

interface Ticket {
  token: string;
  sign: string;
  expiracion: Date;
}

// In-memory cache — válido por ~11hs (AFIP emite tickets de 12hs)
let _ticket: Ticket | null = null;

function buildTRA(servicio: string): string {
  const now = new Date();
  const desde = new Date(now.getTime() - 5 * 60 * 1000);
  const hasta = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const uniqueId = Math.floor(now.getTime() / 1000);

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${uniqueId}</uniqueId>
    <generationTime>${desde.toISOString().replace(/\.\d{3}Z$/, "-03:00")}</generationTime>
    <expirationTime>${hasta.toISOString().replace(/\.\d{3}Z$/, "-03:00")}</expirationTime>
  </header>
  <service>${servicio}</service>
</loginTicketRequest>`;
}

function signTRA(tra: string): string {
  const certPem = Buffer.from(process.env.AFIP_CERT!, "base64").toString("utf-8");
  const keyPem  = Buffer.from(process.env.AFIP_KEY!,  "base64").toString("utf-8");

  const cert = forge.pki.certificateFromPem(certPem);
  const key  = forge.pki.privateKeyFromPem(keyPem);

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, "utf8");
  p7.addCertificate(cert);
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
    ],
  });
  p7.sign({ detached: false });

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Buffer.from(der, "binary").toString("base64");
}

function parseTicket(xml: string): Ticket {
  const token = xml.match(/<token>([\s\S]*?)<\/token>/)?.[1]?.trim();
  const sign  = xml.match(/<sign>([\s\S]*?)<\/sign>/)?.[1]?.trim();
  const expStr = xml.match(/<expirationTime>([\s\S]*?)<\/expirationTime>/)?.[1]?.trim();

  if (!token || !sign) throw new Error(`WSAA no devolvió token/sign.\nRespuesta: ${xml}`);

  const expiracion = expStr ? new Date(expStr) : new Date(Date.now() + 11 * 60 * 60 * 1000);
  return { token, sign, expiracion };
}

export async function getTicketAcceso(servicio = "wsfe"): Promise<Ticket> {
  if (_ticket && _ticket.expiracion > new Date(Date.now() + 5 * 60 * 1000)) {
    return _ticket;
  }

  const env = (process.env.AFIP_ENV === "production" ? "production" : "homologacion") as keyof typeof WSAA_URL;
  const tra = buildTRA(servicio);
  const cms = signTRA(tra);

  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cms}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

  const res = await fetch(WSAA_URL[env], {
    method: "POST",
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      "SOAPAction": "",
    },
    body: soapBody,
  });

  const xml = await res.text();
  _ticket = parseTicket(xml);
  return _ticket;
}

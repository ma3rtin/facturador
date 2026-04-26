# Plan de desarrollo — Facturador La Paltería

## Contexto del proyecto

Sistema interno de gestión para La Paltería, distribuidora de paltas en Buenos Aires. Permite gestionar clientes, pedidos, pagos y emitir facturas electrónicas (con integración AFIP/ARCA pendiente).

---

## Stack técnico — detalles críticos

| Tecnología | Versión | Notas importantes |
|---|---|---|
| Next.js | 16.2.4 | App Router, Server Actions (`"use server"`), React 19 |
| Prisma | 7.8.0 | **Breaking changes vs versiones anteriores** — ver abajo |
| PostgreSQL | Neon serverless | `DATABASE_URL` (pooled) para app, `DIRECT_URL` (direct) para migraciones |
| Tailwind CSS | v4 | Sintaxis `@import "tailwindcss"` + `@theme inline {}` |
| lucide-react | latest | Iconos SVG — no usar emojis |

### Prisma 7 — gotchas críticos

- **`prisma.config.ts`** (raíz del proyecto): la `url` de la DB va acá, NO en `schema.prisma`. El datasource en schema solo tiene `provider = "postgresql"`.
- **Imports**: `PrismaClient` desde `../generated/prisma/client`, enums desde `@/generated/prisma/enums`. No existe `index.ts` en el generated output.
- **Driver adapter obligatorio**: se debe usar `@prisma/adapter-pg` + `pg`. Sin esto tira `accelerateUrl is missing`.
- **`PrismaClientOptions`**: no existe la key `datasources` ni `log` tipado — usar `as never` en el constructor si es necesario.
- **`prisma migrate reset`**: requiere `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="si, confirmo"` como env var (guard de seguridad de AI).

### Paleta de colores

```
bg página:     #f2f5f2   (verde muy claro)
cards:         #ffffff   + border #dde6de
texto primary: #1a2419   (verde oscuro casi negro)
texto muted:   #5a6b5c
texto dimmed:  #9aab9d
acento verde:  #16a34a
acento naranja:#ea580c   (botones primarios, hover links)
sidebar bg:    #1a3d2b   (verde oscuro)
sidebar texto: #d4e6d5
```

---

## Lo que está construido ✅

### Base de datos (Prisma + Neon)
- Modelos: `Cliente`, `Pedido`, `ItemPedido`, `Pago`, `Factura`, `ItemFactura`
- Enums: `CondicionIVA`, `TipoFactura`, `EstadoFactura`, `EstadoPedido`
- Migraciones aplicadas en Neon

### Server Actions
- `src/actions/clientes.ts` — `getClientes`, `getCliente`, `crearCliente`, `actualizarCliente`, `eliminarCliente`
- `src/actions/pedidos.ts` — `getPedidosDelDia`, `getPedidos`, `crearPedido`, `actualizarEstadoPedido`
- `src/actions/pagos.ts` — `getPagos`, `getPagosSemana`, `registrarPago`, `getClientesConDeuda`
- `src/actions/facturas.ts` — `getFacturas`, `getFactura`, `crearFactura` (auto-incrementa `numeroComprobante` por tipo+punto de venta)

### Páginas
| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Dashboard con stats (clientes, pedidos hoy, deudas, facturas) |
| `/clientes` | ✅ | Lista con saldo pendiente, link a detalle |
| `/clientes/nuevo` | ✅ | Formulario alta cliente |
| `/clientes/[id]` | ✅ | Detalle con historial de pedidos y pagos |
| `/pedidos` | ✅ | Lista con dropdown de cambio de estado inline |
| `/pedidos/nuevo` | ✅ | Formulario nuevo pedido con ítems dinámicos |
| `/pedidos/[id]` | ✅ | Detalle: ítems, estado, facturas vinculadas, botón "Generar factura" |
| `/pagos` | ✅ | Lista de pagos y clientes con deuda |
| `/pagos/nuevo` | ✅ | Registrar pago con selector de cliente |
| `/facturacion` | ✅ | Lista de facturas con estado y CAE |
| `/facturacion/nueva` | ✅ | Form completo: tipo (A/B/C/M/X), IVA por ítem, bonificación, punto de venta. Acepta `?pedidoId=` para pre-llenar desde pedido |
| `/facturacion/[id]` | ✅ | Detalle con totales, botón "Emitir a AFIP" (si BORRADOR), botón "Descargar PDF" |
| `GET /api/facturas/[id]/pdf` | ✅ | Route handler que devuelve PDF en formato AFIP |

### Componentes
- `src/components/nav.tsx` — sidebar oscuro con navegación, marca "La Paltería"
- `src/components/pedido-estado-select.tsx` — dropdown interactivo para cambiar estado de pedido
- `src/components/emitir-factura-button.tsx` — botón verde "Emitir a AFIP" con confirmación y manejo de errores
- `src/app/globals.css` — variables de color con Tailwind v4
- `src/lib/pdf/factura-pdf.tsx` — template PDF con `@react-pdf/renderer`: cabecera emisor/receptor, tabla ítems, totales, recuadro CAE

### AFIP (código listo, pendiente de credenciales)
- `src/lib/afip/wsaa.ts` — firma TRA con certificado (PKCS7/node-forge), llama al WSAA, cachea el ticket (~11hs)
- `src/lib/afip/wsfe.ts` — construye el SOAP de `FECAESolicitar`, mapea tipos/alícuotas AFIP, parsea CAE de la respuesta
- `src/actions/facturas.ts::emitirFactura` — action que llama a wsfe, guarda CAE+vencimiento, cambia estado a EMITIDA

**Variables de entorno necesarias para activar AFIP:**
```env
AFIP_CUIT=20xxxxxxxxx9
AFIP_CERT=<base64 del .crt>
AFIP_KEY=<base64 del .key>
AFIP_ENV=homologacion   # o "production"
```

---

## Lo que falta construir 🔲

### 1. Activar integración AFIP/ARCA (prioridad alta — bloqueado por credenciales)
El código está completo. Solo falta:
1. Que el cliente genere su certificado digital en el portal AFIP (WSASS)
2. Crear un punto de venta tipo "WSFE" en AFIP (distinto al de Factura E/WSFEX)
3. Adherir el servicio WSFE al CUIT del emisor
4. Cargar `AFIP_CUIT`, `AFIP_CERT`, `AFIP_KEY`, `AFIP_ENV` como env vars en Vercel
5. Probar en homologación antes de producción

### 2. Configuración del emisor (prioridad alta)
El PDF actualmente usa env vars para los datos del emisor (razón social, CUIT, domicilio, IIBB). Falta:
- Pantalla `/configuracion` para editar estos datos desde la UI
- Guardarlos en DB (nueva tabla `Configuracion`) o seguir con env vars (más simple)
- Las env vars necesarias hoy: `EMISOR_RAZON_SOCIAL`, `EMISOR_CUIT`, `EMISOR_DOMICILIO`, `EMISOR_CONDICION_IVA`, `EMISOR_IIBB`, `EMISOR_INICIO_ACTIVIDADES`

### 3. Anular facturas (prioridad media)
- Botón "Anular" en `/facturacion/[id]` para facturas EMITIDAS (solo cambia estado localmente por ahora)
- AFIP requiere nota de crédito para anulación real — dejar para fase 2

### 4. Búsqueda y filtros (prioridad baja)
- `/clientes`: buscar por nombre/CUIT
- `/pedidos`: filtrar por fecha, estado, cliente
- `/facturacion`: filtrar por tipo, estado, fecha

### 5. Editar facturas en BORRADOR (prioridad baja)
- Permitir modificar ítems/cliente de una factura que aún no fue emitida

---

## Estructura de archivos relevante

```
facturador/
├── prisma/
│   ├── schema.prisma          # Solo provider, sin url (Prisma 7)
│   └── migrations/
├── prisma.config.ts           # URL de DB, path de migraciones (Prisma 7)
├── src/
│   ├── actions/               # Server Actions
│   │   ├── clientes.ts
│   │   ├── pedidos.ts
│   │   ├── pagos.ts
│   │   └── facturas.ts
│   ├── app/
│   │   ├── globals.css        # Tailwind v4 con @theme inline
│   │   ├── layout.tsx         # Root layout con sidebar
│   │   ├── page.tsx           # Dashboard
│   │   ├── clientes/
│   │   ├── pedidos/
│   │   ├── pagos/
│   │   └── facturacion/
│   ├── components/
│   │   └── nav.tsx
│   ├── generated/prisma/      # Auto-generado, no editar
│   └── lib/
│       └── prisma.ts          # Singleton PrismaClient con adapter pg
├── .env                       # DATABASE_URL + DIRECT_URL
└── .env.example
```

---

## Variables de entorno necesarias

```env
DATABASE_URL=postgresql://...  # Neon pooled connection (para la app)
DIRECT_URL=postgresql://...    # Neon direct connection (para migraciones)
```

Cuando se integre AFIP agregar:
```env
AFIP_CUIT=20xxxxxxxx9
AFIP_CERT=<base64 del certificado>
AFIP_KEY=<base64 de la clave privada>
AFIP_ENV=production  # o "homologacion" para pruebas
```

---

## Deploy

- Plataforma: Vercel
- `"postinstall": "prisma generate"` en `package.json` (ya configurado)
- Las env vars se configuran en el panel de Vercel

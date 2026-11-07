# AsexiA Suite 360

CRM inicial de salud, adaptable a otros sectores: gestión de clientes, canvas, agenda, cobros, salas y alertas.

Capa de presentación (PWA) para la gestión comercial y operativa de clínicas.
React + TypeScript + Tailwind CSS. Los datos son mock con latencia simulada,
listos para sustituirse por REST o XML-RPC (Odoo) sin tocar las vistas.

## Vistas

- **Pipeline Kanban** (`/`) — columnas Nuevo Contacto, Cualificado por IA, Cita Confirmada, Facturado.
- **Ficha 360** (`/pacientes/$id`) — ficha de contacto + timeline unificado (WhatsApp y transcripciones de voz).
- **Copiloto IA** — FAB persistente que abre un panel lateral de asistencia.

## Sustituir el mock por API real

El contrato vive en `src/lib/api/types.ts` (`AsexiAApi`).
La implementación mock está en `src/lib/api/client.ts`.

1. Implemente `createRestClient` o `createXmlRpcClient` que cumpla `AsexiAApi`.
2. Exporte esa instancia como `api` en `src/lib/api/client.ts`.
3. Las vistas (`components/kanban`, `components/patient`, `components/copilot`) no cambian.

## Scripts

```bash
npm run dev          # desarrollo
npm run build        # producción
npm run typecheck    # TypeScript
```

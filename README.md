# AsexiA Suite 360

CRM de clínica, adaptable a otros sectores: pipeline, ficha, agenda, cobros, salas y alertas.

PWA mobile-first. React + TypeScript + Tailwind. Los datos viven en el aparato y se sincronizan con el libro compartido de la clínica mientras hay red.

## Vistas

- **Tablero** (`/`) — pipeline comercial.
- **Actuar** (`/actuar`) — alarmas, predicciones, WhatsApp y lista de espera.
- **Mandos** (`/mandos`) — indicadores, filtro por profesional o sala, exportación del periodo.
- **Agenda** (`/agenda`) — citas, huecos y lista de espera.
- **Admin** (`/admin`) — actividades, duración, precio, días de recuerdo, horarios y salas.
- **Ficha** (`/pacientes/$id`) — contacto, economía, citas, pagos, factura, historial y archivos.

## Contrato

La interfaz está en `src/lib/api/types.ts` (`AsexiAApi`).
La implementación actual está en `src/lib/api/client.ts`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```

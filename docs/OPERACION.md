# Operación y recomendaciones

## Cadena de datos

GitHub Actions obtiene su identidad → Edge Function verifica firma y claims → descarga BCRP → valida contrato → RPC transaccional en Supabase → frontend consulta datos y recalcula las métricas.

La fuente es fija; ni el cuerpo del POST ni parámetros externos permiten elegir otra URL, otra serie o SQL. No se aceptan precios suministrados por el caller. La función requiere autenticación OIDC propia; `verify_jwt=false` desactiva solamente la validación de JWT de Supabase, no la autorización.

## Controles antes de publicar cambios

- `npm run check`: pruebas y build obligatorios.
- Revisar que no aparezcan secretos ni datos personales en el diff.
- Revisar preview y los escenarios de error/copia de respaldo.
- Toda nueva regla debe incluir un benchmark y una prueba temporal que evite datos futuros.

## GitHub Actions recomendados

1. **Implementado: CI** en push y PR. Tests de integridad, cálculos y confianza OIDC.
2. **Implementado: actualización y frescura** de lunes a viernes. Revisar los jobs fallidos en Actions; las notificaciones dependen de las preferencias del propietario de GitHub.
3. **Recomendado como siguiente mejora:** rama main protegida y CI obligatorio antes de merge. Los cambios de protección no forman parte de esta entrega.
4. **Recomendado:** ampliar investigación a varios años mediante workflow manual, versionando datasets y resultados. No activar nuevas señales solo porque mejoren 2026.
5. **Recomendado:** monitor externo de disponibilidad y backup exportado privado de auditoría. No publicar logs internos ni usar Actions como almacenamiento permanente.

Vercel ejecuta `npm run check` antes de publicar. La integración Git nativa evita duplicar despliegues. La publicación inicial mediante API no equivale por sí sola a una integración Git permanente: verificar el estado de vinculación.

## Consulta de auditoría (administración)

```sql
select run_key,status,started_at,finished_at,rows_received,last_observation,error_code
from public.pm_ingestion_runs order by started_at desc limit 20;
select count(*) from public.pm_rate_revisions;
```

Un `running` antiguo puede indicar interrupción antes de registrar el resultado. Reejecutar Actions crea un intento distinto. El mismo run/attempt no se procesa dos veces. Ante una revisión BCRP se conserva old_rate/new_rate. Un lote inválido no sustituye la última serie buena.

## Costos y dependencia

Frontend estático sin runtime de SSR ni LLM. Una consulta pública de serie por carga de página; ingestión aproximadamente una vez por día laborable. Se usa un proyecto Supabase existente. El uso queda sujeto al plan y cuotas de las plataformas; no se promete costo cero indefinido.

## Evolución

Versión 1 enfocada en 2026. Para 2027 hay que incorporar selector de año, regenerar el respaldo y validar rangos temporales antes de ampliar el contrato. No se modifica automáticamente la metodología ni se entrenan modelos nuevos. Cotizaciones de proveedores y cuentas personales requerirían nuevas fuentes y, para saldos persistentes, autenticación y políticas de propietario.

# Patrimonio en Monedas

Portal USD/PEN para transformar datos públicos en decisiones de cambio más informadas. Frontend estático en Vercel, backend Supabase y actualización autenticada desde GitHub Actions.

## Experiencia

- Panorama: serie BCRP de venta interbancaria, tendencia descriptiva y lectura de evidencia.
- Mis quincenas: aportes editables, escenarios de cobro 12/27 o 15/fin de mes, esperas de 1–15 observaciones y descarga del detalle.
- Costo efectivo: comisión en soles, comisión en dólares y USD netos disponibles para invertir.
- Laboratorio: regresión móvil de 60 datos, predicciones de 1/5 ruedas, benchmark de persistencia y cambios por día.
- Fuentes y método: documentación técnica, hipótesis, límites y trazabilidad del corte.

El portal no ejecuta inversiones ni almacena montos personales. La publicación contiene datos públicos y escenarios ilustrativos. No existe una señal de compra validada ni una garantía de ahorro.

## Desarrollo

Node 22 o superior. Sin dependencias npm de producción.

```sh
npm ci --ignore-scripts
npm run check
npm run dev
```

Desarrollo: http://localhost:4173. `npm run build` produce `dist/`. Las rutas de navegación usan fragmentos (`#simulador`, etc.), por lo que no requieren rewrites.

## Backend activo

Proyecto Supabase: `tlyczyfsboqrtrdpwizp` (proyecto existente del propietario).
- `pm_rates`: serie pública, lectura anónima con RLS; sin escritura anónima.
- `pm_ingestion_runs`: auditoría privada de ejecuciones.
- `pm_rate_revisions`: valores anteriores y nuevos cuando BCRP revisa una fecha.
- `pm_apply_observations`: importación transaccional, security invoker, solo service_role.
- `pm-refresh`: valida JWT OIDC de GitHub antes de consultar la fuente fija e importar.

`web/config.js` contiene únicamente la URL y una clave **publishable** de lectura pública. Nunca colocar una clave secret/service_role allí. Las tablas ajenas al proyecto no se modifican.

## GitHub Actions

`ci.yml`: en push/PR, ejecuta pruebas y construye el portal; conserva el artefacto 14 días.

`refresh.yml`: días laborables a las 23:37 UTC (18:37 Lima), ejecución manual y cambios del propio workflow. Obtiene un JWT efímero OIDC; no requiere guardar una clave de escritura de Supabase en GitHub. La función solo acepta el repositorio/ID exacto, propietario/ID, main, workflow autorizado, audiencia, emisor y firma verificadas. Rechaza PR y forks. Guarda el run ID, estado, hash y fechas.

El cron no garantiza puntualidad. El job falla si la última observación tiene más de 7 días; la interfaz avisa desde 4 días. GitHub puede desactivar cron tras inactividad prolongada en repositorios públicos: vigilar Actions y reactivar si corresponde.

## Vercel

`vercel.json`: `npm run check` como build y `dist` como salida. Incluye CSP y cabeceras de seguridad. La misma validación corre durante el despliegue.

Recomendación de operación: vincular este repositorio a Vercel para previews por PR y producción desde main; evitar un segundo workflow de despliegue que duplique esa integración. Si el proyecto fue publicado mediante API, comprobar la vinculación Git en Vercel antes de asumir despliegues automáticos de futuros commits.

## Evidencia y límites

Pruebas de reproducción del corte inicial (170 observaciones, 05/01–10/09/2026), ausencia de fuga de información en el pronóstico, rechazo de datos inválidos, reglas OIDC y cálculo del costo efectivo. `web/snapshot.json` es copia fija de respaldo; se identifica como tal si falla Supabase.

Ver [operación](docs/OPERACION.md), [método](docs/METODOLOGIA.md) y [verificación](docs/VERIFICACION.md).

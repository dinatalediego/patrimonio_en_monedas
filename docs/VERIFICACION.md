# Verificación de entrega

- Las pruebas automatizadas reproducen el resultado inicial +US$0.1390655 de esperar cinco ruedas con 16 aportes de S/350 y cobros 15/fin de mes.
- Alterar un dato futuro no modifica el pronóstico ya emitido.
- Costo efectivo: S/700 a 3.5 y US$1 de comisión produce US$199.
- RLS activo en tres tablas. anon no tiene INSERT de pm_rates, SELECT de auditoría ni EXECUTE de la RPC de importación.
- La fuente admite solo fechas válidas, sin duplicados, desde 2026 hasta hoy, con valor entre 2 y 6 como control de plausibilidad.
- Auditor Supabase: tablas de auditoría sin políticas públicas por diseño (deny-all); pm_rates visible públicamente por diseño, al ser referencia BCRP. No se modificaron avisos de otros proyectos.

Las pruebas de autorización por claims no sustituyen una ejecución real de firma OIDC. Registrar el resultado de CI/refresh y despliegue en el cierre de entrega.

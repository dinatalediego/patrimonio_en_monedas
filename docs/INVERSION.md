# Costos de invertir — versión 2026-09-14

Rutas: #plataformas, #inversion y #aprender. Acciones/ETF, cuenta de efectivo, venta total. Dos plataformas; no se declara ganador universal. PayPal directo no confirmado. Fuentes oficiales y revisión en web/fees.json. Datos públicos versionados en pm_fee_catalog (RLS lectura pública, escritura de servicio). Importes personales no se transmiten.

Modelo: presupuesto PEN / TC venta. Aportes iguales y equidistantes al inicio del intervalo, una orden por aporte, venta única y retiros iguales el mismo mes. La tarifa de depósito se paga sobre el monto acreditado dentro del presupuesto fijo, resuelto numéricamente. Retorno anual compuesto según tiempo de cada aporte. Costos manuales: banco de entrada/salida, comisión media por orden, regulación total, spread por lado, otros y estimación fiscal total. Los vacíos se omiten provisionalmente con aviso visible, nunca se describen como neto confirmado. El cálculo fiscal es externo: ingresar retenciones más saldo local después de créditos, sin duplicarlos. Curva y punto de equilibrio mantienen ese impuesto fijo.

IBKR: tarifas publicadas Fixed/Tiered solo referencia; el simulador usa comisión manual. Al 14/09/2026 la página Other Fees publica DOS retiros sin costo al mes, luego wire USD 10; terceros aparte. No usar una antigua regla de uno gratis. Hapi internacional: ayuda mínimo 35 USD, captura 25: discrepancia visible. Airtm mínimo de comisión 4.99, no asumir monto mínimo libre de cargo.

Operación: CI ejecuta pruebas económicas y build. fees-review comprueba antigüedad semanalmente y falla después de 30 días; no modifica tarifas automáticamente ni falsifica fechas de revisión. Revisar fuentes, editar catálogo, aplicar nueva migración versionada y desplegar frontend con copia equivalente. Sin token de servicio en GitHub o navegador. La consulta horaria BCRP sigue independiente de tarifas (revisión humana).

Para cerrar CI/CD: conectar este repositorio en Vercel Settings > Git, activar previews por PR, proteger main con CI y revisión, habilitar notificaciones personales de workflows fallidos desde GitHub. No mezclar fallos de revisión tarifaria con bloqueo del portal existente. Cotizaciones bancarias y tarifas de app pueden cambiar antes del plazo de 30 días.

Validación: conservación de dinero con costos fijos, cargo porcentual sobre principal, mínimo Airtm, equilibrio en PEN con pérdida cambiaria, aportes con tiempos distintos, cuota IBKR más terceros y escenarios imposibles. No se almacenan ni publican capturas personales.

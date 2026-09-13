# USD/PEN: análisis exploratorio para compras quincenales

Fecha del análisis: 13 de septiembre de 2026.
Fuente: BCRP, serie PD04638PD, TC Interbancario (S/ por US$), Venta.
URL consultada: https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04638PD/json/2026-01-01/2026-09-11/esp
170 observaciones numéricas: 5 de enero–10 de septiembre de 2026. Se excluyen n.d.; no se rellenan datos ausentes. Las ruedas de la simulación son observaciones disponibles, no necesariamente todos los días hábiles del calendario. No son cotizaciones minoristas ejecutables ni datos intradía.

## Conclusión
No se demuestra una ventaja robusta de esperar o comprar un día de semana específico con estas pruebas. Esto no demuestra que no pueda existir otra regla mejor. No se probaron todos los modelos ni todos los plazos.

## Regresión y prueba cronológica
Ajuste descriptivo de nivel contra índice de observación: TC(t)=3.400324488 + 0.000000659934*t; t=0 en la primera observación. R²=0.0000005365. No extrapolar ese ajuste como señal.
Predicción: regresión lineal reestimada con 60 observaciones hasta el origen; extrapolación a 1 y 5 observaciones. Benchmark: último valor conocido (persistencia). Sin utilizar observaciones futuras para estimar. MAE en soles por dólar:
- 1 rueda (110 pronósticos): persistencia 0.010015; regresión 0.026422.
- 5 ruedas (106 pronósticos): persistencia 0.026145; regresión 0.032203.
No se evaluó una política de trading basada en esta regresión. Los errores solapados a 5 ruedas no son independientes; la comparación MAE es descriptiva, sin prueba de superioridad predictiva.

## Calendario
Regresión del cambio diario en dummies de lunes a viernes, sin constante. Covarianza HAC Bartlett con 5 rezagos. Wald asintótico de igualdad entre los cinco coeficientes: p=0.223. No evidencia global al 5%. El cambio del lunes incluye lo ocurrido desde la observación anterior. El efecto no es necesariamente causal ni una cotización más barata en nivel. No seleccionar un coeficiente favorable ignorando la comparación múltiple.

## Simulación de caja
Enero–agosto, 16 aportes iguales de S/350 (S/5600 en total), presupuesto ilustrativo y escalable. Escenario temprano: 12 y 27. Tardío: 15 y último día calendario del mes. Se pasa a la siguiente observación si la fecha no tiene dato. Los escenarios no representan fechas exactas del usuario.
Se comparan: compra inmediata; compra en la quinta observación posterior; mitad del presupuesto en cada extremo; umbral fijo de caída del 0.3% frente al día inicial, observado el día anterior a ejecutar y con vencimiento en la quinta observación; mínimo retrospectivo de las seis observaciones (solo cota ideal inalcanzable).
No se optimizaron estos parámetros sobre la muestra. Se calculan USD obtenidos con presupuesto fijo. La compra dividida usa media armónica del tipo de cambio, no media aritmética.
Esperar 5 ruedas: +US$0.139 acumulados en escenario tardío; -US$4.030 en temprano. Umbral: -US$1.252 y -US$2.589 respectivamente. Mínimo retrospectivo: +US$9.127 y +US$6.138; NO ejecutable con información contemporánea.
Bootstrap exploratorio por bloques mensuales, 20000 remuestreos, semilla 73. Para esperar cinco ruedas, intervalo percentil 95% del resultado total: tardío [-10.94,9.80] USD; temprano [-13.64,3.52] USD. Solo ocho bloques mensuales: incertidumbre poco precisa; no son bandas de pronóstico ni garantías. Asume intercambiabilidad de meses, discutible en divisas.

## Límites operativos
No se incluyen spread, comisiones de cambio, costos de fondeo, rendimiento de la inversión diferida ni remuneración de soles durante la espera. La serie diaria interbancaria es una referencia ex post, no un precio de compra garantizado. No conocemos hora del abono ni posibilidad de ejecutar en esa fecha. No hay validación con varios años ni muestra independiente posterior a septiembre. No se justifica prometer un día óptimo ni rentabilidad.

## Forecasts externos
- Encuesta de expectativas del BCRP: https://www.bcrp.gob.pe/en/estadisticas/encuesta-de-expectativas-macroeconomicas.html
- BBVA Research, Situación Perú, junio 2026: https://www.bbvaresearch.com/publicaciones/situacion-peru-junio-2026/
El informe BBVA del 18 de junio proyectaba S/3.20–3.30 para el cierre de 2026 y 2027; es una previsión fechada, no necesariamente la última ni una señal quincenal. No se ha auditado su historial de aciertos.

## Reproducción
Python con numpy, pandas, matplotlib y scipy. Conservar fx_raw.json al lado de los scripts. Ejecutar analisis_fx.py y luego complemento_fx.py. No se necesitan credenciales ni conexión para recalcular esta muestra. Los CSV incluidos son insumos y resultados, no una hoja de cálculo con fórmulas.

from pathlib import Path
import json,calendar,zipfile
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
ROOT=Path(__file__).parent
out=ROOT/'resultado_fx';out.mkdir(exist_ok=True)
r=json.loads((ROOT/'fx_raw.json').read_text())
months=dict(zip(['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'],range(1,13)))
rows=[]
for p in r['periods']:
 try:v=float(p['values'][0])
 except ValueError:continue
 d,m,y=p['name'].split('.'); rows.append((pd.Timestamp(2000+int(y),months[m],int(d)),v))
df=pd.DataFrame(rows,columns=['fecha','tc']).sort_values('fecha').reset_index(drop=True)
assert df.fecha.is_unique and (df.tc>0).all() and df.fecha.max()<=pd.Timestamp('2026-09-11')
df.to_csv(out/'serie_diaria.csv',index=False)
y=df.tc.to_numpy(); t=np.arange(len(y));b=np.polyfit(t,y,1);fit=np.polyval(b,t);r2=1-np.sum((y-fit)**2)/np.sum((y-y.mean())**2)
# Walk-forward: estimation only through origin, fixed trailing 60 observations.
fore=[]
for h in [1,5]:
 for i in range(59,len(y)-h):
  coef=np.polyfit(np.arange(60),y[i-59:i+1],1)
  fore.append(dict(fecha=df.fecha[i+h],h=h,real=y[i+h],persistencia=y[i],regresion=np.polyval(coef,59+h)))
f=pd.DataFrame(fore); f.to_csv(out/'pronosticos_fuera_muestra.csv',index=False)
metrics=[]
for h,g in f.groupby('h'):
 metrics.append(dict(h=int(h),n=len(g),mae_base=float(abs(g.real-g.persistencia).mean()),mae_reg=float(abs(g.real-g.regresion).mean())))
# Scenario cash dates; full January-August only; 5 observed sessions maximum.
wr=[]
for scenario in ['temprano','tardio']:
 for month in range(1,9):
  for half,day in [('Q1',12 if scenario=='temprano' else 15),('Q2',27 if scenario=='temprano' else calendar.monthrange(2026,month)[1])]:
   date=pd.Timestamp(2026,month,day); idx=df.index[df.fecha>=date][0]
   if idx+5>=len(df):continue
   z=y[idx:idx+6];chosen=5
   for j in range(1,6):
    if z[j-1]<=z[0]*.997:chosen=j;break
   rates={'Inmediato':z[0],'Esperar 5 ruedas':z[5],'Mitad hoy / mitad después':2/(1/z[0]+1/z[5]),'Umbral -0,3% previo':z[chosen],'Mínimo retrospectivo':min(z)}
   for name,rate in rates.items():
    wr.append(dict(escenario=scenario,mes=month,quincena=half,inicio=df.fecha[idx],fin=df.fecha[idx+5],estrategia=name,tc_efectivo=rate,usd_por_350=350/rate,extra_usd=350/rate-350/z[0],ahorro_soles_por_100usd=100*(z[0]-rate)))
w=pd.DataFrame(wr);w.to_csv(out/'simulacion_quincenas.csv',index=False)
summary=w.groupby(['escenario','estrategia']).agg(n=('extra_usd','size'),extra_usd_total=('extra_usd','sum'),ahorro_soles_medio_100usd=('ahorro_soles_por_100usd','mean'),fraccion_mejora=('extra_usd',lambda s:float((s>0).mean()))).reset_index();summary.to_csv(out/'resumen_estrategias.csv',index=False)
# Daily weekday changes; descriptive only.
df['cambio']=df.tc.diff(); wd=df.groupby(df.fecha.dt.dayofweek).cambio.agg(['mean','count']);wd.to_csv(out/'cambios_dia_semana.csv')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold'})
fig,ax=plt.subplots(3,1,figsize=(12,12),layout='constrained');fig.patch.set_facecolor('#f7f9fc')
ax[0].plot(df.fecha,y,color='#183b56',lw=1.7,label='Interbancario venta observado')
ax[0].plot(df.fecha,fit,color='#d58432',ls='--',label=f'Regresión descriptiva, R²={r2:.2f}')
ax[0].set(title='USD/PEN 2026 · La tendencia histórica no es una señal de compra',ylabel='Soles por dólar');ax[0].legend(loc='best');ax[0].xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
g=f[f.h==5];ax[1].plot(g.fecha,g.real,label='Real',color='#183b56');ax[1].plot(g.fecha,g.regresion,label='Pronóstico lineal, 5 ruedas',color='#d58432',alpha=.85);ax[1].plot(g.fecha,g.persistencia,label='Referencia: último valor conocido',color='#21918c',alpha=.7);ax[1].set(title='Prueba cronológica · Cada pronóstico usa solo 60 observaciones previas',ylabel='Soles por dólar');ax[1].legend();ax[1].xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
g=w[(w.escenario=='tardio')&(w.estrategia!='Inmediato')]
for name,s in g.groupby('estrategia',sort=False):
 ax[2].plot(s.inicio,s.extra_usd.cumsum(),marker='o',ms=3,label=name,ls='--' if name=='Mínimo retrospectivo' else '-')
ax[2].axhline(0,color='gray',lw=.8);ax[2].set(title='16 aportes de S/350 · Cobro el 15 y a fin de mes, espera máxima 5 ruedas',ylabel='USD extra acumulados vs. cambiar al cobrar');ax[2].legend(fontsize=9);ax[2].xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
fig.suptitle('Comprar dólares con tus quincenas',fontsize=21,fontweight='bold',color='#183b56')
fig.text(.02,-.025,'Fuente: BCRP, PD04638PD. Sin spreads, comisiones ni rendimiento de la inversión diferida.\nEl mínimo retrospectivo requiere conocer el futuro: no es una estrategia ejecutable. Fechas de cobro supuestas.',fontsize=10)
fig.savefig(out/'curvas_tipo_cambio_2026.png',dpi=160,bbox_inches='tight')
result=dict(n=len(df),desde=str(df.fecha.min().date()),hasta=str(df.fecha.max().date()),inicio=float(y[0]),ultimo=float(y[-1]),min=float(min(y)),max=float(max(y)),pendiente=float(b[0]),intercepto=float(b[1]),r2=float(r2),metricas=metrics,resumen=summary.to_dict('records'),dias=wd.to_dict('index'))
(out/'resultados.json').write_text(json.dumps(result,indent=2,ensure_ascii=False))
print(json.dumps(result,indent=2,ensure_ascii=False))

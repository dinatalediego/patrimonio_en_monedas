from pathlib import Path
import json,zipfile,shutil
import numpy as np,pandas as pd
from scipy.stats import norm,chi2
root=Path(__file__).parent;o=root/'resultado_fx';d=pd.read_csv(o/'serie_diaria.csv',parse_dates=['fecha']);delta=d.tc.diff().iloc[1:].to_numpy();wd=d.fecha.dt.dayofweek.iloc[1:].to_numpy();X=np.eye(5)[wd];b=np.linalg.lstsq(X,delta,rcond=None)[0];e=delta-X@b;Z=X*e[:,None];S=Z.T@Z
for lag in range(1,6):
 C=Z[lag:].T@Z[:-lag];S+=(1-lag/6)*(C+C.T)
inv=np.linalg.inv(X.T@X);V=inv@S@inv;se=np.sqrt(np.diag(V));R=np.zeros((4,5))
for i in range(4):R[i,i+1]=1;R[i,0]=-1
rb=R@b;stat=rb@np.linalg.inv(R@V@R.T)@rb;p=float(chi2.sf(stat,4))
w=pd.read_csv(o/'simulacion_quincenas.csv');rng=np.random.default_rng(73);cis=[]
for (sc,st),g in w.groupby(['escenario','estrategia']):
 if st=='Inmediato':continue
 monthly=g.groupby('mes').extra_usd.sum().to_numpy();boot=rng.choice(monthly,size=(20000,len(monthly)),replace=True).sum(axis=1)
 cis.append(dict(escenario=sc,estrategia=st,ci95_total_usd=np.quantile(boot,[.025,.975]).tolist()))
res={'weekday_global_p_HAC5':p,'weekday_mean_ci95':[{'dia':i,'media':float(b[i]),'lo':float(b[i]-1.96*se[i]),'hi':float(b[i]+1.96*se[i])} for i in range(5)],'bootstrap_mensual':cis}
(o/'incertidumbre.json').write_text(json.dumps(res,indent=2));print(json.dumps(res,indent=2))

export const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
export function linear(values){if(values.length<2)throw Error('Se requieren dos observaciones');const n=values.length,xbar=(n-1)/2,ybar=mean(values);let xy=0,xx=0;values.forEach((v,i)=>{xy+=(i-xbar)*(v-ybar);xx+=(i-xbar)**2});const slope=xy/xx,intercept=ybar-slope*xbar,fit=values.map((_,i)=>intercept+slope*i),sst=values.reduce((s,v)=>s+(v-ybar)**2,0),sse=values.reduce((s,v,i)=>s+(v-fit[i])**2,0);return {slope,intercept,fit,r2:sst?1-sse/sst:0}}
export function forecastAudit(rows,window=60,h=5){const out=[];for(let i=window-1;i<rows.length-h;i++){const m=linear(rows.slice(i-window+1,i+1).map(r=>r.rate));out.push({date:rows[i+h].date,actual:rows[i+h].rate,baseline:rows[i].rate,prediction:m.intercept+m.slope*(window-1+h)})}return {rows:out,n:out.length,maeBaseline:out.length?mean(out.map(r=>Math.abs(r.actual-r.baseline))):null,maeModel:out.length?mean(out.map(r=>Math.abs(r.actual-r.prediction))):null}}
export function normalize(rows){if(!Array.isArray(rows)||!rows.length)throw Error('Sin observaciones');const seen=new Set();return rows.map(r=>{const date=r.date??r.rate_date,rate=Number(r.rate);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(rate)||rate<=0||seen.has(date))throw Error('Serie inválida o duplicada');seen.add(date);return {date,rate}}).sort((a,b)=>a.date.localeCompare(b.date))}
export function simulate(rows,{amount=350,delay=5,scenario='late',threshold=.003,year=2026}={}){
 if(!Number.isFinite(amount)||amount<=0||!Number.isInteger(delay)||delay<1||delay>15)throw Error('Monto o plazo inválido');
 const periods=[],last=rows.at(-1)?.date;if(!last)return {periods,summary:[]};
 const cutoff=new Date(last+'T12:00:00Z');
 for(let month=0;month<12;month++){
  // Only complete calendar months; no fabricated future paychecks.
  if(new Date(Date.UTC(year,month+1,1))>cutoff)continue;
  const end=new Date(Date.UTC(year,month+1,0)).getUTCDate();
  for(const day of scenario==='early'?[12,27]:[15,end]){
   const cashDate=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,i=rows.findIndex(r=>r.date>=cashDate);if(i<0||i+delay>=rows.length)continue;
   const slice=rows.slice(i,i+delay+1);let chosen=delay;for(let j=1;j<=delay;j++){if(slice[j-1].rate<=slice[0].rate*(1-threshold)){chosen=j;break}}
   const first=slice[0].rate,lastRate=slice.at(-1).rate;
   const rates={immediate:first,wait:lastRate,split:2/(1/first+1/lastRate),threshold:slice[chosen].rate,oracle:Math.min(...slice.map(r=>r.rate))};
   periods.push({date:slice[0].date,cashDate,end:slice.at(-1).date,rates,extra:Object.fromEntries(Object.entries(rates).map(([k,v])=>[k,amount/v-amount/first]))});
  }
 }
 const summary=['immediate','wait','split','threshold','oracle'].map(key=>({key,total:periods.reduce((s,p)=>s+p.extra[key],0),wins:periods.filter(p=>p.extra[key]>1e-10).length,n:periods.length}));return {periods,summary};
}
export function effectiveCost({soles,rate,feeSoles=0,feeUsd=0}){if(![soles,rate,feeSoles,feeUsd].every(Number.isFinite)||soles<=0||rate<=0||feeSoles<0||feeUsd<0)throw Error('Revisa los montos');const usd=(soles-feeSoles)/rate-feeUsd;if(usd<=0)throw Error('Las comisiones consumen el monto');return {usd,effective:soles/usd}}
export function weekdayChanges(rows){return ['Lun','Mar','Mié','Jue','Vie'].map((name,k)=>{const a=rows.slice(1).filter(r=>new Date(r.date+'T12:00:00Z').getUTCDay()===k+1).map(r=>{const i=rows.indexOf(r);return r.rate-rows[i-1].rate});return {name,n:a.length,change:a.length?mean(a):0}})}

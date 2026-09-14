export const fee=(a,r)=>r.fixed+Math.max(a*r.pct,r.minimum);
export function funded(b,r){if(b<=fee(0,r))throw Error('El aporte no cubre el depósito.');let l=0,h=b;for(let i=0;i<70;i++){let m=(l+h)/2;if(m+fee(m,r)>b)h=m;else l=m}return l}
export function cycle(s,c,ret=s.returnPct){
for(const v of Object.values(s))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Número inválido.');
if(s.budget<=0||s.fxIn<=0||s.fxOut<=0||ret<=-100||![s.months,s.deposits,s.withdrawals].every(n=>Number.isInteger(n)&&n>=1&&n<=1000))throw Error('Revisa presupuesto, cambios, cantidades y plazo (1–1.000).');
for(const k of ['bankIn','bankOut','trade','regulatory','other','tax','spread'])if(s[k]<0)throw Error('Los costos no pueden ser negativos.');if(s.spread>=100)throw Error('Spread debe ser menor que 100%.');
const usd=s.budget/s.fxIn,rule=s.platform==='hapi'?c.deposits.find(r=>r.id===s.deposit):{fixed:0,pct:0,minimum:0};
const principal=funded(usd/s.deposits-s.bankIn,rule),buy=principal-s.trade;if(buy<=0)throw Error('El aporte no cubre la compra.');
let market=0;for(let i=0;i<s.deposits;i++)market+=buy*(1-s.spread/100)*Math.pow(1+ret/100,s.months/12*(1-i/s.deposits));
const entry=usd-buy*s.deposits,proceeds=market*(1-s.spread/100)-s.trade-s.regulatory-s.other-s.tax,route=c.withdrawals.find(r=>r.id===s.withdrawal),each=proceeds/s.withdrawals;
const withdrawal=s.platform==='hapi'?s.withdrawals*fee(Math.max(0,each),route):Math.max(0,s.withdrawals-2)*10;
const net=proceeds-withdrawal-s.bankOut*s.withdrawals;
return {usd,net,profit:net*s.fxOut-s.budget,executable:net>0&&each>=(s.platform==='hapi'?route.min_amount:0),breakdown:[['USD iniciales',usd],['Fondeo, banco y compras',-entry],['Capital comprado antes del spread',buy*s.deposits],['Valor antes de vender',market],['Spread de venta',-market*s.spread/100],['Venta y regulación',-s.trade-s.regulatory],['Otros cargos',-s.other],['Impuestos ingresados',-s.tax],['Retiro del broker',-withdrawal],['Banco / intermediarios de salida',-s.bankOut*s.withdrawals],['USD finales',net]]};
}
export function breakEven(s,c){let l=-99.99,h=1000;if(cycle(s,c,h).profit<0)return null;for(let i=0;i<65;i++){const m=(l+h)/2;if(cycle(s,c,m).profit>=0)h=m;else l=m}return h}

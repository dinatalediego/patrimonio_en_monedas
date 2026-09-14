
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const dom=new JSDOM('<main id="root"></main>',{url:'https://example.test'});
globalThis.document=dom.window.document;
globalThis.FormData=dom.window.FormData;
globalThis.fetch=async()=>({ok:true,json:async()=>[{payload:JSON.parse(readFileSync('web/fees.json','utf8'))}]});
const ui=await import('../web/investment-ui.js');
await ui.loadFees();
const root=document.querySelector('#root');
function render(){root.innerHTML=ui.investment();ui.bindInvestment()}
function change(name,value){const el=document.querySelector('[name="'+name+'"]');el.value=value;el.dispatchEvent(new dom.window.Event('change',{bubbles:true}));}
function submit(){document.querySelector('#investment-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));}
render();
assert.match(document.querySelector('#plan-total').textContent,/8,?400/);
change('frequency','monthly');change('amount','700');
assert.match(document.querySelector('#plan-total').textContent,/12 aportes/);
submit();
assert.equal(document.querySelector('#investment-error').textContent,'');
assert.match(document.querySelector('#investment-result').textContent,/Resultado incompleto/);
document.querySelector('#save-scenario').click();
change('amount','800');
assert.match(document.querySelector('#stale-result').textContent,/Pendiente/);
assert.equal(document.querySelector('#save-scenario').disabled,true);
render();
assert.equal(document.querySelector('[name="amount"]').value,'800');
assert.match(document.querySelector('#scenario-comparison').textContent,/Escenario 1/);
change('platform','ibkr');
assert.equal(document.querySelector('[name="trade"]').value,'1');
assert.equal(document.querySelector('[name="deposit"]').disabled,true);
change('bankInState','quoted');change('bankIn','10');
change('taxState','none');
submit();
assert.equal(document.querySelector('#investment-error').textContent,'');
assert.match(document.querySelector('#investment-result').textContent,/GANANCIA \/ PÉRDIDA USD/);
document.querySelector('#save-scenario').click();
assert.match(document.querySelector('#scenario-comparison').textContent,/Escenario 2/);
assert.match(document.querySelector('#scenario-comparison').textContent,/Para comparar costos/);
change('platform','hapi');
assert.equal(document.querySelector('[name="bankInState"]').value,'unknown');
console.log('PASS: guided flow, frequency totals, calculations, currency, stale state, session navigation, platform reset and two-scenario comparison');

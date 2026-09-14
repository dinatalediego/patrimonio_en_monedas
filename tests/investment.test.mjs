import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {fee,funded,cycle,breakEven} from '../web/investment.js';
const c=JSON.parse(readFileSync(new URL('../web/fees.json',import.meta.url)));const s={budget:3500,fxIn:3.5,fxOut:3.5,months:12,deposits:1,withdrawals:1,returnPct:0,platform:'hapi',deposit:'crosspen',withdrawal:'usd',trade:.15,bankIn:0,bankOut:0,regulatory:0,spread:0,other:0,tax:0};
test('Full cycle conserves money and subtracts all fixed costs',()=>assert.ok(Math.abs(cycle(s,c).net-(1000-1.99-.3-7.99))<1e-8));
test('Funding percentage charged on credited amount, inside budget',()=>{const r=c.deposits.find(r=>r.id==='card'),p=funded(100,r);assert.ok(Math.abs(p+fee(p,r)-100)<1e-8)});
test('Airtm minimum fee is not a minimum withdrawal',()=>{const r=c.withdrawals.find(r=>r.id==='airtm');assert.equal(fee(10,r),4.99);assert.equal(fee(1000,r),10)});
test('Break even recovers initial PEN, including FX loss',()=>{let z={...s,fxOut:3.4};assert.ok(Math.abs(cycle(z,c,breakEven(z,c)).profit)<1e-7)});
test('Later contributions earn less time and repeat funding fees',()=>assert.ok(cycle({...s,returnPct:10,deposits:2},c).net<cycle({...s,returnPct:10},c).net));
test('IBKR free quota and bank fees stay separate',()=>{let z={...s,platform:'ibkr',trade:1,bankOut:5};assert.equal(cycle({...z,withdrawals:3},c).net,973);assert.equal(cycle(z,c).net,993)});
test('Invalid and unaffordable scenarios',()=>{assert.throws(()=>cycle({...s,budget:1},c));assert.throws(()=>cycle({...s,tax:-1},c));assert.throws(()=>cycle({...s,returnPct:-100},c));assert.equal(cycle({...s,withdrawal:'wire',budget:100},c).executable,false)});

import test from 'node:test';import assert from 'node:assert/strict';import {normalizePlan} from '../web/investment-ui.js';
test('Quincenal: 350 soles twice monthly for one year totals 8400',()=>{const p=normalizePlan({amount:350,months:12,frequency:'fortnightly',currency:'PEN',fxIn:3.5,fxOut:3.4});assert.equal(p.budget,8400);assert.equal(p.deposits,24)});
test('Monthly comparison preserves total with double contribution',()=>{assert.equal(normalizePlan({amount:700,months:12,frequency:'monthly',currency:'USD',fxIn:3.5}).budget,8400)});
test('USD goal neutralizes exit conversion for break even',()=>{assert.equal(normalizePlan({amount:350,months:12,frequency:'once',currency:'USD',fxIn:3.5,fxOut:3.4}).fxOut,3.5)});
test('Invalid schedule is rejected',()=>{assert.throws(()=>normalizePlan({amount:0,months:12,frequency:'monthly'}));assert.throws(()=>normalizePlan({amount:350,months:501,frequency:'fortnightly'}))});

import {readFileSync} from 'node:fs';
const c=JSON.parse(readFileSync(new URL('../web/fees.json',import.meta.url)));
const age=(Date.now()-Date.parse(c.reviewed_at))/86400000;
if(!Number.isFinite(age)||age>30)throw Error('Catálogo de tarifas: revisión humana pendiente (más de 30 días). No actualizar la fecha sin revisar fuentes.');
console.log(`Catálogo ${c.version}: revisado hace ${Math.floor(age)} días. Revisar condiciones en la app antes de operar.`);

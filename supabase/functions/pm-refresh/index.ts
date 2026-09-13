import {createRemoteJWKSet,jwtVerify} from 'npm:jose@6.1.0';
import {trustedClaims,parseBcrp} from './auth.js';
const jwks=createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'));
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
 let payload;
 try{const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token)throw Error();({payload}=await jwtVerify(token,jwks,{issuer:'https://token.actions.githubusercontent.com',audience:'patrimonio-en-monedas-refresh',algorithms:['RS256'],maxTokenAge:'10m'}));if(!trustedClaims(payload))throw Error()}catch{return reply({error:'unauthorized'},401)}
 const base=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const db=async(path:string,method:string,body?:unknown)=>{const r=await fetch(`${base}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('database_'+r.status);return r.status===204?null:await r.json()};
 let runId:string|undefined;
 try{
  const run=await db('pm_ingestion_runs','POST',{run_key:`github:${payload.run_id}:${payload.run_attempt}`,status:'running'});runId=run[0].id;
  const today=new Date().toISOString().slice(0,10),url=`https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04638PD/json/2026-01-01/${today}/esp`;
  const res=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!res.ok)throw Error('source_http');const text=await res.text();if(text.length>300000)throw Error('source_size');const rows=parseBcrp(JSON.parse(text),today);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const result=await db('rpc/pm_apply_observations','POST',{p_rows:rows,p_run:runId,p_hash:hash});return reply({status:'success',...result});
 }catch(err){const code=err instanceof Error&&/^(source_[a-z_]+|database_\d+)$/.test(err.message)?err.message:'refresh_failed';if(runId){try{await db(`pm_ingestion_runs?id=eq.${runId}`,'PATCH',{status:'error',finished_at:new Date().toISOString(),error_code:code})}catch{console.error('failed_to_record_run')}}console.error(code);return reply({error:code},502)}
});

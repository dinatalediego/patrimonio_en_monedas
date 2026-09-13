export function trustedClaims(p){
 const repo='dinatalediego/patrimonio_en_monedas';
 const subjects=[`repo:${repo}:ref:refs/heads/main`,'repo:dinatalediego@49383324/patrimonio_en_monedas@1368767373:ref:refs/heads/main'];
 return subjects.includes(p.sub)&&p.repository===repo&&p.repository_id==='1368767373'&&p.repository_owner_id==='49383324'&&p.ref==='refs/heads/main'&&p.workflow_ref===`${repo}/.github/workflows/refresh.yml@refs/heads/main`&&['schedule','workflow_dispatch','push'].includes(p.event_name)&&p.runner_environment==='github-hosted';
}
export function parseBcrp(data,today){
 if(!data?.config?.series?.[0]?.name?.includes('Interbancario')||!data.config.series[0].name.includes('Venta')||!Array.isArray(data.periods))throw Error('source_contract');
 const months={Ene:'01',Feb:'02',Mar:'03',Abr:'04',May:'05',Jun:'06',Jul:'07',Ago:'08',Set:'09',Sep:'09',Oct:'10',Nov:'11',Dic:'12'},seen=new Set(),rows=[];
 for(const p of data.periods){const raw=p.values?.[0];if(raw==='n.d.'||raw==='')continue;const m=/^(\d{2})\.([A-Za-z]{3})\.(\d{2})$/.exec(p.name||'');if(!m||!months[m[2]])throw Error('source_date');const date=`20${m[3]}-${months[m[2]]}-${m[1]}`,rate=Number(raw);if(!Number.isFinite(rate)||rate<2||rate>6||date<'2026-01-01'||date>today||seen.has(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('source_observation');seen.add(date);rows.push({rate_date:date,rate})}
 if(rows.length<60||rows.length>1000)throw Error('source_volume');return rows.sort((a,b)=>a.rate_date.localeCompare(b.rate_date));
}

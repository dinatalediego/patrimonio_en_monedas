// GitHub issues the token to this job. It is never printed or persisted.
const u=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);u.searchParams.set('audience','patrimonio-en-monedas-refresh');
const tokenResponse=await fetch(u,{headers:{Authorization:`Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`},signal:AbortSignal.timeout(15000)});if(!tokenResponse.ok)throw Error('OIDC unavailable');const {value}=await tokenResponse.json();
const r=await fetch('https://tlyczyfsboqrtrdpwizp.supabase.co/functions/v1/pm-refresh',{method:'POST',headers:{Authorization:`Bearer ${value}`},signal:AbortSignal.timeout(90000)});const result=await r.json();console.log(JSON.stringify(result));if(!r.ok)process.exitCode=1;

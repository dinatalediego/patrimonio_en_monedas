-- Public reference data only. No personal balances or income records.
create table public.pm_rates (
 series_code text not null default 'PD04638PD' check(series_code='PD04638PD'),
 rate_date date not null, rate numeric(18,12) not null check(rate between 2 and 6),
 source_url text not null default 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04638PD/json',
 fetched_at timestamptz not null default now(), primary key(series_code,rate_date)
);
create table public.pm_ingestion_runs (
 id uuid primary key default gen_random_uuid(), run_key text unique not null,
 started_at timestamptz not null default now(), finished_at timestamptz,
 status text not null check(status in ('running','success','error')),
 rows_received integer, last_observation date, source_hash text, error_code text
);
create table public.pm_rate_revisions (
 id bigint generated always as identity primary key, series_code text not null,
 rate_date date not null, old_rate numeric(18,12) not null, new_rate numeric(18,12) not null,
 revised_at timestamptz not null default now()
);
alter table public.pm_rates enable row level security;
alter table public.pm_ingestion_runs enable row level security;
alter table public.pm_rate_revisions enable row level security;
revoke all on public.pm_rates, public.pm_ingestion_runs, public.pm_rate_revisions from anon, authenticated;
grant select on public.pm_rates to anon, authenticated;
grant all on public.pm_rates, public.pm_ingestion_runs, public.pm_rate_revisions to service_role;
grant usage, select on sequence public.pm_rate_revisions_id_seq to service_role;
create policy pm_public_market_read on public.pm_rates for select to anon, authenticated using (true);

create function public.pm_apply_observations(p_rows jsonb, p_run uuid, p_hash text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare cnt integer; latest date;
begin
 if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) not between 1 and 1000 then raise exception 'invalid_batch'; end if;
 if not exists(select 1 from public.pm_ingestion_runs where id=p_run and status='running') then raise exception 'invalid_run'; end if;
 if exists(select 1 from jsonb_to_recordset(p_rows) as x(rate_date date,rate numeric) where rate is null or rate not between 2 and 6 or rate_date is null or rate_date < '2026-01-01'::date or rate_date > current_date)
 then raise exception 'invalid_observation'; end if;
 if (select count(*) from jsonb_to_recordset(p_rows) as x(rate_date date)) <> (select count(distinct rate_date) from jsonb_to_recordset(p_rows) as x(rate_date date)) then raise exception 'duplicate_dates'; end if;
 insert into public.pm_rate_revisions(series_code,rate_date,old_rate,new_rate)
 select r.series_code,r.rate_date,r.rate,x.rate from public.pm_rates r join jsonb_to_recordset(p_rows) as x(rate_date date,rate numeric) on r.rate_date=x.rate_date
 where r.series_code='PD04638PD' and r.rate<>round(x.rate,12);
 insert into public.pm_rates(series_code,rate_date,rate)
 select 'PD04638PD',x.rate_date,x.rate from jsonb_to_recordset(p_rows) as x(rate_date date,rate numeric)
 on conflict(series_code,rate_date) do update set rate=excluded.rate,fetched_at=now();
 select count(*),max(rate_date) into cnt,latest from jsonb_to_recordset(p_rows) as x(rate_date date);
 update public.pm_ingestion_runs set status='success',finished_at=now(),rows_received=cnt,last_observation=latest,source_hash=p_hash where id=p_run;
 return jsonb_build_object('rows_received',cnt,'last_observation',latest);
end;
$$;
revoke all on function public.pm_apply_observations(jsonb,uuid,text) from public, anon, authenticated;
grant execute on function public.pm_apply_observations(jsonb,uuid,text) to service_role;

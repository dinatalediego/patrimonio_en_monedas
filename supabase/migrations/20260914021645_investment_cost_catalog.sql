create table public.pm_fee_catalog (
 version text primary key, reviewed_at date not null, payload jsonb not null,
 created_at timestamptz not null default now(),
 constraint fee_payload_object check (jsonb_typeof(payload) = 'object')
);
alter table public.pm_fee_catalog enable row level security;
revoke all on public.pm_fee_catalog from anon, authenticated;
grant select on public.pm_fee_catalog to anon, authenticated;
grant all on public.pm_fee_catalog to service_role;
create policy fee_catalog_public_read on public.pm_fee_catalog for select to anon, authenticated using (true);
insert into public.pm_fee_catalog(version,reviewed_at,payload) values ('2026-09-14.1','2026-09-14','{
  "version": "2026-09-14.1",
  "reviewed_at": "2026-09-14",
  "sources": {
    "deposit": "https://help.hapi.trade/es/articles/10244510-depositar-a-hapi-desde-peru",
    "withdraw": "https://help.hapi.trade/es/articles/12786009-como-retirar-fondos-de-hapi-en-peru",
    "trade": "https://help.hapi.trade/es/articles/8976002-entendiendo-el-clearing-house-fee-y-otras-tarifas-en-hapi",
    "ibkr": "https://www.interactivebrokers.com/en/pricing/commissions-stocks.php?re=amer",
    "ibkrwithdraw": "https://www.interactivebrokers.com/en/pricing/other-fees.php",
    "tax": "https://personas.sunat.gob.pe/rentas-fuente-extranjera",
    "credit": "https://personas.sunat.gob.pe/tengo-ingresos-extranjero/declaracion-pago"
  },
  "deposits": [
    {
      "id": "crosspen",
      "label": "Hapi · CrossPayments PEN",
      "fixed": 1.99,
      "pct": 0,
      "minimum": 0
    },
    {
      "id": "crossusd",
      "label": "Hapi · CrossPayments USD",
      "fixed": 0,
      "pct": 0.0045,
      "minimum": 2.99
    },
    {
      "id": "airtm",
      "label": "Hapi · Airtm USD",
      "fixed": 0,
      "pct": 0.0065,
      "minimum": 2.99
    },
    {
      "id": "card",
      "label": "Hapi · Tarjeta PEN / USD",
      "fixed": 0,
      "pct": 0.0385,
      "minimum": 2.99
    },
    {
      "id": "koywe",
      "label": "Hapi · Koywe USD",
      "fixed": 0,
      "pct": 0.009,
      "minimum": 2.99
    }
  ],
  "withdrawals": [
    {
      "id": "usd",
      "label": "Banco USD · opción 2",
      "fixed": 7.99,
      "pct": 0,
      "minimum": 0,
      "min_amount": 7.99
    },
    {
      "id": "pen",
      "label": "Banco PEN · opción 2",
      "fixed": 4.99,
      "pct": 0,
      "minimum": 0,
      "min_amount": 4.99
    },
    {
      "id": "airtm",
      "label": "Airtm · falta salida al banco",
      "fixed": 0,
      "pct": 0.01,
      "minimum": 4.99,
      "min_amount": 4.99
    },
    {
      "id": "wire",
      "label": "Transferencia internacional USD",
      "fixed": 20,
      "pct": 0,
      "minimum": 0,
      "min_amount": 35
    }
  ]
}
'::jsonb);

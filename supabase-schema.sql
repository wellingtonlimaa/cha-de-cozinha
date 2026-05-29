-- =============================================================
-- Schema SQL do Chá de Cozinha
-- Cole este arquivo no SQL Editor do Supabase e clique em "Run".
--
-- Cria 4 tabelas com RLS habilitada:
--   - reservations:    presentes reservados pelos convidados
--   - guests:          confirmações de presença
--   - event_settings:  configs do evento (casal, data, PIX, endereço)
--   - products:        catálogo de presentes (gerenciado pelo painel admin)
--
-- Todas têm policies públicas (qualquer um pode ler/escrever),
-- já que o site é aberto e usa apenas a chave anon. Para um
-- cenário comercial real, considere migrar para Supabase Auth.
-- =============================================================

-- ── Reservas de presentes ────────────────────────────────────

create table if not exists public.reservations (
  product_id   integer primary key,
  person_name  text not null,
  phone        text not null,
  reserved_at  timestamptz not null default now()
);

alter table public.reservations enable row level security;

drop policy if exists "leitura pública"        on public.reservations;
drop policy if exists "reserva pública"        on public.reservations;
drop policy if exists "cancelamento público"   on public.reservations;

create policy "leitura pública"
  on public.reservations for select using (true);

create policy "reserva pública"
  on public.reservations for insert with check (true);

create policy "cancelamento público"
  on public.reservations for delete using (true);

-- Realtime: atualiza pros outros convidados ao reservar
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reservations'
  ) then
    execute 'alter publication supabase_realtime add table public.reservations';
  end if;
end $$;

-- ── Confirmações de presença ─────────────────────────────────

create table if not exists public.guests (
  phone         text primary key,
  name          text not null,
  guests_count  integer not null default 1,
  confirmed_at  timestamptz not null default now()
);

alter table public.guests enable row level security;

drop policy if exists "leitura pública guests"  on public.guests;
drop policy if exists "confirmação pública"     on public.guests;
drop policy if exists "atualização pública"     on public.guests;

create policy "leitura pública guests"
  on public.guests for select using (true);

create policy "confirmação pública"
  on public.guests for insert with check (true);

create policy "atualização pública"
  on public.guests for update using (true) with check (true);

-- ── Configurações do evento ──────────────────────────────────
-- Linha única (id = 1) — gerenciada pelo painel admin.

create table if not exists public.event_settings (
  id                integer primary key default 1 check (id = 1),
  couple_name       text not null default 'Manu & Vitor',
  couple_monogram   text not null default 'M&V',
  pix_key           text not null default 'pix-chave@exemplo.com',
  day_label         text not null default 'domingo',
  time_label        text not null default 'às 14h',
  month_label       text not null default 'junho',
  year_label        text not null default '2026',
  day_number        text not null default '07',
  address           text not null default 'R. Amélia, 52 - Pinheirinho, Altiva - SP',
  maps_link         text not null default '',
  message           text not null default 'É com carinho que convidamos você para o nosso chá de cozinha, um momento especial para celebrar o início de uma nova fase.',
  updated_at        timestamptz not null default now()
);

-- Garante que a linha única existe
insert into public.event_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.event_settings enable row level security;

drop policy if exists "leitura pública event"     on public.event_settings;
drop policy if exists "atualização pública event" on public.event_settings;

create policy "leitura pública event"
  on public.event_settings for select using (true);

create policy "atualização pública event"
  on public.event_settings for update using (true) with check (true);

-- Realtime no event_settings (UI atualiza quando admin salva)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'event_settings'
  ) then
    execute 'alter publication supabase_realtime add table public.event_settings';
  end if;
end $$;

-- ── Produtos (lista de presentes) ────────────────────────────

create table if not exists public.products (
  id              integer primary key,
  code            text not null,
  name            text not null,
  category        text not null,
  color           text not null default 'Bege',
  image_url       text default '',
  reference_link  text default '',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "leitura pública products" on public.products;
drop policy if exists "criação pública products" on public.products;
drop policy if exists "edição pública products"  on public.products;
drop policy if exists "remoção pública products" on public.products;

create policy "leitura pública products"
  on public.products for select using (true);

create policy "criação pública products"
  on public.products for insert with check (true);

create policy "edição pública products"
  on public.products for update using (true) with check (true);

create policy "remoção pública products"
  on public.products for delete using (true);

-- Realtime nos produtos
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    execute 'alter publication supabase_realtime add table public.products';
  end if;
end $$;

-- ── Seed inicial dos produtos ────────────────────────────────
-- (Só insere se a tabela estiver vazia.)

insert into public.products (id, code, name, category, color, reference_link, sort_order)
select v.id, v.code, v.name, v.category, v.color, v.reference_link, v.sort_order
from (values
  ( 1, 'CC-001', 'Jogo de talheres',          'Cozinha',         'Bambu',  'https://exemplo.com/faqueiro-bambu',     1),
  ( 2, 'CC-002', 'Escorredor de louça',       'Cozinha',         'Preto',  'https://exemplo.com/escorredor-preto',   2),
  ( 3, 'CC-003', 'Jogo de pratos',            'Cozinha',         'Bege',   'https://exemplo.com/pratos-fundos',      3),
  ( 4, 'CC-004', 'Jogo de copos',             'Cozinha',         'Inox',   'https://exemplo.com/tacas-vidro',        4),
  ( 5, 'CC-005', 'Potes de mantimentos',      'Cozinha',         'Cinza',  'https://exemplo.com/potes-hermeticos',   5),
  ( 6, 'CC-006', 'Tábua de carne',            'Cozinha',         'Bambu',  'https://exemplo.com/tabua-bambu',        6),
  ( 7, 'CC-007', 'Pano de prato',             'Cozinha',         'Bege',   'https://exemplo.com/panos-prato',        7),
  ( 8, 'CC-008', 'Jarra de vidro',            'Cozinha',         'Inox',   'https://exemplo.com/jarra-vidro',        8),
  ( 9, 'CC-009', 'Conjunto de panelas',       'Cozinha',         'Marrom', 'https://exemplo.com/panelas-bege',       9),
  (10, 'CC-010', 'Porta sabão com dispenser', 'Área de Serviço', 'Marrom', 'https://exemplo.com/dispenser-cozinha',  10),
  (11, 'CC-011', 'Lixeira',                   'Área de Serviço', 'Inox',   'https://exemplo.com/lixeira-inox',       11),
  (12, 'CC-012', 'Balde organizador',         'Área de Serviço', 'Cinza',  'https://exemplo.com/baldes-organizador', 12),
  (13, 'CC-013', 'Rodo',                      'Área de Serviço', 'Inox',   'https://exemplo.com/rodo-inox',          13),
  (14, 'CC-014', 'Tapete de banheiro',        'Banheiro',        'Bege',   'https://exemplo.com/tapete-banheiro',    14),
  (15, 'CC-015', 'Toalha de banho',           'Banheiro',        'Branco', 'https://exemplo.com/toalha-banho',       15),
  (16, 'CC-016', 'Porta escova e pasta',      'Banheiro',        'Cinza',  'https://exemplo.com/porta-escova',       16),
  (17, 'CC-017', 'Lençóis ou colcha',         'Quarto e Sala',   'Branco', 'https://exemplo.com/lencois-colcha',     17),
  (18, 'CC-018', 'Travesseiros',              'Quarto e Sala',   'Branco', 'https://exemplo.com/travesseiros',       18),
  (19, 'CC-019', 'Caixa organizadora',        'Quarto e Sala',   'Bambu',  'https://exemplo.com/caixa-organizadora', 19),
  (20, 'CC-020', 'Ventilador',                'Maiores',         'Branco', 'https://exemplo.com/ventilador',         20)
) as v(id, code, name, category, color, reference_link, sort_order)
where not exists (select 1 from public.products);

-- =============================================================
-- Pronto. Tabelas criadas em: Table Editor → reservations / guests / event_settings / products
-- =============================================================

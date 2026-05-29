-- =============================================================
-- Segurança: fecha a ESCRITA do banco pra somente administradores
-- autenticados (Supabase Auth). Leitura pública e as ações dos
-- convidados (confirmar presença, reservar, recados) continuam.
--
-- PRÉ-REQUISITO: criar o usuário admin em
--   Authentication → Users → Add user (marque "Auto Confirm User")
--
-- Depois, cole tudo no SQL Editor e clique em Run.
-- =============================================================

-- ── event_settings: leitura pública, edição só admin ─────────
-- (protege a CHAVE PIX e os dados do evento)
drop policy if exists "atualização pública event" on public.event_settings;
drop policy if exists "update event admin"        on public.event_settings;
create policy "update event admin"
  on public.event_settings for update
  to authenticated using (true) with check (true);

-- ── products: leitura pública, criar/editar/remover só admin ─
drop policy if exists "criação pública products" on public.products;
drop policy if exists "edição pública products"  on public.products;
drop policy if exists "remoção pública products" on public.products;
drop policy if exists "insert products admin"    on public.products;
drop policy if exists "update products admin"    on public.products;
drop policy if exists "delete products admin"    on public.products;
create policy "insert products admin"
  on public.products for insert to authenticated with check (true);
create policy "update products admin"
  on public.products for update to authenticated using (true) with check (true);
create policy "delete products admin"
  on public.products for delete to authenticated using (true);

-- ── guests: confirmação pública, mas LEITURA só admin ────────
-- (esconde a lista de convidados e telefones do público)
drop policy if exists "leitura pública guests" on public.guests;
drop policy if exists "select guests admin"    on public.guests;
create policy "select guests admin"
  on public.guests for select to authenticated using (true);
-- insert/update permanecem públicos: o convidado confirma a própria presença.

-- ── messages: leitura/criação pública, remoção só admin ──────
drop policy if exists "remoção pública msg" on public.messages;
drop policy if exists "delete msg admin"    on public.messages;
create policy "delete msg admin"
  on public.messages for delete to authenticated using (true);

-- reservations permanecem públicas (convidados reservam e cancelam livremente).
-- =============================================================
-- Pronto. A partir de agora, editar evento/PIX/produtos exige login.
-- =============================================================

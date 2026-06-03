-- =============================================================
-- Storage: bucket público para imagens dos produtos.
-- Leitura pública (qualquer convidado vê) + upload/edição/remoção
-- somente para admin autenticado.
--
-- Rode no SQL Editor do Supabase e clique em Run.
-- =============================================================

-- Cria (ou ajusta) o bucket como público
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Leitura pública das imagens do bucket
drop policy if exists "leitura pública imagens produtos" on storage.objects;
create policy "leitura pública imagens produtos"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Upload / edição / remoção: só admin autenticado
drop policy if exists "upload imagens admin" on storage.objects;
drop policy if exists "update imagens admin" on storage.objects;
drop policy if exists "delete imagens admin" on storage.objects;

create policy "upload imagens admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

create policy "update imagens admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

create policy "delete imagens admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images');

-- =============================================================
-- Pronto. Bucket "product-images" criado e pronto para uploads.
-- =============================================================

-- =============================================================
-- Corrige "Erro ao salvar" nas Informações do evento.
-- A tabela event_settings estava sem 3 colunas que o formulário
-- do admin grava. Este script adiciona as colunas que faltam.
--
-- Rode no SQL Editor do Supabase e clique em Run. (Sem redeploy.)
-- =============================================================

alter table public.event_settings
  add column if not exists couple_photo_url text not null default '',
  add column if not exists event_datetime   timestamptz,
  add column if not exists whatsapp_number   text not null default '';

-- =============================================================
-- Pronto. Agora o botão "Salvar informações" funciona.
-- =============================================================

-- Run this once in the Supabase SQL Editor for the shared `leads` table.
-- Adds real columns for lead source / UTM tracking (previously only inside custom_fields JSON).
-- Safe to run on the shared table used by other client projects too — additive only, nothing removed.

alter table public.leads
  add column if not exists submitted_at timestamptz not null default now(),
  add column if not exists landing_page text,
  add column if not exists lead_source  text,
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content  text,
  add column if not exists utm_term     text;

-- Postgres column order has no functional effect (it's cosmetic only).
-- To match the requested visual order in Supabase Table Editor, drag the columns
-- into this order after running the migration:
--   submitted_at, name, phone, email, notes, lead_source, landing_page,
--   utm_source, utm_medium, utm_campaign, utm_content, utm_term

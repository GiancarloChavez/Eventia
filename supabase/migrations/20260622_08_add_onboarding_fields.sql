-- ============================================================
-- MIGRACIÓN 8: Campos faltantes para onboarding de proveedores
-- ============================================================

-- ── providers ─────────────────────────────────────────────────

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS phone                    TEXT,
  ADD COLUMN IF NOT EXISTS category_id              INTEGER REFERENCES public.service_categories(id),
  ADD COLUMN IF NOT EXISTS city                     TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_step          INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_card_last4        TEXT,
  ADD COLUMN IF NOT EXISTS stripe_card_brand        TEXT;

-- Cambiar DEFAULT de status a 'draft' (estado inicial antes de completar onboarding)
ALTER TABLE public.providers ALTER COLUMN status SET DEFAULT 'draft';

-- ── services ──────────────────────────────────────────────────

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS space_type        TEXT,
  ADD COLUMN IF NOT EXISTS parking           BOOLEAN,
  ADD COLUMN IF NOT EXISTS amenities         TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS photo_modality    TEXT,
  ADD COLUMN IF NOT EXISTS coverage_hours    NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS delivery_days     INTEGER,
  ADD COLUMN IF NOT EXISTS album_included    BOOLEAN,
  ADD COLUMN IF NOT EXISTS music_type        TEXT,
  ADD COLUMN IF NOT EXISTS music_genres      TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sound_equipment   BOOLEAN,
  ADD COLUMN IF NOT EXISTS lighting_included BOOLEAN,
  ADD COLUMN IF NOT EXISTS deco_types        TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS setup_included    BOOLEAN,
  ADD COLUMN IF NOT EXISTS custom_design     BOOLEAN;

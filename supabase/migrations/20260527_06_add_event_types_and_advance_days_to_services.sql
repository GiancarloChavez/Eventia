ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS event_types  text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS advance_days integer NOT NULL DEFAULT 0;

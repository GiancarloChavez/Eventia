-- ============================================================
-- MIGRACIÓN 7: Tabla de OTPs de verificación de correo
-- Los códigos son enviados via Resend (no Supabase email).
-- Solo accesible con service_role key (RLS sin políticas).
-- ============================================================

CREATE TABLE public.email_otps (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL,
  code_hash  TEXT        NOT NULL,
  verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_otps_lookup
  ON public.email_otps(email, used, expires_at);

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- ── Helper: buscar usuario por email en auth.users ───────────
-- Usado en complete-signup para detectar si el usuario ya existe.

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE email = p_email LIMIT 1;
  RETURN v_id;
END;
$$;

-- ============================================================
-- MIGRACIÓN 5: Actualizar trigger de creación de usuario
-- Lee role y phone desde raw_user_meta_data; auto-crea fila
-- en providers cuando role = 'provider'.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _role TEXT;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  IF _role NOT IN ('client', 'provider', 'admin') THEN
    _role := 'client';
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    _role
  );

  IF _role = 'provider' THEN
    INSERT INTO public.providers (user_id, business_name, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$;

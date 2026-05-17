-- ============================================================
-- MIGRACIÓN 2: Proveedores y servicios
-- ============================================================

CREATE TABLE public.providers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name     TEXT        NOT NULL,
  description       TEXT,
  ruc               TEXT,
  document_url      TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason  TEXT,
  approved_by       UUID        REFERENCES public.profiles(id),
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_providers_user_id ON public.providers(user_id);
CREATE INDEX idx_providers_status  ON public.providers(status);

CREATE TABLE public.services (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id   INTEGER     NOT NULL REFERENCES public.service_categories(id),
  title         TEXT        NOT NULL,
  description   TEXT,
  pricing_type  TEXT        NOT NULL CHECK (pricing_type IN ('fixed', 'quote')),
  base_price    NUMERIC(10,2),
  capacity_min  INTEGER,
  capacity_max  INTEGER,
  location      TEXT,
  status        TEXT        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fixed_price_required
    CHECK (pricing_type = 'quote' OR base_price IS NOT NULL)
);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_services_provider_id  ON public.services(provider_id);
CREATE INDEX idx_services_category_id  ON public.services(category_id);
CREATE INDEX idx_services_status       ON public.services(status);
CREATE INDEX idx_services_pricing_type ON public.services(pricing_type);

CREATE TABLE public.service_images (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    UUID        NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  url           TEXT        NOT NULL,
  display_order INTEGER     NOT NULL DEFAULT 0,
  is_cover      BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_images_service_id ON public.service_images(service_id);

ALTER TABLE public.providers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proveedor visible para todos" ON public.providers
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Proveedor gestiona su propio perfil" ON public.providers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Servicios activos visibles para todos" ON public.services
  FOR SELECT USING (status = 'active');

CREATE POLICY "Proveedor gestiona sus servicios" ON public.services
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Imágenes visibles para todos" ON public.service_images
  FOR SELECT USING (true);

CREATE POLICY "Proveedor gestiona imágenes de sus servicios" ON public.service_images
  FOR ALL USING (
    service_id IN (
      SELECT s.id FROM public.services s
      JOIN public.providers p ON p.id = s.provider_id
      WHERE p.user_id = auth.uid()
    )
  );

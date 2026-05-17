-- ============================================================
-- MIGRACIÓN 4: Reseñas y notificaciones
-- ============================================================

CREATE TABLE public.reviews (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID        NOT NULL UNIQUE REFERENCES public.bookings(id),
  client_id             UUID        NOT NULL REFERENCES public.profiles(id),
  service_id            UUID        NOT NULL REFERENCES public.services(id),
  rating                INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment               TEXT,
  provider_response     TEXT,
  provider_response_at  TIMESTAMPTZ,
  is_visible            BOOLEAN     NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX idx_reviews_client_id  ON public.reviews(client_id);
CREATE INDEX idx_reviews_is_visible ON public.reviews(is_visible);

CREATE OR REPLACE VIEW public.service_ratings AS
  SELECT
    service_id,
    ROUND(AVG(rating)::NUMERIC, 1) AS avg_rating,
    COUNT(*)                        AS review_count
  FROM public.reviews
  WHERE is_visible = true
  GROUP BY service_id;

CREATE TABLE public.notifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL
                  CHECK (type IN (
                    'booking_request', 'booking_confirmed', 'booking_cancelled',
                    'quote_received',  'quote_accepted',    'quote_rejected',
                    'contract_ready',  'contract_signed',
                    'payment_received','payment_released',
                    'review_received', 'event_reminder'
                  )),
  title           TEXT        NOT NULL,
  message         TEXT        NOT NULL,
  is_read         BOOLEAN     NOT NULL DEFAULT false,
  reference_id    UUID,
  reference_type  TEXT        CHECK (reference_type IN ('booking', 'contract', 'payment', 'review')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type    ON public.notifications(type);

ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reseñas visibles para todos" ON public.reviews
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Cliente crea reseña de su reserva completada" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id AND
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE client_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Proveedor responde reseñas de sus servicios" ON public.reviews
  FOR UPDATE USING (
    service_id IN (
      SELECT s.id FROM public.services s
      JOIN public.providers p ON p.id = s.provider_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuario ve solo sus notificaciones" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuario marca sus notificaciones como leídas" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- MIGRACIÓN 3: Reservas, contratos y pagos
-- ============================================================

CREATE TABLE public.bookings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID        NOT NULL REFERENCES public.profiles(id),
  service_id    UUID        NOT NULL REFERENCES public.services(id),
  event_date    DATE        NOT NULL,
  event_type    TEXT,
  guest_count   INTEGER,
  notes         TEXT,
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'quoted', 'confirmed', 'completed', 'cancelled')),
  quoted_price  NUMERIC(10,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_bookings_client_id  ON public.bookings(client_id);
CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX idx_bookings_status     ON public.bookings(status);
CREATE INDEX idx_bookings_event_date ON public.bookings(event_date);

CREATE TABLE public.contracts (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID          NOT NULL UNIQUE REFERENCES public.bookings(id),
  terms               TEXT          NOT NULL,
  total_amount        NUMERIC(10,2) NOT NULL,
  commission_rate     NUMERIC(5,2)  NOT NULL,
  commission_amount   NUMERIC(10,2) NOT NULL,
  provider_amount     NUMERIC(10,2) NOT NULL,
  client_signed_at    TIMESTAMPTZ,
  provider_signed_at  TIMESTAMPTZ,
  status              TEXT          NOT NULL DEFAULT 'pending_signatures'
                      CHECK (status IN ('pending_signatures', 'signed', 'cancelled')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_booking_id ON public.contracts(booking_id);
CREATE INDEX idx_contracts_status     ON public.contracts(status);

CREATE TABLE public.payments (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id               UUID          NOT NULL UNIQUE REFERENCES public.contracts(id),
  stripe_payment_intent_id  TEXT          UNIQUE,
  stripe_transfer_id        TEXT,
  amount                    NUMERIC(10,2) NOT NULL,
  commission_amount         NUMERIC(10,2) NOT NULL,
  provider_amount           NUMERIC(10,2) NOT NULL,
  currency                  TEXT          NOT NULL DEFAULT 'usd',
  status                    TEXT          NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'paid', 'transferred', 'refunded')),
  paid_at                   TIMESTAMPTZ,
  transferred_at            TIMESTAMPTZ,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_contract_id              ON public.payments(contract_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status                   ON public.payments(status);

ALTER TABLE public.bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente ve sus reservas" ON public.bookings
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Cliente crea reservas" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Cliente o proveedor actualizan reserva" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = client_id OR
    service_id IN (
      SELECT s.id FROM public.services s
      JOIN public.providers p ON p.id = s.provider_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Proveedor ve reservas de sus servicios" ON public.bookings
  FOR SELECT USING (
    service_id IN (
      SELECT s.id FROM public.services s
      JOIN public.providers p ON p.id = s.provider_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Partes involucradas ven el contrato" ON public.contracts
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE client_id = auth.uid()
      OR service_id IN (
        SELECT s.id FROM public.services s
        JOIN public.providers p ON p.id = s.provider_id
        WHERE p.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Partes involucradas actualizan contrato" ON public.contracts
  FOR UPDATE USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE client_id = auth.uid()
      OR service_id IN (
        SELECT s.id FROM public.services s
        JOIN public.providers p ON p.id = s.provider_id
        WHERE p.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Cliente ve sus pagos" ON public.payments
  FOR SELECT USING (
    contract_id IN (
      SELECT c.id FROM public.contracts c
      JOIN public.bookings b ON b.id = c.booking_id
      WHERE b.client_id = auth.uid()
    )
  );

CREATE POLICY "Proveedor ve pagos de sus contratos" ON public.payments
  FOR SELECT USING (
    contract_id IN (
      SELECT c.id FROM public.contracts c
      JOIN public.bookings b ON b.id = c.booking_id
      JOIN public.services s ON s.id = b.service_id
      JOIN public.providers p ON p.id = s.provider_id
      WHERE p.user_id = auth.uid()
    )
  );

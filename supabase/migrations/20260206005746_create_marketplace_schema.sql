/*
  # Create Marketplace Schema

  1. New Tables
    - `marketplace_vehicles`
      - `id` (uuid, primary key)
      - `seller_id` (text, NOT NULL) - external auth user ID
      - `status` (text) - DRAFT, PENDING_REVIEW, APPROVED, REJECTED, SOLD, ARCHIVED
      - Vehicle fields: title, make, model, year, price_usd, vehicle_type, colors, transmission, fuel_type, engine_size, drivetrain, mileage, vin, description, features, location
      - `rejection_reason` (text, nullable) - reason if admin rejects
      - Timestamps
    - `vehicle_images`
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, FK to marketplace_vehicles)
      - `url` (text)
      - `is_primary` (boolean)
      - `sort_order` (integer)
    - `vehicle_requests`
      - `id` (uuid, primary key)
      - `buyer_id` (text, NOT NULL) - external auth user ID
      - `vehicle_id` (uuid, FK to marketplace_vehicles)
      - `status` (text) - NEW_REQUEST through COMPLETED/CANCELED
      - `deposit_amount`, `final_amount` (numeric)
      - `cancel_reason`, `notes` (text)
    - `marketplace_payments`
      - `id` (uuid, primary key)
      - `request_id` (uuid, FK to vehicle_requests)
      - `payer_id` (text)
      - `payment_type` (text) - DEPOSIT or FINAL
      - `stripe_payment_intent_id` (text)
      - `amount` (numeric), `currency` (text), `status` (text)
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `title`, `message`, `type`, `link` (text)
      - `is_read` (boolean)
    - `audit_logs`
      - `id` (uuid, primary key)
      - `admin_id` (text)
      - `action`, `entity_type`, `entity_id` (text)
      - `details` (jsonb)

  2. Security
    - RLS enabled on all tables
    - Public (anon) can only SELECT approved vehicles and their images
    - All write operations handled via server-side API routes using service role
    - Restrictive policies: no USING(true)

  3. Indexes
    - marketplace_vehicles: status, seller_id
    - vehicle_images: vehicle_id
    - vehicle_requests: buyer_id, vehicle_id, status
    - marketplace_payments: request_id
    - notifications: user_id, is_read
    - audit_logs: admin_id, entity_type
*/

-- marketplace_vehicles
CREATE TABLE IF NOT EXISTS marketplace_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SOLD', 'ARCHIVED')),
  title text NOT NULL DEFAULT '',
  make text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT 2020,
  price_usd numeric(12,2) NOT NULL DEFAULT 0,
  vehicle_type text NOT NULL DEFAULT 'CAR',
  exterior_color text DEFAULT '',
  interior_color text DEFAULT '',
  transmission text NOT NULL DEFAULT 'Automatic',
  fuel_type text NOT NULL DEFAULT 'Regular Unleaded',
  engine_size text DEFAULT '',
  drivetrain text NOT NULL DEFAULT 'FWD',
  mileage integer DEFAULT 0,
  vin text DEFAULT '',
  description text DEFAULT '',
  features text[] DEFAULT '{}',
  location_city text DEFAULT '',
  location_state text DEFAULT '',
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved vehicles"
  ON marketplace_vehicles
  FOR SELECT
  TO anon
  USING (status = 'APPROVED');

CREATE INDEX IF NOT EXISTS idx_marketplace_vehicles_status ON marketplace_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_vehicles_seller_id ON marketplace_vehicles(seller_id);

-- vehicle_images
CREATE TABLE IF NOT EXISTS vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES marketplace_vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view images of approved vehicles"
  ON vehicle_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_vehicles
      WHERE marketplace_vehicles.id = vehicle_images.vehicle_id
      AND marketplace_vehicles.status = 'APPROVED'
    )
  );

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);

-- vehicle_requests
CREATE TABLE IF NOT EXISTS vehicle_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id text NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES marketplace_vehicles(id),
  status text NOT NULL DEFAULT 'NEW_REQUEST'
    CHECK (status IN (
      'NEW_REQUEST', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'ADMIN_VERIFYING',
      'VERIFIED_AVAILABLE', 'FINAL_PAYMENT_PENDING', 'FINAL_PAID', 'COMPLETED', 'CANCELED'
    )),
  deposit_amount numeric(12,2) NOT NULL DEFAULT 500,
  final_amount numeric(12,2) DEFAULT 0,
  cancel_reason text,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vehicle_requests_buyer_id ON vehicle_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_vehicle_id ON vehicle_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_status ON vehicle_requests(status);

-- marketplace_payments
CREATE TABLE IF NOT EXISTS marketplace_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES vehicle_requests(id),
  payer_id text NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('DEPOSIT', 'FINAL')),
  stripe_payment_intent_id text,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_marketplace_payments_request_id ON marketplace_payments(request_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'
    CHECK (type IN ('info', 'success', 'warning', 'error')),
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_marketplace_vehicles_updated_at'
  ) THEN
    CREATE TRIGGER update_marketplace_vehicles_updated_at
      BEFORE UPDATE ON marketplace_vehicles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_vehicle_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicle_requests_updated_at
      BEFORE UPDATE ON vehicle_requests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_marketplace_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_marketplace_payments_updated_at
      BEFORE UPDATE ON marketplace_payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

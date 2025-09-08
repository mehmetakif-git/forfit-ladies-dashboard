/*
  # Create feature toggles system

  1. New Tables
    - `feature_toggles`
      - `id` (uuid, primary key)
      - `feature_name` (text, unique)
      - `enabled` (boolean, default true)
      - `role_permissions` (jsonb)
      - `description` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `feature_toggles` table
    - Add policy for authenticated users to read feature toggles
    - Add policy for admin users to manage feature toggles

  3. Initial Data
    - Insert default feature toggles for all system features
    - Set appropriate role permissions for each feature
*/

CREATE TABLE IF NOT EXISTS feature_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text UNIQUE NOT NULL,
  enabled boolean DEFAULT true,
  role_permissions jsonb DEFAULT '["admin"]'::jsonb,
  description text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read feature toggles"
  ON feature_toggles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage feature toggles"
  ON feature_toggles
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default feature toggles
INSERT INTO feature_toggles (feature_name, enabled, role_permissions, description, category) VALUES
  ('security_cameras', true, '["admin"]', 'Security camera monitoring and management', 'security'),
  ('access_control', true, '["admin"]', 'NFC access control and door management', 'security'),
  ('member_management', true, '["admin", "staff"]', 'Member CRUD operations and profiles', 'members'),
  ('member_documents', true, '["admin", "staff"]', 'QID and document upload system', 'members'),
  ('trainer_management', true, '["admin"]', 'Trainer assignments and scheduling', 'trainers'),
  ('payment_system', true, '["admin"]', 'Payment processing and financial records', 'finance'),
  ('subscription_management', true, '["admin", "staff"]', 'Subscription plans and pricing', 'finance'),
  ('discount_system', true, '["admin"]', 'Member discount management', 'finance'),
  ('attendance_tracking', true, '["admin", "staff"]', 'Check-in/out and attendance records', 'operations'),
  ('class_booking', true, '["admin", "staff"]', 'Fitness class scheduling and bookings', 'operations'),
  ('progress_tracking', true, '["admin", "staff", "trainer"]', 'Member progress photos and measurements', 'health'),
  ('whatsapp_integration', true, '["admin", "staff"]', 'WhatsApp messaging and templates', 'communications'),
  ('reports_analytics', true, '["admin"]', 'Business reports and analytics dashboard', 'reports'),
  ('system_testing', true, '["admin"]', 'System testing and diagnostics panel', 'admin'),
  ('form_builder', true, '["admin"]', 'Dynamic registration form builder', 'admin'),
  ('theme_customization', true, '["admin"]', 'Branding and theme customization', 'admin'),
  ('notification_system', true, '["admin", "staff"]', 'System notifications and alerts', 'communications'),
  ('backup_restore', true, '["admin"]', 'Data backup and restore functionality', 'admin');
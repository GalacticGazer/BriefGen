-- Main reports table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Customer
  customer_email TEXT NOT NULL,

  -- Report details
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'standard',

  -- Payment
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  amount_cents INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending',

  -- Report generation
  report_status TEXT DEFAULT 'pending',
  -- Statuses: 'pending', 'generating', 'completed', 'failed', 'awaiting_manual'
  report_content TEXT,
  report_pdf_url TEXT,

  -- Delivery
  email_sent BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Operator fields (for premium/custom reports)
  operator_notified BOOLEAN DEFAULT FALSE,
  operator_notes TEXT
);

CREATE INDEX idx_reports_email ON reports(customer_email);
CREATE INDEX idx_reports_status ON reports(report_status);
CREATE INDEX idx_reports_stripe_session ON reports(stripe_session_id);
CREATE INDEX idx_reports_payment_status ON reports(payment_status);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON reports
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Do not grant public/anon SELECT access to reports.
-- Status polling is served through server-side API routes.
DROP POLICY IF EXISTS "Public can read own report status" ON reports;

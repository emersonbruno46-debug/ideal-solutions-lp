
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  address TEXT,
  instagram_url TEXT,
  brand_color TEXT DEFAULT '#E07A5F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their businesses" ON public.businesses FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Public can view businesses by slug" ON public.businesses FOR SELECT USING (true);

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  price DECIMAL(10,2),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage services" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (is_active = true);

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Staff members table
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage staff" ON public.staff_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Public can view active staff" ON public.staff_members FOR SELECT USING (is_active = true);

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Working hours table
CREATE TABLE public.working_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(business_id, day_of_week)
);

ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage hours" ON public.working_hours FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Public can view working hours" ON public.working_hours FOR SELECT USING (true);

-- Blocked dates table
CREATE TABLE public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage blocked dates" ON public.blocked_dates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Public can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone)
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage customers" ON public.customers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
-- Allow anonymous inserts for booking (customers create themselves)
CREATE POLICY "Anyone can create customers for booking" ON public.customers FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  staff_id UUID REFERENCES public.staff_members(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'canceled', 'completed', 'no_show')),
  notes TEXT,
  reminder_24h_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_2h_sent BOOLEAN NOT NULL DEFAULT false,
  webhook_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage appointments" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
-- Allow anonymous inserts for booking
CREATE POLICY "Anyone can create appointments for booking" ON public.appointments FOR INSERT WITH CHECK (true);
-- Allow public to view appointments for availability checking
CREATE POLICY "Public can view appointments for availability" ON public.appointments FOR SELECT USING (true);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Webhook events table
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('appointment_created', 'appointment_canceled', 'reminder_24h', 'reminder_2h')),
  payload JSONB NOT NULL DEFAULT '{}',
  delivered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view webhook events" ON public.webhook_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_appointments_business_date ON public.appointments(business_id, appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_services_business ON public.services(business_id);
CREATE INDEX idx_staff_business ON public.staff_members(business_id);
CREATE INDEX idx_customers_business ON public.customers(business_id);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);

-- Storage bucket for business logos
INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true);
CREATE POLICY "Anyone can view business assets" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');
CREATE POLICY "Authenticated users can upload business assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'business-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update their business assets" ON storage.objects FOR UPDATE USING (bucket_id = 'business-assets' AND auth.role() = 'authenticated');

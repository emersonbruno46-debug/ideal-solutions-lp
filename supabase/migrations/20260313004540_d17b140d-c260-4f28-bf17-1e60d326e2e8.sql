CREATE OR REPLACE FUNCTION public.create_business_for_user(_user_id uuid, _name text, _slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id uuid;
  _dow integer;
BEGIN
  INSERT INTO public.businesses (owner_id, name, slug)
  VALUES (_user_id, _name, _slug)
  RETURNING id INTO _business_id;

  -- Insert default working hours: Mon-Fri (1-5) active, Sat-Sun (0,6) inactive
  FOR _dow IN 0..6 LOOP
    INSERT INTO public.working_hours (business_id, day_of_week, start_time, end_time, is_active)
    VALUES (_business_id, _dow, '09:00', '18:00', _dow >= 1 AND _dow <= 5);
  END LOOP;
END;
$$;
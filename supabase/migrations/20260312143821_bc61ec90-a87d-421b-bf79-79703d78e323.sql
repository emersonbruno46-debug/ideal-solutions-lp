
CREATE OR REPLACE FUNCTION public.create_business_for_user(
  _user_id uuid,
  _name text,
  _slug text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.businesses (owner_id, name, slug)
  VALUES (_user_id, _name, _slug);
END;
$$;

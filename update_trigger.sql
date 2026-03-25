-- Update handle_new_user function to support Shadow Profiles (Invitations)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- 1. Check if there is a pending invitation for this email
  SELECT * INTO invite_record 
  FROM public.pending_invitations 
  WHERE email = new.email 
  LIMIT 1;

  IF invite_record.email IS NOT NULL THEN
    -- 2. If invitation exists, link user to company and assign role from invitation
    INSERT INTO public.profiles (id, company_id, email, first_name, last_name, role, is_active)
    VALUES (
      new.id, 
      invite_record.company_id, 
      new.email, 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name', 
      invite_record.role, 
      true
    );
    
    -- 3. Delete the used invitation
    DELETE FROM public.pending_invitations WHERE email = new.email;
  ELSE
    -- 4. Fallback: Default profile creation
    INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
    VALUES (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name', 
      'EMPLOYEE', 
      true
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

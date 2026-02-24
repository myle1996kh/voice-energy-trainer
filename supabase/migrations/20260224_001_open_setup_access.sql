-- Open setup access for authless Voice Energy Trainer mode
-- Date: 2026-02-24

-- Sentences: allow full management without admin role checks
DROP POLICY IF EXISTS "Admins can insert sentences" ON public.sentences;
DROP POLICY IF EXISTS "Admins can update sentences" ON public.sentences;
DROP POLICY IF EXISTS "Admins can delete sentences" ON public.sentences;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sentences' AND policyname = 'Anyone can insert sentences'
  ) THEN
    CREATE POLICY "Anyone can insert sentences"
      ON public.sentences FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sentences' AND policyname = 'Anyone can update sentences'
  ) THEN
    CREATE POLICY "Anyone can update sentences"
      ON public.sentences FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sentences' AND policyname = 'Anyone can delete sentences'
  ) THEN
    CREATE POLICY "Anyone can delete sentences"
      ON public.sentences FOR DELETE
      USING (true);
  END IF;
END $$;

-- App settings: allow setup changes for all sessions
DROP POLICY IF EXISTS "Admins can insert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can delete app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.app_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.app_settings;
DROP POLICY IF EXISTS "Allow admin update" ON public.app_settings;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Anyone can insert app settings'
  ) THEN
    CREATE POLICY "Anyone can insert app settings"
      ON public.app_settings FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Anyone can update app settings'
  ) THEN
    CREATE POLICY "Anyone can update app settings"
      ON public.app_settings FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Anyone can delete app settings'
  ) THEN
    CREATE POLICY "Anyone can delete app settings"
      ON public.app_settings FOR DELETE
      USING (true);
  END IF;
END $$;

-- Profiles: allow setup page to read all learners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Anyone can view profiles'
  ) THEN
    CREATE POLICY "Anyone can view profiles"
      ON public.profiles FOR SELECT
      USING (true);
  END IF;
END $$;

-- User roles: allow setup page to toggle roles without a privileged account
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Anyone can view roles'
  ) THEN
    CREATE POLICY "Anyone can view roles"
      ON public.user_roles FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Anyone can insert roles'
  ) THEN
    CREATE POLICY "Anyone can insert roles"
      ON public.user_roles FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Anyone can update roles'
  ) THEN
    CREATE POLICY "Anyone can update roles"
      ON public.user_roles FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Anyone can delete roles'
  ) THEN
    CREATE POLICY "Anyone can delete roles"
      ON public.user_roles FOR DELETE
      USING (true);
  END IF;
END $$;

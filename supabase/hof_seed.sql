-- Hall of Fame seed — 3 real-world tools
-- Run in Supabase Dashboard > SQL Editor

DO $$
DECLARE
  v_admin_id  uuid;
  v_linear_id uuid;
  v_raycast_id uuid;
  v_vercel_id uuid;
BEGIN
  /* ── Get admin user ────────────────────────────────────────────────── */
  SELECT id INTO v_admin_id
  FROM auth.users WHERE email = 'sohams270@gmail.com' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found. Check the email matches your account.';
  END IF;

  /* ── Linear ────────────────────────────────────────────────────────── */
  SELECT id INTO v_linear_id FROM public.tools WHERE slug = 'linear' LIMIT 1;
  IF v_linear_id IS NULL THEN
    INSERT INTO public.tools (
      name, slug, tagline, description,
      website_url, pricing, status, upvote_count, featured, submitter_id
    ) VALUES (
      'Linear',
      'linear',
      'Issue tracker built for modern software teams',
      'Linear is a purpose-built tool for planning and building products. Streamline issues, sprints, and product roadmaps with an interface that is fast by design — keyboard-first, zero clutter, and built for teams that move fast.',
      'https://linear.app',
      'freemium',
      'approved',
      4821,
      false,
      v_admin_id
    ) RETURNING id INTO v_linear_id;
  ELSE
    UPDATE public.tools SET upvote_count = 4821, status = 'approved' WHERE id = v_linear_id;
  END IF;

  /* ── Raycast ───────────────────────────────────────────────────────── */
  SELECT id INTO v_raycast_id FROM public.tools WHERE slug = 'raycast' LIMIT 1;
  IF v_raycast_id IS NULL THEN
    INSERT INTO public.tools (
      name, slug, tagline, description,
      website_url, pricing, status, upvote_count, featured, submitter_id
    ) VALUES (
      'Raycast',
      'raycast',
      'Blazingly fast macOS launcher with extensions',
      'Raycast is a blazingly fast, totally extendable launcher. Complete tasks, calculate, share common links, and navigate your entire stack — all from a single command palette. Trusted by millions of developers worldwide.',
      'https://raycast.com',
      'freemium',
      'approved',
      3942,
      false,
      v_admin_id
    ) RETURNING id INTO v_raycast_id;
  ELSE
    UPDATE public.tools SET upvote_count = 3942, status = 'approved' WHERE id = v_raycast_id;
  END IF;

  /* ── Vercel ────────────────────────────────────────────────────────── */
  SELECT id INTO v_vercel_id FROM public.tools WHERE slug = 'vercel' LIMIT 1;
  IF v_vercel_id IS NULL THEN
    INSERT INTO public.tools (
      name, slug, tagline, description,
      website_url, pricing, status, upvote_count, featured, submitter_id
    ) VALUES (
      'Vercel',
      'vercel',
      'Frontend cloud for the modern web',
      'Vercel enables frontend teams to do their best work. Build, deploy, and scale modern web applications with zero configuration, instant rollbacks, and global edge infrastructure. The platform that powers the web.',
      'https://vercel.com',
      'freemium',
      'approved',
      3611,
      false,
      v_admin_id
    ) RETURNING id INTO v_vercel_id;
  ELSE
    UPDATE public.tools SET upvote_count = 3611, status = 'approved' WHERE id = v_vercel_id;
  END IF;

  /* ── Hall of Fame entries ──────────────────────────────────────────── */
  INSERT INTO public.hall_of_fame (tool_id, user_id, pitch, status, inducted_at)
  VALUES
    (
      v_linear_id, v_admin_id,
      'The gold standard for engineering teams. Linear redefined how product teams track work — minimal UI, maximum velocity, keyboard-first by design.',
      'approved',
      '2024-01-15 00:00:00+00'
    ),
    (
      v_raycast_id, v_admin_id,
      'The macOS power tool millions of developers swear by. Raycast replaced Spotlight and transformed how builders interact with their entire stack in one keystroke.',
      'approved',
      '2024-02-20 00:00:00+00'
    ),
    (
      v_vercel_id, v_admin_id,
      'Deployment infrastructure that changed the game. Vercel made production-grade CI/CD accessible to every frontend developer in minutes, not days.',
      'approved',
      '2024-03-10 00:00:00+00'
    )
  ON CONFLICT (tool_id) DO UPDATE SET
    status     = 'approved',
    inducted_at = EXCLUDED.inducted_at,
    pitch       = EXCLUDED.pitch;

  RAISE NOTICE 'Done. Inducted: Linear (%), Raycast (%), Vercel (%)',
    v_linear_id, v_raycast_id, v_vercel_id;
END $$;

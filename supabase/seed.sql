-- NextBigTool: Seed data
-- Run SECOND, after schema.sql succeeds
-- Wrapped in DO block so the SQL editor treats it as one statement

DO $$
DECLARE
  cat_ai   uuid;
  cat_dev  uuid;
  cat_prod uuid;
  cat_des  uuid;
  cat_mkt  uuid;
  cat_ana  uuid;
  cat_sec  uuid;
  cat_fin  uuid;
BEGIN

  -- categories
  INSERT INTO public.categories (slug, name, icon) VALUES
    ('ai-ml',           'AI / ML',         'robot'),
    ('developer-tools', 'Developer Tools', 'wrench'),
    ('productivity',    'Productivity',    'zap'),
    ('design',          'Design',          'pen-tool'),
    ('marketing',       'Marketing',       'megaphone'),
    ('analytics',       'Analytics',       'bar-chart'),
    ('security',        'Security',        'shield'),
    ('finance',         'Finance',         'dollar-sign');

  SELECT id INTO cat_ai   FROM public.categories WHERE slug = 'ai-ml';
  SELECT id INTO cat_dev  FROM public.categories WHERE slug = 'developer-tools';
  SELECT id INTO cat_prod FROM public.categories WHERE slug = 'productivity';
  SELECT id INTO cat_des  FROM public.categories WHERE slug = 'design';
  SELECT id INTO cat_mkt  FROM public.categories WHERE slug = 'marketing';
  SELECT id INTO cat_ana  FROM public.categories WHERE slug = 'analytics';
  SELECT id INTO cat_sec  FROM public.categories WHERE slug = 'security';
  SELECT id INTO cat_fin  FROM public.categories WHERE slug = 'finance';

  -- tags
  INSERT INTO public.tags (slug, name) VALUES
    ('llm',           'LLM'),
    ('open-source',   'Open Source'),
    ('api',           'API'),
    ('no-code',       'No-Code'),
    ('automation',    'Automation'),
    ('browser',       'Browser'),
    ('collaboration', 'Collaboration'),
    ('saas',          'SaaS'),
    ('cli',           'CLI'),
    ('vector-db',     'Vector DB');

  -- tools
  INSERT INTO public.tools
    (slug, name, tagline, description, logo_url, website_url, pricing, upvote_count, view_count, featured, launched_at, category_id)
  VALUES
    ('promptbase', 'PromptBase', 'Marketplace for buying and selling AI prompts',
     'A curated marketplace where creators sell high-quality prompts for GPT-4, Midjourney, and DALL-E. Buyers get better results; sellers monetize their expertise.',
     'https://promptbase.com/favicon.ico', 'https://promptbase.com',
     'freemium', 312, 4100, true, '2026-04-10', cat_ai),

    ('raycast', 'Raycast', 'Blazingly fast macOS launcher for developers',
     'Replace Spotlight with a fully extensible launcher. Open apps, run scripts, manage snippets, search GitHub repos, and control your Mac without touching the mouse.',
     'https://raycast.com/favicon.ico', 'https://raycast.com',
     'freemium', 287, 3800, true, '2026-04-09', cat_dev),

    ('linear-app', 'Linear', 'Issue tracker built for modern software teams',
     'Linear streamlines software projects, sprints, tasks, and bug tracking. Built for speed with keyboard-first navigation and Git integrations that keep issues in sync.',
     'https://linear.app/favicon.ico', 'https://linear.app',
     'freemium', 251, 3200, false, '2026-04-08', cat_prod),

    ('warp-term', 'Warp', 'The terminal reimagined with AI and collaboration',
     'A Rust-based terminal that understands commands, autocompletes naturally, lets you share terminal sessions with teammates, and has an AI assistant built right in.',
     'https://warp.dev/favicon.ico', 'https://warp.dev',
     'freemium', 198, 2700, false, '2026-04-08', cat_dev),

    ('perplexity', 'Perplexity', 'AI-powered answer engine with cited sources',
     'Ask any question and get a concise, sourced answer in seconds. Perplexity searches the web in real time and shows you exactly where each claim comes from.',
     'https://perplexity.ai/favicon.ico', 'https://perplexity.ai',
     'freemium', 189, 2500, false, '2026-04-07', cat_ai),

    ('supabase', 'Supabase', 'Open source Firebase alternative built on Postgres',
     'Build in a weekend, scale to millions. Supabase gives you a Postgres database, auth, edge functions, realtime subscriptions, and storage, all open source.',
     'https://supabase.com/favicon.ico', 'https://supabase.com',
     'freemium', 176, 2300, false, '2026-04-07', cat_dev),

    ('loom', 'Loom', 'Record and share video messages with your team',
     'Skip meetings. Record your screen and camera in one click, share a link, and let teammates watch at their own pace. Async video communication done right.',
     'https://loom.com/favicon.ico', 'https://loom.com',
     'freemium', 154, 2100, false, '2026-04-06', cat_prod),

    ('figma-ai', 'Figma AI', 'Design faster with AI directly inside Figma',
     'Auto-layout suggestions, copy generation, asset search, and prototype animations, all powered by AI and integrated natively into Figma.',
     'https://figma.com/favicon.ico', 'https://figma.com',
     'paid', 143, 1900, false, '2026-04-06', cat_des),

    ('posthog', 'PostHog', 'Open source product analytics your team will love',
     'Self-host or use the cloud. Feature flags, session recordings, funnels, cohorts, A/B testing, everything product teams need in one open-source platform.',
     'https://posthog.com/favicon.ico', 'https://posthog.com',
     'freemium', 128, 1700, false, '2026-04-05', cat_ana),

    ('resend', 'Resend', 'Email API for developers, built on modern infrastructure',
     'Send transactional emails with React components and a simple API. Deliverability obsessed, with real-time logs, webhooks, and a generous free tier.',
     'https://resend.com/favicon.ico', 'https://resend.com',
     'freemium', 117, 1500, false, '2026-04-05', cat_dev);

  -- tool_tags
  INSERT INTO public.tool_tags (tool_id, tag_id)
  SELECT t.id, tg.id FROM public.tools t, public.tags tg WHERE
    (t.slug = 'promptbase'  AND tg.slug = 'llm') OR
    (t.slug = 'promptbase'  AND tg.slug = 'api') OR
    (t.slug = 'promptbase'  AND tg.slug = 'saas') OR
    (t.slug = 'raycast'     AND tg.slug = 'automation') OR
    (t.slug = 'raycast'     AND tg.slug = 'browser') OR
    (t.slug = 'raycast'     AND tg.slug = 'open-source') OR
    (t.slug = 'linear-app'  AND tg.slug = 'saas') OR
    (t.slug = 'linear-app'  AND tg.slug = 'collaboration') OR
    (t.slug = 'warp-term'   AND tg.slug = 'cli') OR
    (t.slug = 'warp-term'   AND tg.slug = 'open-source') OR
    (t.slug = 'warp-term'   AND tg.slug = 'collaboration') OR
    (t.slug = 'perplexity'  AND tg.slug = 'llm') OR
    (t.slug = 'perplexity'  AND tg.slug = 'api') OR
    (t.slug = 'supabase'    AND tg.slug = 'open-source') OR
    (t.slug = 'supabase'    AND tg.slug = 'api') OR
    (t.slug = 'supabase'    AND tg.slug = 'vector-db') OR
    (t.slug = 'loom'        AND tg.slug = 'saas') OR
    (t.slug = 'loom'        AND tg.slug = 'collaboration') OR
    (t.slug = 'figma-ai'    AND tg.slug = 'llm') OR
    (t.slug = 'figma-ai'    AND tg.slug = 'no-code') OR
    (t.slug = 'posthog'     AND tg.slug = 'open-source') OR
    (t.slug = 'posthog'     AND tg.slug = 'saas') OR
    (t.slug = 'resend'      AND tg.slug = 'api') OR
    (t.slug = 'resend'      AND tg.slug = 'saas');

END;
$$;

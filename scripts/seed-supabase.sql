-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase seed data — user-001 (Commander Zara)
--
-- Run this in your Supabase project's SQL Editor:
--   https://supabase.com/dashboard/project/<your-project-id>/sql
--
-- Safe to re-run: all statements use ON CONFLICT DO UPDATE (upsert).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── users ───────────────────────────────────────────────────────────────────
INSERT INTO public.users (
  id, username, title, status,
  level, xp, max_xp, progress_percent,
  joined_at, created_at, updated_at
) VALUES (
  'user-001', 'Commander Zara', 'Galactic Architect', 'online',
  47, 84320, 100000, 84,
  '2022-03-15T08:00:00Z'::timestamptz,
  '2022-03-15T08:00:00Z'::timestamptz,
  '2024-12-01T10:00:00Z'::timestamptz
)
ON CONFLICT (id) DO UPDATE SET
  username         = EXCLUDED.username,
  title            = EXCLUDED.title,
  status           = EXCLUDED.status,
  level            = EXCLUDED.level,
  xp               = EXCLUDED.xp,
  max_xp           = EXCLUDED.max_xp,
  progress_percent = EXCLUDED.progress_percent,
  updated_at       = EXCLUDED.updated_at;

-- ─── avatars ─────────────────────────────────────────────────────────────────
INSERT INTO public.avatars (
  user_id, initials, image_url, frame_color, badge_icon, updated_at
) VALUES (
  'user-001', 'CZ', null, '#7c3aed', 'early-adopter',
  '2024-12-01T10:00:00Z'::timestamptz
)
ON CONFLICT (user_id) DO UPDATE SET
  initials   = EXCLUDED.initials,
  image_url  = EXCLUDED.image_url,
  frame_color = EXCLUDED.frame_color,
  badge_icon = EXCLUDED.badge_icon,
  updated_at = EXCLUDED.updated_at;

-- ─── reputations ─────────────────────────────────────────────────────────────
INSERT INTO public.reputations (
  user_id, score, tier, upvotes, downvotes, badges, history, updated_at
) VALUES (
  'user-001', 142, 'gold', 187, 12,
  ARRAY['early-adopter', 'trader', 'explorer'],
  '[
    {"date":"2024-12-01","delta":5, "reason":"Được đánh giá tích cực"},
    {"date":"2024-11-15","delta":10,"reason":"Hoàn thành nhiệm vụ tuần"},
    {"date":"2024-10-30","delta":-2,"reason":"Báo cáo hợp lệ được ghi nhận"},
    {"date":"2024-09-20","delta":8, "reason":"Tham gia sự kiện cộng đồng"},
    {"date":"2024-08-05","delta":3, "reason":"Được đánh giá tích cực"}
  ]'::jsonb,
  '2024-12-01T10:00:00Z'::timestamptz
)
ON CONFLICT (user_id) DO UPDATE SET
  score      = EXCLUDED.score,
  tier       = EXCLUDED.tier,
  upvotes    = EXCLUDED.upvotes,
  downvotes  = EXCLUDED.downvotes,
  badges     = EXCLUDED.badges,
  history    = EXCLUDED.history,
  updated_at = EXCLUDED.updated_at;

-- ─── wallets ─────────────────────────────────────────────────────────────────
INSERT INTO public.wallets (
  user_id, credits, coins, tokens, updated_at
) VALUES (
  'user-001', 125840, 48290, 3750,
  '2024-12-01T10:00:00Z'::timestamptz
)
ON CONFLICT (user_id) DO UPDATE SET
  credits    = EXCLUDED.credits,
  coins      = EXCLUDED.coins,
  tokens     = EXCLUDED.tokens,
  updated_at = EXCLUDED.updated_at;

-- ─── inventories ─────────────────────────────────────────────────────────────
INSERT INTO public.inventories (
  user_id, pet_count, player_count, ticket_count,
  digital_asset_count, item_count, total_count, updated_at
) VALUES (
  'user-001', 12, 47, 8, 234, 156, 457,
  '2024-12-01T10:00:00Z'::timestamptz
)
ON CONFLICT (user_id) DO UPDATE SET
  pet_count           = EXCLUDED.pet_count,
  player_count        = EXCLUDED.player_count,
  ticket_count        = EXCLUDED.ticket_count,
  digital_asset_count = EXCLUDED.digital_asset_count,
  item_count          = EXCLUDED.item_count,
  total_count         = EXCLUDED.total_count,
  updated_at          = EXCLUDED.updated_at;

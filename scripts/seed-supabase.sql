-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase seed — kimjaychou (72e296a9-cbff-496f-8c9c-65de33c9b930)
--
-- Run in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<your-project>/sql
--
-- Uses DELETE + INSERT so it works regardless of whether tables have a
-- UNIQUE constraint on user_id. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. wallet_transactions (create table if not exists) ─────────────────────

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type         TEXT        NOT NULL CHECK (type IN ('credit','debit','reward','trade','purchase')),
  currency     TEXT        NOT NULL CHECK (currency IN ('credits','coins','tokens')),
  amount       INTEGER     NOT NULL,
  description  TEXT        NOT NULL,
  counterparty TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wallet_transactions' AND policyname = 'anon read'
  ) THEN
    EXECUTE 'CREATE POLICY "anon read" ON public.wallet_transactions FOR SELECT TO anon USING (true)';
  END IF;
END $$;

-- ─── 2. users ─────────────────────────────────────────────────────────────────
-- Actual columns: id, username, email, display_name, status, created_at, updated_at

INSERT INTO public.users (id, username, display_name, status, created_at, updated_at)
VALUES (
  '72e296a9-cbff-496f-8c9c-65de33c9b930',
  'kimjaychou', 'kim', 'active', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  username     = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  updated_at   = NOW();

-- ─── 3. avatars ───────────────────────────────────────────────────────────────
-- Actual columns: id, user_id, avatar_name, avatar_image, title, level,
--                 experience, metadata, created_at, updated_at

DELETE FROM public.avatars
WHERE user_id = '72e296a9-cbff-496f-8c9c-65de33c9b930';

INSERT INTO public.avatars
  (user_id, avatar_name, avatar_image, title, level, experience, metadata, created_at, updated_at)
VALUES (
  '72e296a9-cbff-496f-8c9c-65de33c9b930',
  'KJ', null, 'Universe Member', 1, 0,
  '{"frameColor": "#0ea5e9", "badgeIcon": null}'::jsonb,
  NOW(), NOW()
);

-- ─── 4. reputations ───────────────────────────────────────────────────────────
-- Actual columns: id, user_id, score, tier, upvotes, downvotes, created_at, updated_at
-- Note: badges and history columns do NOT exist

DELETE FROM public.reputations
WHERE user_id = '72e296a9-cbff-496f-8c9c-65de33c9b930';

INSERT INTO public.reputations
  (user_id, score, tier, upvotes, downvotes, created_at, updated_at)
VALUES (
  '72e296a9-cbff-496f-8c9c-65de33c9b930',
  320, 'gold', 412, 8, NOW(), NOW()
);

-- ─── 5. wallets ───────────────────────────────────────────────────────────────
-- Actual columns: id, user_id, credits, coins, tokens, created_at, updated_at

DELETE FROM public.wallets
WHERE user_id = '72e296a9-cbff-496f-8c9c-65de33c9b930';

INSERT INTO public.wallets
  (user_id, credits, coins, tokens, created_at, updated_at)
VALUES (
  '72e296a9-cbff-496f-8c9c-65de33c9b930',
  125840, 48290, 3750, NOW(), NOW()
);

-- ─── 6. wallet_transactions ───────────────────────────────────────────────────

DELETE FROM public.wallet_transactions
WHERE user_id = '72e296a9-cbff-496f-8c9c-65de33c9b930';

INSERT INTO public.wallet_transactions
  (id, user_id, type, currency, amount, description, counterparty, created_at)
VALUES
  (gen_random_uuid(), '72e296a9-cbff-496f-8c9c-65de33c9b930',
   'reward',   'coins',    500,    'Phần thưởng đăng nhập hàng ngày',    null,          NOW() - INTERVAL '5 minutes'),
  (gen_random_uuid(), '72e296a9-cbff-496f-8c9c-65de33c9b930',
   'credit',   'credits',  12000,  'Bán Rồng Lửa trên Chợ',              'StarLord99',   NOW() - INTERVAL '30 minutes'),
  (gen_random_uuid(), '72e296a9-cbff-496f-8c9c-65de33c9b930',
   'purchase', 'tokens',   -250,   'Nâng cấp Module Phòng thủ',           null,           NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), '72e296a9-cbff-496f-8c9c-65de33c9b930',
   'trade',    'credits',  -8500,  'Mua Cầu thủ Huyền thoại',             'NebulaMaster', NOW() - INTERVAL '6 hours'),
  (gen_random_uuid(), '72e296a9-cbff-496f-8c9c-65de33c9b930',
   'debit',    'coins',    -1200,  'Đặt giá thầu Phiên đấu giá #A-077',  null,           NOW() - INTERVAL '12 hours');

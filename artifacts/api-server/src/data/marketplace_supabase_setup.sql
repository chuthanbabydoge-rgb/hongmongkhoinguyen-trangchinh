-- ═══════════════════════════════════════════════════════════════════════════════
-- Marketplace Universe V1 — Supabase Setup
-- Run this entire script once in: Supabase Dashboard → SQL Editor
-- All tables are empty — safe to drop and recreate.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Step 1: Drop existing tables (order matters for FKs) ──────────────────────
DROP TABLE IF EXISTS public.marketplace_bids         CASCADE;
DROP TABLE IF EXISTS public.marketplace_transactions CASCADE;
DROP TABLE IF EXISTS public.marketplace_listings     CASCADE;
DROP TABLE IF EXISTS public.marketplace_auctions     CASCADE;

-- ── Step 2: marketplace_listings ─────────────────────────────────────────────
CREATE TABLE public.marketplace_listings (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id    UUID         NOT NULL,
  item_id      UUID         NOT NULL,
  item_name    TEXT         NOT NULL,
  category     TEXT         NOT NULL
                            CHECK (category IN ('pets','football','world-assets','tickets','items')),
  rarity       TEXT         NOT NULL
                            CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  price        NUMERIC(18,4) NOT NULL CHECK (price > 0),
  currency     TEXT         NOT NULL DEFAULT 'credits'
                            CHECK (currency IN ('credits','stars','eth')),
  status       TEXT         NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','sold','cancelled','expired')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ
);

CREATE INDEX marketplace_listings_seller_id_idx  ON public.marketplace_listings(seller_id);
CREATE INDEX marketplace_listings_status_idx     ON public.marketplace_listings(status);
CREATE INDEX marketplace_listings_category_idx   ON public.marketplace_listings(category);
CREATE INDEX marketplace_listings_rarity_idx     ON public.marketplace_listings(rarity);

-- ── Step 3: marketplace_transactions ─────────────────────────────────────────
CREATE TABLE public.marketplace_transactions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID          NOT NULL REFERENCES public.marketplace_listings(id),
  buyer_id    UUID          NOT NULL,
  seller_id   UUID          NOT NULL,
  item_name   TEXT          NOT NULL,
  price       NUMERIC(18,4) NOT NULL CHECK (price > 0),
  currency    TEXT          NOT NULL CHECK (currency IN ('credits','stars','eth')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_transactions_buyer_id_idx  ON public.marketplace_transactions(buyer_id);
CREATE INDEX marketplace_transactions_seller_id_idx ON public.marketplace_transactions(seller_id);
CREATE INDEX marketplace_transactions_listing_id_idx ON public.marketplace_transactions(listing_id);

-- ── Step 4: marketplace_auctions ─────────────────────────────────────────────
CREATE TABLE public.marketplace_auctions (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id      UUID          NOT NULL,
  item_id        UUID          NOT NULL,
  item_name      TEXT          NOT NULL,
  category       TEXT          NOT NULL
                               CHECK (category IN ('pets','football','world-assets','tickets','items')),
  rarity         TEXT          NOT NULL
                               CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  starting_price NUMERIC(18,4) NOT NULL CHECK (starting_price > 0),
  current_price  NUMERIC(18,4) NOT NULL CHECK (current_price > 0),
  currency       TEXT          NOT NULL DEFAULT 'credits'
                               CHECK (currency IN ('credits','stars','eth')),
  status         TEXT          NOT NULL DEFAULT 'live'
                               CHECK (status IN ('live','ended','cancelled')),
  bid_count      INT           NOT NULL DEFAULT 0 CHECK (bid_count >= 0),
  starts_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  ends_at        TIMESTAMPTZ   NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_auctions_seller_id_idx ON public.marketplace_auctions(seller_id);
CREATE INDEX marketplace_auctions_status_idx    ON public.marketplace_auctions(status);
CREATE INDEX marketplace_auctions_ends_at_idx   ON public.marketplace_auctions(ends_at);

-- ── Step 5: marketplace_bids ──────────────────────────────────────────────────
CREATE TABLE public.marketplace_bids (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id  UUID          NOT NULL REFERENCES public.marketplace_auctions(id),
  bidder_id   UUID          NOT NULL,
  amount      NUMERIC(18,4) NOT NULL CHECK (amount > 0),
  currency    TEXT          NOT NULL CHECK (currency IN ('credits','stars','eth')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_bids_auction_id_idx ON public.marketplace_bids(auction_id);
CREATE INDEX marketplace_bids_bidder_id_idx  ON public.marketplace_bids(bidder_id);

-- ── Step 6: Row Level Security ────────────────────────────────────────────────
ALTER TABLE public.marketplace_listings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_auctions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_bids         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_listings"     ON public.marketplace_listings     FOR SELECT USING (true);
CREATE POLICY "anon_write_listings"    ON public.marketplace_listings     FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_listings"   ON public.marketplace_listings     FOR UPDATE USING (true);
CREATE POLICY "anon_delete_listings"   ON public.marketplace_listings     FOR DELETE USING (true);

CREATE POLICY "anon_read_transactions" ON public.marketplace_transactions FOR SELECT USING (true);
CREATE POLICY "anon_write_transactions"ON public.marketplace_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_read_auctions"     ON public.marketplace_auctions     FOR SELECT USING (true);
CREATE POLICY "anon_write_auctions"    ON public.marketplace_auctions     FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_auctions"   ON public.marketplace_auctions     FOR UPDATE USING (true);

CREATE POLICY "anon_read_bids"         ON public.marketplace_bids         FOR SELECT USING (true);
CREATE POLICY "anon_write_bids"        ON public.marketplace_bids         FOR INSERT WITH CHECK (true);

-- ── Step 7: Seed data ─────────────────────────────────────────────────────────
-- User: 72e296a9-cbff-496f-8c9c-65de33c9b930 (kimjaychou)

-- Seed listings (6 rows)
INSERT INTO public.marketplace_listings
  (id, seller_id, item_id, item_name, category, rarity, price, currency, status, expires_at)
VALUES
  (
    'aaaaaaaa-0001-0001-0001-000000000001',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    '5020387e-f6fc-4b7b-a844-aea4e3da5f01',
    'Rồng Lửa', 'pets', 'legendary', 5000, 'credits', 'active',
    now() + interval '7 days'
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000002',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    'd835d99a-df4e-4cec-8721-4ca6b5bfec8d',
    'Striker Alpha', 'football', 'legendary', 3500, 'credits', 'active',
    now() + interval '5 days'
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000003',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    'b79b168c-c741-47c4-ada6-dc9b94f9f10f',
    'Đảo Thiên Hà', 'world-assets', 'mythic', 12000, 'stars', 'active',
    now() + interval '14 days'
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000004',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    '6b5c88de-8a34-4377-af79-f242c9c382c9',
    'Vé Platinum World Tour', 'tickets', 'mythic', 2200, 'credits', 'active',
    now() + interval '3 days'
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000005',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    '53ca454f-1218-46ec-81b3-6a96271d7b9e',
    'Giáp Plasma Mk.III', 'items', 'legendary', 4800, 'credits', 'sold',
    null
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000006',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    '74f7632d-e5f2-453f-b841-7c3fdb69d955',
    'Rùa Thần Kim', 'pets', 'rare', 800, 'credits', 'active',
    now() + interval '10 days'
  );

-- Seed transaction (1 row — the sold listing above)
INSERT INTO public.marketplace_transactions
  (listing_id, buyer_id, seller_id, item_name, price, currency)
VALUES
  (
    'aaaaaaaa-0001-0001-0001-000000000005',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    'Giáp Plasma Mk.III', 4800, 'credits'
  );

-- Seed auctions (3 rows)
INSERT INTO public.marketplace_auctions
  (id, seller_id, item_id, item_name, category, rarity, starting_price, current_price, currency, status, bid_count, starts_at, ends_at)
VALUES
  (
    'bbbbbbbb-0002-0002-0002-000000000001',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    '43847fea-d4c3-42a7-8e31-289655853ce4',
    'Phượng Hoàng Ngọc', 'pets', 'mythic',
    8000, 8000, 'credits', 'live', 0,
    now(), now() + interval '2 days'
  ),
  (
    'bbbbbbbb-0002-0002-0002-000000000002',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    'b324d216-8159-48a1-93fa-b7dcd5c37be2',
    'Tháp Năng Lượng Mặt Trời', 'world-assets', 'legendary',
    6000, 6500, 'stars', 'live', 2,
    now() - interval '1 hour', now() + interval '1 day'
  ),
  (
    'bbbbbbbb-0002-0002-0002-000000000003',
    '72e296a9-cbff-496f-8c9c-65de33c9b930',
    'e80a5f1b-a51d-4ec4-9f20-7e17c68ab5d1',
    'Kiếm Thần Ánh Sao', 'items', 'legendary',
    3000, 3200, 'credits', 'ended', 3,
    now() - interval '3 days', now() - interval '1 day'
  );

-- Seed bids (3 rows on auction 2)
INSERT INTO public.marketplace_bids
  (auction_id, bidder_id, amount, currency)
VALUES
  ('bbbbbbbb-0002-0002-0002-000000000002', '72e296a9-cbff-496f-8c9c-65de33c9b930', 6200, 'stars'),
  ('bbbbbbbb-0002-0002-0002-000000000002', '72e296a9-cbff-496f-8c9c-65de33c9b930', 6400, 'stars'),
  ('bbbbbbbb-0002-0002-0002-000000000002', '72e296a9-cbff-496f-8c9c-65de33c9b930', 6500, 'stars');

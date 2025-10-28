-- Seed store items from public/profile and public/shop
-- and grant all profile items to all existing users.

BEGIN;

-- Ensure unique image_src so re-running this script is idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='ux_store_items_image_src'
  ) THEN
    CREATE UNIQUE INDEX ux_store_items_image_src ON public.store_items(image_src);
  END IF;
END$$;

-- Profile avatars (granted free to everyone)
INSERT INTO public.store_items (name, image_src, price_points, item_type, active)
VALUES
  ('Beruang',   '/profile/beruang.png',   0, 'profile', true),
  ('Bintang',   '/profile/bintang.png',   0, 'profile', true),
  ('Bunga',     '/profile/bunga.png',     0, 'profile', true),
  ('Kelinci',   '/profile/kelinci.png',   0, 'profile', true),
  ('Perempuan', '/profile/perempuan.png', 0, 'profile', true)
ON CONFLICT (image_src) DO NOTHING;

-- Shop items (example price 100 points)
INSERT INTO public.store_items (name, image_src, price_points, item_type, active)
VALUES
  ('Agent',    '/shop/agent.png',    100, 'shop', true),
  ('Alpukat',  '/shop/alpukat.png',  100, 'shop', true),
  ('Api',      '/shop/api.png',      100, 'shop', true),
  ('Batman',   '/shop/batman.png',   100, 'shop', true),
  ('Burger',   '/shop/burger.png',   100, 'shop', true),
  ('Elf',      '/shop/elf.png',      100, 'shop', true),
  ('Gorilla',  '/shop/gorilla.png',  100, 'shop', true),
  ('Hacker',   '/shop/hacker.png',   100, 'shop', true),
  ('Ironman',  '/shop/ironman.png',  100, 'shop', true),
  ('King',     '/shop/king.png',     100, 'shop', true),
  ('Kucing',   '/shop/kucing.png',   100, 'shop', true),
  ('Matahari', '/shop/matahari.png', 100, 'shop', true),
  ('Panda',    '/shop/panda.png',    100, 'shop', true),
  ('Rusa',     '/shop/rusa.png',     100, 'shop', true),
  ('Santa',    '/shop/santa.png',    100, 'shop', true),
  ('Unicorn',  '/shop/unicorn.png',  100, 'shop', true)
ON CONFLICT (image_src) DO NOTHING;

-- Backfill: grant all profile items to all existing users (avoid duplicates)
INSERT INTO public.user_purchases (user_id, item_id)
SELECT u.id, si.id
FROM public.users u
JOIN public.store_items si ON si.item_type = 'profile' AND si.active = true
LEFT JOIN public.user_purchases up ON up.user_id = u.id AND up.item_id = si.id
WHERE up.id IS NULL
ON CONFLICT (user_id, item_id) DO NOTHING;

COMMIT;

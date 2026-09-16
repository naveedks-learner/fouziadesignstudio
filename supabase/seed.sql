-- Sample content for Fouzia Design Studio.
-- Run after 0001_init.sql. Safe to re-run (uses fixed slugs / upserts where practical).

insert into fouzia_design_studio.categories (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Kurtas', 'kurtas'),
  ('22222222-2222-2222-2222-222222222222', 'Western Wear', 'western-wear'),
  ('33333333-3333-3333-3333-333333333333', 'Accessories', 'accessories')
on conflict (slug) do nothing;

insert into fouzia_design_studio.products (name, description, category_id, price, sizes, images, stock, active) values
  (
    'Rose Embroidered Anarkali Kurta',
    'A flowing anarkali kurta in dusty rose with delicate thread embroidery on the yoke. Pairs beautifully with churidar or straight pants.',
    '11111111-1111-1111-1111-111111111111',
    3200.00,
    array['S', 'M', 'L', 'XL'],
    array['https://placehold.co/600x800?text=Rose+Anarkali+Kurta'],
    12, true
  ),
  (
    'Indigo Block Print Straight Kurta',
    'Hand block-printed cotton straight kurta in indigo blue, perfect for everyday elegance and easy to style.',
    '11111111-1111-1111-1111-111111111111',
    1800.00,
    array['S', 'M', 'L', 'XL'],
    array['https://placehold.co/600x800?text=Indigo+Block+Print+Kurta'],
    20, true
  ),
  (
    'Mustard Chikankari Kurta',
    'Classic Lucknowi chikankari hand embroidery on soft mustard georgette, with a subtle sheen.',
    '11111111-1111-1111-1111-111111111111',
    4200.00,
    array['S', 'M', 'L'],
    array['https://placehold.co/600x800?text=Mustard+Chikankari+Kurta'],
    8, true
  ),
  (
    'Emerald Silk Kurta Set',
    'Two-piece silk kurta and palazzo set in emerald green with gold zari border, ideal for festive occasions.',
    '11111111-1111-1111-1111-111111111111',
    6500.00,
    array['S', 'M', 'L', 'XL'],
    array['https://placehold.co/600x800?text=Emerald+Silk+Kurta+Set'],
    5, true
  ),
  (
    'Ivory Cotton Short Kurti',
    'Lightweight everyday short kurti in ivory cotton with simple button placket, easy to layer.',
    '11111111-1111-1111-1111-111111111111',
    1200.00,
    array['S', 'M', 'L', 'XL', 'XXL'],
    array['https://placehold.co/600x800?text=Ivory+Cotton+Kurti'],
    25, true
  ),
  (
    'Maroon Velvet Kurta',
    'Rich maroon velvet kurta with mirror work detailing, a statement piece for winter festivities.',
    '11111111-1111-1111-1111-111111111111',
    5200.00,
    array['M', 'L', 'XL'],
    array['https://placehold.co/600x800?text=Maroon+Velvet+Kurta'],
    6, true
  ),
  (
    'Blush Wrap Midi Dress',
    'A flattering wrap midi dress in blush crepe, tie-waist silhouette, perfect for brunch or evening events.',
    '22222222-2222-2222-2222-222222222222',
    2800.00,
    array['S', 'M', 'L'],
    array['https://placehold.co/600x800?text=Blush+Wrap+Midi+Dress'],
    10, true
  ),
  (
    'Black Tailored Jumpsuit',
    'Sharp tailored jumpsuit in black with a fitted waist and wide-leg trousers, effortlessly chic.',
    '22222222-2222-2222-2222-222222222222',
    3600.00,
    array['S', 'M', 'L', 'XL'],
    array['https://placehold.co/600x800?text=Black+Tailored+Jumpsuit'],
    9, true
  ),
  (
    'Floral Co-ord Set',
    'Breezy floral print top and skirt co-ord set, lightweight viscose fabric for warm days.',
    '22222222-2222-2222-2222-222222222222',
    2400.00,
    array['S', 'M', 'L'],
    array['https://placehold.co/600x800?text=Floral+Co-ord+Set'],
    14, true
  ),
  (
    'Beige Trench Coat',
    'Classic double-breasted trench coat in beige, a versatile layering piece for the season.',
    '22222222-2222-2222-2222-222222222222',
    4800.00,
    array['S', 'M', 'L', 'XL'],
    array['https://placehold.co/600x800?text=Beige+Trench+Coat'],
    7, true
  ),
  (
    'Handcrafted Jhumka Earrings',
    'Traditional gold-toned jhumka earrings with pearl drops, handcrafted by local artisans.',
    '33333333-3333-3333-3333-333333333333',
    1500.00,
    array['One Size'],
    array['https://placehold.co/600x800?text=Jhumka+Earrings'],
    30, true
  ),
  (
    'Embroidered Potli Bag',
    'Compact potli bag with mirror and thread embroidery, ideal companion for festive outfits.',
    '33333333-3333-3333-3333-333333333333',
    1300.00,
    array['One Size'],
    array['https://placehold.co/600x800?text=Embroidered+Potli+Bag'],
    18, true
  ),
  (
    'Layered Stone Necklace Set',
    'Statement layered necklace with matching earrings, studded with colored stones.',
    '33333333-3333-3333-3333-333333333333',
    2200.00,
    array['One Size'],
    array['https://placehold.co/600x800?text=Layered+Stone+Necklace'],
    11, true
  )
on conflict do nothing;

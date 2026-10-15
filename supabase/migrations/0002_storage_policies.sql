-- Storage policies for the "FouziaDesignStudio" bucket (public, holds product
-- images). Public read already works because the bucket is public; these
-- policies let admins upload/replace/delete objects in it via the API using
-- their logged-in session (anon key + auth), instead of only via the
-- dashboard.
--
-- Run this in the Supabase SQL editor after 0001_init.sql.

create policy "admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'FouziaDesignStudio'
    and fouzia_design_studio.is_admin()
  );

create policy "admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'FouziaDesignStudio'
    and fouzia_design_studio.is_admin()
  )
  with check (
    bucket_id = 'FouziaDesignStudio'
    and fouzia_design_studio.is_admin()
  );

create policy "admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'FouziaDesignStudio'
    and fouzia_design_studio.is_admin()
  );

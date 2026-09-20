-- Storage RLS for CherrySo
--
-- Replaces the loose "Allow authenticated uploads" policies in
-- src/scripts/add-storage-rls.ts (which let ANY logged-in user upload to
-- the products bucket) with role-aware policies.
--
-- Policies below enforce:
--   * `products` bucket: public read; admin/moderator write only
--   * `avatars`  bucket: public read; users write only to their own folder
--                          (`{auth.uid()}/...`), admin can manage any
--
-- The existing admin helper function is_admin(uuid) is reused — see
-- migration 0001_rls_and_search.sql.
--
-- Idempotency:
--   All CREATE POLICY statements use IF NOT EXISTS semantics via DROP +
--   CREATE in a DO block. Safe to re-run.

-- ============================================================
-- PRODUCTS BUCKET
-- ============================================================

DO $$
BEGIN
  -- Public read (anyone, including anon visitors browsing the storefront)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'products_public_read'
  ) THEN
    CREATE POLICY products_public_read ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'products');
  END IF;

  -- Admin/moderator write — INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'products_admin_write'
  ) THEN
    CREATE POLICY products_admin_write ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'products' AND is_admin(auth.uid())
      );
  END IF;

  -- Admin/moderator write — UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'products_admin_update'
  ) THEN
    CREATE POLICY products_admin_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'products' AND is_admin(auth.uid())
      )
      WITH CHECK (
        bucket_id = 'products' AND is_admin(auth.uid())
      );
  END IF;

  -- Admin/moderator write — DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'products_admin_delete'
  ) THEN
    CREATE POLICY products_admin_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'products' AND is_admin(auth.uid())
      );
  END IF;
END
$$;

-- ============================================================
-- AVATARS BUCKET (future-proofing for user-profile avatars)
-- ============================================================
--
-- Convention: files are uploaded under the path `{auth.uid()}/avatar.jpg`,
-- so a user can only write to a folder that matches their own user id.
-- This is enforced with (storage.foldername(name))[1]::uuid = auth.uid().
--
-- Even if the bucket doesn't exist yet, these policies are harmless — they
-- only fire when rows with bucket_id='avatars' are written.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars_public_read'
  ) THEN
    CREATE POLICY avatars_public_read ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'avatars');
  END IF;

  -- Users can upload/update/delete only files inside their own folder.
  -- The top-level folder MUST equal their auth.uid().
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars_owner_write'
  ) THEN
    CREATE POLICY avatars_owner_write ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1]::uuid = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars_owner_update'
  ) THEN
    CREATE POLICY avatars_owner_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1]::uuid = auth.uid()
      )
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1]::uuid = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars_owner_delete'
  ) THEN
    CREATE POLICY avatars_owner_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1]::uuid = auth.uid()
      );
  END IF;
END
$$;

-- ============================================================
-- Defensive cleanup: drop the old loose policies that this migration
-- replaces. Each DROP is wrapped so the migration is still safe to re-run
-- after a partial application.
-- ============================================================

DROP POLICY IF EXISTS "Allow authenticated uploads"  ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates"  ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes"  ON storage.objects;

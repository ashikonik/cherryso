/**
 * Sanity tests for the storage RLS migration.
 *
 * We can't easily run psql in the test environment, but we CAN verify that
 * the migration file contains the policies we expect. If someone refactors
 * the migration and accidentally removes a critical policy, this test fails
 * loudly at PR time.
 *
 * These tests are intentionally string-match based — fragile in principle
 * but valuable in practice for a security-critical migration that lives
 * outside the TypeScript build pipeline.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION_PATH = resolve(
  process.cwd(),
  "supabase/migrations/0005_storage_rls.sql"
);

describe("storage RLS migration", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf-8");

  it("exists and is non-empty", () => {
    expect(sql.length).toBeGreaterThan(100);
  });

  it("defines a public-read policy for the products bucket", () => {
    expect(sql).toMatch(/products_public_read[\s\S]*FOR SELECT[\s\S]*bucket_id = 'products'/);
  });

  it("restricts products bucket INSERT to admin/moderator", () => {
    expect(sql).toMatch(/products_admin_write[\s\S]*FOR INSERT[\s\S]*is_admin\(auth\.uid\(\)\)/);
  });

  it("restricts products bucket UPDATE to admin/moderator", () => {
    expect(sql).toMatch(/products_admin_update[\s\S]*FOR UPDATE[\s\S]*is_admin\(auth\.uid\(\)\)/);
  });

  it("restricts products bucket DELETE to admin/moderator", () => {
    expect(sql).toMatch(/products_admin_delete[\s\S]*FOR DELETE[\s\S]*is_admin\(auth\.uid\(\)\)/);
  });

  it("defines a public-read policy for the avatars bucket", () => {
    expect(sql).toMatch(/avatars_public_read[\s\S]*FOR SELECT[\s\S]*bucket_id = 'avatars'/);
  });

  it("restricts avatars bucket INSERT to files inside the user's own folder", () => {
    expect(sql).toMatch(/avatars_owner_write[\s\S]*\(storage\.foldername\(name\)\)\[1\]::uuid = auth\.uid\(\)/);
  });

  it("drops the old loose policies that the migration replaces", () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS "Allow authenticated uploads"/);
    expect(sql).toMatch(/DROP POLICY IF EXISTS "Allow authenticated updates"/);
    expect(sql).toMatch(/DROP POLICY IF EXISTS "Allow authenticated deletes"/);
  });

  it("does not allow non-admin writes to the products bucket (defensive check)", () => {
    // No policy should match `FOR INSERT ... bucket_id = 'products'` WITHOUT
    // `is_admin(...)` in the WITH CHECK clause. The regex is intentionally
    // permissive on whitespace.
    const insertPolicies = sql.match(/CREATE POLICY[^;]+FOR INSERT[^;]+;/gi) || [];
    for (const policy of insertPolicies) {
      if (policy.includes("bucket_id = 'products'")) {
        expect(policy).toMatch(/is_admin/);
      }
    }
  });
});

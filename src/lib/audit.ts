import { db } from "@/db";
import { auditLog } from "@/db/schema";

/**
 * Record an admin action to the audit log.
 *
 * Use this from any server action that mutates privileged data
 * (create/update/delete on products, categories, tags, orders, settings).
 *
 * Best-effort write: audit logging MUST NOT block the main action or fail the
 * user request. If the audit insert throws, we log to stderr and swallow the
 * error so the caller still succeeds. This trades audit-completeness for
 * availability — admins can investigate missing entries after the fact via
 * the database.
 *
 * The caller is responsible for NOT passing PII (passwords, full card numbers,
 * full address text) into `details`. Snapshot the minimum needed to identify
 * what changed (e.g. `{ name, price }` is fine; never include customer notes
 * or transaction IDs unless that's the field being audited).
 */
export async function logAdminAction(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details ?? null,
    });
  } catch (err) {
    // Don't block the caller. Surface the failure for ops investigation.
    // Stringify params explicitly — the default util.inspect wraps it in
    // [object Object] when mixed with other console.error args, which loses
    // the entityId and makes lost audit rows untraceable.
    console.error(
      "[audit] failed to write audit log entry:",
      err,
      JSON.stringify({
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
      })
    );
  }
}

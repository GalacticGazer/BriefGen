import { supabaseAdmin } from "@/lib/supabase-admin";

const RETENTION_DAYS = 30;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const MAX_REPORTS_PER_RUN = 500;
let lastCleanupAt = 0;

type RetentionCleanupOptions = {
  protectedReportIds?: string[];
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getCutoffIsoDate() {
  const now = Date.now();
  return new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export async function runRetentionCleanupIfDue(options: RetentionCleanupOptions = {}) {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }

  const cutoffIso = getCutoffIsoDate();

  const { data: expiredReports, error: selectError } = await supabaseAdmin
    .from("reports")
    .select("id")
    .lt("created_at", cutoffIso)
    .limit(MAX_REPORTS_PER_RUN);

  if (selectError) {
    throw new Error(`Retention cleanup select failed: ${getErrorMessage(selectError)}`);
  }

  if (expiredReports && expiredReports.length > 0) {
    const protectedReportIds = new Set(options.protectedReportIds?.filter(Boolean) ?? []);
    const reportIds = expiredReports
      .map((report) => report.id)
      .filter((reportId) => !protectedReportIds.has(reportId));

    if (reportIds.length > 0) {
      const storagePaths = reportIds.map((id) => `${id}.pdf`);

      const { error: removeStorageError } = await supabaseAdmin.storage
        .from("reports")
        .remove(storagePaths);

      if (removeStorageError) {
        throw new Error(
          `Retention cleanup storage remove failed: ${getErrorMessage(removeStorageError)}`,
        );
      }

      const { error: deleteError } = await supabaseAdmin
        .from("reports")
        .delete()
        .in("id", reportIds);

      if (deleteError) {
        throw new Error(`Retention cleanup delete failed: ${getErrorMessage(deleteError)}`);
      }
    }
  }

  lastCleanupAt = now;
}

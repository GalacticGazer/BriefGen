import { supabaseAdmin } from "@/lib/supabase-admin";

const RETENTION_DAYS = 30;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const MAX_REPORTS_PER_RUN = 500;
let lastCleanupAt = 0;

type RetentionCleanupOptions = {
  protectedReportIds?: string[];
};

function getCutoffIsoDate() {
  const now = Date.now();
  return new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export async function runRetentionCleanupIfDue(options: RetentionCleanupOptions = {}) {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanupAt = now;

  try {
    const cutoffIso = getCutoffIsoDate();

    const { data: expiredReports, error: selectError } = await supabaseAdmin
      .from("reports")
      .select("id")
      .lt("created_at", cutoffIso)
      .limit(MAX_REPORTS_PER_RUN);

    if (selectError) {
      console.error("Retention cleanup select failed:", selectError);
      return;
    }

    if (!expiredReports || expiredReports.length === 0) {
      return;
    }

    const protectedReportIds = new Set(options.protectedReportIds?.filter(Boolean) ?? []);
    const reportIds = expiredReports
      .map((report) => report.id)
      .filter((reportId) => !protectedReportIds.has(reportId));

    if (reportIds.length === 0) {
      return;
    }

    const storagePaths = reportIds.map((id) => `${id}.pdf`);

    const { error: removeStorageError } = await supabaseAdmin.storage
      .from("reports")
      .remove(storagePaths);

    // Removing a non-existing file is acceptable; continue record cleanup.
    if (removeStorageError) {
      console.error("Retention cleanup storage remove warning:", removeStorageError);
    }

    const { error: deleteError } = await supabaseAdmin
      .from("reports")
      .delete()
      .in("id", reportIds);

    if (deleteError) {
      console.error("Retention cleanup delete failed:", deleteError);
    }
  } catch (error) {
    console.error("Retention cleanup failed:", error);
  }
}

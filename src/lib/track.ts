/*
 * Analytics seam. v1 logs to the console in development and no-ops in
 * production; swapping in a real provider later means changing this file
 * only. Event names map to the partner deck's KPIs.
 */

export type TrackEvent =
  | "move_search"
  | "move_result_shown"
  | "move_tap_through"
  | "move_deeplink_click"
  | "move_saved"
  | "plan_search"
  | "plan_deeplink_click"
  | "pack_download_started"
  | "pack_download_completed"
  | "pack_deleted"
  | "locale_switched";

export function track(
  event: TrackEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[track] ${event}`, props ?? {});
  }
}

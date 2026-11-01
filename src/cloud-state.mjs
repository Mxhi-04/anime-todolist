// Never treat a newly fetched revision as authorization to overwrite newer remote work with a dirty cache.
export function reconciliationAction({
  remoteRevision,
  cachedRevision,
  dirty,
}) {
  if (remoteRevision === null) return dirty ? "push-local" : "new";
  if (!dirty) return "load-remote";
  return cachedRevision === remoteRevision ? "push-local" : "conflict";
}

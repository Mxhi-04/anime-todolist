import test from "node:test";
import assert from "node:assert/strict";
import { reconciliationAction } from "../src/cloud-state.mjs";
test("a dirty older cache never overwrites a newer remote revision", () => {
  assert.equal(
    reconciliationAction({ remoteRevision: 8, cachedRevision: 6, dirty: true }),
    "conflict",
  );
});
test("an offline edit can sync when the remote revision has not changed", () => {
  assert.equal(
    reconciliationAction({ remoteRevision: 6, cachedRevision: 6, dirty: true }),
    "push-local",
  );
});
test("a clean cache loads the latest remote data", () => {
  assert.equal(
    reconciliationAction({
      remoteRevision: 8,
      cachedRevision: 6,
      dirty: false,
    }),
    "load-remote",
  );
});
test("a new account is distinct from an unsynced local document", () => {
  assert.equal(
    reconciliationAction({
      remoteRevision: null,
      cachedRevision: null,
      dirty: false,
    }),
    "new",
  );
  assert.equal(
    reconciliationAction({
      remoteRevision: null,
      cachedRevision: null,
      dirty: true,
    }),
    "push-local",
  );
});

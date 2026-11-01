import test from "node:test";
import assert from "node:assert/strict";
import {
  createStore,
  LEGACY_KEYS,
  filterTasks,
  todayKey,
  timerRemaining,
} from "../src/store.mjs";
function memory(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data,
  };
}
const oldTask = {
  id: "task-old",
  name: "Keep my original mission",
  activityId: "act-old",
  date: "2026-10-17",
  startTime: "18:00",
  endTime: "19:00",
  notes: "Original notes",
  completed: true,
  createdAt: 1,
};
const oldActivity = { id: "act-old", name: "Coding", icon: "luffy" };
test("existing v1 data survives loading, task edits, and reload with all relationships preserved", () => {
  const s = memory({
    [LEGACY_KEYS.tasks]: JSON.stringify([oldTask]),
    [LEGACY_KEYS.activities]: JSON.stringify([oldActivity]),
  });
  const first = createStore(s);
  assert.deepEqual(first.tasks, [oldTask]);
  first.updateTask("task-old", { completed: false });
  const second = createStore(s);
  assert.deepEqual(second.tasks, [{ ...oldTask, completed: false }]);
  assert.deepEqual(second.activities, [oldActivity]);
});
test("fresh workspaces start empty and task completion persists", () => {
  const s = memory(),
    store = createStore(s);
  assert.equal(store.tasks.length, 0);
  const task = store.addTask({ name: "Read 10 pages", activityId: "study" });
  store.updateTask(task.id, { completed: true });
  assert.equal(createStore(s).tasks[0].completed, true);
});
test("account caches and the original device tasks are isolated", () => {
  const s = memory();
  const local = createStore(s),
    a = createStore(s, "user-a"),
    b = createStore(s, "user-b");
  local.addTask({ name: "Device private" });
  a.addTask({ name: "A private" });
  b.addTask({ name: "B private" });
  assert.deepEqual(
    createStore(s).tasks.map((t) => t.name),
    ["Device private"],
  );
  assert.deepEqual(
    createStore(s, "user-a").tasks.map((t) => t.name),
    ["A private"],
  );
  assert.deepEqual(
    createStore(s, "user-b").tasks.map((t) => t.name),
    ["B private"],
  );
});
test("changing anime preserves tasks and their completion and activity", () => {
  const store = createStore(memory());
  const t = store.addTask({
    name: "Study",
    activityId: "study",
    completed: true,
  });
  store.savePrefs({ active: "frieren", favorites: ["frieren", "one-piece"] });
  assert.deepEqual(store.tasks, [t]);
  assert.equal(store.prefs.active, "frieren");
});
test("deletion can be undone without duplicating tasks", () => {
  const store = createStore(memory());
  const t = store.addTask({ name: "Recover me" });
  const removed = store.removeTask(t.id);
  assert.equal(store.tasks.length, 0);
  store.restoreTask(removed);
  store.restoreTask(removed);
  assert.equal(store.tasks.length, 1);
  assert.deepEqual(store.tasks[0], t);
});
test("backup import is idempotent and does not remove existing records", () => {
  const store = createStore(memory());
  store.addTask({ name: "Keep me" });
  const payload = { tasks: [oldTask], activities: [oldActivity] };
  assert.equal(store.importData(payload), 1);
  assert.equal(store.importData(payload), 0);
  assert.equal(store.tasks.length, 2);
  assert.ok(store.activities.some((a) => a.id === oldActivity.id));
});
test("corrupt legacy data remains intact and is never overwritten by seed data", () => {
  const s = memory({ [LEGACY_KEYS.tasks]: "{bad-json" });
  assert.throws(() => createStore(s), /kept intact/);
  assert.equal(s.getItem(LEGACY_KEYS.tasks), "{bad-json");
});
test("a failed persistence write does not mutate the active task state", () => {
  const s = memory(),
    store = createStore(s);
  const old = s.setItem;
  s.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.throws(() => store.addTask({ name: "Cannot save" }), /Quota/);
  assert.equal(store.tasks.length, 0);
  s.setItem = old;
});
test("search, status, activity and date filtering compose correctly", () => {
  const tasks = [
    {
      ...oldTask,
      id: "1",
      name: "Study kanji",
      date: todayKey(),
      completed: false,
    },
    {
      ...oldTask,
      id: "2",
      name: "Study words",
      date: todayKey(),
      completed: true,
    },
    {
      ...oldTask,
      id: "3",
      name: "Study other",
      date: "2099-01-01",
      completed: false,
    },
  ];
  assert.deepEqual(
    filterTasks(tasks, {
      view: "today",
      search: "STUDY",
      status: "open",
      activity: "act-old",
    }).map((t) => t.id),
    ["1"],
  );
  assert.equal(filterTasks(tasks, { view: "upcoming" }).length, 1);
});
test("focus countdown uses elapsed time across inactive tabs and clamps to zero", () => {
  const t = { running: true, endsAt: 60000, remaining: 60 };
  assert.equal(timerRemaining(t, 12500), 48);
  assert.equal(timerRemaining(t, 90000), 0);
  assert.equal(
    timerRemaining({ ...t, running: false, remaining: 23 }, 90000),
    23,
  );
});

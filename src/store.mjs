export const LEGACY_KEYS = {
  tasks: "anime_todo_tasks_v1",
  activities: "anime_todo_activities_v1",
};
export const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const makeId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `item_${Date.now()}_${Math.random().toString(36).slice(2)}`;
export function parseStored(storage, key, fallback) {
  const raw = storage.getItem(key);
  if (raw === null) return structuredClone(fallback);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Your saved data could not be read (${key}). It has been kept intact. Export a backup before resetting it.`,
    );
  }
}
export function createStore(storage, scope = "local") {
  const prefix = scope === "local" ? "anime_todo_" : `anime_todo_${scope}_`;
  const keys =
    scope === "local"
      ? LEGACY_KEYS
      : { tasks: `${prefix}tasks_v2`, activities: `${prefix}activities_v2` };
  let tasks = parseStored(storage, keys.tasks, []);
  let activities = parseStored(storage, keys.activities, [
    { id: "general", name: "Personal", icon: "✦" },
    { id: "study", name: "Study", icon: "↗" },
    { id: "work", name: "Work", icon: "▣" },
  ]);
  if (
    !Array.isArray(tasks) ||
    !Array.isArray(activities) ||
    activities.some(
      (a) => !a || typeof a.id !== "string" || typeof a.name !== "string",
    ) ||
    tasks.some(
      (t) => !t || typeof t.id !== "string" || typeof t.name !== "string",
    )
  )
    throw new Error(
      "Your saved task format needs recovery. The original data has been preserved.",
    );
  let prefs = parseStored(storage, `${prefix}preferences_v2`, {
    active: "one-piece",
    favorites: ["one-piece"],
    motion: true,
    name: "",
    onboarding: false,
    mode: scope === "local" ? "local" : "cloud",
  });
  const commit = (nextTasks, nextActivities = activities) => {
    // Write the task payload first. A quota error must not silently discard the in-memory transaction.
    const oldTasks = storage.getItem(keys.tasks),
      oldActivities = storage.getItem(keys.activities);
    try {
      storage.setItem(keys.tasks, JSON.stringify(nextTasks));
      storage.setItem(keys.activities, JSON.stringify(nextActivities));
    } catch (error) {
      try {
        oldTasks === null
          ? storage.removeItem(keys.tasks)
          : storage.setItem(keys.tasks, oldTasks);
        oldActivities === null
          ? storage.removeItem(keys.activities)
          : storage.setItem(keys.activities, oldActivities);
      } catch {}
      throw error;
    }
    tasks = nextTasks;
    activities = nextActivities;
  };
  return {
    get tasks() {
      return structuredClone(tasks);
    },
    get activities() {
      return structuredClone(activities);
    },
    get prefs() {
      return structuredClone(prefs);
    },
    scope,
    savePrefs(change) {
      const next = { ...prefs, ...change };
      storage.setItem(`${prefix}preferences_v2`, JSON.stringify(next));
      prefs = next;
      return this.prefs;
    },
    addTask(fields) {
      const task = {
        id: makeId(),
        name: "",
        notes: "",
        activityId: activities[0]?.id || "general",
        date: todayKey(),
        startTime: "",
        endTime: "",
        completed: false,
        priority: "normal",
        createdAt: Date.now(),
        ...fields,
      };
      if (!task.name.trim()) throw new Error("Give your task a title.");
      commit([...tasks, task]);
      return task;
    },
    updateTask(id, change) {
      commit(tasks.map((t) => (t.id === id ? { ...t, ...change } : t)));
    },
    removeTask(id) {
      const task = tasks.find((t) => t.id === id);
      commit(tasks.filter((t) => t.id !== id));
      return task;
    },
    restoreTask(task) {
      if (task && !tasks.some((t) => t.id === task.id))
        commit([...tasks, task]);
    },
    addActivity(name) {
      if (!name.trim()) throw new Error("Give your activity a name.");
      const a = { id: makeId(), name: name.trim(), icon: "✦" };
      commit(tasks, [...activities, a]);
      return a;
    },
    replaceData(payload) {
      if (
        !Array.isArray(payload.tasks) ||
        !Array.isArray(payload.activities) ||
        payload.tasks.some(
          (t) => !t || typeof t.id !== "string" || typeof t.name !== "string",
        ) ||
        payload.activities.some(
          (a) => !a || typeof a.id !== "string" || typeof a.name !== "string",
        )
      )
        throw new Error(
          "The remote workspace format needs review. Your cached copy has been preserved.",
        );
      commit(payload.tasks, payload.activities);
      if (payload.preferences) this.savePrefs(payload.preferences);
    },
    importData(payload) {
      if (!Array.isArray(payload.tasks) || !Array.isArray(payload.activities))
        throw new Error("This backup does not contain tasks and activities.");
      const ids = new Set(tasks.map((t) => t.id));
      const aIds = new Set(activities.map((a) => a.id));
      const next = payload.tasks.filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.name === "string" &&
          !ids.has(t.id),
      );
      commit(
        [...tasks, ...next],
        [
          ...activities,
          ...payload.activities.filter(
            (a) =>
              a &&
              typeof a.id === "string" &&
              typeof a.name === "string" &&
              !aIds.has(a.id),
          ),
        ],
      );
      return next.length;
    },
    exportData() {
      return {
        version: 2,
        exportedAt: new Date().toISOString(),
        tasks: this.tasks,
        activities: this.activities,
        preferences: this.prefs,
      };
    },
  };
}
export function filterTasks(
  tasks,
  {
    view = "all",
    search = "",
    status = "all",
    activity = null,
    date = null,
  } = {},
) {
  const today = todayKey();
  return tasks
    .filter(
      (t) =>
        (view !== "today" || t.date === today) &&
        (view !== "upcoming" || t.date > today) &&
        (view !== "completed" || t.completed) &&
        (!activity || t.activityId === activity) &&
        (!date || t.date === date) &&
        (status !== "open" || !t.completed) &&
        (status !== "done" || t.completed) &&
        `${t.name} ${t.notes || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(a.completed) - Number(b.completed) ||
        (a.date || "").localeCompare(b.date || "") ||
        (a.startTime || "").localeCompare(b.startTime || ""),
    );
}
export function timerRemaining(timer, now = Date.now()) {
  return timer.running
    ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
    : timer.remaining;
}

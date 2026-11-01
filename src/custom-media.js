const dbPromise = new Promise((resolve, reject) => {
  const r = indexedDB.open("anime-todo-media", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("files");
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});
export async function putFile(key, file) {
  const db = await dbPromise;
  return new Promise((res, rej) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(file, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
export async function getFile(key) {
  const db = await dbPromise;
  return new Promise((res, rej) => {
    const r = db.transaction("files").objectStore("files").get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function readCustomThemes(scope) {
  let list;
  try {
    list = JSON.parse(localStorage.getItem(`anime_custom_${scope}`) || "[]");
  } catch {
    return [];
  }
  const themes = [];
  for (const t of list) {
    const file = await getFile(t.imageKey);
    if (!file) continue;
    const video = t.videoKey ? await getFile(t.videoKey) : null;
    themes.push({
      ...t,
      poster: URL.createObjectURL(file),
      scene: URL.createObjectURL(file),
      loop: video ? URL.createObjectURL(video) : null,
      custom: true,
      genres: ["Custom"],
      taskLabel: "Tasks",
      focusLabel: "Focus session",
      native: "YOUR WORLD",
      source: null,
    });
  }
  return themes;
}

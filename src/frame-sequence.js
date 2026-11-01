/** Scroll-scrubbed Flow/Veo sequence with a bounded decoded-frame cache. */
export function mountFrameSequence(host, config) {
  if (
    !host ||
    !config.ready ||
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    innerWidth < 740
  )
    return () => {};
  const canvas = host.querySelector("canvas"),
    ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => {};
  const cache = new Map(),
    pending = new Set(),
    blobs = new Map();
  let alive = true,
    target = 0,
    current = -1,
    raf = 0,
    visible = true;
  const path = (i) => `${config.prefix}${String(i + 1).padStart(4, "0")}.jpg`;
  async function frame(i) {
    if (!alive || cache.has(i) || pending.has(i)) return;
    pending.add(i);
    try {
      let blob = blobs.get(i);
      if (!blob) {
        const response = await fetch(path(i));
        if (!response.ok) throw new Error("Missing frame");
        blob = await response.blob();
        blobs.set(i, blob);
      }
      const bitmap = await createImageBitmap(blob);
      if (!alive) {
        bitmap.close();
        return;
      }
      cache.set(i, bitmap);
      while (cache.size > 10) {
        const victim = [...cache.keys()]
          .filter((k) => k !== target)
          .sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
        cache.get(victim).close();
        cache.delete(victim);
      }
      schedule();
    } catch {
    } finally {
      pending.delete(i);
    }
  }
  function paint() {
    if (!alive || !visible) return;
    let chosen = cache.has(target)
      ? target
      : [...cache.keys()].sort(
          (a, b) => Math.abs(a - target) - Math.abs(b - target),
        )[0];
    if (chosen === undefined || chosen === current) return;
    const image = cache.get(chosen),
      scale = Math.max(
        canvas.width / image.width,
        canvas.height / image.height,
      );
    ctx.drawImage(
      image,
      (canvas.width - image.width * scale) / 2,
      (canvas.height - image.height * scale) / 2,
      image.width * scale,
      image.height * scale,
    );
    current = chosen;
    host.classList.add("has-frames");
  }
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(paint);
  }
  function update() {
    const track = host.closest(".hero-track"),
      r = track.getBoundingClientRect();
    const progress = Math.max(
      0,
      Math.min(1, -r.top / (track.offsetHeight - innerHeight)),
    );
    target = Math.round(progress * (config.count - 1));
    frame(target);
    for (const offset of [-1, 1, -2, 2]) {
      const next = target + offset;
      if (next >= 0 && next < config.count) frame(next);
    }
    schedule();
  }
  function resize() {
    const r = host.getBoundingClientRect(),
      ratio = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(r.width * ratio);
    canvas.height = Math.round(r.height * ratio);
    current = -1;
    update();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) update();
  });
  io.observe(host);
  window.addEventListener("scroll", update, { passive: true });
  resize();
  // Download compressed frames after critical paint; never eagerly decode the complete sequence.
  const idle =
    window.requestIdleCallback?.(() => prefetch(), { timeout: 2500 }) ??
    setTimeout(() => prefetch(), 2200);
  async function prefetch() {
    let next = 0;
    async function worker() {
      while (alive && next < config.count) {
        const i = next++;
        if (blobs.has(i) || pending.has(i)) continue;
        try {
          const response = await fetch(path(i));
          if (response.ok) blobs.set(i, await response.blob());
        } catch {}
      }
    }
    await Promise.all([worker(), worker()]);
  }
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    window.cancelIdleCallback?.(idle);
    clearTimeout(idle);
    window.removeEventListener("scroll", update);
    ro.disconnect();
    io.disconnect();
    cache.forEach((b) => b.close());
    cache.clear();
    blobs.clear();
  };
}

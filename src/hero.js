export async function mountHero(host, worlds, onSelect) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches || innerWidth < 740) return () => {};
  let alive = true,
    renderer,
    raf = 0,
    observer;
  const disposals = [];
  try {
    const THREE = await import("three");
    if (!alive) return () => {};
    const canvas = host.querySelector("canvas");
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.z = 11.8;
    const group = new THREE.Group();
    scene.add(group);
    const loader = new THREE.TextureLoader();
    const cards = [];
    const poses = [
      [-1.6, 0.85, 0.2, -0.18],
      [0.3, -0.55, 0.8, 0.1],
      [2.15, 0.72, -0.2, 0.17],
      [-2.3, -1.5, -0.8, 0.13],
      [1.7, -1.7, -1, -0.13],
    ];
    for (let i = 0; i < worlds.length; i++) {
      const tex = await loader.loadAsync(worlds[i].poster);
      if (!host.isConnected) {
        tex.dispose();
        disposals.forEach((d) => d.dispose());
        renderer.dispose();
        return () => {};
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      const imageRatio = tex.image.width / tex.image.height;
      const geometry = new THREE.PlaneGeometry(2.45, 2.45 / imageRatio);
      const material = new THREE.MeshBasicMaterial({ map: tex });
      const mesh = new THREE.Mesh(geometry, material);
      const [x, y, z, rot] = poses[i];
      mesh.position.set(x, y, z);
      mesh.rotation.z = rot;
      mesh.userData = { world: worlds[i], base: [x, y, z, rot] };
      const border = new THREE.Mesh(
        new THREE.PlaneGeometry(2.53, 2.45 / imageRatio + 0.08),
        new THREE.MeshBasicMaterial({ color: 0x191919 }),
      );
      border.position.z = -0.012;
      mesh.add(border);
      group.add(mesh);
      cards.push(mesh);
      disposals.push(tex, geometry, material, border.geometry, border.material);
    }
    host.classList.add("webgl-ready");
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let px = 0,
      py = 0,
      visible = true,
      progress = 0;
    const resize = () => {
      const r = host.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      draw();
    };
    const draw = () => {
      if (!alive || !visible) return;
      group.rotation.y = px * 0.055 + progress * 0.14;
      group.rotation.x = -py * 0.04;
      cards.forEach((m, i) => {
        const [x, y, z, rot] = m.userData.base;
        m.rotation.z = rot + progress * (i % 2 ? 0.16 : -0.12);
        m.position.y = y + progress * (i % 2 ? -0.6 : 0.55);
        m.position.z = z + progress * 0.4;
      });
      renderer.render(scene, camera);
    };
    const move = (e) => {
      const r = host.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const click = (e) => {
      const r = host.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards, false)[0];
      if (hit) onSelect(hit.object.userData.world.id);
    };
    const scroll = () => {
      const track = document.querySelector(".hero-track");
      if (!track) return;
      const rect = track.getBoundingClientRect();
      progress = Math.max(
        0,
        Math.min(1, -rect.top / (track.offsetHeight - innerHeight)),
      );
      host.style.setProperty("--progress", progress);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    observer = new ResizeObserver(resize);
    observer.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) draw();
    });
    io.observe(host);
    host.addEventListener("pointermove", move);
    canvas.addEventListener("click", click);
    window.addEventListener("scroll", scroll, { passive: true });
    resize();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", move);
      canvas.removeEventListener("click", click);
      window.removeEventListener("scroll", scroll);
      observer.disconnect();
      io.disconnect();
      disposals.forEach((d) => d.dispose());
      renderer.dispose();
    };
  } catch (e) {
    renderer?.dispose();
    host.classList.remove("webgl-ready");
    console.info("Using the illustrated hero fallback.", e.message);
    return () => {
      alive = false;
    };
  }
}
export async function mountScrollAnimations() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  const ctx = gsap.context(() => {
    gsap.utils
      .toArray("[data-reveal]")
      .forEach((el) =>
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 93%", once: true },
        }),
      );
    const track = document.querySelector(".hero-track");
    if (track && innerWidth >= 740) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tl.to(".hero-copy", { y: -60, opacity: 0, duration: 0.26 }, 0.3)
        .fromTo(
          ".hero-next",
          { y: 55, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25 },
          0.43,
        )
        .to(".hero-art", { scale: 1.06, x: -20, duration: 0.7 }, 0);
    }
  });
  return () => ctx.revert();
}
export function observeVideos(root = document) {
  const videos = [...root.querySelectorAll("video[data-ambient]")];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const video = e.target;
        if (
          e.isIntersecting &&
          !document.hidden &&
          video.dataset.paused !== "true"
        ) {
          video.play().catch(() => {});
        } else video.pause();
      }
    },
    { threshold: 0.05 },
  );
  videos.forEach((v) => io.observe(v));
  const visibility = () => {
    for (const v of videos) {
      if (document.hidden) v.pause();
      else if (
        v.getBoundingClientRect().top < innerHeight &&
        v.dataset.paused !== "true"
      )
        v.play().catch(() => {});
    }
  };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    videos.forEach((v) => v.pause());
  };
}

import "./styles.css";
import catalog from "./data/catalog.json";
import { selectWorlds } from "./world-catalog.mjs";
import { icon, mark } from "./icons.js";
import { reconciliationAction } from "./cloud-state.mjs";
import {
  createStore,
  todayKey,
  makeId,
  filterTasks,
  timerRemaining,
  LEGACY_KEYS,
} from "./store.mjs";
import {
  authConfigured,
  currentUser,
  sendCode,
  verifyCode,
  signInGoogle,
  signOut,
  loadCloudData,
  saveCloudData,
} from "./auth.js";
import { readCustomThemes, putFile } from "./custom-media.js";
import heroSequence from "./data/hero-sequence.json";
import { mountFrameSequence } from "./frame-sequence.js";
import { mountHero, mountScrollAnimations, observeVideos } from "./hero.js";

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const $ = (selector, root = document) => root.querySelector(selector);
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let store,
  storageError,
  user = null,
  custom = [],
  cleanup = [],
  routeVersion = 0,
  cloudRevision = null,
  syncState = "Saved on this device",
  syncTimer,
  syncInFlight = false,
  syncAgain = false;
try {
  store = createStore(localStorage);
} catch (e) {
  storageError = e;
}
let cloudBlocked = false,
  cloudMutation = 0;
let selected =
  sessionStorage.getItem("anime_theme_intent") ||
  store?.prefs.active ||
  "one-piece";
let favorites = [...(store?.prefs.favorites || ["one-piece"])];
let onboardStep = 1,
  worldQuery = "",
  worldGenre = "All",
  worldLimit = 12,
  onboardQuery = "",
  taskQuery = "",
  taskStatus = "all",
  calendarDate = new Date(),
  selectedDate = null,
  activity = null,
  pendingEmail = "",
  toastTimer,
  lastFocus,
  draftImageUrl = null;
let timer = loadTimer();
let demoTasks = [
  { id: "d1", name: "Read a chapter. Start a new one.", done: true },
  { id: "d2", name: "Make a little progress on the big idea.", done: false },
  { id: "d3", name: "Take 25 minutes for yourself.", done: false },
];
const allThemes = () => [...catalog, ...custom];
const theme = (id = selected) =>
  allThemes().find((t) => t.id === id) || catalog[0];
const shortTitle = (t) =>
  ({
    "The Apothecary Diaries": "The Apothecary Diaries",
    "Demon Slayer: Kimetsu no Yaiba": "Demon Slayer",
    "Frieren: Beyond Journey’s End": "Frieren",
    "That Time I Got Reincarnated as a Slime": "Reincarnated as a Slime",
    "KONOSUBA -God’s blessing on this wonderful world!": "KONOSUBA",
    "Re:ZERO -Starting Life in Another World-": "Re:ZERO",
    "MASHLE: MAGIC AND MUSCLES": "MASHLE",
  })[t.title] || t.title;
const logo = () =>
  `<a class="brand" href="/" data-route="/" aria-label="Anime Todo home">${mark()}<span>anime<span class="brand-light">todo</span><sup>✦</sup></span></a>`;
const button = (text, action, kind = "primary", extra = "") =>
  `<button class="button ${kind}" data-action="${action}" ${extra}>${text}</button>`;
const genreOptions = [
  "All",
  "Popular 50",
  "Action",
  "Adventure",
  "Fantasy",
  "Supernatural",
  "Sports",
  "Romance",
  "Comedy",
  "Sci-Fi",
  "Music",
  "Mystery",
  "Drama",
];
function setTheme(id) {
  const t = theme(id);
  document.documentElement.style.setProperty("--world", t.color);
  document.documentElement.style.setProperty("--world-alt", t.secondary);
  document.documentElement.style.setProperty(
    "--world-ink",
    contrastColor(t.color),
  );
  document.documentElement.dataset.world = t.id;
  document.documentElement.style.setProperty(
    "--theme-scene",
    `url("${t.scene}")`,
  );
  document.documentElement.style.setProperty("--focal", t.focal || "center");
}
function contrastColor(hex) {
  const c = hex.replace("#", "");
  const rgb = [0, 2, 4]
    .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.36
    ? "#191919"
    : "#ffffff";
}
function toast(text, undo) {
  clearTimeout(toastTimer);
  const el = $("#toast");
  el.innerHTML = `<span>${escape(text)}</span>${undo ? '<button data-action="undo">Undo</button>' : ""}`;
  el.classList.add("show");
  if (undo)
    el.querySelector("button").onclick = () => {
      undo();
      el.classList.remove("show");
    };
  toastTimer = setTimeout(() => el.classList.remove("show"), 5000);
}
function go(path) {
  closeModal();
  history.pushState({}, "", path);
  window.scrollTo({ top: 0, behavior: "instant" });
  render();
}
window.addEventListener("popstate", () => {
  closeModal();
  render();
});
function applyPreference(id) {
  selected = id;
  store.savePrefs({
    active: id,
    favorites: favorites.includes(id) ? favorites : [...favorites, id],
  });
  setTheme(id);
  queueSync();
}
function render() {
  routeVersion++;
  cleanup.forEach((fn) => fn());
  cleanup = [];
  document.body.classList.remove("menu-open");
  if (storageError) {
    renderRecovery();
    return;
  }
  const path = location.pathname;
  setTheme(path.startsWith("/app") ? store.prefs.active : selected);
  if (path === "/sign-in" || path === "/auth/callback") renderSignIn();
  else if (path === "/onboarding") renderOnboarding();
  else if (path.startsWith("/app")) {
    if (!store.prefs.onboarding) {
      go("/onboarding");
      return;
    }
    renderDashboard();
  } else renderLanding();
  document.title = path.startsWith("/app")
    ? `${shortTitle(theme(store.prefs.active))} workspace · Anime Todo`
    : "Anime Todo — Your next arc starts here.";
  if (path !== "/")
    requestAnimationFrame(() => $("#main")?.focus({ preventScroll: true }));
}
function renderRecovery() {
  app.innerHTML = `<main id="main" class="recovery"><span class="eyebrow">Your work comes first</span><h1>Let’s recover your workspace.</h1><p>${escape(storageError.message)}</p><p>Your original saved records have not been changed.</p>${button("Download the original data", "recover-data")}</main>`;
}
function header() {
  return `<header class="site-header"><div class="header-inner">${logo()}<nav class="desktop-nav" aria-label="Main navigation"><a href="/#worlds" data-anchor="worlds">The worlds</a><a href="/#how-it-works" data-anchor="how-it-works">How it works</a><a href="/#workspace" data-anchor="workspace">The workspace</a></nav><div class="nav-actions"><a class="sign-in-link" href="/sign-in" data-route="/sign-in">${store.prefs.onboarding ? "Your workspace" : "Sign in"}</a>${button(`Find your world ${icon("arrow")}`, "start", "small primary")}<button class="icon-button mobile-toggle" data-action="menu" aria-label="Open navigation" aria-expanded="false">${icon("menu")}</button></div></div><nav class="mobile-nav" aria-label="Mobile navigation"><a href="/#worlds" data-anchor="worlds">The worlds</a><a href="/#how-it-works" data-anchor="how-it-works">How it works</a><a href="/#workspace" data-anchor="workspace">The workspace</a><a href="/sign-in" data-route="/sign-in">Sign in / Your workspace</a></nav></header>`;
}
function renderLanding() {
  const featured = [
    "one-piece",
    "naruto-shippuden",
    "jujutsu-kaisen",
    "frieren",
    "solo-leveling",
  ].map((id) => theme(id));
  app.innerHTML = `${header()}<main id="main" tabindex="-1">
    <section class="hero-track" aria-labelledby="hero-title"><div class="hero-sticky"><div class="hero-sequence" style="background-image:url('/media/hero/end_frame.jpg')"><canvas aria-hidden="true"></canvas></div><div class="hero-inner">
      <div class="hero-copy"><span class="eyebrow"><span class="ink-dot"></span> A little focus. A whole new world.</span><h1 id="hero-title">YOUR DAY.<br>YOUR ANIME.<br><span class="hero-red">YOUR NEXT ARC.</span></h1><p>A to-do list that gets you. Turn everyday tasks into your own adventure, with a workspace inspired by the anime you love.</p><div class="hero-actions">${button(`Choose your world ${icon("arrow")}`, "start")}<a class="text-link" href="#workspace" data-anchor="workspace">Take a look inside ${icon("play")}</a></div><div class="hero-note"><span class="little-star">✳</span> Built for main-character energy.<span class="note-dash"></span> One task at a time.</div></div>
      <div class="hero-next" aria-hidden="true"><span class="eyebrow">The plot twist?</span><h2>YOU’RE THE<br><span>MAIN CHARACTER.</span></h2><p>Pick a world that moves you.<br>Make room for what matters.</p><a class="button primary" href="#worlds" data-anchor="worlds" tabindex="-1">Explore the worlds ${icon("arrow")}</a></div>
      <div class="hero-art" aria-label="Interactive anime poster collage"><div class="sun-disc"></div><div class="halftone hero-dots"></div><span class="orbit-label">A NEW CHAPTER STARTS WITH YOU</span><div class="hero-webgl" id="hero-webgl"><canvas aria-hidden="true"></canvas><div class="poster-fallback">${featured.map((t, i) => `<button class="hero-poster poster-${i}" data-action="preview" data-id="${t.id}" aria-label="Preview ${escape(t.title)}"><img src="${t.poster}" alt="${escape(t.title)} key visual" ${i > 1 ? 'loading="lazy"' : ""}/></button>`).join("")}</div></div><div class="manga-sticker">MAKE<br>TODAY<br>COUNT.<span>✦</span></div><div class="floating-task"><span class="floating-check">${icon("check")}</span><div><strong>Write your next chapter.</strong><small>Today’s mission · you’ve got this</small></div><span>↗</span></div><span class="hero-annotation">Your favorites. Your space. Your pace.</span></div>
      <div class="hero-bottom"><span>SCROLL TO START YOUR ARC</span><span class="scroll-line"></span><span>01 — THE BEGINNING</span></div>
    </div></div></section>
    <div class="chapter-strip"><span>LESS OVERWHELM.</span><span class="strip-star">✦</span><span>MORE MAIN-CHARACTER ENERGY.</span><span class="strip-star">✦</span><span>YOUR WORLD. YOUR PACE.</span><span class="strip-star">✦</span></div>
    <section id="worlds" class="worlds-section section-wrap"><div class="section-heading" data-reveal><div><span class="eyebrow">01 / FIND YOUR WORLD</span><h2>Different worlds.<br><span class="serif-italic">Same you.</span></h2></div><p>From the Grand Line to a quiet journey beyond.<br>Find the world that makes you want to show up.</p></div><div class="featured-world" id="featured-world">${featuredWorld(theme(selected))}</div><div class="catalog-header"><div><h3>The world is your pick.</h3><span class="muted">${catalog.length} anime worlds. One place to make progress.</span></div><label class="search-field">${icon("search")}<input id="world-search" type="search" placeholder="Search your favorite anime…" aria-label="Search anime worlds" autocomplete="off" value="${escape(worldQuery)}"/><kbd>/</kbd></label></div><div class="genre-tabs" role="group" aria-label="Filter worlds by genre">${genreOptions.map((g) => `<button class="genre-tab ${g === worldGenre ? "active" : ""}" data-action="genre" data-genre="${g}" aria-pressed="${g === worldGenre}">${g}</button>`).join("")}</div><p class="catalog-source-note">Includes the first 50 worlds observed on <a href="https://www.crunchyroll.com/videos/popular" target="_blank" rel="noopener noreferrer">Crunchyroll Popular ↗</a> on 1 Nov 2026. Order varies by date and region.</p><div id="world-grid" class="world-grid">${worldGrid()}</div><div id="world-more" class="world-more">${moreWorlds()}</div><div class="custom-world-banner"><span class="custom-scribble">✳</span><div><h3>Can’t find your universe?</h3><p>Make it yours. Add your own art, colors, and a little personality.</p></div>${button(`Create a custom world ${icon("plus")}`, "custom", "outline")}</div></section>
    <section id="how-it-works" class="how-section"><div class="section-wrap"><div class="section-heading" data-reveal><div><span class="eyebrow">02 / A SIMPLE ORIGIN STORY</span><h2>Big dreams.<br>Small daily steps.</h2></div><span class="hand-note">No training arc required. ↙</span></div><div class="steps"><article data-reveal><span class="step-number">01</span><div class="step-art step-pick">${[theme("one-piece"), theme("frieren"), theme("dandadan")].map((t) => `<img src="${t.poster}" alt="" loading="lazy"/>`).join("")}</div><h3>Pick your world.</h3><p>Choose the anime that feels like home. Or create a universe of your own.</p></article><article data-reveal><span class="step-number">02</span><div class="step-art step-plan"><span>YOUR NEXT LITTLE WINS</span><div>${icon("check")} Finish the first chapter</div><div><i></i> Work on that big idea</div><div><i></i> Remember to take a break</div></div><h3>Give your day a little direction.</h3><p>Add a task, plan your time, and make space for the things that matter to you.</p></article><article data-reveal><span class="step-number">03</span><div class="step-art step-focus"><span>YOUR FOCUS ARC</span><strong>25:00</strong><div>${icon("play")} ONE THING AT A TIME</div></div><h3>Show up. Level up.</h3><p>Find your focus, celebrate the small wins, and keep your story moving forward.</p></article></div></div></section>
    <section id="workspace" class="workspace-section section-wrap"><div class="section-heading" data-reveal><div><span class="eyebrow">03 / A SPACE THAT FEELS LIKE YOU</span><h2>Meet your<br><span class="serif-italic">new happy place.</span></h2></div><p>A little structure. A little escape.<br>Everything you need to make today yours.</p></div><div class="demo-theme-tabs" aria-label="Preview a workspace">${["one-piece", "frieren", "solo-leveling"].map((id) => `<button data-action="demo-theme" data-id="${id}" class="${id === selected ? "active" : ""}">${escape(shortTitle(theme(id)))}</button>`).join("")}<span>${icon("spark")} An interactive preview — go ahead, click.</span></div><div id="demo-workspace">${workspaceDemo(theme(selected))}</div><div class="workspace-notes"><span>${icon("list")} Tasks that feel manageable</span><span>${icon("clock")} A little room to focus</span><span>${icon("calendar")} Your days, thoughtfully planned</span><span>${icon("spark")} Always your kind of world</span></div></section>
    <section class="manifesto"><div class="section-wrap manifesto-inner"><span class="eyebrow">A NOTE FROM YOUR NEXT CHAPTER</span><p>You don’t have to save the world today.<br><span>Just do one thing for yours.</span></p><span class="manifesto-star">✳</span></div></section>
    <section class="faq-section section-wrap"><div><span class="eyebrow">04 / THE LITTLE DETAILS</span><h2>A few things<br>you might ask.</h2></div><div class="faq-list">${[
      [
        "Can I change my anime later?",
        "Any time. Switch worlds from your workspace without changing your tasks, activities, or focus session. Save a few favorites so your next world is always close by.",
      ],
      [
        "Can I add my own anime?",
        "Absolutely. Upload an image, pick your colors, and give your world a name. You can also add a video loop. Custom artwork is stored on this device.",
      ],
      [
        "Do I need an account to get started?",
        "You can use a device workspace right away. It saves your tasks in this browser. Cloud sign-in is available when the account service is connected.",
      ],
      [
        "Will I keep my existing tasks?",
        "Yes. Your device workspace reads your existing Anime Todo tasks and activities. You can also export a backup at any time in settings.",
      ],
      [
        "Can I turn off the animations?",
        "Of course. Turn ambient motion off in your workspace. We also respect your device’s reduced-motion setting. Focus comes first.",
      ],
    ]
      .map(
        ([q, a]) =>
          `<details><summary>${q}<span>+</span></summary><p>${a}</p></details>`,
      )
      .join("")}</div></section>
    <section class="final-cta"><span class="eyebrow">THE NEXT CHAPTER IS YOURS</span><h2>LET’S MAKE<br><span>TODAY A GOOD ONE.</span></h2>${button(`Start your next arc ${icon("arrow")}`, "start", "ink")}<span class="cta-scribble">See you on the other side. ✦</span></section>
  </main><footer class="site-footer">${logo()}<span>A little focus. A lot of heart.</span><div><button class="text-button" data-action="credits">Artwork & credits</button><span>Made for your everyday adventures.</span></div></footer>`;
  const version = routeVersion;
  mountHero($("#hero-webgl"), featured, (id) => previewWorld(id)).then((fn) => {
    if (version === routeVersion) cleanup.push(fn);
    else fn();
  });
  mountScrollAnimations().then((fn) => {
    if (version === routeVersion) cleanup.push(fn);
    else fn();
  });
  cleanup.push(mountFrameSequence($(".hero-sequence"), heroSequence));
  cleanup.push(observeVideos(app));
}
function featuredWorld(t) {
  return `<div class="featured-image"><img src="${t.scene}" alt="${escape(t.title)} anime artwork" loading="lazy"/><div class="featured-overlay"></div><span class="world-chapter">WORLD / ${String(catalog.findIndex((x) => x.id === t.id) + 1).padStart(2, "0")}</span><span class="native-title" lang="ja">${escape(t.native || "YOUR WORLD")}</span><div class="featured-caption"><span>${escape(t.genres[0])} / A PLACE TO BEGIN</span><h3>${escape(shortTitle(t))}</h3></div></div><div class="featured-copy" style="--card-color:${t.color}"><span class="eyebrow">YOUR WORLD, REIMAGINED</span><h3>New day.<br>New adventure.</h3><p>Your tasks. Your focus. A little inspiration from ${escape(shortTitle(t))}.</p><ul><li>${icon("check")} A workspace with its own personality</li><li>${icon("check")} Tasks, focus sessions, and a daily plan</li><li>${icon("check")} A world you can change whenever you like</li></ul>${button(`Make this my world ${icon("arrow")}`, "choose-world", "primary", `data-id="${t.id}"`)}<span class="world-switch-note">Or find your favorite below ↓</span></div>`;
}
function matchingWorlds(query = worldQuery, genre = worldGenre) {
  return selectWorlds(allThemes(), query, genre);
}
function worldGrid() {
  const list = matchingWorlds();
  if (!list.length)
    return `<div class="empty-worlds"><h3>No worlds found. Yet.</h3><p>Try another title, clear your filters, or create a world of your own.</p>${button("Clear filters", "clear-worlds", "outline")}</div>`;
  return list
    .slice(0, worldLimit)
    .map(
      (t) =>
        `<article class="world-card"><button class="world-card-image" data-action="preview" data-id="${t.id}" aria-label="Preview ${escape(t.title)}"><img src="${t.poster}" alt="${escape(t.title)} key visual" loading="lazy" width="300" height="440"/><span class="world-card-arrow">${icon("arrow")}</span>${t.id === selected ? '<span class="selected-tag">YOUR PICK</span>' : ""}${t.popularPosition ? `<span class="popular-position">POPULAR / ${String(t.popularPosition).padStart(2, "0")}</span>` : ""}</button><div class="world-card-meta"><h4><button data-action="preview" data-id="${t.id}">${escape(t.title)}</button></h4><span>${escape(t.genres[0])}</span></div></article>`,
    )
    .join("");
}
function moreWorlds() {
  const count = matchingWorlds().length;
  return `<span>${Math.min(count, worldLimit)} of ${count} worlds</span>${count > worldLimit ? button(`More worlds to explore ${icon("plus")}`, "more-worlds", "outline") : ""}`;
}
function updateWorldGrid() {
  const q = $("#world-grid");
  if (q) q.innerHTML = worldGrid();
  const more = $("#world-more");
  if (more) more.innerHTML = moreWorlds();
  document.querySelectorAll(".genre-tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.genre === worldGenre);
    el.setAttribute("aria-pressed", String(el.dataset.genre === worldGenre));
  });
}
function workspaceDemo(t) {
  return `<div class="demo-shell" style="--demo-accent:${t.color}"><aside class="demo-sidebar">${logo()}<div class="demo-nav active">${icon("home")} My day</div><div class="demo-nav">${icon("calendar")} Calendar</div><div class="demo-nav">${icon("list")} All tasks</div><span class="eyebrow">MY ACTIVITIES</span><div class="demo-activity"><i style="background:${t.color}"></i> A little personal growth</div><div class="demo-activity"><i></i> The big idea</div><div class="demo-world"><img src="${t.poster}" alt="" loading="lazy"/><span>YOUR WORLD<strong>${escape(shortTitle(t))}</strong></span></div></aside><div class="demo-main"><div class="demo-top"><span>MY DAY / YOUR NEXT CHAPTER</span><span>✦ Your pace is a good pace.</span></div><h3>Good things take<br><span>a little every day.</span></h3><div class="demo-content"><div class="demo-task-panel"><div class="panel-title"><h4>Today’s little missions</h4><span>${demoTasks.filter((t) => t.done).length} / 3</span></div>${demoTasks.map((d) => `<button class="demo-task ${d.done ? "done" : ""}" data-action="demo-task" data-id="${d.id}"><span class="task-check">${d.done ? icon("check") : ""}</span><span>${d.name}<small>${d.id === "d1" ? "PERSONAL GROWTH" : "A LITTLE PROGRESS"}</small></span></button>`).join("")}<button class="demo-add" data-action="start">${icon("plus")} Write your own next chapter</button><div class="demo-quote">“Little by little, a little becomes a lot.”<span>YOUR DAILY REMINDER</span></div></div><div class="demo-right"><div class="demo-scene"><img src="${t.scene}" alt="${escape(t.title)} workspace scene" loading="lazy"/><span>${escape(shortTitle(t))}</span></div><div class="demo-timer"><span>YOUR FOCUS ARC</span><strong>25:00</strong>${button(`${icon("play")} Find your focus`, "start", "ink small")}</div></div></div></div></div>`;
}
function renderSignIn() {
  const t = theme(selected);
  app.innerHTML = `<main id="main" class="auth-page" tabindex="-1"><div class="auth-art" style="--art-color:${t.color}"><img src="${t.poster}" alt="${escape(t.title)} artwork"/><div class="auth-art-wash"></div>${logo()}<div class="auth-art-copy"><span class="eyebrow">YOUR ORIGIN STORY STARTS HERE</span><h1>A LITTLE FOCUS.<br>A WHOLE<br><span>NEW WORLD.</span></h1><span>${escape(shortTitle(t))} / Your next chapter</span></div></div><div class="auth-form-wrap"><a class="back-link" href="/" data-route="/">← Back to the beginning</a><div class="auth-form"><span class="eyebrow">WELCOME TO ANIME TODO</span><h2>${pendingEmail ? "Check your inbox." : "Every great arc<br>starts somewhere."}</h2><p>${pendingEmail ? `We sent a sign-in code to <strong>${escape(pendingEmail)}</strong>.` : "A space for your plans, your progress, and the anime you love."}</p>${pendingEmail ? `<form id="verify-form"><label>YOUR SIGN-IN CODE<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" minlength="6" maxlength="8" required placeholder="Enter the code"/></label>${button(`Continue ${icon("arrow")}`, "submit-verify", "primary", 'type="submit"')}<button type="button" class="text-button" data-action="change-email">Use a different email</button></form>` : `${button(`${googleMark()} Continue with Google`, "google", "outline full", authConfigured ? "" : "disabled")}<div class="form-divider"><span>or use your email</span></div><form id="email-form"><label>EMAIL ADDRESS<input name="email" type="email" autocomplete="email" placeholder="you@yourworld.com" required ${authConfigured ? "" : "disabled"}/></label>${button(`Send a sign-in code ${icon("arrow")}`, "submit-email", "primary full", `type="submit" ${authConfigured ? "" : "disabled"}`)}</form>${!authConfigured ? '<p class="auth-availability">Account sign-in is being connected. Your device workspace is ready to use.</p>' : ""}`}<div class="local-choice"><span>No account? No problem.</span>${button(`Continue on this device ${icon("right")}`, "local-start", "text")}<small>Your tasks stay in this browser. Export a backup any time.</small></div><p class="auth-caption">One task. One small win. One good day.</p></div><div class="auth-bottom"><span>YOUR WORLD. YOUR PACE.</span><span>✦</span><span>YOUR STORY.</span></div></div></main>`;
}
function googleMark() {
  return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4Z"/><path fill="#34a853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.4-2.6Z"/><path fill="#ea4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.6A6 6 0 0 1 12 6Z"/></svg>';
}
function renderOnboarding() {
  app.innerHTML = `<div class="onboarding-page"><header class="simple-header">${logo()}<span>${user ? "YOUR PERSONAL WORKSPACE" : "DEVICE WORKSPACE"} <i>✦</i></span><button class="text-button" data-action="exit-onboarding">Save for later →</button></header><main id="main" class="onboarding-main" tabindex="-1"><div class="onboard-progress"><span class="${onboardStep === 1 ? "active" : "complete"}">01 <i></i> Find your favorites</span><span class="${onboardStep === 2 ? "active" : ""}">02 <i></i> Make it yours</span></div>${onboardStep === 1 ? `<div class="onboard-heading"><span class="eyebrow">THERE’S A WORLD FOR EVERY YOU</span><h1>Which stories<br><span>feel like yours?</span></h1><p>Pick a few favorites. You’ll choose your active world next.</p></div><div class="onboard-search"><label class="search-field">${icon("search")}<input type="search" id="onboard-search" placeholder="Find your favorite anime…" aria-label="Search favorites" value="${escape(onboardQuery)}"/></label>${button(`${icon("plus")} Create a custom world`, "custom", "outline small")}</div><div class="onboard-worlds" id="onboard-worlds">${onboardCards()}</div>` : `${onboardCustomize()}`}</main><div class="onboard-bottom"><div><strong id="favorite-count">${favorites.length} ${favorites.length === 1 ? "world" : "worlds"} selected</strong><span>${onboardStep === 1 ? "Your favorites. Ready for the next chapter." : "Everything can be changed later."}</span></div>${onboardStep === 2 ? button("← Back", "onboard-back", "text") : ""}${button(`${onboardStep === 1 ? "Make it mine" : "Enter my workspace"} ${icon("arrow")}`, onboardStep === 1 ? "onboard-next" : "onboard-finish", "primary", favorites.length ? "" : "disabled")}</div></div>`;
}
function onboardCards() {
  return (
    matchingWorlds(onboardQuery, "All")
      .map(
        (t) =>
          `<button class="onboard-card ${favorites.includes(t.id) ? "chosen" : ""}" data-action="favorite" data-id="${t.id}" aria-pressed="${favorites.includes(t.id)}"><div><img src="${t.poster}" alt="" loading="lazy" width="240" height="350"/><span class="choose-check">${favorites.includes(t.id) ? icon("check") : icon("plus")}</span></div><strong>${escape(t.title)}</strong><small>${escape(t.genres[0])}</small></button>`,
      )
      .join("") ||
    '<p class="empty-worlds">No matches. Try another title or create a custom world.</p>'
  );
}
function onboardCustomize() {
  const t = theme(selected);
  return `<div class="onboard-heading"><span class="eyebrow">MAKE YOURSELF AT HOME</span><h1>Welcome to<br><span>your kind of space.</span></h1></div><div class="customize-grid"><div class="customize-options"><label class="field-label">WHAT SHOULD WE CALL YOU?<input id="profile-name" placeholder="Your name (optional)" maxlength="40" value="${escape(store.prefs.name)}"/></label><div class="field-label">YOUR ACTIVE WORLD<div class="favorite-options">${favorites
    .map((id) => {
      const x = theme(id);
      return `<button data-action="active-world" data-id="${id}" class="favorite-option ${id === selected ? "selected" : ""}" aria-pressed="${id === selected}"><img src="${x.poster}" alt=""/><span>${escape(x.title)}</span>${id === selected ? icon("check") : ""}</button>`;
    })
    .join(
      "",
    )}</div></div><label class="motion-choice"><span><strong>A little world in motion</strong><small>Ambient live artwork while you work.</small></span><input id="onboard-motion" type="checkbox" ${store.prefs.motion && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "checked" : ""}/></label><p class="muted">Your tasks and progress stay with you when you change worlds.</p></div><div class="onboard-preview" style="--card-color:${t.color}"><div class="onboard-preview-image"><img src="${t.scene}" alt="${escape(t.title)} artwork"/><span>${escape(shortTitle(t))}</span></div><div><span class="eyebrow">YOUR NEXT CHAPTER</span><h3>Let’s make<br>today a good one.</h3><div class="preview-task">${icon("check")} One small win at a time.</div><div class="preview-focus"><span>${escape(t.focusLabel)}</span><strong>25:00</strong></div></div></div></div>`;
}
function renderDashboard() {
  cleanup.forEach((dispose) => dispose());
  cleanup = [];
  const t = theme(store.prefs.active);
  selected = t.id;
  setTheme(t.id);
  const path = location.pathname;
  const view = path.split("/")[2] || "dashboard";
  app.innerHTML = `<div class="workspace-app"><aside class="app-sidebar" id="app-sidebar">${logo()}<span class="sidebar-kicker">YOUR DAILY CHAPTER</span><nav aria-label="Workspace navigation">${[
    ["dashboard", "My day", "home", "/app"],
    ["today", "Today", "calendar", "/app/today"],
    ["tasks", "All tasks", "list", "/app/tasks"],
    ["calendar", "Calendar", "calendar", "/app/calendar"],
    ["completed", "Little wins", "check", "/app/completed"],
  ]
    .map(
      ([key, label, ico, url]) =>
        `<a class="sidebar-link ${view === key && !activity ? "active" : ""}" href="${url}" data-route="${url}">${icon(ico)}<span>${label}</span>${key === "tasks" ? `<small id="all-task-count">${store.tasks.length}</small>` : ""}</a>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-section-title"><span>MY ACTIVITIES</span><button class="icon-button" data-action="new-activity" aria-label="Create activity">${icon("plus")}</button></div><div class="sidebar-activities">${store.activities.map((a, i) => `<button class="sidebar-activity ${activity === a.id ? "active" : ""}" data-action="activity" data-id="${escape(a.id)}"><i style="background:${["var(--world)", "#cc945a", "#8c9b78", "#9a85b6"][i % 4]}"></i><span>${escape(a.name)}</span><small>${store.tasks.filter((x) => x.activityId === a.id && !x.completed).length}</small></button>`).join("")}</div><div class="sidebar-bottom"><button class="current-world" data-action="switch-world"><img src="${t.poster}" alt=""/><span>MY WORLD<strong>${escape(shortTitle(t))}</strong></span>${icon("spark")}</button><a class="sidebar-link ${view === "settings" ? "active" : ""}" href="/app/settings" data-route="/app/settings">${icon("settings")}<span>Settings & your space</span></a><button class="sidebar-profile" data-action="profile"><span>${escape((store.prefs.name || user?.email || "You").slice(0, 1).toUpperCase())}</span><div><strong>${escape(store.prefs.name || "Your workspace")}</strong><small>${user ? "ACCOUNT WORKSPACE" : "SAVED ON THIS DEVICE"}</small></div>${icon("chevron")}</button></div></aside><div class="app-content"><header class="app-topbar"><button class="icon-button app-menu" data-action="sidebar" aria-label="Toggle workspace navigation">${icon("menu")}</button><span>${activity ? "MY ACTIVITIES" : view === "dashboard" ? "MY DAY" : view.toUpperCase()} <i>/</i> YOUR NEXT CHAPTER</span><div><span class="sync-status" id="sync-status"><i></i>${escape(syncState)}</span><button class="icon-button" data-action="switch-world" aria-label="Change anime world">${icon("spark")}</button>${button(`${icon("plus")} New task`, "new-task", "primary small")}</div></header><main id="main" class="dashboard-main" tabindex="-1">${view === "settings" ? settingsPage() : dashboardContent(view, t)}</main></div></div>`;
  cleanup.push(observeVideos(app));
  updateTimer();
}
function dashboardContent(view, t) {
  return `<div class="dashboard-heading"><div><span class="eyebrow">${new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase()}</span><h1>${view === "calendar" ? "A little room to plan." : view === "completed" ? "Look at you go." : view === "tasks" ? "Your story, in small steps." : activity ? escape(store.activities.find((a) => a.id === activity)?.name || "Your activity") : `Hey${store.prefs.name ? ", " + escape(store.prefs.name) : ", main character"}.<br><span>Let’s make today count.</span>`}</h1><p>${view === "completed" ? "Every checked box is a little step forward." : `No world-saving required. Just your next little win.`}</p></div><div class="daily-stamp"><span>ONE DAY</span><strong>AT A<br>TIME.</strong><span>✦ YOU’VE GOT THIS ✦</span></div></div><div class="dashboard-stats" id="dashboard-stats">${statsHtml()}</div><div class="dashboard-columns"><section class="task-panel"><div id="task-panel-inner">${taskPanel(view)}</div></section><aside class="dashboard-aside"><div class="scene-panel"><div class="scene-media">${store.prefs.motion && !matchMedia("(prefers-reduced-motion: reduce)").matches && t.loop ? `<video data-ambient muted loop playsinline preload="metadata" poster="${t.scene}" src="${t.loop}" aria-label="${escape(t.title)} live artwork"></video>` : `<img src="${t.scene}" alt="${escape(t.title)} artwork"/>`}<span class="scene-world">${escape(shortTitle(t))}</span>${t.loop && !matchMedia("(prefers-reduced-motion: reduce)").matches ? `<button class="scene-pause icon-button" data-action="scene-motion" aria-label="${store.prefs.motion ? "Pause" : "Play"} live artwork">${icon(store.prefs.motion ? "pause" : "play")}</button>` : ""}</div><div class="scene-caption"><span>${icon("spark")} YOUR LITTLE ESCAPE</span><small>${t.loopKind === "live-artwork" ? "LIVE ARTWORK" : "YOUR WORLD"}</small></div></div><div class="focus-panel"><div class="panel-title"><span>${escape(t.focusLabel).toUpperCase()}</span>${icon("clock")}</div><p>One thing at a time.</p><div id="timer-display" class="timer-display">25:00</div><div class="focus-presets">${[5, 25, 50].map((n) => `<button data-action="timer-preset" data-minutes="${n}" class="${timer.total === n * 60 ? "selected" : ""}">${n} min</button>`).join("")}</div><div class="timer-actions"><button id="timer-toggle" class="button world-button" data-action="timer-toggle">${icon(timer.running ? "pause" : "play")} ${timer.running ? "Pause" : "Let’s focus"}</button><button class="icon-button" data-action="timer-reset" aria-label="Reset focus timer">${icon("reset")}</button></div><span class="focus-footnote">${icon("spark")} Progress, at your own pace.</span></div><div class="mini-calendar">${calendarHtml(true)}</div><div class="daily-note"><span>YOUR DAILY REMINDER</span><p>“You don’t have to be great to start. Just start.”</p><span>✳</span></div></aside></div>`;
}
function statsHtml() {
  const tasks = store.tasks;
  const today = tasks.filter((t) => t.date === todayKey());
  const pending = today.filter((t) => !t.completed).length;
  const done = today.filter((t) => t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  return `<div><span>ON TODAY’S PAGE</span><strong>${pending}<small>${pending === 1 ? "task" : "tasks"} to explore</small></strong></div><div><span>LITTLE WINS TODAY</span><strong>${done}<small>${done === 1 ? "reason" : "reasons"} to feel good</small></strong></div><div><span>YOUR STORY SO FAR</span><strong>${completed}<small>${completed === 1 ? "task" : "tasks"} completed</small></strong></div>`;
}

function taskPanel(view) {
  if (view === "calendar")
    return `<div class="large-calendar">${calendarHtml(false)}</div>${selectedDate ? `<div class="panel-title"><h2>${escape(formatDate(selectedDate))}</h2>${button(`${icon("plus")} Add task`, "new-task", "text small", `data-date="${selectedDate}"`)}</div>${taskList(filterTasks(store.tasks, { date: selectedDate, search: taskQuery }))}` : '<p class="calendar-hint">Choose a day to see its tasks.</p>'}`;
  const filtered = filterTasks(store.tasks, {
    view: view === "dashboard" ? "today" : view === "tasks" ? "all" : view,
    search: taskQuery,
    status: taskStatus,
    activity,
  });
  return `<div class="panel-title"><div><span class="eyebrow">YOUR NEXT LITTLE WINS</span><h2>${view === "completed" ? "A little proof of progress" : view === "tasks" ? "All your tasks" : activity ? "Your activity tasks" : `${escape(theme(store.prefs.active).taskLabel)} for today`}</h2></div><span class="count-label">${filtered.length}</span></div><div class="task-toolbar"><div class="task-filter">${[
    ["all", "All"],
    ["open", "To do"],
    ["done", "Done"],
  ]
    .map(
      ([v, l]) =>
        `<button class="${taskStatus === v ? "active" : ""}" data-action="task-filter" data-status="${v}" aria-pressed="${taskStatus === v}">${l}</button>`,
    )
    .join(
      "",
    )}</div><label class="task-search">${icon("search")}<input id="task-search" type="search" placeholder="Find a task…" aria-label="Search your tasks" value="${escape(taskQuery)}"/></label></div><div class="task-list">${taskList(filtered)}</div><button class="add-task-row" data-action="new-task">${icon("plus")} Add your next little mission <kbd>⌘ K</kbd></button>${!user && store.tasks.length ? '<div class="device-note">Your tasks are saved in this browser. Make a backup in settings.</div>' : ""}`;
}
function taskList(tasks) {
  if (!tasks.length)
    return `<div class="tasks-empty"><span>✳</span><h3>${taskQuery ? "No tasks found." : "A fresh page. All yours."}</h3><p>${taskQuery ? "Try a different search." : "Start small. Add one thing you’d like to do today."}</p>${!taskQuery ? button(`${icon("plus")} Write your first task`, "new-task", "outline small") : ""}</div>`;
  return tasks
    .map((t) => {
      const a = store.activities.find((x) => x.id === t.activityId);
      return `<article class="task-row ${t.completed ? "is-complete" : ""}"><button class="task-checkbox" data-action="complete" data-id="${escape(t.id)}" role="checkbox" aria-checked="${t.completed}" aria-label="${t.completed ? "Reopen" : "Complete"} ${escape(t.name)}">${t.completed ? icon("check") : ""}</button><div class="task-row-content"><button class="task-name" data-action="edit-task" data-id="${escape(t.id)}">${escape(t.name)}</button><div class="task-meta"><span class="activity-pill">${escape(a?.name || "Personal")}</span>${t.date ? `<span>${icon("calendar")}${escape(formatDate(t.date))}</span>` : ""}${t.startTime ? `<span>${icon("clock")}${escape(t.startTime)}${t.endTime ? "–" + escape(t.endTime) : ""}</span>` : ""}${t.priority === "high" ? '<span class="priority-high">High priority</span>' : ""}</div>${t.notes ? `<p class="task-notes">${escape(t.notes)}</p>` : ""}</div><div class="task-row-actions"><button class="icon-button" data-action="edit-task" data-id="${escape(t.id)}" aria-label="Edit ${escape(t.name)}">${icon("edit")}</button><button class="icon-button" data-action="delete-task" data-id="${escape(t.id)}" aria-label="Delete ${escape(t.name)}">${icon("trash")}</button></div></article>`;
    })
    .join("");
}
function formatDate(value) {
  const today = todayKey();
  if (value === today) return "Today";
  const d = new Date(value + "T12:00:00");
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        d,
      );
}
function calendarHtml(compact) {
  const y = calendarDate.getFullYear(),
    m = calendarDate.getMonth(),
    first = (new Date(y, m, 1).getDay() + 6) % 7,
    days = new Date(y, m + 1, 0).getDate();
  const today = todayKey();
  return `<div class="calendar-heading"><strong>${new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(calendarDate)}</strong><div><button class="icon-button" data-action="calendar-prev" aria-label="Previous month">‹</button><button class="text-button" data-action="calendar-today">Today</button><button class="icon-button" data-action="calendar-next" aria-label="Next month">›</button></div></div><div class="calendar-grid ${compact ? "compact" : ""}">${["M", "T", "W", "T", "F", "S", "S"].map((d, i) => `<span class="weekday" aria-label="${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]}">${d}</span>`).join("")}${Array.from({ length: first }, () => "<span></span>").join("")}${Array.from(
    { length: days },
    (_, i) => {
      const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      const count = store.tasks.filter(
        (t) => t.date === key && !t.completed,
      ).length;
      return `<button class="calendar-day ${today === key ? "is-today" : ""} ${selectedDate === key ? "selected" : ""}" data-action="calendar-day" data-date="${key}" aria-label="${escape(key)}, ${count} pending tasks" ${selectedDate === key ? 'aria-pressed="true"' : ""}>${i + 1}${count ? "<i></i>" : ""}</button>`;
    },
  ).join("")}</div>`;
}
function settingsPage() {
  return `<div class="settings-page"><span class="eyebrow">MAKE YOURSELF AT HOME</span><h1>Your world.<br>Your way.</h1><div class="settings-section"><h2>The little personal details</h2><form id="settings-form"><label class="field-label">YOUR NAME<input name="name" value="${escape(store.prefs.name)}" maxlength="40" placeholder="What should we call you?"/></label><label class="motion-choice"><span><strong>Ambient motion</strong><small>Live artwork in your workspace. Device motion preferences are respected.</small></span><input name="motion" type="checkbox" ${store.prefs.motion ? "checked" : ""}/></label>${button("Save my preferences", "save-settings", "primary", 'type="submit"')}</form></div><div class="settings-section"><h2>Your anime world</h2><p>Change your world without changing your progress.</p>${button(`${icon("spark")} Find another world`, "switch-world", "outline")}${button(`${icon("plus")} Create a custom world`, "custom", "text")}</div><div class="settings-section"><h2>Your work belongs to you.</h2><p>Export a complete backup of your tasks, activities, and preferences. Imported backups add new records without removing existing ones.</p><div class="settings-actions">${button(`${icon("download")} Export my workspace`, "export", "outline")}${button(`${icon("upload")} Import a backup`, "import-backup", "outline")}<input type="file" id="backup-file" accept="application/json" hidden/></div>${user ? button("Import my device tasks into this account", "import-device", "text") : ""}</div><div class="settings-section"><h2>${user ? "Your account" : "Your device workspace"}</h2><p>${user ? `Signed in as ${escape(user.email)}. ${escape(syncState)}.` : "Your tasks are stored in this browser. Clearing browser data can remove them, so keep a backup of anything important."}</p>${button(user ? "Sign out" : "Explore account sign-in", user ? "sign-out" : "account-signin", "outline")}</div><div class="settings-section"><h2>Made with the worlds you love.</h2><p>Anime artwork remains credited to its respective creators. Ambient live-artwork loops animate the sourced images; they are not extracted anime footage.</p>${button("Artwork & typography credits", "credits", "text")}<p><a class="text-link" href="/legacy.html">Open the original One Piece workspace ↗</a></p></div></div>`;
}
function openModal(content, cls = "") {
  closeModal();
  lastFocus = document.activeElement;
  modalRoot.innerHTML = `<dialog class="dialog ${cls}" aria-labelledby="dialog-title"><button class="dialog-close icon-button" data-action="close-modal" aria-label="Close dialog">${icon("close")}</button>${content}</dialog>`;
  const dialog = modalRoot.querySelector("dialog");
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        closeModal();
    }
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeModal();
  });
  dialog.showModal();
  return dialog;
}
function closeModal() {
  modalRoot.querySelectorAll("video").forEach((v) => v.pause());
  const dialog = modalRoot.querySelector("dialog");
  if (dialog) {
    dialog.close();
    modalRoot.innerHTML = "";
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  }
  if (draftImageUrl) {
    URL.revokeObjectURL(draftImageUrl);
    draftImageUrl = null;
  }
}
function previewWorld(id) {
  const t = theme(id);
  openModal(
    `<div class="world-preview-art">${t.loop && !matchMedia("(prefers-reduced-motion: reduce)").matches ? `<video src="${t.loop}" poster="${t.scene}" muted loop playsinline autoplay controls aria-label="${escape(t.title)} live artwork"></video>` : `<img src="${t.scene}" alt="${escape(t.title)} artwork"/>`}</div><div class="world-preview-copy"><span class="eyebrow">${escape(t.genres[0])} / YOUR NEXT CHAPTER</span><h2 id="dialog-title">${escape(t.title)}</h2><p>A new look for your everyday adventures. Your tasks, focus sessions, and plans — inspired by a world you love.</p><div class="preview-swatches"><i style="background:${t.color}"></i><i style="background:${t.secondary}"></i><i style="background:#fff9ed"></i><span>${escape(t.focusLabel)} · ${escape(t.taskLabel)}</span></div>${button(`Make this my world ${icon("arrow")}`, "choose-world", "primary", `data-id="${t.id}"`)}<small class="media-description">${t.loopKind === "live-artwork" ? "Ambient motion made from sourced anime artwork." : t.custom ? "Your custom world." : "Anime key visual."}${t.source ? ` <a href="${t.source}" target="_blank" rel="noopener noreferrer">Artwork reference ↗</a>` : ""}</small></div>`,
    "world-preview",
  );
}
function taskModal(id, date) {
  const task = id ? store.tasks.find((t) => t.id === id) : null;
  openModal(
    `<span class="eyebrow">ONE LITTLE STEP FOR YOUR STORY</span><h2 id="dialog-title">${task ? "Edit your mission." : "What’s your next<br>little mission?"}</h2><form id="task-form" data-edit-id="${escape(id || "")}"><label class="field-label">THE TASK<input name="title" placeholder="One thing you’d like to do…" maxlength="240" required value="${escape(task?.name || "")}" autofocus/></label><div class="form-two"><label class="field-label">ACTIVITY<select name="activity">${store.activities.map((a) => `<option value="${escape(a.id)}" ${(task?.activityId || activity) === a.id ? "selected" : ""}>${escape(a.name)}</option>`).join("")}</select></label><label class="field-label">DAY<input name="date" type="date" required value="${task?.date || date || selectedDate || todayKey()}"/></label></div><div class="form-two"><label class="field-label">START TIME <small>(OPTIONAL)</small><input name="start" type="time" value="${escape(task?.startTime || "")}"/></label><label class="field-label">END TIME <small>(OPTIONAL)</small><input name="end" type="time" value="${escape(task?.endTime || "")}"/></label></div><label class="field-label">A LITTLE CONTEXT <small>(OPTIONAL)</small><textarea name="notes" rows="3" maxlength="2000" placeholder="Anything you want to remember?">${escape(task?.notes || "")}</textarea></label><label class="checkbox-label"><input name="priority" type="checkbox" ${task?.priority === "high" ? "checked" : ""}/> Give this a little extra priority</label><div class="dialog-actions">${button("Maybe later", "close-modal", "text", 'type="button"')}${button(`${task ? "Save changes" : "Add to my story"} ${icon("arrow")}`, "save-task", "primary", 'type="submit"')}</div><p class="form-error" role="alert"></p></form>`,
    "task-dialog",
  );
}
function customModal() {
  openModal(
    `<span class="eyebrow">A WORLD ONLY YOU COULD MAKE</span><h2 id="dialog-title">Make room for<br>your imagination.</h2><p>Your favorite character. A scene that inspires you. Something entirely your own.</p><form id="custom-form"><div class="custom-upload" id="custom-upload-preview"><label for="custom-image">${icon("upload")}<strong>Choose your world’s artwork</strong><span>JPG, PNG, or WebP · up to 10 MB</span></label><input id="custom-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required/></div><label class="field-label">WORLD NAME<input name="title" placeholder="Give your universe a name" maxlength="60" required/></label><div class="form-two"><label class="field-label">YOUR MAIN COLOR<input name="color" type="color" value="#e84b35"/></label><label class="field-label">A SECOND COLOR<input name="secondary" type="color" value="#2c8cc9"/></label></div><label class="field-label">OPTIONAL AMBIENT VIDEO<input name="video" type="file" accept="video/mp4,video/webm"/><small>MP4 or WebM · up to 20 MB and 30 seconds. Choose a clip that loops smoothly.</small></label><label class="field-label">ARTWORK FOCAL POINT<select name="focal"><option value="center">Center</option><option value="top">Top / character’s face</option><option value="bottom">Bottom</option></select></label><p class="muted">Custom artwork and videos are saved on this device.</p><div class="dialog-actions">${button("Maybe later", "close-modal", "text", 'type="button"')}${button(`Create my world ${icon("arrow")}`, "save-custom", "primary", 'type="submit"')}</div><p class="form-error" role="alert"></p></form>`,
    "custom-dialog",
  );
}
function switchWorldModal() {
  openModal(
    `<span class="eyebrow">A CHANGE OF SCENERY</span><h2 id="dialog-title">Where to next?</h2><p>Your tasks and focus stay right here.</p><label class="search-field">${icon("search")}<input id="switch-search" placeholder="Find your next world…" aria-label="Search worlds to switch" type="search"/></label><div class="switch-world-grid" id="switch-world-grid">${switchCards("")}</div>${button(`${icon("plus")} Create your own world`, "custom", "outline")}`,
    "switch-dialog",
  );
}
function switchCards(query) {
  return matchingWorlds(query, "All")
    .map(
      (t) =>
        `<button class="switch-card ${store.prefs.active === t.id ? "selected" : ""}" data-action="switch-select" data-id="${t.id}"><img src="${t.poster}" alt="" loading="lazy"/><span>${escape(t.title)}</span>${store.prefs.active === t.id ? icon("check") : ""}</button>`,
    )
    .join("");
}
function updateTasks() {
  const view = location.pathname.split("/")[2] || "dashboard";
  const panel = $("#task-panel-inner");
  if (panel) panel.innerHTML = taskPanel(view);
  const stats = $("#dashboard-stats");
  if (stats) stats.innerHTML = statsHtml();
  const badge = $("#all-task-count");
  if (badge) badge.textContent = store.tasks.length;
  document.querySelectorAll(".sidebar-activity").forEach((el) => {
    const count = el.querySelector("small");
    if (count)
      count.textContent = store.tasks.filter(
        (t) => t.activityId === el.dataset.id && !t.completed,
      ).length;
  });
  document
    .querySelectorAll(".mini-calendar")
    .forEach((el) => (el.innerHTML = calendarHtml(true)));
  queueSync();
}
function queueSync() {
  if (!user) return;
  cloudMutation++;
  localStorage.setItem(`anime_cloud_dirty_${user.id}`, "true");
  if (cloudBlocked) {
    setSyncState("Saved here · review sync conflict");
    return;
  }
  clearTimeout(syncTimer);
  setSyncState("Saving…");
  syncTimer = setTimeout(syncCloud, 650);
}
function setSyncState(text) {
  syncState = text;
  const el = $("#sync-status");
  if (el) el.innerHTML = `<i></i>${escape(text)}`;
}
async function syncCloud() {
  if (!user || cloudBlocked) return;
  if (syncInFlight) {
    syncAgain = true;
    return;
  }
  syncInFlight = true;
  const uid = user.id,
    mutation = cloudMutation;
  try {
    const revision = await saveCloudData(
      uid,
      store.exportData(),
      cloudRevision,
    );
    if (user?.id !== uid) return;
    cloudRevision = revision;
    localStorage.setItem(`anime_cloud_revision_${uid}`, String(revision));
    if (cloudMutation === mutation)
      localStorage.removeItem(`anime_cloud_dirty_${uid}`);
    setSyncState(
      cloudMutation === mutation ? "Saved to your account" : "Saving…",
    );
  } catch (e) {
    if (user?.id === uid) {
      if (e.message.includes("changed on another device")) cloudBlocked = true;
      setSyncState("Saved here · sync needs attention");
      toast(e.message);
    }
  } finally {
    syncInFlight = false;
    if (syncAgain) {
      syncAgain = false;
      queueSync();
    }
  }
}
function loadTimer(scope = "local") {
  try {
    const x = JSON.parse(
      localStorage.getItem(`anime_focus_${scope}_v2`) || "null",
    );
    return x && Number.isFinite(x.remaining)
      ? x
      : { total: 1500, remaining: 1500, running: false, endsAt: null };
  } catch {
    return { total: 1500, remaining: 1500, running: false, endsAt: null };
  }
}
function persistTimer() {
  localStorage.setItem(
    `anime_focus_${store?.scope || "local"}_v2`,
    JSON.stringify(timer),
  );
}
function updateTimer() {
  const left = timerRemaining(timer);
  const el = $("#timer-display");
  if (el)
    el.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  const toggle = $("#timer-toggle");
  if (toggle)
    toggle.innerHTML = `${icon(timer.running ? "pause" : "play")} ${timer.running ? "Pause" : "Let’s focus"}`;
  if (timer.running && left === 0) {
    timer = { ...timer, running: false, remaining: 0, endsAt: null };
    persistTimer();
    toast("Focus chapter complete. Take a breath — you earned it.");
    if (toggle) toggle.innerHTML = `${icon("play")} Start another chapter`;
  }
}
setInterval(updateTimer, 1000);
async function initializeAccount(account) {
  user = account;
  cloudBlocked = false;
  store = createStore(localStorage, account.id);
  timer = loadTimer(account.id);
  custom = await readCustomThemes(account.id);
  const dirty =
    localStorage.getItem(`anime_cloud_dirty_${account.id}`) === "true";
  const cachedRevision =
    Number(localStorage.getItem(`anime_cloud_revision_${account.id}`)) || null;
  try {
    const cloud = await loadCloudData(account.id);
    const action = reconciliationAction({
      remoteRevision: cloud?.revision ?? null,
      cachedRevision,
      dirty,
    });
    cloudRevision = cloud?.revision ?? null;
    if (action === "conflict") {
      cloudBlocked = true;
      setSyncState("Saved here · review sync conflict");
      toast(
        "This workspace has changes here and on another device. Export this copy before refreshing to reconcile.",
      );
    } else if (action === "load-remote") {
      store.replaceData(cloud.payload);
      localStorage.setItem(
        `anime_cloud_revision_${account.id}`,
        String(cloud.revision),
      );
      setSyncState("Saved to your account");
    } else if (action === "push-local") {
      queueSync();
    } else setSyncState("Ready to sync");
  } catch (e) {
    cloudBlocked = true;
    setSyncState("Saved here · sync needs attention");
    toast(e.message);
  }
  favorites = store.prefs.favorites;
  selected = sessionStorage.getItem("anime_theme_intent") || store.prefs.active;
}
function downloadJson(data, filename) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function handleAction(el) {
  const action = el.dataset.action,
    id = el.dataset.id;
  switch (action) {
    case "start":
      if (store.prefs.onboarding) go("/app");
      else go("/sign-in");
      break;
    case "menu":
      document.body.classList.toggle("menu-open");
      el.setAttribute(
        "aria-expanded",
        String(document.body.classList.contains("menu-open")),
      );
      break;
    case "sidebar":
      document.body.classList.toggle("sidebar-open");
      break;
    case "preview":
      previewWorld(id);
      break;
    case "choose-world":
      selected = id;
      sessionStorage.setItem("anime_theme_intent", id);
      if (store.prefs.onboarding) {
        applyPreference(id);
        go("/app");
        toast(`Welcome to ${shortTitle(theme(id))}.`);
      } else {
        favorites = favorites.includes(id) ? favorites : [...favorites, id];
        go("/sign-in");
      }
      break;
    case "genre":
      worldGenre = el.dataset.genre;
      worldLimit = 12;
      updateWorldGrid();
      break;
    case "clear-worlds":
      worldQuery = "";
      worldGenre = "All";
      worldLimit = 12;
      if ($("#world-search")) $("#world-search").value = "";
      updateWorldGrid();
      break;
    case "more-worlds":
      worldLimit += 18;
      updateWorldGrid();
      break;
    case "demo-theme":
      selected = id;
      setTheme(id);
      $("#demo-workspace").innerHTML = workspaceDemo(theme(id));
      $("#featured-world").innerHTML = featuredWorld(theme(id));
      document
        .querySelectorAll('[data-action="demo-theme"]')
        .forEach((b) => b.classList.toggle("active", b.dataset.id === id));
      break;
    case "demo-task":
      demoTasks = demoTasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      );
      $("#demo-workspace").innerHTML = workspaceDemo(theme(selected));
      break;
    case "custom":
      customModal();
      break;
    case "close-modal":
      closeModal();
      break;
    case "local-start":
      user = null;
      store = createStore(localStorage);
      custom = await readCustomThemes("local");
      favorites = [...new Set([...store.prefs.favorites, selected])];
      onboardStep = 1;
      if (store.prefs.onboarding) {
        applyPreference(selected);
        go("/app");
      } else go("/onboarding");
      break;
    case "google":
      await signInGoogle();
      break;
    case "change-email":
      pendingEmail = "";
      renderSignIn();
      break;
    case "favorite":
      favorites = favorites.includes(id)
        ? favorites.filter((x) => x !== id)
        : [...favorites, id];
      $("#onboard-worlds").innerHTML = onboardCards();
      $("#favorite-count").textContent =
        `${favorites.length} ${favorites.length === 1 ? "world" : "worlds"} selected`;
      document.querySelector('[data-action="onboard-next"]').disabled =
        !favorites.length;
      break;
    case "onboard-next":
      if (!favorites.length) return;
      if (!favorites.includes(selected)) selected = favorites[0];
      onboardStep = 2;
      renderOnboarding();
      window.scrollTo(0, 0);
      break;
    case "onboard-back":
      store.savePrefs({
        name: $("#profile-name")?.value ?? store.prefs.name,
        motion: $("#onboard-motion")?.checked ?? store.prefs.motion,
      });
      onboardStep = 1;
      renderOnboarding();
      break;
    case "active-world":
      store.savePrefs({
        name: $("#profile-name")?.value ?? store.prefs.name,
        motion: $("#onboard-motion")?.checked ?? store.prefs.motion,
      });
      selected = id;
      setTheme(id);
      renderOnboarding();
      break;
    case "onboard-finish":
      store.savePrefs({
        name: $("#profile-name")?.value.trim() || "",
        motion: $("#onboard-motion")?.checked ?? true,
        onboarding: true,
        favorites,
        active: selected,
      });
      sessionStorage.removeItem("anime_theme_intent");
      queueSync();
      go("/app");
      break;
    case "exit-onboarding":
      go("/");
      break;
    case "new-task":
      taskModal(null, el.dataset.date);
      break;
    case "edit-task":
      taskModal(id);
      break;
    case "complete": {
      const t = store.tasks.find((t) => t.id === id);
      if (!t) return;
      store.updateTask(id, {
        completed: !t.completed,
        completedAt: !t.completed ? Date.now() : null,
      });
      updateTasks();
      if (!t.completed) toast("A little win. A little closer. ✦");
      break;
    }
    case "delete-task": {
      const removed = store.removeTask(id);
      updateTasks();
      toast("Task removed.", () => {
        store.restoreTask(removed);
        updateTasks();
      });
      break;
    }
    case "task-filter":
      taskStatus = el.dataset.status;
      updateTasks();
      break;
    case "activity":
      activity = id;
      taskQuery = "";
      taskStatus = "all";
      if (location.pathname !== "/app/tasks") go("/app/tasks");
      else renderDashboard();
      break;
    case "new-activity":
      openModal(
        `<span class="eyebrow">MAKE A LITTLE SPACE</span><h2 id="dialog-title">A new activity.</h2><form id="activity-form"><label class="field-label">ACTIVITY NAME<input name="name" required maxlength="60" placeholder="Study, projects, a little you time…" autofocus/></label><div class="dialog-actions">${button("Create activity", "save-activity", "primary", 'type="submit"')}</div><p class="form-error" role="alert"></p></form>`,
      );
      break;
    case "calendar-prev":
      calendarDate = new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() - 1,
        1,
      );
      refreshCalendars();
      break;
    case "calendar-next":
      calendarDate = new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() + 1,
        1,
      );
      refreshCalendars();
      break;
    case "calendar-today":
      calendarDate = new Date();
      selectedDate = todayKey();
      refreshCalendars();
      break;
    case "calendar-day":
      selectedDate = el.dataset.date;
      activity = null;
      if (location.pathname !== "/app/calendar") go("/app/calendar");
      else refreshCalendars();
      break;
    case "timer-toggle":
      if (timer.remaining === 0 && !timer.running)
        timer.remaining = timer.total;
      if (timer.running) {
        timer.remaining = timerRemaining(timer);
        timer.running = false;
        timer.endsAt = null;
      } else {
        timer.endsAt = Date.now() + timer.remaining * 1000;
        timer.running = true;
      }
      persistTimer();
      updateTimer();
      break;
    case "timer-reset":
      timer = {
        ...timer,
        running: false,
        remaining: timer.total,
        endsAt: null,
      };
      persistTimer();
      updateTimer();
      break;
    case "timer-preset": {
      const seconds = Number(el.dataset.minutes) * 60;
      timer = {
        total: seconds,
        remaining: seconds,
        running: false,
        endsAt: null,
      };
      persistTimer();
      document
        .querySelectorAll('[data-action="timer-preset"]')
        .forEach((b) => b.classList.toggle("selected", b === el));
      updateTimer();
      break;
    }
    case "scene-motion": {
      const v = $(".scene-media video");
      if (v) {
        if (v.paused) {
          v.dataset.paused = "false";
          v.play().catch(() => {});
          el.innerHTML = icon("pause");
          el.setAttribute("aria-label", "Pause live artwork");
        } else {
          v.dataset.paused = "true";
          v.pause();
          el.innerHTML = icon("play");
          el.setAttribute("aria-label", "Play live artwork");
        }
      } else {
        store.savePrefs({ motion: true });
        renderDashboard();
      }
      break;
    }
    case "switch-world":
      switchWorldModal();
      break;
    case "switch-select":
      applyPreference(id);
      closeModal();
      renderDashboard();
      toast(`A new chapter in ${shortTitle(theme(id))}.`);
      break;
    case "profile":
      go("/app/settings");
      break;
    case "account-signin":
      go("/sign-in");
      break;
    case "sign-out":
      clearTimeout(syncTimer);
      await signOut();
      user = null;
      store = createStore(localStorage);
      favorites = store.prefs.favorites;
      custom = await readCustomThemes("local");
      timer = loadTimer();
      cloudRevision = null;
      setSyncState("Saved on this device");
      go("/");
      toast("Signed out. Your account workspace is safe.");
      break;
    case "export":
      downloadJson(store.exportData(), `anime-todo-${todayKey()}.json`);
      toast("Your workspace backup is ready.");
      break;
    case "import-backup":
      $("#backup-file").click();
      break;
    case "import-device": {
      const local = createStore(localStorage);
      const count = store.importData(local.exportData());
      queueSync();
      toast(`${count} device tasks added to your account workspace.`);
      break;
    }
    case "recover-data":
      downloadJson(
        Object.fromEntries(
          Object.values(LEGACY_KEYS).map((k) => [k, localStorage.getItem(k)]),
        ),
        "anime-todo-original-data.json",
      );
      break;
    case "credits":
      openModal(
        `<span class="eyebrow">THE PEOPLE BEHIND THE WORLDS</span><h2 id="dialog-title">A little credit.<br>A lot of gratitude.</h2><p>Anime artwork belongs to its respective artists, studios, publishers, and production committees. This is a fan-inspired productivity workspace, not an official anime or Crunchyroll product.</p><p>Title-matched key visuals and banners were retrieved through AniList metadata. Each world’s artwork reference is available in its preview. The library includes the first 50 entries observed on Crunchyroll Popular on 1 November 2026, plus additional classics. Popular positions describe that dated account view and can vary by region; they are not a universal ranking.</p><p>Live-artwork videos add a gentle cyclic camera movement to sourced stills. They are not extracted anime footage or character animation.</p><p><strong>Typography:</strong> Humane by Rajesh Rajput, discovered through Awwwards; Ranade by Indian Type Foundry / Fontshare. Full source details are included with the project.</p><p><a href="https://anilist.co" target="_blank" rel="noopener noreferrer">AniList ↗</a> · <a href="https://www.awwwards.com/awwwards/collections/free-fonts/" target="_blank" rel="noopener noreferrer">Awwwards font collection ↗</a> · <a href="https://www.fontshare.com/fonts/ranade" target="_blank" rel="noopener noreferrer">Ranade ↗</a></p>`,
        "credits-dialog",
      );
      break;
  }
}
function refreshCalendars() {
  document
    .querySelectorAll(".mini-calendar")
    .forEach((el) => (el.innerHTML = calendarHtml(true)));
  if (location.pathname === "/app/calendar") updateTasks();
}
async function onSubmit(form) {
  const data = new FormData(form),
    error = form.querySelector(".form-error");
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  try {
    if (form.id === "task-form") {
      const start = data.get("start"),
        end = data.get("end");
      if (start && end && end <= start)
        throw new Error("Choose an end time after the start time.");
      const fields = {
        name: String(data.get("title")).trim(),
        activityId: String(data.get("activity")),
        date: String(data.get("date")),
        startTime: start,
        endTime: end,
        notes: String(data.get("notes")).trim(),
        priority: data.get("priority") ? "high" : "normal",
      };
      if (!fields.name) throw new Error("Give your task a title.");
      if (form.dataset.editId) store.updateTask(form.dataset.editId, fields);
      else store.addTask(fields);
      closeModal();
      updateTasks();
      toast(
        form.dataset.editId
          ? "Mission updated."
          : "Your next chapter is on the page.",
      );
    } else if (form.id === "activity-form") {
      store.addActivity(String(data.get("name")));
      closeModal();
      renderDashboard();
      queueSync();
      toast("A little new space, just for you.");
    } else if (form.id === "settings-form") {
      store.savePrefs({
        name: String(data.get("name")).trim(),
        motion: Boolean(data.get("motion")),
      });
      queueSync();
      toast("Your space, just the way you like it.");
    } else if (form.id === "email-form") {
      pendingEmail = String(data.get("email")).trim();
      await sendCode(pendingEmail);
      renderSignIn();
    } else if (form.id === "verify-form") {
      const account = await verifyCode(
        pendingEmail,
        String(data.get("code")).trim(),
      );
      await initializeAccount(account);
      pendingEmail = "";
      go(store.prefs.onboarding ? "/app" : "/onboarding");
    } else if (form.id === "custom-form") {
      await saveCustomTheme(data);
    }
  } catch (e) {
    if (error) error.textContent = e.message;
    else toast(e.message);
  } finally {
    if (submit?.isConnected) submit.disabled = false;
  }
}
async function saveCustomTheme(data) {
  const image = data.get("image"),
    video = data.get("video");
  if (!(image instanceof File) || !image.size)
    throw new Error("Choose a picture for your world.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type))
    throw new Error("Use a JPG, PNG, or WebP image.");
  if (image.size > 10 * 1024 * 1024)
    throw new Error("Choose an image smaller than 10 MB.");
  await validateImage(image);
  if (video?.size) {
    if (
      !["video/mp4", "video/webm"].includes(video.type) ||
      video.size > 20 * 1024 * 1024
    )
      throw new Error("Choose an MP4 or WebM smaller than 20 MB.");
    await validateVideo(video);
  }
  const id = "custom-" + makeId(),
    imageKey = `${store.scope}/${id}/image`,
    videoKey = video?.size ? `${store.scope}/${id}/video` : null;
  await putFile(imageKey, image);
  if (videoKey) await putFile(videoKey, video);
  const t = {
    id,
    title: String(data.get("title")).trim(),
    color: String(data.get("color")),
    secondary: String(data.get("secondary")),
    imageKey,
    videoKey,
    focal: String(data.get("focal")),
    loopKind: videoKey ? "custom-video" : null,
  };
  const key = `anime_custom_${store.scope}`;
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(key, JSON.stringify([...list, t]));
  custom.forEach((t) => {
    if (t.custom) {
      URL.revokeObjectURL(t.poster);
      if (t.loop) URL.revokeObjectURL(t.loop);
    }
  });
  custom = await readCustomThemes(store.scope);
  selected = id;
  sessionStorage.setItem("anime_theme_intent", id);
  favorites = [...new Set([...favorites, id])];
  closeModal();
  if (location.pathname.startsWith("/app")) {
    applyPreference(id);
    renderDashboard();
  } else if (location.pathname === "/onboarding") renderOnboarding();
  else go("/sign-in");
  toast("Your world is ready. Make yourself at home.");
}
function validateImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file),
      img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth < 200 || img.naturalHeight < 200)
        rej(new Error("Choose artwork at least 200 × 200 pixels."));
      else if (img.naturalWidth * img.naturalHeight > 40_000_000)
        rej(new Error("Choose an image smaller than 40 megapixels."));
      else res();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rej(new Error("That image could not be opened. Try another file."));
    };
    img.src = url;
  });
}
function validateVideo(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file),
      v = document.createElement("video");
    v.preload = "metadata";
    const timeout = setTimeout(
      () => finish(new Error("That video could not be opened.")),
      8000,
    );
    function finish(e) {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      v.removeAttribute("src");
      v.load();
      e ? rej(e) : res();
    }
    v.onloadedmetadata = () =>
      finish(
        !Number.isFinite(v.duration) || v.duration > 30
          ? new Error("Choose an ambient clip up to 30 seconds long.")
          : null,
      );
    v.onerror = () => finish(new Error("That video could not be opened."));
    v.src = url;
  });
}
app.addEventListener("click", onClick);
modalRoot.addEventListener("click", onClick);
function onClick(e) {
  const route = e.target.closest("[data-route]");
  if (route) {
    e.preventDefault();
    activity = null;
    taskQuery = "";
    taskStatus = "all";
    document.body.classList.remove("sidebar-open");
    go(
      route.dataset.route === "/sign-in" && store.prefs.onboarding
        ? "/app"
        : route.dataset.route,
    );
    return;
  }
  const anchor = e.target.closest("[data-anchor]");
  if (anchor) {
    e.preventDefault();
    const id = anchor.dataset.anchor;
    if (location.pathname !== "/") {
      go("/");
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      );
    } else
      document.getElementById(id)?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    document.body.classList.remove("menu-open");
    return;
  }
  const action = e.target.closest("[data-action]");
  if (
    action &&
    !action.disabled &&
    (!action.closest("form") || action.type !== "submit")
  )
    handleAction(action).catch((e) => toast(e.message));
}
app.addEventListener("submit", (e) => {
  e.preventDefault();
  onSubmit(e.target);
});
modalRoot.addEventListener("submit", (e) => {
  e.preventDefault();
  onSubmit(e.target);
});
app.addEventListener("input", (e) => {
  if (e.target.id === "world-search") {
    worldQuery = e.target.value;
    worldLimit = 12;
    updateWorldGrid();
  }
  if (e.target.id === "onboard-search") {
    onboardQuery = e.target.value;
    $("#onboard-worlds").innerHTML = onboardCards();
  }
  if (e.target.id === "task-search") {
    taskQuery = e.target.value;
    const start = e.target.selectionStart;
    const view = location.pathname.split("/")[2] || "dashboard";
    const list = $(".task-list");
    if (list)
      list.innerHTML = taskList(
        filterTasks(store.tasks, {
          view:
            view === "dashboard" ? "today" : view === "tasks" ? "all" : view,
          search: taskQuery,
          status: taskStatus,
          activity,
        }),
      );
  }
});
modalRoot.addEventListener("input", (e) => {
  if (e.target.id === "switch-search")
    $("#switch-world-grid").innerHTML = switchCards(e.target.value);
});
modalRoot.addEventListener("change", (e) => {
  if (e.target.id === "custom-image") {
    const file = e.target.files[0];
    if (!file) return;
    if (draftImageUrl) URL.revokeObjectURL(draftImageUrl);
    draftImageUrl = URL.createObjectURL(file);
    const panel = $("#custom-upload-preview");
    panel.style.backgroundImage = `url("${draftImageUrl}")`;
    panel.classList.add("has-image");
    panel.querySelector("strong").textContent = "Change your artwork";
  }
});
app.addEventListener("change", async (e) => {
  if (e.target.id === "backup-file") {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 5 MB.");
      const count = store.importData(JSON.parse(await file.text()));
      queueSync();
      toast(`${count} tasks added. Your existing work is safe.`);
    } catch (e) {
      toast(e.message);
    }
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.body.classList.remove("menu-open", "sidebar-open");
  }
  if (
    (e.metaKey || e.ctrlKey) &&
    e.key.toLowerCase() === "k" &&
    location.pathname.startsWith("/app")
  ) {
    e.preventDefault();
    taskModal();
  }
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(
      document.activeElement?.tagName,
    ) &&
    !modalRoot.children.length
  ) {
    const input = $("#world-search") || $("#task-search");
    if (input) {
      e.preventDefault();
      input.focus();
    }
  }
});
window.addEventListener("online", () => {
  if (user) queueSync();
});
async function init() {
  if (storageError) {
    render();
    return;
  }
  custom = await readCustomThemes("local").catch(() => []);
  if (authConfigured) {
    const account = await currentUser();
    if (account) await initializeAccount(account);
    if (location.pathname === "/auth/callback") {
      go(
        account
          ? store.prefs.onboarding
            ? "/app"
            : "/onboarding"
          : "/sign-in",
      );
      return;
    }
  }
  render();
}
init().catch((e) => {
  toast(e.message);
  render();
});

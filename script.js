/**
 * ============================================================
 * Anime Productivity & Todo List — Core JavaScript (script.js)
 * ============================================================
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_ACTIVITIES = 'anime_todo_activities_v1';
  const STORAGE_KEY_TASKS = 'anime_todo_tasks_v1';
  const STORAGE_KEY_NAV = 'anime_todo_nav_state_v1';
  const STORAGE_KEY_SKY_REGION = 'anime_todo_sky_region_v1';
  const STORAGE_KEY_SKY_MODE = 'anime_todo_sky_mode_v1';

  // One Piece Quotes Collection
  const MOTIVATIONAL_QUOTES = [
    { quote: "If you don't take risks, you can't create a future!", author: "☠️ Monkey D. Luffy ☠️" },
    { quote: "Scars on the back are a swordsman's shame. Keep pressing forward!", author: "⚔️ Roronoa Zoro ⚔️" },
    { quote: "When do you think people die? When they are forgotten! Live with no regrets!", author: "🌸 Dr. Hiriluk 🌸" },
    { quote: "I don't care if I die trying, as long as I fight for what I believe in!", author: "☠️ Monkey D. Luffy ☠️" },
    { quote: "A man's dream will never die! Set sail for the Grand Line!", author: "⚓ Marshall D. Teach ⚓" },
    { quote: "No matter how hard or impossible it is, never lose sight of your goal.", author: "👒 Monkey D. Luffy 👒" },
    { quote: "The world's greatest treasure is out there. Become the Pirate King!", author: "👑 Gol D. Roger 👑" },
    { quote: "Destiny, dreams, the flow of the ages... these cannot be stopped.", author: "🧭 Gol D. Roger 🧭" }
  ];

  // The 10 Official Straw Hat Pirate Flags (Jolly Rogers)
  const ONE_PIECE_FLAGS = [
    { id: 'luffy', name: 'Monkey D. Luffy', shortName: 'Luffy', title: 'Straw Hat Flag', desc: 'Captain • Straw Hat Skull & Bones', flag: 'assets/flags/luffy.svg', color: '#ef233c' },
    { id: 'zoro', name: 'Roronoa Zoro', shortName: 'Zoro', title: 'Three-Sword Flag', desc: 'Swordsman • Crossed Katanas & Bandana', flag: 'assets/flags/zoro.svg', color: '#2d6a4f' },
    { id: 'nami', name: 'Nami', shortName: 'Nami', title: 'Cat Burglar Flag', desc: 'Navigator • Tangerine & Money Gesture', flag: 'assets/flags/nami.svg', color: '#ff7b00' },
    { id: 'usopp', name: 'Usopp', shortName: 'Usopp', title: 'God Usopp Flag', desc: 'Sniper • Long Nose & Crossed Slingshot', flag: 'assets/flags/usopp.svg', color: '#cc8b3c' },
    { id: 'sanji', name: 'Sanji', shortName: 'Sanji', title: 'Black Leg Cook Flag', desc: 'Cook • Chef Hat, Crossed Fork & Knife', flag: 'assets/flags/sanji.svg', color: '#ffd166' },
    { id: 'chopper', name: 'Tony Tony Chopper', shortName: 'Chopper', title: 'Sakura Doctor Flag', desc: 'Doctor • Pink Hat, Antlers & Sakura', flag: 'assets/flags/chopper.svg', color: '#ff758f' },
    { id: 'robin', name: 'Nico Robin', shortName: 'Robin', title: 'Hana Hana Flag', desc: 'Archaeologist • Radiating Fleur-de-lis Arms', flag: 'assets/flags/robin.svg', color: '#9d4edd' },
    { id: 'franky', name: 'Franky', shortName: 'Franky', title: 'Cyborg SUUUPER Flag', desc: 'Shipwright • Blue Pompadour & Wrenches', flag: 'assets/flags/franky.svg', color: '#00b4d8' },
    { id: 'brook', name: 'Brook', shortName: 'Brook', title: 'Soul King Flag', desc: 'Musician • Afro Skull, Top Hat & Violin', flag: 'assets/flags/brook.svg', color: '#7b2cbf' },
    { id: 'jinbe', name: 'Jinbe', shortName: 'Jinbe', title: 'Sun Pirates Flag', desc: 'Helmsman • Sun Crest, Tusks & Anchor', flag: 'assets/flags/jinbe.svg', color: '#0077b6' }
  ];

  function getFlag(icon) {
    if (!icon) return null;
    const clean = String(icon).trim().toLowerCase();
    return ONE_PIECE_FLAGS.find(f =>
      f.id === clean ||
      f.flag.toLowerCase() === clean ||
      f.name.toLowerCase() === clean ||
      clean === f.shortName.toLowerCase() ||
      clean.includes(f.id)
    ) || null;
  }

  function renderActivityIcon(icon, extraClass = '') {
    if (!icon) icon = 'luffy';
    const flagObj = getFlag(icon);
    if (flagObj) {
      return `<img src="${flagObj.flag}" alt="${flagObj.name}'s Flag" class="activity-flag-icon ${extraClass}" loading="lazy" />`;
    }
    if (typeof icon === 'string' && (icon.includes('.svg') || icon.includes('.png') || icon.includes('.jpg') || icon.includes('/'))) {
      return `<img src="${icon}" alt="flag" class="activity-flag-icon ${extraClass}" loading="lazy" />`;
    }
    return `<span class="activity-emoji-fallback ${extraClass}">${escapeHTML(icon)}</span>`;
  }

  // Application State
  const state = {
    activities: [],
    tasks: [],
    currentView: 'dashboard', // 'dashboard' | 'activity' | 'all-tasks' | 'today-tasks' | 'date-tasks'
    selectedActivityId: null,
    selectedDate: getTodayDateString(),
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(), // 0-indexed
    activityFilter: 'all', // 'all' | 'pending' | 'completed'
    quoteIndex: Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length),
    isSidebarOpen: false,
    isSidebarCollapsed: false,
    selectedRegion: 'auto',
    skyModeOverride: 'auto',
    isSkyDropdownOpen: false
  };

  // Helper: Format Date to YYYY-MM-DD (local time)
  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper: Format Time 24h (HH:mm) to 12h (hh:mm AM/PM)
  function format12Hour(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    const hours12 = h % 12 || 12;
    return `${String(hours12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  }

  // Helper: Format friendly date string (e.g., "Thursday, 16 October 2026")
  function formatFriendlyDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // ============================================================
  // LocalStorage Persistence & Seed Data
  // ============================================================

  function loadFromStorage() {
    try {
      const storedActivities = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);

      if (storedActivities) {
        state.activities = JSON.parse(storedActivities);
      } else {
        // Initial Seed Activities
        seedInitialData();
        return;
      }

      if (storedTasks) {
        state.tasks = JSON.parse(storedTasks);
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      seedInitialData();
    }
  }

  function saveNavState() {
    try {
      const navData = {
        currentView: state.currentView,
        selectedActivityId: state.selectedActivityId,
        selectedDate: state.selectedDate,
        isSidebarCollapsed: state.isSidebarCollapsed
      };
      localStorage.setItem(STORAGE_KEY_NAV, JSON.stringify(navData));
    } catch (e) {
      console.error('Failed to save navigation state:', e);
    }
  }

  function loadNavState() {
    try {
      const storedNav = localStorage.getItem(STORAGE_KEY_NAV);
      if (storedNav) {
        const nav = JSON.parse(storedNav);
        if (nav.currentView) state.currentView = nav.currentView;
        if (nav.selectedActivityId) state.selectedActivityId = nav.selectedActivityId;
        if (nav.selectedDate) state.selectedDate = nav.selectedDate;
        if (typeof nav.isSidebarCollapsed === 'boolean') state.isSidebarCollapsed = nav.isSidebarCollapsed;
      }
    } catch (e) {
      console.error('Error parsing navigation state:', e);
    }

    // Safety check: if currentView is 'activity', ensure the activity still exists
    if (state.currentView === 'activity') {
      const exists = state.activities.some(a => a.id === state.selectedActivityId);
      if (!exists) {
        state.currentView = 'dashboard';
        state.selectedActivityId = null;
      }
    }
  }

  function seedInitialData() {
    const today = getTodayDateString();

    state.activities = [
      { id: 'act_college', name: 'College', icon: 'luffy', createdAt: Date.now() - 3000 },
      { id: 'act_coding', name: 'Coding', icon: 'sanji', createdAt: Date.now() - 2000 },
      { id: 'act_japanese', name: 'Japanese', icon: 'zoro', createdAt: Date.now() - 1000 }
    ];

    state.tasks = [
      {
        id: 'task_1',
        activityId: 'act_college',
        name: 'Complete Computational Maths assignment',
        date: today,
        startTime: '09:00',
        endTime: '10:30',
        notes: 'Review matrix transformations & solve chapter 4 exercises.',
        completed: false,
        createdAt: Date.now() - 500
      },
      {
        id: 'task_2',
        activityId: 'act_coding',
        name: 'Build portfolio website frontend',
        date: today,
        startTime: '14:00',
        endTime: '16:00',
        notes: 'Implement dark glassmorphism layout and smooth animations.',
        completed: true,
        createdAt: Date.now() - 400
      },
      {
        id: 'task_3',
        activityId: 'act_japanese',
        name: 'Practice Hiragana & Kanji vocabulary',
        date: today,
        startTime: '19:00',
        endTime: '20:00',
        notes: 'Study 15 new N5 kanji flashcards on Anki.',
        completed: false,
        createdAt: Date.now() - 300
      }
    ];

    saveToStorage();
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(state.activities));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
  }

  // ============================================================
  // Dynamic Sky Phases, Regional Time & Live Tracker
  // ============================================================

  const WAVE_GRADIENT_PALETTES = {
    morning: {
      back0: '#1c5277', back1: '#0a2942',
      mid0: '#257e9e', mid1: '#0f445f',
      front0: '#41bed8', front1: '#166282'
    },
    afternoon: {
      back0: '#104e8d', back1: '#082c54',
      mid0: '#196ebd', mid1: '#0e3f72',
      front0: '#38bdf8', front1: '#1368b0'
    },
    evening: {
      back0: '#33143c', back1: '#180922',
      mid0: '#5f1e4a', mid1: '#2b0d26',
      front0: '#c84838', front1: '#4a142f'
    },
    night: {
      back0: '#14355a', back1: '#071326',
      mid0: '#1b5480', mid1: '#0a223d',
      front0: '#2c8dc7', front1: '#0e3760'
    }
  };

  const SKY_PHASE_META = {
    morning: { icon: '🌅', label: 'Morning' },
    afternoon: { icon: '☀️', label: 'Afternoon' },
    evening: { icon: '🌇', label: 'Evening' },
    night: { icon: '🌙', label: 'Night' }
  };

  function loadSkyPreferences() {
    try {
      const reg = localStorage.getItem(STORAGE_KEY_SKY_REGION);
      if (reg) state.selectedRegion = reg;
      const mode = localStorage.getItem(STORAGE_KEY_SKY_MODE);
      if (mode) state.skyModeOverride = mode;
    } catch (e) {
      console.warn('Error loading sky preferences:', e);
    }
  }

  function getRegionalDateTime(timeZoneKey) {
    const now = new Date();
    let targetTimeZone = timeZoneKey || 'auto';

    let localTimeZone = 'UTC';
    try {
      localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
      localTimeZone = 'UTC';
    }

    if (!targetTimeZone || targetTimeZone === 'auto') {
      targetTimeZone = localTimeZone;
    }

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    let day = now.toLocaleDateString('en-US', { day: 'numeric' });
    let month = now.toLocaleDateString('en-US', { month: 'long' });
    let year = now.toLocaleDateString('en-US', { year: 'numeric' });
    let timeZoneAbbr = '';

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTimeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(now);
      const pMap = {};
      parts.forEach(p => pMap[p.type] = p.value);
      if (pMap.hour !== undefined) {
        hours = parseInt(pMap.hour, 10) % 24;
      }
      if (pMap.minute !== undefined) minutes = parseInt(pMap.minute, 10);
      if (pMap.second !== undefined) seconds = parseInt(pMap.second, 10);
      if (pMap.weekday) weekday = pMap.weekday;
      if (pMap.day) day = pMap.day;
      if (pMap.month) month = pMap.month;
      if (pMap.year) year = pMap.year;
      if (pMap.timeZoneName) timeZoneAbbr = pMap.timeZoneName;
    } catch (err) {
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }

    const cityRaw = targetTimeZone.split('/').pop() || targetTimeZone;
    const cityClean = cityRaw.replace(/_/g, ' ');
    const regionFriendly = timeZoneAbbr ? `${cityClean} (${timeZoneAbbr})` : cityClean;

    // Daylight cycle based on the regional hour:
    // Morning Dawn: 05:00 - 11:59
    // Afternoon High Sun: 12:00 - 16:59
    // Evening Twilight: 17:00 - 20:59
    // Night Stars: 21:00 - 04:59
    let naturalPhase = 'night';
    let naturalGreeting = 'Good night';
    if (hours >= 5 && hours < 12) {
      naturalPhase = 'morning';
      naturalGreeting = 'Good morning';
    } else if (hours >= 12 && hours < 17) {
      naturalPhase = 'afternoon';
      naturalGreeting = 'Good afternoon';
    } else if (hours >= 17 && hours < 21) {
      naturalPhase = 'evening';
      naturalGreeting = 'Good evening';
    } else {
      naturalPhase = 'night';
      naturalGreeting = 'Good night';
    }

    const activePhase = (state.skyModeOverride && state.skyModeOverride !== 'auto')
      ? state.skyModeOverride
      : naturalPhase;

    let activeGreeting = naturalGreeting;
    if (state.skyModeOverride && state.skyModeOverride !== 'auto') {
      if (state.skyModeOverride === 'morning') activeGreeting = 'Good morning';
      else if (state.skyModeOverride === 'afternoon') activeGreeting = 'Good afternoon';
      else if (state.skyModeOverride === 'evening') activeGreeting = 'Good evening';
      else if (state.skyModeOverride === 'night') activeGreeting = 'Good night';
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const timeStringShort = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    const timeStringWithSec = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${period}`;
    const formattedDate = `${weekday}, ${day} ${month} ${year}`;

    return {
      hours,
      minutes,
      seconds,
      hours12,
      period,
      weekday,
      day,
      month,
      year,
      timeZoneAbbr,
      targetTimeZone,
      regionFriendly,
      timeStringShort,
      timeStringWithSec,
      formattedDate,
      naturalPhase,
      activePhase,
      activeGreeting
    };
  }

  function initLiveClock() {
    loadSkyPreferences();
    updateClock();
    setInterval(updateClock, 1000);
  }

  function updateClock() {
    const info = getRegionalDateTime(state.selectedRegion);

    // 1. Top Header Time (legacy / general element if present)
    const headerTimeEl = document.getElementById('headerTime');
    if (headerTimeEl) {
      headerTimeEl.textContent = info.timeStringWithSec;
    }

    // 2. Sidebar Clock
    const sidebarClockTime = document.getElementById('sidebarClockTime');
    const sidebarClockDay = document.getElementById('sidebarClockDay');
    const sidebarClockDate = document.getElementById('sidebarClockDate');

    if (sidebarClockTime) sidebarClockTime.textContent = info.timeStringShort;
    if (sidebarClockDay) sidebarClockDay.textContent = info.weekday;
    if (sidebarClockDate) sidebarClockDate.textContent = `${info.day} ${info.month} ${info.year}`;

    // 3. Greeting Banner Title & Subtitle with Region Tag
    const greetingTitle = document.getElementById('greetingTitle');
    const greetingSubtitle = document.getElementById('greetingSubtitle');
    if (greetingTitle) {
      greetingTitle.innerHTML = `${info.activeGreeting}, Mahi <span class="sparkle-anim">✦</span>`;
    }
    if (greetingSubtitle) {
      greetingSubtitle.innerHTML = `<span class="greeting-date-text">${info.formattedDate}</span> <span class="greeting-sep">•</span> <span class="greeting-time-text">${info.timeStringShort}</span>`;
    }

    // 4. Update Top Header Ocean & Sky Atmosphere Classes
    const topHeader = document.getElementById('topHeader');
    if (topHeader && topHeader.classList) {
      ['sky-morning', 'sky-afternoon', 'sky-evening', 'sky-night'].forEach(c => {
        if (c === `sky-${info.activePhase}`) {
          topHeader.classList.add(c);
        } else {
          topHeader.classList.remove(c);
        }
      });

      if (info.activePhase === 'night') {
        topHeader.classList.add('is-night-voyage');
      } else {
        topHeader.classList.remove('is-night-voyage');
      }
    }

    // 5. Update Wave SVG Gradients dynamically
    const pal = WAVE_GRADIENT_PALETTES[info.activePhase] || WAVE_GRADIENT_PALETTES.night;
    const setStop = (id, color) => {
      const el = document.getElementById(id);
      if (el) {
        if (typeof el.setAttribute === 'function') el.setAttribute('stop-color', color);
        if (el.style) el.style.stopColor = color;
      }
    };
    setStop('backWaveStop0', pal.back0);
    setStop('backWaveStop1', pal.back1);
    setStop('midWaveStop0', pal.mid0);
    setStop('midWaveStop1', pal.mid1);
    setStop('frontWaveStop0', pal.front0);
    setStop('frontWaveStop1', pal.front1);

    // 6. Update Top Header Right Sky & Region Pill
    const pillIcon = document.getElementById('skyPillIcon');
    const pillPhase = document.getElementById('skyPillPhase');
    const pillTime = document.getElementById('skyPillTime');
    const pillRegion = document.getElementById('skyPillRegion');
    const meta = SKY_PHASE_META[info.activePhase] || SKY_PHASE_META.night;

    if (pillIcon) pillIcon.textContent = meta.icon;
    if (pillPhase) pillPhase.textContent = info.activePhase.charAt(0).toUpperCase() + info.activePhase.slice(1);
    if (pillTime) pillTime.textContent = info.timeStringShort;
    if (pillRegion) pillRegion.textContent = info.regionFriendly;

    // 7. Sync Dropdown UI Controls if open or present
    const regionSelect = document.getElementById('skyRegionSelect');
    if (regionSelect && regionSelect.value !== (state.selectedRegion || 'auto')) {
      regionSelect.value = state.selectedRegion || 'auto';
    }

    const currentMode = state.skyModeOverride || 'auto';
    ['auto', 'morning', 'afternoon', 'evening', 'night'].forEach(m => {
      const btn = document.getElementById(`skyModeBtn-${m}`);
      if (btn && btn.classList) {
        if (m === currentMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    // 8. Update initial speech dialogue if not interacted with
    const bubbleText = document.getElementById('sunnyBubbleText');
    if (bubbleText && !bubbleText.dataset.userCheered) {
      if (info.activePhase === 'morning') {
        bubbleText.textContent = "Good morning! Setting sail into the sunrise! ☀️⚓";
      } else if (info.activePhase === 'afternoon') {
        bubbleText.textContent = "Full sail ahead! Keep conquering tasks under clear skies! 🌊⚔️";
      } else if (info.activePhase === 'evening') {
        bubbleText.textContent = "Good evening, Mahi! Sunset over the Grand Line is magnificent! 🌇✨";
      } else {
        bubbleText.textContent = "Yo-ho-ho! Rest well tonight, Mahi! Sailing smoothly under the moonlight! 🌙💤";
      }
    }
  }

  // Sky Region Dropdown & Controller Methods
  function toggleSkyDropdown(event) {
    if (event && event.stopPropagation) event.stopPropagation();
    const wrapper = document.getElementById('skyRegionPillWrapper');
    if (!wrapper) return;
    state.isSkyDropdownOpen = !state.isSkyDropdownOpen;
    wrapper.classList.toggle('open', state.isSkyDropdownOpen);
  }

  function closeSkyDropdown() {
    const wrapper = document.getElementById('skyRegionPillWrapper');
    if (wrapper) {
      wrapper.classList.remove('open');
      state.isSkyDropdownOpen = false;
    }
  }

  function setRegion(newRegion) {
    state.selectedRegion = newRegion || 'auto';
    try {
      localStorage.setItem(STORAGE_KEY_SKY_REGION, state.selectedRegion);
    } catch (e) {
      console.warn('Error saving sky region:', e);
    }
    updateClock();
    const city = newRegion === 'auto' ? 'Auto-Detect (Local)' : (newRegion.split('/').pop() || newRegion).replace(/_/g, ' ');
    showToast(`🧭 Region set to ${city}`);
  }

  function setSkyMode(mode) {
    state.skyModeOverride = mode || 'auto';
    try {
      localStorage.setItem(STORAGE_KEY_SKY_MODE, state.skyModeOverride);
    } catch (e) {
      console.warn('Error saving sky mode:', e);
    }
    updateClock();
    const labels = {
      auto: 'Auto (Live Region Clock)',
      morning: 'Morning Dawn 🌅',
      afternoon: 'Afternoon Sky ☀️',
      evening: 'Sunset Evening 🌇',
      night: 'Starlit Night 🌙'
    };
    showToast(`✨ Sky set to ${labels[mode] || mode}`);
  }

  // ============================================================
  // SunnyGo Sailing Ocean Effect & Voyage Controller
  // ============================================================

  const SUNNY_PIRATE_QUOTES = [
    "Yo-ho-ho! Sailing smoothly under the moonlight! 🌙",
    "Rest well tonight, Mahi! Tomorrow we conquer the Grand Line! 🍖",
    "Good morning, Mahi! Setting sail into the sunrise! ☀️⚓",
    "Morning ocean breeze! Let's conquer all our bounties! 🌊",
    "High noon on the Grand Line! Thousand Sunny is flying! 💥",
    "Thousand Sunny standing by! Coup de Burst ready! 🚀",
    "Good evening, Mahi! The sunset over the sea is magnificent! 🌇✨",
    "Grand Line twilight! What an incredible day of adventures! 🍖",
    "Straw Hat Crew is sailing strong! Sleep tight! ⚓",
    "The seas are peaceful tonight, Captain! 🌊✨",
    "You're gonna become the Pirate King! 👑"
  ];
  let sunnyQuoteIdx = 0;

  function initSunnyVoyage() {
    const starsContainer = document.getElementById('sunnyStarsContainer');
    if (starsContainer && (!starsContainer.children || starsContainer.children.length === 0)) {
      // Generate twinkling night stars across the header sky
      const starCount = 24;
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        const isSparkle = i % 5 === 0;
        star.className = isSparkle ? 'sunny-star sparkle-cross' : 'sunny-star';
        if (isSparkle) {
          star.textContent = '✦';
        }
        const left = Math.round((i * 4.1 + 3) % 95);
        const top = Math.round(4 + (i * 2.1) % 32);
        const size = isSparkle ? 9 : Math.round(1.5 + (i % 3));
        const dur = (2.2 + (i % 4) * 0.7).toFixed(1) + 's';
        const delay = ((i * 0.35) % 3).toFixed(1) + 's';

        star.style.left = `${left}%`;
        star.style.top = `${top}px`;
        if (!isSparkle) {
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
        }
        star.style.setProperty('--twinkle-dur', dur);
        star.style.setProperty('--twinkle-delay', delay);
        starsContainer.appendChild(star);
      }
    }

    // Set initial dialogue if element exists
    updateClock();
  }

  function cheerSunny(event) {
    if (event && event.stopPropagation) event.stopPropagation();
    const shipVoyager = document.getElementById('sunnyShipVoyager');
    const bubbleMsg = document.getElementById('sunnyBubbleMsg');
    const bubbleText = document.getElementById('sunnyBubbleText');

    sunnyQuoteIdx = (sunnyQuoteIdx + 1) % SUNNY_PIRATE_QUOTES.length;
    if (bubbleText) {
      bubbleText.dataset.userCheered = 'true';
      bubbleText.textContent = SUNNY_PIRATE_QUOTES[sunnyQuoteIdx];
    }

    if (shipVoyager && shipVoyager.classList) {
      shipVoyager.classList.remove('sunny-burst');
      // Trigger reflow if in browser
      if (typeof shipVoyager.offsetWidth === 'number') {
        void shipVoyager.offsetWidth;
      }
      shipVoyager.classList.add('sunny-burst');
      setTimeout(() => {
        if (shipVoyager && shipVoyager.classList) shipVoyager.classList.remove('sunny-burst');
      }, 900);
    }

    if (bubbleMsg && bubbleMsg.style) {
      bubbleMsg.style.opacity = '1';
      bubbleMsg.style.visibility = 'visible';
      bubbleMsg.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(() => {
        if (bubbleMsg && bubbleMsg.style) {
          bubbleMsg.style.opacity = '';
          bubbleMsg.style.visibility = '';
          bubbleMsg.style.transform = '';
        }
      }, 4000);
    }

    showToast("🍖 Thousand Sunny cheered on! Full speed ahead!");
  }

  // ============================================================
  // Quotes
  // ============================================================

  function renderQuote() {
    const item = MOTIVATIONAL_QUOTES[state.quoteIndex % MOTIVATIONAL_QUOTES.length];
    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    if (textEl) textEl.textContent = `"${item.quote}"`;
    if (authorEl) authorEl.textContent = item.author;
  }

  function nextQuote() {
    state.quoteIndex = (state.quoteIndex + 1) % MOTIVATIONAL_QUOTES.length;
    renderQuote();
  }

  // ============================================================
  // Sidebar & Navigation
  // ============================================================

  function toggleSidebar(forceState) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const appLayout = document.getElementById('appLayout');

    if (window.innerWidth <= 1024) {
      // Mobile drawer behavior
      if (typeof forceState === 'boolean') {
        state.isSidebarOpen = forceState;
      } else {
        state.isSidebarOpen = !state.isSidebarOpen;
      }

      if (sidebar) sidebar.classList.toggle('open', state.isSidebarOpen);
      if (backdrop) backdrop.classList.toggle('active', state.isSidebarOpen);
    } else {
      // Desktop collapse behavior
      if (typeof forceState === 'boolean') {
        state.isSidebarCollapsed = !forceState;
      } else {
        state.isSidebarCollapsed = !state.isSidebarCollapsed;
      }

      if (appLayout) {
        appLayout.classList.toggle('sidebar-collapsed', state.isSidebarCollapsed);
      }
      saveNavState();
    }
  }

  function switchView(viewName, payload = null) {
    state.currentView = viewName;
    if (viewName === 'activity' && payload) {
      state.selectedActivityId = payload;
      state.activityFilter = 'all';
    } else if (viewName === 'date-tasks' && payload) {
      state.selectedDate = payload;
    }

    // Persist current view so refreshing preserves exact position
    saveNavState();

    // Close mobile drawer on navigation
    if (window.innerWidth <= 1024) {
      toggleSidebar(false);
    }

    updateNavigationUI();
    renderCurrentView();
  }

  function updateNavigationUI() {
    // Nav items active classes
    const navDashboard = document.getElementById('navDashboard');
    const navToday = document.getElementById('navToday');
    const navAll = document.getElementById('navAll');

    if (navDashboard) navDashboard.classList.toggle('active', state.currentView === 'dashboard');
    if (navToday) navToday.classList.toggle('active', state.currentView === 'today-tasks');
    if (navAll) navAll.classList.toggle('active', state.currentView === 'all-tasks');

    // Update Badges
    const today = getTodayDateString();
    const todayTasks = state.tasks.filter(t => t.date === today);
    const todayBadge = document.getElementById('todayTaskCountBadge');
    const allBadge = document.getElementById('allTaskCountBadge');

    if (todayBadge) todayBadge.textContent = todayTasks.length;
    if (allBadge) allBadge.textContent = state.tasks.length;

    // Update Activity active state in sidebar
    const actItems = document.querySelectorAll('.activity-item');
    actItems.forEach(item => {
      const actId = item.dataset.activityId;
      item.classList.toggle('active', state.currentView === 'activity' && state.selectedActivityId === actId);
    });
  }

  function renderSidebarActivities() {
    const listEl = document.getElementById('activitiesList');
    if (!listEl) return;

    if (state.activities.length === 0) {
      listEl.innerHTML = `
        <div style="font-size: 12px; color: var(--text-muted); padding: 8px 10px; font-style: italic;">
          No activities yet ✦
        </div>
      `;
      return;
    }

    listEl.innerHTML = state.activities.map(act => {
      const count = state.tasks.filter(t => t.activityId === act.id).length;
      const isActive = state.currentView === 'activity' && state.selectedActivityId === act.id;
      return `
        <button
          class="activity-item ${isActive ? 'active' : ''}"
          data-activity-id="${act.id}"
          onclick="app.switchView('activity', '${act.id}')"
          oncontextmenu="app.handleActivityContextMenu(event, '${act.id}')"
          title="Click to view • Double right-click to delete"
        >
          <span class="activity-icon">${renderActivityIcon(act.icon, 'sidebar-flag-face')}</span>
          <span class="activity-name">${escapeHTML(act.name)}</span>
          <span class="activity-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  // ============================================================
  // One Piece Wanted Bounty Calendar Themes (12 Months)
  // ============================================================

  const CALENDAR_MONTH_THEMES = [
    {
      month: 0,
      name: 'January',
      character: 'Monkey D. Luffy',
      bounty: '3,000,000,000',
      image: 'luffy.jpg',
      accent: '#dc2626',
      accentGlow: 'rgba(220, 38, 38, 0.55)',
      themeColor: '#ef4444'
    },
    {
      month: 1,
      name: 'February',
      character: 'Roronoa Zoro',
      bounty: '1,101,000,000',
      image: 'zoro.jpg',
      accent: '#16a34a',
      accentGlow: 'rgba(22, 163, 74, 0.55)',
      themeColor: '#22c55e'
    },
    {
      month: 2,
      name: 'March',
      character: 'Nami',
      bounty: '366,000,000',
      image: 'nami.jpg',
      accent: '#ea580c',
      accentGlow: 'rgba(234, 88, 12, 0.55)',
      themeColor: '#f97316'
    },
    {
      month: 3,
      name: 'April',
      character: 'God Usopp',
      bounty: '500,000,000',
      image: 'usopp.jpg',
      accent: '#ca8a04',
      accentGlow: 'rgba(202, 138, 4, 0.55)',
      themeColor: '#eab308'
    },
    {
      month: 4,
      name: 'May',
      character: 'Vinsmoke Sanji',
      bounty: '1,032,000,000',
      image: 'sanji.jpg',
      accent: '#0284c7',
      accentGlow: 'rgba(2, 132, 199, 0.55)',
      themeColor: '#38bdf8'
    },
    {
      month: 5,
      name: 'June',
      character: 'Tony Tony Chopper',
      bounty: '100',
      image: 'chopper.jpg',
      accent: '#db2777',
      accentGlow: 'rgba(219, 39, 119, 0.55)',
      themeColor: '#f472b6'
    },
    {
      month: 6,
      name: 'July',
      character: 'Nico Robin',
      bounty: '930,000,000',
      image: 'robin.jpg',
      accent: '#9333ea',
      accentGlow: 'rgba(147, 51, 234, 0.55)',
      themeColor: '#a855f7'
    },
    {
      month: 7,
      name: 'August',
      character: 'Franky',
      bounty: '44,000,000',
      image: 'franky.jpg',
      accent: '#0891b2',
      accentGlow: 'rgba(8, 145, 178, 0.55)',
      themeColor: '#06b6d4'
    },
    {
      month: 8,
      name: 'September',
      character: 'Soul King Brook',
      bounty: '383,000,000',
      image: 'brook.jpg',
      accent: '#6366f1',
      accentGlow: 'rgba(99, 102, 241, 0.55)',
      themeColor: '#818cf8'
    },
    {
      month: 9,
      name: 'October',
      character: 'Jinbe',
      bounty: '1,100,000,000',
      image: 'jinbe.jpg',
      accent: '#0284c7',
      accentGlow: 'rgba(2, 132, 199, 0.55)',
      themeColor: '#38bdf8'
    },
    {
      month: 10,
      name: 'November',
      character: 'Portgas D. Ace',
      bounty: '550,000,000',
      image: 'ace.jpg',
      accent: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.55)',
      themeColor: '#fb923c'
    },
    {
      month: 11,
      name: 'December',
      character: 'Red-Haired Shanks',
      bounty: '4,048,900,000',
      image: 'shanks.jpg',
      accent: '#b91c1c',
      accentGlow: 'rgba(185, 28, 28, 0.55)',
      themeColor: '#f87171'
    }
  ];

  // ============================================================
  // Calendar Engine
  // ============================================================

  function renderCalendar() {
    const monthYearEl = document.getElementById('calendarMonthYear');
    const gridEl = document.getElementById('calendarDaysGrid');
    if (!monthYearEl || !gridEl) return;

    const year = state.calendarYear;
    const month = ((state.calendarMonth % 12) + 12) % 12;

    const theme = CALENDAR_MONTH_THEMES[month];
    monthYearEl.textContent = `${theme.name} ${year}`;

    const subtitleEl = document.getElementById('calendarThemeSubtitle');
    if (subtitleEl && theme) {
      subtitleEl.textContent = `${theme.character} • ฿${theme.bounty}`;
    }

    const cardEl = document.getElementById('calendarCard');
    if (cardEl && theme) {
      cardEl.style.setProperty('--cal-theme-bg', `url('assets/calendar_themes/${theme.image}')`);
      cardEl.style.setProperty('--cal-theme-accent', theme.accent);
      cardEl.style.setProperty('--cal-theme-glow', theme.accentGlow);
      cardEl.style.setProperty('--cal-theme-color', theme.themeColor);
    }

    // Compute first day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Compute total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Total days in previous month
    const prevMonthDays = new Date(year, month, 0).getDate();

    const todayStr = getTodayDateString();

    let daysHTML = '';

    // 1. Padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      daysHTML += `<div class="cal-day-cell other-month">${dayNum}</div>`;
    }

    // 2. Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const isToday = dateKey === todayStr;
      const isSelected = dateKey === state.selectedDate;
      const hasTasks = state.tasks.some(t => t.date === dateKey);

      let classes = 'cal-day-cell';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';

      daysHTML += `
        <div class="${classes}" onclick="app.handleDateClick('${dateKey}')" title="${dateKey}">
          <span class="cal-day-num">${day}</span>
        </div>
      `;
    }

    // 3. Padding days for next month to complete standard 35 or 42 grid cells
    const cellsSoFar = firstDayIndex + totalDays;
    const remainingCells = (cellsSoFar % 7 === 0) ? 0 : 7 - (cellsSoFar % 7);
    for (let j = 1; j <= remainingCells; j++) {
      daysHTML += `<div class="cal-day-cell other-month">${j}</div>`;
    }

    gridEl.innerHTML = daysHTML;
  }

  function prevMonth() {
    if (state.calendarMonth === 0) {
      state.calendarMonth = 11;
      state.calendarYear -= 1;
    } else {
      state.calendarMonth -= 1;
    }
    renderCalendar();
  }

  function nextMonth() {
    if (state.calendarMonth === 11) {
      state.calendarMonth = 0;
      state.calendarYear += 1;
    } else {
      state.calendarMonth += 1;
    }
    renderCalendar();
  }

  function goToCurrentMonth() {
    const now = new Date();
    state.calendarYear = now.getFullYear();
    state.calendarMonth = now.getMonth();
    const today = getTodayDateString();
    state.selectedDate = today;
    renderCalendar();
    if (state.currentView === 'date-tasks') {
      switchView('date-tasks', today);
    } else {
      renderCurrentView();
    }
  }

  function handleDateClick(dateKey) {
    state.selectedDate = dateKey;
    renderCalendar();
    switchView('date-tasks', dateKey);
  }

  // ============================================================
  // Task Rendering & Filtering
  // ============================================================

  function renderTaskCard(task) {
    const activity = state.activities.find(a => a.id === task.activityId);
    const actIcon = activity ? activity.icon : '📁';
    const actName = activity ? activity.name : 'General';

    // Time slot formatting
    let timeSlotDisplay = '';
    if (task.startTime && task.endTime) {
      timeSlotDisplay = `⏱ ${format12Hour(task.startTime)} — ${format12Hour(task.endTime)}`;
    } else if (task.startTime) {
      timeSlotDisplay = `⏱ ${format12Hour(task.startTime)}`;
    }

    // Date formatting if needed
    const friendlyDate = formatFriendlyDate(task.date);

    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" id="task-card-${task.id}">
        <div class="task-checkbox-container">
          <input
            type="checkbox"
            class="task-checkbox"
            id="chk-${task.id}"
            ${task.completed ? 'checked' : ''}
            onchange="app.toggleTaskCompletion('${task.id}')"
            aria-label="Mark task complete"
          >
        </div>
        <div class="task-content">
          <div class="task-header-meta">
            <span class="task-activity-tag" onclick="app.switchView('activity', '${task.activityId}')" style="cursor: pointer;" title="View Activity">
              <span class="task-act-icon-wrap">${renderActivityIcon(actIcon, 'task-flag-face')}</span>
              <span>${escapeHTML(actName)}</span>
            </span>
            ${timeSlotDisplay ? `<span class="task-time-tag">${escapeHTML(timeSlotDisplay)}</span>` : ''}
            <span class="task-date-tag">📅 ${escapeHTML(friendlyDate)}</span>
          </div>
          <div class="task-title">${escapeHTML(task.name)}</div>
          ${task.notes ? `<div class="task-notes">${escapeHTML(task.notes)}</div>` : ''}
        </div>
        <div class="task-actions">
          <button class="btn-task-action" onclick="app.openEditTaskModal('${task.id}')" title="Edit Task" aria-label="Edit Task">
            ✏️
          </button>
          <button class="btn-task-action delete" onclick="app.confirmDeleteTask('${task.id}')" title="Delete Task" aria-label="Delete Task">
            🗑
          </button>
        </div>
        ${task.completed ? '<div class="mission-stamp"><span class="mission-stamp-text stamp-static">MISSION COMPLETED</span></div>' : ''}
      </div>
    `;
  }

  // ============================================================
  // Views Rendering
  // ============================================================

  function renderCurrentView() {
    // Hide all views
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.remove('active'));

    // Update general components
    renderSidebarActivities();
    updateNavigationUI();
    renderCalendar();

    switch (state.currentView) {
      case 'dashboard':
        renderDashboardView();
        break;
      case 'activity':
        renderActivityView();
        break;
      case 'all-tasks':
        renderAllTasksView();
        break;
      case 'today-tasks':
        renderTodayTasksView();
        break;
      case 'date-tasks':
        renderDateTasksView();
        break;
      default:
        renderDashboardView();
    }
  }

  // 1. Dashboard View
  function renderDashboardView() {
    const viewEl = document.getElementById('viewDashboard');
    if (!viewEl) return;
    viewEl.classList.add('active');

    const today = getTodayDateString();
    const todayTasks = state.tasks.filter(t => t.date === today);
    const completedToday = todayTasks.filter(t => t.completed).length;
    const pendingToday = todayTasks.length - completedToday;
    const completionPercent = todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);

    // Update stats cards if present
    const elRem = document.getElementById('statTodayRemaining');
    if (elRem) elRem.textContent = pendingToday;
    const elComp = document.getElementById('statTodayCompleted');
    if (elComp) elComp.textContent = completedToday;
    const elAct = document.getElementById('statTotalActivities');
    if (elAct) elAct.textContent = state.activities.length;
    const elRate = document.getElementById('statCompletionRate');
    if (elRate) elRate.textContent = `${completionPercent}%`;

    // Today progress banner
    const fillEl = document.getElementById('todayProgressFill');
    const textEl = document.getElementById('todayProgressText');
    if (fillEl) fillEl.style.width = `${completionPercent}%`;
    if (textEl) {
      textEl.textContent = `${completedToday} of ${todayTasks.length} tasks completed (${completionPercent}%)`;
    }

    // Render list
    const listEl = document.getElementById('dashboardTodayTaskList');
    if (!listEl) return;

    if (todayTasks.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌸</div>
          <div class="empty-state-title">You're all caught up ✦</div>
          <div class="empty-state-desc">No tasks scheduled for today. Take a deep breath or schedule your next step.</div>
          <button class="btn-primary" onclick="app.openTaskModal()">
            <span class="plus-icon">+</span> Add Task
          </button>
        </div>
      `;
      return;
    }

    // Sort by startTime then createdAt
    const sorted = [...todayTasks].sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
    listEl.innerHTML = sorted.map(t => renderTaskCard(t)).join('');
  }

  // 2. Activity View
  function renderActivityView() {
    const viewEl = document.getElementById('viewActivity');
    if (!viewEl) return;
    viewEl.classList.add('active');

    const activity = state.activities.find(a => a.id === state.selectedActivityId);
    if (!activity) {
      switchView('dashboard');
      return;
    }

    // Banner info
    const heroIconEl = document.getElementById('activityHeroIcon');
    if (heroIconEl) {
      heroIconEl.innerHTML = renderActivityIcon(activity.icon, 'hero-flag-face');
    }
    document.getElementById('activityHeroTitle').textContent = activity.name;

    const actTasks = state.tasks.filter(t => t.activityId === activity.id);
    const completedCount = actTasks.filter(t => t.completed).length;
    document.getElementById('activityHeroStats').textContent = `${actTasks.length} total tasks • ${completedCount} completed`;

    // Filter tasks
    let filtered = actTasks;
    if (state.activityFilter === 'pending') {
      filtered = actTasks.filter(t => !t.completed);
    } else if (state.activityFilter === 'completed') {
      filtered = actTasks.filter(t => t.completed);
    }

    // Sort by date then startTime
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
    });

    const listEl = document.getElementById('activityTaskList');
    if (!listEl) return;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">No tasks yet</div>
          <div class="empty-state-desc">Ready to make progress in ${escapeHTML(activity.name)}?</div>
          <button class="btn-primary" onclick="app.openTaskModalForCurrentActivity()">
            <span class="plus-icon">+</span> Add Task
          </button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(t => renderTaskCard(t)).join('');
  }

  function filterActivityTasks(filterType) {
    state.activityFilter = filterType;
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(p => {
      p.classList.toggle('active', p.textContent.toLowerCase() === filterType);
    });
    renderActivityView();
  }

  // 3. All Tasks View
  function renderAllTasksView() {
    const viewEl = document.getElementById('viewAllTasks');
    if (!viewEl) return;
    viewEl.classList.add('active');

    const listEl = document.getElementById('allTaskList');
    if (!listEl) return;

    if (state.tasks.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✦</div>
          <div class="empty-state-title">Start your journey ✦</div>
          <div class="empty-state-desc">No tasks in your workspace yet. Create an activity and add tasks to get started.</div>
          <button class="btn-primary" onclick="app.openTaskModal()">
            <span class="plus-icon">+</span> Add Task
          </button>
        </div>
      `;
      return;
    }

    // Group tasks by date
    const grouped = {};
    state.tasks.forEach(task => {
      if (!grouped[task.date]) grouped[task.date] = [];
      grouped[task.date].push(task);
    });

    // Sort dates ascending
    const sortedDates = Object.keys(grouped).sort();

    let html = '';
    sortedDates.forEach(dateStr => {
      const tasksOnDate = grouped[dateStr];
      // Sort tasks within this date by start time
      tasksOnDate.sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));

      const isToday = dateStr === getTodayDateString();
      const friendlyDate = formatFriendlyDate(dateStr);

      html += `
        <div class="task-group">
          <div class="task-group-header">
            <span>📅 ${escapeHTML(friendlyDate)}</span>
            ${isToday ? '<span class="jp-badge" style="background: rgba(244,114,182,0.2); color: #fbcfe8;">TODAY</span>' : ''}
            <span style="font-size: 11px; color: var(--text-muted); margin-left: auto;">${tasksOnDate.length} tasks</span>
          </div>
          <div class="task-list-container">
            ${tasksOnDate.map(t => renderTaskCard(t)).join('')}
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // 4. Today Tasks View
  function renderTodayTasksView() {
    const viewEl = document.getElementById('viewTodayTasks');
    if (!viewEl) return;
    viewEl.classList.add('active');

    const today = getTodayDateString();
    const todayLabel = document.getElementById('todayViewDateLabel');
    if (todayLabel) {
      todayLabel.textContent = `Tasks scheduled for ${formatFriendlyDate(today)}.`;
    }

    const listEl = document.getElementById('todayScheduleList');
    if (!listEl) return;

    const todayTasks = state.tasks.filter(t => t.date === today);

    if (todayTasks.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌸</div>
          <div class="empty-state-title">You're all caught up ✦</div>
          <div class="empty-state-desc">No tasks scheduled for today. Take some time to relax or add a new goal.</div>
          <button class="btn-primary" onclick="app.openTaskModal()">
            <span class="plus-icon">+</span> Add Task
          </button>
        </div>
      `;
      return;
    }

    // Sort by startTime
    const sorted = [...todayTasks].sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
    listEl.innerHTML = sorted.map(t => renderTaskCard(t)).join('');
  }

  // 5. Date Tasks View (Calendar Click)
  function renderDateTasksView() {
    const viewEl = document.getElementById('viewDateTasks');
    if (!viewEl) return;
    viewEl.classList.add('active');

    const dateKey = state.selectedDate || getTodayDateString();
    const friendlyDate = formatFriendlyDate(dateKey);

    const titleEl = document.getElementById('dateTasksTitle');
    const subEl = document.getElementById('dateTasksSubtitle');
    if (titleEl) titleEl.textContent = friendlyDate;
    if (subEl) {
      const isToday = dateKey === getTodayDateString();
      subEl.textContent = isToday ? "Today's scheduled tasks & agenda." : `Tasks and reminders for this day.`;
    }

    const listEl = document.getElementById('dateScheduleList');
    if (!listEl) return;

    const tasksOnDate = state.tasks.filter(t => t.date === dateKey);

    if (tasksOnDate.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🗓</div>
          <div class="empty-state-title">No tasks for this date</div>
          <div class="empty-state-desc">Nothing planned for ${escapeHTML(friendlyDate)}. Would you like to schedule something?</div>
          <button class="btn-primary" onclick="app.openTaskModalForSelectedDate()">
            <span class="plus-icon">+</span> Schedule Task
          </button>
        </div>
      `;
      return;
    }

    const sorted = [...tasksOnDate].sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
    listEl.innerHTML = sorted.map(t => renderTaskCard(t)).join('');
  }

  // ============================================================
  // Task Interactions (Complete, Delete, Edit)
  // ============================================================

  function toggleTaskCompletion(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveToStorage();

    const card = document.getElementById(`task-card-${taskId}`);

    if (task.completed && card) {
      // --- Play stamp sound via Web Audio API ---
      playStampSound();

      // --- Add "MISSION COMPLETED" stamp overlay ---
      card.classList.add('stamp-flash');
      const stamp = document.createElement('div');
      stamp.className = 'mission-stamp';
      stamp.innerHTML = '<span class="mission-stamp-text">MISSION COMPLETED</span>';
      card.appendChild(stamp);

      // After the slam animation settles, fade the card into completed state
      setTimeout(() => {
        card.classList.add('completed');
        card.classList.remove('stamp-flash');
      }, 500);
    } else {
      if (card) {
        card.classList.toggle('completed', task.completed);
        // Remove any leftover stamp
        const existingStamp = card.querySelector('.mission-stamp');
        if (existingStamp) existingStamp.remove();
      }
      renderCurrentView();
    }

    showToast(task.completed ? 'Mission completed! ☠️' : 'Task marked as pending.');

    // Interactive Companion Reaction
    if (window.companion) {
      if (task.completed) {
        const today = getTodayDateString();
        const todayTasks = state.tasks.filter(t => t.date === today);
        const allDone = todayTasks.length > 0 && todayTasks.every(t => t.completed);

        if (allDone) {
          companion.react('ALL_TODAY_TASKS_COMPLETED', { task });
        } else {
          companion.react('TASK_COMPLETED', { task });
        }
      } else {
        companion.react('TASK_UNCOMPLETED', { task });
      }
    }
  }

  // Synthesize a punchy rubber-stamp sound using Web Audio API
  function playStampSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Layer 1: Low thud (the impact)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(120, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
      gain1.gain.setValueAtTime(0.6, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      // Layer 2: Noise burst (the slap/paper texture)
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 800;
      noiseFilter.Q.value = 1.2;
      noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
      noise.start(ctx.currentTime);

      // Layer 3: Mid click (mechanical stamp lever)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(600, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.07);

      // Cleanup
      setTimeout(() => ctx.close(), 500);
    } catch (e) {
      // Web Audio not supported — silent fallback
    }
  }

  function confirmDeleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    openConfirmModal(
      'Delete Task?',
      `Are you sure you want to delete "${escapeHTML(task.name)}"? This action cannot be undone.`,
      () => {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        saveToStorage();
        renderCurrentView();
        showToast('Task deleted.');
        if (window.companion) companion.react('TASK_DELETED');
      }
    );
  }

  // ============================================================
  // Task Modal Handling
  // ============================================================

  function selectTaskActivity(activityId) {
    const selectEl = document.getElementById('taskFormActivity');
    if (selectEl) {
      selectEl.value = activityId;
      if (typeof selectEl.dispatchEvent === 'function') {
        try {
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (_) {}
      }
    }
    updateTaskActivityPickerVisuals(activityId);
  }

  function updateTaskActivityPickerVisuals(selectedId) {
    const gridEl = document.getElementById('taskActivityPickerGrid');
    if (!gridEl) return;
    const cards = gridEl.querySelectorAll('.task-activity-card');
    cards.forEach(card => {
      const isCardSelected = card.getAttribute('data-act-id') === selectedId;
      if (isCardSelected) {
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-checked', 'false');
      }
    });
  }

  function populateActivityDropdown(selectedId = null) {
    const selectEl = document.getElementById('taskFormActivity');
    const gridEl = document.getElementById('taskActivityPickerGrid');
    if (!selectEl) return;

    if (state.activities.length === 0) {
      selectEl.innerHTML = '<option value="">(No activities exist — create one first!)</option>';
      if (gridEl) {
        gridEl.innerHTML = '<div class="no-activities-hint">No activities found. Please create an activity first! 🏴‍☠️</div>';
      }
      return;
    }

    const effectiveId = selectedId || (state.selectedActivityId && state.activities.some(a => a.id === state.selectedActivityId) ? state.selectedActivityId : state.activities[0].id);

    // Populate native select (clean text without "Luffy's Flag" / "Zoro's Flag" text)
    selectEl.innerHTML = state.activities.map(act => {
      const isSel = act.id === effectiveId;
      return `<option value="${act.id}" ${isSel ? 'selected' : ''}>${escapeHTML(act.name)}</option>`;
    }).join('');
    selectEl.value = effectiveId;

    // Populate visual cards with actual pirate flag SVG + Activity name
    if (gridEl) {
      gridEl.innerHTML = state.activities.map(act => {
        const isSel = act.id === effectiveId;
        const flagHtml = renderActivityIcon(act.icon, 'task-act-select-flag');
        return `
          <button type="button" 
                  class="task-activity-card ${isSel ? 'active' : ''}" 
                  data-act-id="${act.id}"
                  role="radio"
                  aria-checked="${isSel ? 'true' : 'false'}"
                  onclick="app.selectTaskActivity('${act.id}')"
                  title="Assign task to ${escapeHTML(act.name)}">
            <span class="task-activity-card-flag">${flagHtml}</span>
            <span class="task-activity-card-name">${escapeHTML(act.name)}</span>
            <span class="task-activity-card-check" aria-hidden="true">✓</span>
          </button>
        `;
      }).join('');
    }
  }

  function updateTimeSlotPreview() {
    const startVal = document.getElementById('taskFormStartTime').value;
    const endVal = document.getElementById('taskFormEndTime').value;
    const previewEl = document.getElementById('timeSlotPreview');
    if (!previewEl) return;

    if (startVal && endVal) {
      previewEl.textContent = `${format12Hour(startVal)} — ${format12Hour(endVal)}`;
    } else if (startVal) {
      previewEl.textContent = format12Hour(startVal);
    } else {
      previewEl.textContent = 'No time set';
    }
  }

  function openTaskModal(prefillActivityId = null, prefillDate = null) {
    // If no activities exist, prompt user to create an activity first
    if (state.activities.length === 0) {
      showToast('Please create an Activity first! 🌸');
      openActivityModal();
      return;
    }

    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    form.reset();

    document.getElementById('taskFormEditId').value = '';
    document.getElementById('taskModalTitle').textContent = 'Create New Task ✦';
    document.getElementById('btnTaskSubmit').textContent = 'Save Task ✦';

    const actId = prefillActivityId || (state.currentView === 'activity' ? state.selectedActivityId : null);
    populateActivityDropdown(actId);

    const activityGroup = document.getElementById('taskFormActivityGroup');
    const lockedGroup = document.getElementById('taskFormActivityLockedGroup');
    const lockedBadge = document.getElementById('taskFormActivityLockedBadge');

    // If adding from inside an activity, hide the dropdown and lock to current activity
    if (actId) {
      const activity = state.activities.find(a => a.id === actId);
      if (activityGroup) activityGroup.style.display = 'none';
      if (lockedGroup) lockedGroup.style.display = 'block';
      if (lockedBadge && activity) {
        lockedBadge.innerHTML = `<span class="locked-badge-avatar">${renderActivityIcon(activity.icon, 'badge-flag-face')}</span> <span>${escapeHTML(activity.name)}</span>`;
      }
      const selectEl = document.getElementById('taskFormActivity');
      if (selectEl) selectEl.value = actId;
    } else {
      if (activityGroup) activityGroup.style.display = 'block';
      if (lockedGroup) lockedGroup.style.display = 'none';
    }

    // Default Date
    const dateInput = document.getElementById('taskFormDate');
    dateInput.value = prefillDate || state.selectedDate || getTodayDateString();

    // Default Start Time to next reasonable hour
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const startInput = document.getElementById('taskFormStartTime');
    startInput.value = `${currentHour}:00`;

    updateTimeSlotPreview();

    modal.classList.add('active');
    document.getElementById('taskFormName').focus();
  }

  function openTaskModalForCurrentActivity() {
    openTaskModal(state.selectedActivityId);
  }

  function openTaskModalForSelectedDate() {
    openTaskModal(null, state.selectedDate);
  }

  function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('taskModal');
    document.getElementById('taskFormEditId').value = task.id;
    document.getElementById('taskModalTitle').textContent = 'Edit Task ✦';
    document.getElementById('btnTaskSubmit').textContent = 'Update Task ✦';

    document.getElementById('taskFormName').value = task.name;
    populateActivityDropdown(task.activityId);

    const activityGroup = document.getElementById('taskFormActivityGroup');
    const lockedGroup = document.getElementById('taskFormActivityLockedGroup');
    const lockedBadge = document.getElementById('taskFormActivityLockedBadge');

    // If inside an activity, lock to that activity
    if (state.currentView === 'activity') {
      const activity = state.activities.find(a => a.id === task.activityId);
      if (activityGroup) activityGroup.style.display = 'none';
      if (lockedGroup) lockedGroup.style.display = 'block';
      if (lockedBadge && activity) {
        lockedBadge.innerHTML = `<span class="locked-badge-avatar">${renderActivityIcon(activity.icon, 'badge-flag-face')}</span> <span>${escapeHTML(activity.name)}</span>`;
      }
    } else {
      if (activityGroup) activityGroup.style.display = 'block';
      if (lockedGroup) lockedGroup.style.display = 'none';
    }

    document.getElementById('taskFormDate').value = task.date;
    document.getElementById('taskFormStartTime').value = task.startTime || '';
    document.getElementById('taskFormEndTime').value = task.endTime || '';
    document.getElementById('taskFormNotes').value = task.notes || '';

    updateTimeSlotPreview();

    modal.classList.add('active');
    document.getElementById('taskFormName').focus();
  }

  function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) modal.classList.remove('active');
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('taskFormEditId').value;
    const name = document.getElementById('taskFormName').value.trim();
    const activityId = document.getElementById('taskFormActivity').value;
    const date = document.getElementById('taskFormDate').value;
    const startTime = document.getElementById('taskFormStartTime').value;
    const endTime = document.getElementById('taskFormEndTime').value;
    const notes = document.getElementById('taskFormNotes').value.trim();

    if (!name) {
      showToast('Please provide a task name.');
      return;
    }

    if (!activityId) {
      showToast('Task must belong to an Activity.');
      return;
    }

    if (!date) {
      showToast('Please pick a date for the task.');
      return;
    }

    if (editId) {
      // Editing existing task
      const task = state.tasks.find(t => t.id === editId);
      if (task) {
        task.name = name;
        task.activityId = activityId;
        task.date = date;
        task.startTime = startTime;
        task.endTime = endTime;
        task.notes = notes;
        saveToStorage();
        showToast('Task updated ✦');
      }
    } else {
      // Creating new task
      const newTask = {
        id: 'task_' + Date.now(),
        name,
        activityId,
        date,
        startTime,
        endTime,
        notes,
        completed: false,
        createdAt: Date.now()
      };
      state.tasks.push(newTask);
      saveToStorage();
      showToast('New task added ✦');
      if (window.companion) companion.react('TASK_CREATED', { task: newTask });
    }

    closeTaskModal();
    renderCurrentView();
  }

  // ============================================================
  // Activity Modal & CRUD
  // ============================================================

  function openActivityModal() {
    const modal = document.getElementById('activityModal');
    const form = document.getElementById('activityForm');
    if (form) form.reset();

    // Default icon: Luffy's Straw Hat Flag
    selectEmojiPreset('luffy');

    if (modal) modal.classList.add('active');
    const nameInput = document.getElementById('activityFormName');
    if (nameInput) nameInput.focus();
  }

  function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) modal.classList.remove('active');
  }

  function selectEmojiPreset(emoji) {
    const input = document.getElementById('activityFormIcon');
    const preview = document.getElementById('activityEmojiPreview');
    const nameEl = document.getElementById('selectedCharacterName');
    const roleEl = document.getElementById('selectedCharacterRole');

    if (!emoji) emoji = 'luffy';
    if (input) input.value = emoji;

    const flagObj = getFlag(emoji);
    if (flagObj) {
      if (preview) {
        preview.innerHTML = `<img src="${flagObj.flag}" alt="${flagObj.name}'s Flag" class="char-preview-img flag-preview-img" />`;
      }
      if (nameEl) nameEl.textContent = flagObj.name;
      if (roleEl) roleEl.textContent = flagObj.desc;
    } else {
      if (preview) {
        preview.innerHTML = `<span class="preview-emoji-text">${escapeHTML(emoji)}</span>`;
      }
      if (nameEl) nameEl.textContent = 'Custom Flag / Tag';
      if (roleEl) roleEl.textContent = 'Custom Activity Symbol';
    }

    const presetButtons = document.querySelectorAll('.character-preset-btn, .emoji-preset-btn');
    presetButtons.forEach(btn => {
      const btnChar = (btn.dataset && btn.dataset.char) || (typeof btn.getAttribute === 'function' ? btn.getAttribute('data-char') : '') || (btn.textContent ? btn.textContent.trim() : '');
      const isActive = (flagObj && btnChar === flagObj.id) || btnChar === emoji || (btn.textContent && btn.textContent.trim() === emoji);
      btn.classList.toggle('active', !!isActive);
    });
  }

  function handleActivityFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('activityFormName').value.trim();
    const icon = document.getElementById('activityFormIcon').value.trim() || 'luffy';

    if (!name) {
      showToast('Please enter an activity name.');
      return;
    }

    const newActivity = {
      id: 'act_' + Date.now(),
      name,
      icon,
      createdAt: Date.now()
    };

    state.activities.push(newActivity);
    saveToStorage();

    closeActivityModal();
    const flagObj = getFlag(icon);
    const flagName = flagObj ? ` under ${flagObj.name}'s Flag` : '';
    showToast(`Activity "${name}"${flagName} created! 🏴‍☠️`);
    if (window.companion) companion.react('ACTIVITY_CREATED', { activity: newActivity });

    // Switch directly to the newly created activity
    switchView('activity', newActivity.id);
  }

  // Double Right-Click State Tracker
  let lastActivityRightClick = { id: null, time: 0 };

  function handleActivityContextMenu(e, activityId) {
    e.preventDefault();
    const now = Date.now();
    if (lastActivityRightClick.id === activityId && (now - lastActivityRightClick.time) < 700) {
      // Double right-click detected!
      lastActivityRightClick = { id: null, time: 0 };
      promptDeleteActivity(activityId);
    } else {
      lastActivityRightClick = { id: activityId, time: now };
      showToast('Right-click again to delete activity 🗑');
    }
  }

  function promptDeleteActivity(activityId) {
    const activity = state.activities.find(a => a.id === activityId);
    if (!activity) return;

    openConfirmModal(
      'Delete Activity?',
      `<div style="text-align: left; padding: 4px 0;">
         <p style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Delete "${escapeHTML(activity.name)}"?</p>
         <p style="font-size: 13px; color: #f87171; font-weight: 500;">(All your tasks in this activity will also be deleted)</p>
       </div>`,
      () => {
        // Cascade delete tasks
        state.tasks = state.tasks.filter(t => t.activityId !== activity.id);
        // Delete activity
        state.activities = state.activities.filter(a => a.id !== activity.id);
        saveToStorage();

        if (state.selectedActivityId === activity.id) {
          switchView('dashboard');
        } else {
          renderCurrentView();
        }
        showToast(`Activity "${activity.name}" and its tasks deleted.`);
      }
    );
  }

  function confirmDeleteCurrentActivity() {
    promptDeleteActivity(state.selectedActivityId);
  }

  // ============================================================
  // Confirmation Modal
  // ============================================================

  let confirmCallback = null;

  function openConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').innerHTML = message;
    confirmCallback = onConfirm;

    const acceptBtn = document.getElementById('confirmModalAcceptBtn');
    acceptBtn.onclick = function () {
      if (confirmCallback) confirmCallback();
      closeConfirmModal();
    };

    modal.classList.add('active');
  }

  function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
  }

  // ============================================================
  // Toast Notifications
  // ============================================================

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✦</span><span>${escapeHTML(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

  // ============================================================
  // Utilities
  // ============================================================

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Listen for Time Slot input changes in the Task modal
  function setupFormListeners() {
    const startInput = document.getElementById('taskFormStartTime');
    const endInput = document.getElementById('taskFormEndTime');
    if (startInput) startInput.addEventListener('input', updateTimeSlotPreview);
    if (endInput) endInput.addEventListener('input', updateTimeSlotPreview);

    const customEmojiInput = document.getElementById('activityFormIcon');
    if (customEmojiInput) {
      customEmojiInput.addEventListener('input', (e) => {
        selectEmojiPreset(e.target.value);
      });
    }

    const taskActSelect = document.getElementById('taskFormActivity');
    if (taskActSelect) {
      taskActSelect.addEventListener('change', (e) => {
        updateTaskActivityPickerVisuals(e.target.value);
      });
    }

    // Close modals on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTaskModal();
        closeActivityModal();
        closeConfirmModal();
      }
    });

    // Close modal when clicking on the backdrop
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target === m) {
          m.classList.remove('active');
        }
      });
    });
  }


  // Expose methods to global `app` object for inline HTML event handlers
  window.app = {
    toggleSidebar,
    switchView,
    renderQuote,
    nextQuote,
    prevMonth,
    nextMonth,
    goToCurrentMonth,
    handleDateClick,
    toggleTaskCompletion,
    confirmDeleteTask,
    openTaskModal,
    openTaskModalForCurrentActivity,
    openTaskModalForSelectedDate,
    openEditTaskModal,
    closeTaskModal,
    handleTaskFormSubmit,
    openActivityModal,
    closeActivityModal,
    selectEmojiPreset,
    selectTaskActivity,
    handleActivityFormSubmit,
    confirmDeleteCurrentActivity,
    handleActivityContextMenu,
    promptDeleteActivity,
    closeConfirmModal,
    filterActivityTasks,
    showToast,
    // Straw Hat Flags Helpers
    ONE_PIECE_FLAGS,
    renderActivityIcon,
    // Calendar Themes
    CALENDAR_MONTH_THEMES,
    // SunnyGo Sailing Cheer Control
    cheerSunny,
    // Sky Atmosphere & Region Controller
    toggleSkyDropdown,
    closeSkyDropdown,
    setRegion,
    setSkyMode,
    updateClock,
    // 3D Wanted Posters Background Engine
    initWanted3DBackground,
    // Replay Pixel Art Loader
    replayLoader: replayPixelLoader,
    // Debug & Testing helpers
    state
  };

  // ============================================================
  // Full-Screen Pixel Art Luffy Loading Screen Engine
  // ============================================================

  let pixelAnimInterval = null;
  let pixelProgressAnim = null;

  function initPixelLoader() {
    const overlay = document.getElementById('pixelLoaderOverlay');
    if (!overlay) return;
    runPixelLoaderSequence();
  }

  function setLuffyFrame(frameNum) {
    const frames = [
      document.getElementById('luffyFrame1'),
      document.getElementById('luffyFrame2'),
      document.getElementById('luffyFrame3'),
      document.getElementById('luffyFrame4')
    ];
    const frameJump = document.getElementById('luffyFrame5');

    frames.forEach((f, idx) => {
      if (f) f.style.display = (idx + 1 === frameNum) ? 'inline' : 'none';
    });
    if (frameJump) {
      frameJump.style.display = (frameNum === 5) ? 'inline' : 'none';
    }
  }

  function startLuffyRun() {
    if (pixelAnimInterval) clearInterval(pixelAnimInterval);
    let currentIdx = 0;
    setLuffyFrame(1);
    pixelAnimInterval = setInterval(() => {
      currentIdx = (currentIdx + 1) % 4;
      setLuffyFrame(currentIdx + 1);
    }, 110);
  }

  function stopLuffyRun() {
    if (pixelAnimInterval) {
      clearInterval(pixelAnimInterval);
      pixelAnimInterval = null;
    }
  }

  function getPixelQuestText(pct) {
    if (pct < 25) return '✦ HOISTING THE SAILS ✦';
    if (pct < 50) return '✦ STOCKING MEAT & SUPPLIES ✦';
    if (pct < 75) return '✦ NAVIGATING THE GRAND LINE ✦';
    if (pct < 99) return '✦ APPROACHING PIRATE ISLAND ✦';
    return '✦ PIRATE KING READY! SET SAIL! ⚓ ✦';
  }

  function runPixelLoaderSequence(onComplete) {
    const overlay = document.getElementById('pixelLoaderOverlay');
    const anchor = document.getElementById('pixelLuffyAnchor');
    const fill = document.getElementById('pixelBarFill');
    const percentText = document.getElementById('pixelPercentText');
    const questText = document.getElementById('pixelQuestText');

    if (!overlay || !anchor || !fill || !percentText) return;

    if (pixelProgressAnim) cancelAnimationFrame(pixelProgressAnim);

    overlay.style.display = 'flex';
    overlay.classList.remove('is-hidden');
    anchor.classList.remove('is-jumping');
    fill.classList.remove('is-complete');

    anchor.style.left = '36px';
    fill.style.width = '0%';
    percentText.textContent = 'LOADING... 0%';
    if (questText) questText.textContent = getPixelQuestText(0);

    startLuffyRun();

    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds smooth progress

    function step(now) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(100, (elapsed / duration) * 100);
      const rounded = Math.round(rawProgress);

      // Interpolate horizontal position so Luffy's feet stay centered on top of the bar
      anchor.style.left = `calc(36px + (100% - 72px) * ${rawProgress / 100})`;
      fill.style.width = `${rawProgress}%`;
      percentText.textContent = `LOADING... ${rounded}%`;
      if (questText) questText.textContent = getPixelQuestText(rounded);

      if (rawProgress < 100) {
        pixelProgressAnim = requestAnimationFrame(step);
      } else {
        // 100% REACHED!
        stopLuffyRun();
        setLuffyFrame(5); // Victory celebration jump
        anchor.classList.add('is-jumping');
        fill.classList.add('is-complete');
        percentText.textContent = 'LOADING... 100%';
        if (questText) questText.textContent = '✦ SET SAIL! ⚓ ✦';

        // Brief celebration pause before fading out
        setTimeout(() => {
          overlay.classList.add('is-hidden');
          setTimeout(() => {
            overlay.style.display = 'none';
            if (onComplete) onComplete();
          }, 550);
        }, 650);
      }
    }

    pixelProgressAnim = requestAnimationFrame(step);
  }

  function replayPixelLoader() {
    runPixelLoaderSequence();
  }

  // ============================================================
  // 3D Wanted Posters Background Engine & Parallax
  // ============================================================

  function initWanted3DBackground() {
    const wrapper = document.getElementById('wanted3DWrapper');
    const sparklesContainer = document.getElementById('wantedBountySparkles');

    // 1. Generate subtle floating golden bounty sparkles
    if (sparklesContainer && (!sparklesContainer.children || sparklesContainer.children.length === 0)) {
      const sparkleCount = 18;
      for (let i = 0; i < sparkleCount; i++) {
        const s = document.createElement('span');
        s.className = 'wanted-sparkle';
        const left = Math.round(4 + (i * 5.6) % 92);
        const top = Math.round(12 + (i * 5.1) % 82);
        const dur = (10 + (i % 5) * 2.5).toFixed(1) + 's';
        const delay = ((i * 0.65) % 6).toFixed(1) + 's';
        const driftX = (i % 2 === 0 ? 1 : -1) * (15 + (i % 4) * 8) + 'px';

        s.style.left = `${left}%`;
        s.style.top = `${top}%`;
        s.style.setProperty('--ember-dur', dur);
        s.style.setProperty('--ember-delay', delay);
        s.style.setProperty('--drift-x', driftX);
        sparklesContainer.appendChild(s);
      }
    }

    // 2. Micro 3D mouse parallax tracking
    if (!wrapper || typeof window === 'undefined') return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let isTracking = false;

    window.addEventListener('mousemove', (e) => {
      const w = window.innerWidth || 1200;
      const h = window.innerHeight || 800;
      const xPct = (e.clientX / w) - 0.5;
      const yPct = (e.clientY / h) - 0.5;

      // Minute 3D tilt: max ~1.2deg tilt
      targetRotY = xPct * 2.2;
      targetRotX = -yPct * 1.8;
      isTracking = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    function smoothParallax() {
      if (isTracking && wrapper) {
        currentRotX += (targetRotX - currentRotX) * 0.05;
        currentRotY += (targetRotY - currentRotY) * 0.05;

        wrapper.style.setProperty('--mouse-tilt-x', `${currentRotX.toFixed(2)}deg`);
        wrapper.style.setProperty('--mouse-tilt-y', `${currentRotY.toFixed(2)}deg`);
      }
      requestAnimationFrame(smoothParallax);
    }
    requestAnimationFrame(smoothParallax);
  }

  // Run on DOM ready
  function init() {
    initWanted3DBackground();
    initPixelLoader();
    initLiveClock();
    loadFromStorage();
    loadNavState();
    initSunnyVoyage();
    renderQuote();
    setupFormListeners();

    // Close sky region dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('skyRegionPillWrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        closeSkyDropdown();
      }
    });

    renderCurrentView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

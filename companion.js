/**
 * ============================================================
 * Anime Study Partner — Interactive Companion Engine (companion.js)
 * ============================================================
 * An energetic, Luffy-inspired anime companion that dynamically reacts
 * to user productivity actions with animations, speech bubbles,
 * typewriter effects, and Japanese anime-style voice synthesis.
 *
 * Modular Architecture: Productive logic is decoupled from companion logic.
 * Personality and dialogue pools can easily be replaced or upgraded with AI.
 */

(function () {
  'use strict';

  const STORAGE_KEY_COMPANION = 'anime_todo_companion_memory_v1';

  // ============================================================
  // Personality Configuration (Luffy-inspired: Energetic, Optimistic)
  // ============================================================

  const COMPANION_PERSONALITY = {
    id: 'luffy_study_buddy',
    name: 'Luffy',
    japaneseName: 'ルフィ',
    title: 'Study Partner ✦ 相棒',
    voiceSettings: {
      pitch: 1.25,
      rate: 1.15,
      volume: 0.9,
      lang: 'ja-JP'
    },

    // Dialogue Pools
    dialogues: {
      APP_OPENED: [
        {
          text: "Welcome back! You're gonna become the Pirate King!! Let's conquer today!",
          jpSub: "海賊王に、おれはなる！今日も行くぞ！",
          jpAudio: "かいぞくおうに、おれはなる！きょうもいくぞ！",
          animation: "excited",
          moodIcon: "👑",
          playAudio: true
        },
        {
          text: "Welcome back! ✦ Ready for adventure?",
          jpSub: "おかえり！今日も冒険だ！",
          jpAudio: "おかえり！きょうもぼうけんだ！",
          animation: "bounce",
          moodIcon: "⚡",
          playAudio: true
        },
        {
          text: "You're here! Let's get stronger today!",
          jpSub: "来たな！今日も強くなろうぜ！",
          jpAudio: "きたな！きょうもつよくなろうぜ！",
          animation: "excited",
          moodIcon: "💪",
          playAudio: true
        }
      ],

      TASK_COMPLETED: [
        {
          text: "WHAT?! You're so strong!",
          jpSub: "すげぇ！お前強いな！",
          jpAudio: "すげえ！おまえつよいな！",
          animation: "bounce",
          moodIcon: "🔥",
          playAudio: true
        },
        {
          text: "YES! You knocked it out!",
          jpSub: "やったー！ぶっ飛ばしたな！",
          jpAudio: "やったー！ぶっとばしたな！",
          animation: "excited",
          moodIcon: "⚡",
          playAudio: true
        },
        {
          text: "That was easy for you! Let's go!",
          jpSub: "余裕だったな！次行こうぜ！",
          jpAudio: "よゆうだったな！つぎいこうぜ！",
          animation: "bounce",
          moodIcon: "💪",
          playAudio: true
        },
        {
          text: "HAHAHA! Nice! Keep this momentum!",
          jpSub: "ハハハ！いいぞ！この調子だ！",
          jpAudio: "ははは！いいぞ！このちょうしだ！",
          animation: "excited",
          moodIcon: "🍖",
          playAudio: true
        },
        {
          text: "One more step toward the top!",
          jpSub: "頂点への一歩だな！",
          jpAudio: "ちょうてんへのいっぽだな！",
          animation: "bounce",
          moodIcon: "🌟",
          playAudio: true
        },
        {
          text: "You're getting faster and sharper!",
          jpSub: "どんどん速くなってるぞ！",
          jpAudio: "どんどん速くなってるぞ！",
          animation: "excited",
          moodIcon: "⚡",
          playAudio: true
        }
      ],

      FIRST_TASK_COMPLETED: [
        {
          text: "That's the first one! Keep going!",
          jpSub: "最初の一歩クリア！まだまだ行くぞ！",
          jpAudio: "さいしょのいっぽクリア！まだまだいくぞ！",
          animation: "celebrate",
          moodIcon: "🎉",
          playAudio: true
        }
      ],

      STREAK_3: [
        {
          text: "HAHAHA! You're on fire! 3 in a row!",
          jpSub: "ハハハ！燃えてきたー！3連勝！",
          jpAudio: "ははは！もえてきたー！さんれんしょう！",
          animation: "celebrate",
          moodIcon: "🔥",
          playAudio: true
        }
      ],

      STREAK_5: [
        {
          text: "Nothing can stop you now! Unstoppable!",
          jpSub: "誰にも止められないぜ！無敵だ！",
          jpAudio: "だれにもとめられないぜ！むてきだ！",
          animation: "celebrate",
          moodIcon: "👑",
          playAudio: true
        }
      ],

      ALL_TODAY_TASKS_COMPLETED: [
        {
          text: "YOU DID IT! You're seriously amazing!!",
          jpSub: "全部終わったのか？！お前最高だぜ！",
          jpAudio: "ぜんぶおわったのか？！おまえさいこうだぜ！",
          animation: "celebrate",
          moodIcon: "👑",
          playAudio: true,
          bigCelebration: true
        }
      ],

      TASK_CREATED: [
        {
          text: "Alright! What's the mission?",
          jpSub: "よーし！次の作戦はなんだ？",
          jpAudio: "よーし！つぎのさくせんはなんだ？",
          animation: "idle",
          moodIcon: "📝",
          playAudio: false
        },
        {
          text: "Another challenge! Let's get this done!",
          jpSub: "新たな挑戦だな！やっちゃおうぜ！",
          jpAudio: "あらたなちょうせんだな！やっちゃおうぜ！",
          animation: "bounce",
          moodIcon: "⚡",
          playAudio: false
        },
        {
          text: "Okay! We've got work to do!",
          jpSub: "オッケー！冒険の始まりだ！",
          jpAudio: "オッケー！ぼうけんのはじまりだ！",
          animation: "idle",
          moodIcon: "💪",
          playAudio: false
        }
      ],

      TASK_DELETED: [
        {
          text: "Eh? We'll get it next time! No worries!",
          jpSub: "まあいいさ！次で取り返そうぜ！",
          jpAudio: "まあいいさ！つぎでとりかえそうぜ！",
          animation: "idle",
          moodIcon: "🍃",
          playAudio: false
        },
        {
          text: "Regroup and recharge! We keep moving!",
          jpSub: "作戦変更だな！前を向いて行こう！",
          jpAudio: "さくせんへんこうだな！まえをむいていこう！",
          animation: "idle",
          moodIcon: "✨",
          playAudio: false
        }
      ],

      TASK_UNCOMPLETED: [
        {
          text: "Round two? Let's crush it again!",
          jpSub: "もう一回やるか？受けて立つぜ！",
          jpAudio: "もういっかいやるか？うけてたつぜ！",
          animation: "idle",
          moodIcon: "🔄",
          playAudio: false
        }
      ],

      ACTIVITY_CREATED: [
        {
          text: "New territory unlocked! Let's conquer it!",
          jpSub: "新しい島を見つけたぞ！冒険だ！",
          jpAudio: "あたらしいしまをみつけたぞ！ぼうけんだ！",
          animation: "bounce",
          moodIcon: "🗺️",
          playAudio: false
        }
      ],

      NO_TASKS: [
        {
          text: "Nothing planned today? Come on, let's make a mission!",
          jpSub: "今日予定なしか？冒険に出ようぜ！",
          jpAudio: "きょうよていなしか？ぼうけんにでようぜ！",
          animation: "idle",
          moodIcon: "🌸",
          playAudio: false
        }
      ],

      TALK: [
        {
          text: "Ready for today's adventure? Let's get stronger!",
          jpSub: "今日の冒険の準備はいいか？強くなろう！",
          jpAudio: "きょうのぼうけんのじゅんびはいいか？",
          animation: "excited",
          moodIcon: "💪",
          playAudio: true
        },
        {
          text: "Hungry for progress? Eat well, study hard!",
          jpSub: "腹減ったなー！しっかり食べて頑張ろう！",
          jpAudio: "はらへったなー！しっかりたべてがんばろう！",
          animation: "bounce",
          moodIcon: "🍖",
          playAudio: true
        },
        {
          text: "I believe in you! We're gonna reach the summit!",
          jpSub: "お前ならやれる！てっぺん目指すぞ！",
          jpAudio: "おまえならやれる！てっぺんめざすぞ！",
          animation: "celebrate",
          moodIcon: "👑",
          playAudio: true
        },
        {
          text: "Never give up! One step at a time moves you forward!",
          jpSub: "諦めるなよ！一歩ずつ進めばいいんだ！",
          jpAudio: "あきらめるなよ！いっぽずつすすめばいいんだ！",
          animation: "idle",
          moodIcon: "✦",
          playAudio: true
        },
        {
          text: "What's our next goal? I'm ready whenever you are!",
          jpSub: "次の目標は？いつでもついて行くぜ！",
          jpAudio: "つぎのもくひょうは？いつでもついていくぜ！",
          animation: "bounce",
          moodIcon: "⚡",
          playAudio: true
        },
        {
          text: "Discipline plus passion equals victory! Let's go!",
          jpSub: "気合と情熱で全部乗り越えるぞ！",
          jpAudio: "きあいとじょうねつでぜんぶのりこえるぞ！",
          animation: "excited",
          moodIcon: "🔥",
          playAudio: true
        }
      ]
    }
  };

  // ============================================================
  // Audio Engine: Web Speech API & Web Audio Synthesizer
  // ============================================================

  const audio = {
    audioCtx: null,
    japaneseVoice: null,
    voiceCooldownUntil: 0,

    init() {
      // Setup Web Speech API voice picker
      if ('speechSynthesis' in window) {
        this.loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    },

    loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      // Find generic energetic Japanese anime-style voice
      this.japaneseVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')) || null;
    },

    getAudioContext() {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    },

    // Synthesize charming anime chime / fanfare using Web Audio API
    playChime(type = 'chime') {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        if (type === 'fanfare') {
          // Energetic 4-note anime triumph arpeggio (C5 -> E5 -> G5 -> C6)
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.18, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
          });
        } else if (type === 'pop') {
          // Cute speech bubble pop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else {
          // Standard pleasant task chime
          const notes = [659.25, 880.00];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);

            gain.gain.setValueAtTime(0.15, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.25);
          });
        }
      } catch (e) {
        // Audio synthesis fallback silent
      }
    },

    // Speak Japanese text via Web Speech API
    speak(japaneseText, force = false) {
      if (!companion.memory.voiceEnabled) return;
      if (!('speechSynthesis' in window)) return;

      const now = Date.now();
      // Cooldown of 2.8 seconds between voice lines to avoid audio overlap
      if (!force && now < this.voiceCooldownUntil) {
        return;
      }
      this.voiceCooldownUntil = now + 2800;

      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(japaneseText);
        utterance.lang = COMPANION_PERSONALITY.voiceSettings.lang;
        utterance.pitch = COMPANION_PERSONALITY.voiceSettings.pitch;
        utterance.rate = COMPANION_PERSONALITY.voiceSettings.rate;
        utterance.volume = COMPANION_PERSONALITY.voiceSettings.volume;

        if (this.japaneseVoice) {
          utterance.voice = this.japaneseVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }
  };

  // ============================================================
  // Companion Manager Object
  // ============================================================

  const companion = {
    personality: COMPANION_PERSONALITY,
    isPanelOpen: false,
    typingTimer: null,
    currentFullText: '',
    hasGreetedSession: false,
    tasksSessionCompleted: 0,

    memory: {
      tasksCompletedTotal: 0,
      tasksCompletedToday: 0,
      tasksCreatedTotal: 0,
      firstTaskTodayCompleted: false,
      lastActiveDate: '',
      voiceEnabled: false
    },

    // Initialize Video Flow: Welcome back (last 10s) -> Seamless Dual-Buffer Idle Loop
    initVideos() {
      const welcomeVideo = document.getElementById('luffyWelcomeVideo');
      const idleVideoA = document.getElementById('luffyIdleVideoA') || document.getElementById('luffyIdleVideo');
      const idleVideoB = document.getElementById('luffyIdleVideoB');

      if (!welcomeVideo || !idleVideoA) return;

      // Ensure 100% muted to comply with browser autoplay policy and user requirement
      [welcomeVideo, idleVideoA, idleVideoB].forEach(v => {
        if (v) {
          v.muted = true;
          v.volume = 0;
          if (typeof v.setAttribute === 'function') {
            v.setAttribute('muted', '');
            v.setAttribute('playsinline', '');
          }
        }
      });

      // If the welcome video duration is longer than 15s (e.g. 30s version), skip to last 10s
      const ensureLast10s = () => {
        if (welcomeVideo.duration && welcomeVideo.duration > 15) {
          welcomeVideo.currentTime = welcomeVideo.duration - 10;
        }
      };

      if (typeof welcomeVideo.addEventListener === 'function') {
        welcomeVideo.addEventListener('loadedmetadata', ensureLast10s);
      }

      let activeIdle = idleVideoA;
      let isTransitioning = false;
      let loopCheckInterval = null;

      // Prime inactive buffer to be ready at time 0 so it plays with zero seek lag
      const primeBuffer = (video) => {
        if (!video) return;
        try {
          video.currentTime = 0;
          if (typeof video.pause === 'function') {
            video.pause();
          }
        } catch (_) {}
      };

      // Seamless dual-buffer cross-fade between idleVideoA and idleVideoB
      const crossfadeIdle = () => {
        if (isTransitioning || !idleVideoB) return;
        isTransitioning = true;

        const current = activeIdle;
        const next = (current === idleVideoA) ? idleVideoB : idleVideoA;

        // Start next video playback immediately from pre-seeked time 0
        if (typeof next.play === 'function') {
          const playPromise = next.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }

        // Place next buffer on top (z-index: 4) and fade in smoothly
        if (next.classList && typeof next.classList.add === 'function') {
          next.classList.remove('active');
          next.classList.add('incoming');
        }

        // Current video stays fully visible underneath at opacity: 1 (z-index: 3)
        // After crossfade finishes (350ms), promote next buffer and retire previous
        setTimeout(() => {
          if (next.classList && typeof next.classList.add === 'function') {
            next.classList.add('active');
            next.classList.remove('incoming');
          }

          if (current.classList && typeof current.classList.remove === 'function') {
            current.classList.remove('active');
            current.classList.remove('incoming');
          }

          if (typeof current.pause === 'function') {
            current.pause();
          }

          // Immediately rewind retired video to 0 so it's fully pre-buffered for the next cycle
          primeBuffer(current);

          activeIdle = next;
          isTransitioning = false;
        }, 360);
      };

      // Setup seamless dual-buffer loop between idleVideoA and idleVideoB
      const setupPerfectIdleLoop = () => {
        if (!idleVideoB) {
          idleVideoA.loop = true;
          if (typeof idleVideoA.play === 'function') {
            idleVideoA.play().catch(() => {});
          }
          return;
        }

        // Loop attributes false so we control the seamless swap without default browser hitch
        idleVideoA.loop = false;
        idleVideoB.loop = false;

        // Prime idleVideoB while idleVideoA is playing
        primeBuffer(idleVideoB);

        // Crossfade 0.35s before end of current clip
        const DISSOLVE_TIME = 0.35;

        const checkLoopTick = () => {
          if (!activeIdle || isTransitioning) return;
          if (activeIdle.duration && activeIdle.duration > 0) {
            const remaining = activeIdle.duration - activeIdle.currentTime;
            if (remaining <= DISSOLVE_TIME) {
              crossfadeIdle();
            }
          }
        };

        if (loopCheckInterval) clearInterval(loopCheckInterval);
        loopCheckInterval = setInterval(checkLoopTick, 35);

        // Fail-safe listeners: if timeupdate or ended fires, ensure crossfade triggers
        [idleVideoA, idleVideoB].forEach(v => {
          if (v && typeof v.addEventListener === 'function') {
            v.addEventListener('ended', () => {
              if (v === activeIdle && !isTransitioning) {
                crossfadeIdle();
              }
            });
            v.addEventListener('timeupdate', () => {
              if (v === activeIdle && !isTransitioning && v.duration && v.duration > 0) {
                const rem = v.duration - v.currentTime;
                if (rem <= DISSOLVE_TIME) {
                  crossfadeIdle();
                }
              }
            });
          }
        });
      };

      let switched = false;

      const switchToIdle = () => {
        if (switched) return;
        switched = true;

        // Ensure idle video A is ready and playing smoothly
        idleVideoA.currentTime = 0;
        if (typeof idleVideoA.play === 'function') {
          const playPromise = idleVideoA.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }

        // Fade in idle video A on top without removing welcome video immediately
        if (idleVideoA.classList && typeof idleVideoA.classList.add === 'function') {
          idleVideoA.classList.add('incoming');
        }

        // Cleanly switch over after transition completes
        setTimeout(() => {
          if (idleVideoA.classList && typeof idleVideoA.classList.add === 'function') {
            idleVideoA.classList.add('active');
            idleVideoA.classList.remove('incoming');
          }

          if (welcomeVideo.classList && typeof welcomeVideo.classList.remove === 'function') {
            welcomeVideo.classList.remove('active');
          }

          if (typeof welcomeVideo.pause === 'function') {
            welcomeVideo.pause();
          }

          // Start perfect continuous looping
          setupPerfectIdleLoop();
        }, 360);
      };

      if (typeof welcomeVideo.addEventListener === 'function') {
        // When welcome video ends, seamlessly switch to idle loop
        welcomeVideo.addEventListener('ended', switchToIdle);

        // Safety sync: if timeupdate reaches within 0.25s of the end, trigger transition
        welcomeVideo.addEventListener('timeupdate', () => {
          if (welcomeVideo.duration && welcomeVideo.currentTime >= welcomeVideo.duration - 0.25) {
            switchToIdle();
          }
        });

        // Error fallback
        welcomeVideo.addEventListener('error', switchToIdle);
      }

      // Preload idle videos immediately if supported
      if (typeof idleVideoA.load === 'function') idleVideoA.load();
      if (idleVideoB && typeof idleVideoB.load === 'function') idleVideoB.load();

      // Start welcome video playback
      if (typeof welcomeVideo.play === 'function') {
        const startPromise = welcomeVideo.play();
        if (startPromise !== undefined) {
          startPromise.catch(() => {
            switchToIdle();
          });
        }
      }
    },

    init() {
      this.loadMemory();
      audio.init();
      this.initVideos();
      this.updateStatsUI();
      this.updateVoiceToggleUI();

      // Trigger initial greeting once on session start
      setTimeout(() => {
        if (!this.hasGreetedSession) {
          this.react('APP_OPENED');
          this.hasGreetedSession = true;
        }
      }, 650);
    },

    // Load character memory from localStorage
    loadMemory() {
      const today = this.getTodayDateString();
      try {
        const stored = localStorage.getItem(STORAGE_KEY_COMPANION);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.memory = Object.assign(this.memory, parsed);

          // Force sound muted per user instruction
          this.memory.voiceEnabled = false;

          // Reset daily counters if date has changed
          if (this.memory.lastActiveDate !== today) {
            this.memory.tasksCompletedToday = 0;
            this.memory.firstTaskTodayCompleted = false;
            this.memory.lastActiveDate = today;
            this.saveMemory();
          }
        } else {
          this.memory.voiceEnabled = false;
          this.memory.lastActiveDate = today;
          this.saveMemory();
        }
      } catch (e) {
        console.error('Failed to load companion memory:', e);
      }
    },

    saveMemory() {
      try {
        localStorage.setItem(STORAGE_KEY_COMPANION, JSON.stringify(this.memory));
      } catch (e) {
        console.error('Failed to save companion memory:', e);
      }
    },

    getTodayDateString() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    // ============================================================
    // Core Event Reaction System
    // ============================================================

    react(eventType, data = {}) {
      const dialogues = this.personality.dialogues;
      let pool = dialogues[eventType] || dialogues.TALK;
      let specialCelebration = false;

      switch (eventType) {
        case 'APP_OPENED':
          pool = dialogues.APP_OPENED;
          break;

        case 'TASK_COMPLETED':
          this.memory.tasksCompletedTotal += 1;
          this.memory.tasksCompletedToday += 1;
          this.tasksSessionCompleted += 1;

          // Check for milestones
          if (!this.memory.firstTaskTodayCompleted) {
            this.memory.firstTaskTodayCompleted = true;
            pool = dialogues.FIRST_TASK_COMPLETED;
          } else if (this.tasksSessionCompleted === 5 || this.memory.tasksCompletedToday === 5) {
            pool = dialogues.STREAK_5;
            specialCelebration = true;
          } else if (this.tasksSessionCompleted === 3 || this.memory.tasksCompletedToday === 3) {
            pool = dialogues.STREAK_3;
          } else {
            pool = dialogues.TASK_COMPLETED;
          }

          this.saveMemory();
          this.updateStatsUI();

          // Audio chime
          audio.playChime(specialCelebration ? 'fanfare' : 'chime');
          break;

        case 'ALL_TODAY_TASKS_COMPLETED':
          pool = dialogues.ALL_TODAY_TASKS_COMPLETED;
          specialCelebration = true;
          audio.playChime('fanfare');
          break;

        case 'TASK_CREATED':
          this.memory.tasksCreatedTotal += 1;
          this.saveMemory();
          pool = dialogues.TASK_CREATED;
          break;

        case 'TASK_DELETED':
          pool = dialogues.TASK_DELETED;
          break;

        case 'TASK_UNCOMPLETED':
          if (this.memory.tasksCompletedToday > 0) {
            this.memory.tasksCompletedToday -= 1;
          }
          if (this.tasksSessionCompleted > 0) {
            this.tasksSessionCompleted -= 1;
          }
          this.saveMemory();
          this.updateStatsUI();
          pool = dialogues.TASK_UNCOMPLETED;
          break;

        case 'ACTIVITY_CREATED':
          pool = dialogues.ACTIVITY_CREATED;
          break;

        case 'NO_TASKS':
          pool = dialogues.NO_TASKS;
          break;

        default:
          pool = dialogues.TALK;
      }

      // Pick a random line from the selected pool
      const reaction = pool[Math.floor(Math.random() * pool.length)];
      if (!reaction) return;

      // Animate character
      this.animate(reaction.animation || 'bounce');

      // Update Mood Badge
      const moodEl = document.getElementById('characterMoodBadge');
      if (moodEl) moodEl.textContent = reaction.moodIcon || '⚡';

      // Typewriter Speech Bubble
      this.displayDialogue(reaction.text, reaction.jpSub);

      // Play Japanese voice if configured and enabled
      if (reaction.playAudio && reaction.jpAudio) {
        audio.speak(reaction.jpAudio);
      }

      // Trigger Confetti Celebration if applicable
      if (reaction.bigCelebration || specialCelebration) {
        this.triggerCelebrationParticles();
      }
    },

    // ============================================================
    // Speech Bubble & Typewriter Effect
    // ============================================================

    displayDialogue(englishText, japaneseSub = '') {
      const bubble = document.getElementById('speechBubble');
      const textEl = document.getElementById('speechText');
      const subEl = document.getElementById('speechJpSub');
      if (!textEl || !bubble) return;

      // Reset previous typing animation
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }

      this.currentFullText = englishText;
      textEl.textContent = '';
      if (subEl) subEl.textContent = japaneseSub;

      // Bubble pop animation
      bubble.classList.remove('pop-anim');
      void bubble.offsetWidth; // Force reflow
      bubble.classList.add('pop-anim');
      audio.playChime('pop');

      // Typewriter effect (smooth 22ms per char)
      let idx = 0;
      this.typingTimer = setInterval(() => {
        if (idx < englishText.length) {
          textEl.textContent += englishText[idx];
          idx++;
        } else {
          clearInterval(this.typingTimer);
          this.typingTimer = null;
        }
      }, 22);
    },

    skipTyping() {
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
        const textEl = document.getElementById('speechText');
        if (textEl && this.currentFullText) {
          textEl.textContent = this.currentFullText;
        }
      }
    },

    // ============================================================
    // Character Animations
    // ============================================================

    animate(type = 'bounce') {
      const avatar = document.getElementById('characterAvatarWrapper');
      if (!avatar) return;

      avatar.classList.remove('anim-bounce', 'anim-excited', 'anim-celebrate', 'anim-shake');
      void avatar.offsetWidth; // Trigger reflow

      switch (type) {
        case 'bounce':
          avatar.classList.add('anim-bounce');
          break;
        case 'excited':
          avatar.classList.add('anim-excited');
          break;
        case 'celebrate':
          avatar.classList.add('anim-celebrate');
          break;
        case 'surprised':
          avatar.classList.add('anim-shake');
          break;
        default:
          avatar.classList.add('anim-bounce');
      }
    },

    // Big Celebration Confetti / Sparkles
    triggerCelebrationParticles() {
      const aura = document.getElementById('characterAura');
      if (!aura) return;

      aura.innerHTML = '';
      const symbols = ['✦', '✨', '🌸', '⭐', '🎉', '⚡'];
      for (let i = 0; i < 16; i++) {
        const particle = document.createElement('span');
        particle.className = 'companion-particle';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const x = (Math.random() - 0.5) * 180;
        const y = -Math.random() * 120 - 40;
        particle.style.setProperty('--dx', `${x}px`);
        particle.style.setProperty('--dy', `${y}px`);
        particle.style.left = `${50 + (Math.random() - 0.5) * 40}%`;
        particle.style.top = `${60}%`;
        particle.style.animationDelay = `${Math.random() * 0.25}s`;

        aura.appendChild(particle);
        setTimeout(() => {
          if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 1800);
      }
    },

    // Talk button trigger
    talk() {
      this.react('TALK');
    },

    // Voice toggle
    toggleVoice() {
      this.memory.voiceEnabled = !this.memory.voiceEnabled;
      this.saveMemory();
      this.updateVoiceToggleUI();
      if (this.memory.voiceEnabled) {
        audio.speak('声、オンだぜ！'); // "Voice is on!"
      }
    },

    updateVoiceToggleUI() {
      const icon = document.getElementById('voiceIcon');
      const btn = document.getElementById('btnVoiceToggle');
      if (icon) {
        icon.textContent = this.memory.voiceEnabled ? '🔊' : '🔇';
      }
      if (btn) {
        btn.setAttribute('title', this.memory.voiceEnabled ? 'Mute Partner Voice' : 'Unmute Partner Voice');
        btn.classList.toggle('muted', !this.memory.voiceEnabled);
      }
    },

    // Update stats bar UI
    updateStatsUI() {
      const todayEl = document.getElementById('cstatCompletedToday');
      const totalEl = document.getElementById('cstatCompletedTotal');
      const energyEl = document.getElementById('cstatEnergyFill');

      if (todayEl) todayEl.textContent = this.memory.tasksCompletedToday;
      if (totalEl) totalEl.textContent = this.memory.tasksCompletedTotal;

      // Energy bar fill (scales with daily progress up to 5 tasks)
      if (energyEl) {
        const percent = Math.min(100, Math.max(15, this.memory.tasksCompletedToday * 20));
        energyEl.style.width = `${percent}%`;
      }
    },

    // Mobile / Collapsible Panel Toggle
    togglePanel(forceState) {
      const panel = document.getElementById('companionPanel');
      if (!panel) return;

      if (typeof forceState === 'boolean') {
        this.isPanelOpen = forceState;
      } else {
        this.isPanelOpen = !this.isPanelOpen;
      }

      panel.classList.toggle('open', this.isPanelOpen);

      const floatBtn = document.getElementById('floatingCompanionBtn');
      if (floatBtn) {
        floatBtn.classList.toggle('active', this.isPanelOpen);
      }
    }
  };

  // Expose to window for UI inline handlers & application calls
  window.companion = companion;

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => companion.init());
  } else {
    companion.init();
  }
})();

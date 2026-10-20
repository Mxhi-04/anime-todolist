# ☠️ One Piece Todo & Mission Log | Grand Line Dashboard

<div align="center">

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Set sail across the Grand Line! A feature-rich, One Piece-inspired productivity dashboard and mission log powered by an interactive anime companion, dynamic ocean stage, and modern web tech.**

[Features](#-features) • [Quick Start](#-quick-start) • [Interactive Companion](#-interactive-companion-engine) • [Project Structure](#-project-structure) • [License](#-license)

</div>

---

## 🌊 Overview

**One Piece Todo & Mission Log** transforms your daily tasks into an epic pirate voyage. Designed with vibrant dark-mode anime aesthetics, authentic Japanese typography accents, and rich animations, this dashboard keeps you motivated as you conquer your daily goals and sail toward becoming the "Pirate King" of productivity.

---

## ✨ Features

### 🏴‍☠️ Straw Hat Companion Engine
- **Animated Luffy Study Partner**: An energetic anime companion who reacts dynamically to your actions (task completions, adding quests, streak milestones).
- **Dual-Language Dialogue**: Interactive speech bubbles with English dialogue, Japanese kanji/kana subtitles (*海賊王に、おれはなる！*), and audio voice synthesis.
- **Multiple Reaction States**: Reacts with excited celebrations, motivational boosts, focused study modes, and idle animations.

### ⛵ Thousand Sunny Ocean Horizon Stage
- **Animated Ocean Waves**: Layered SVG cartoon waves and drifting surface wavelets.
- **Grand Line Night Sky**: Dynamic backdrop featuring crescent moon aura, twinkling stars, and anime drifting clouds.
- **Sailing Thousand Sunny**: The iconic ship sails gracefully across your dashboard header.

### 📋 Mission & Task Management
- **Multiple Dashboard Views**: 
  - 🏠 **Dashboard**: High-level overview, quick stats, active missions, and crew status.
  - 📅 **Today's Tasks**: Focused view of missions due today with progress badges.
  - 📋 **All Tasks**: Master mission log with search, filters, and priority sorting.
  - 🗓️ **Date & Calendar Views**: Organize and inspect missions across specific dates.
- **Custom Activity Categories**: Group tasks by custom activities with personalized icons, colors, and badges.
- **Local Persistence**: All tasks, completed history, activities, and companion settings are saved seamlessly in `localStorage`.

### ⚔️ Pirate Crew Aesthetics & Features
- **Crew Jolly Roger Flags**: Interactive crests for Straw Hat crew members (Luffy, Zoro, Nami, Usopp, Sanji, Chopper, Robin, Franky, Brook, Jinbe).
- **"Pirate's Code" Motivational Quotes**: Curated anime wisdom and growth mindset quotes with Japanese translations.
- **Live Clock & Calendar**: Real-time Grand Line time and date display in the sidebar.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mxhi-04/anime-todolist.git
   cd anime-todolist
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

4. **Open in your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173) to start your adventure!

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5 & CSS3** | Semantic structure, custom dark-mode anime styling, glassmorphism, keyframe animations |
| **Vanilla JavaScript** | Modular core logic, task state management, audio synthesis, and companion reactions |
| **Vite** | Blazing-fast development server with Hot Module Replacement (HMR) |
| **Web Speech API** | Japanese speech synthesis for companion voice lines |
| **Google Fonts** | *Plus Jakarta Sans* & *Zen Maru Gothic* for Japanese accents |

---

## 📂 Project Structure

```text
anime-todolist/
├── assets/                  # Images, banners, videos, crew flags & icons
│   ├── calendar_themes/     # Theme artwork for calendar views
│   ├── companion/           # Luffy companion video loops & idle assets
│   ├── flags/               # Straw Hat Jolly Roger crew flags (SVG)
│   └── ...
├── companion.js             # Interactive anime study partner engine
├── index.html               # Main dashboard layout & ocean stage markup
├── script.js                # Task management, views, filtering & persistence
├── style.css                # Anime UI design system, animations & styling
├── test_app.js              # Unit and feature tests
├── package.json             # NPM scripts and devDependencies
├── .gitignore               # Ignored files (node_modules, dist, etc.)
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## 📜 Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Starts the Vite dev server at `http://localhost:5173` |
| `npm start` | Alias for `npm run dev` |
| `npm run build` | Builds production-ready static assets to `dist/` |
| `npm run preview` | Previews the production build locally |

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## ⚓ Acknowledgements & Disclaimer

- Inspired by **Eiichiro Oda** and the legendary world of **One Piece** (Toei Animation / Shueisha).
- Built with ❤️ for productivity enthusiasts and anime fans worldwide.

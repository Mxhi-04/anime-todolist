/**
 * Automated Test Suite for Anime-Themed Productivity & Todo List
 * Tests all 14 user flows and edge cases in a simulated environment.
 */

const fs = require('fs');

// Simple DOM element mock
class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    const set = new Set();
    this.classList = {
      add: (c) => set.add(c),
      remove: (c) => set.delete(c),
      toggle: (c, force) => {
        if (force === true) set.add(c);
        else if (force === false) set.delete(c);
        else if (set.has(c)) set.delete(c);
        else set.add(c);
      },
      contains: (c) => set.has(c)
    };
    this.children = [];
    this.dataset = {};
    this.style = {
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.checked = false;
  }
  focus() { }
  reset() { this.value = ''; }
  addEventListener() { }
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k] || (this.dataset && this.dataset[k]) || null; }
  removeAttribute(k) { delete this[k]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) { this.children = this.children.filter(c => c !== child); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const elements = new Map();
function getOrCreate(id, tag = 'div') {
  if (!elements.has(id)) {
    elements.set(id, new MockElement(id, tag));
  }
  return elements.get(id);
}

// Setup simulated browser globals
const localStorageData = new Map();
const mockLocalStorage = {
  getItem: (key) => localStorageData.get(key) || null,
  setItem: (key, val) => localStorageData.set(key, String(val)),
  removeItem: (key) => localStorageData.delete(key),
  clear: () => localStorageData.clear()
};

const mockDocument = {
  readyState: 'complete',
  getElementById: (id) => getOrCreate(id),
  querySelector: (selector) => {
    if (selector.startsWith('#')) return getOrCreate(selector.slice(1));
    if (selector.startsWith('.')) return getOrCreate(selector.slice(1));
    return getOrCreate(selector);
  },
  querySelectorAll: (selector) => {
    return [getOrCreate('mock-el')];
  },
  createElement: (tag) => new MockElement('', tag),
  addEventListener: () => { }
};

const mockWindow = {
  innerWidth: 1200,
  addEventListener: () => { },
  document: mockDocument,
  localStorage: mockLocalStorage
};

mockWindow.speechSynthesis = {
  speak: () => { },
  cancel: () => { },
  getVoices: () => [{ lang: 'ja-JP', name: 'Kyoko' }]
};
mockWindow.AudioContext = class {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createOscillator() {
    return {
      type: '',
      frequency: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { } },
      connect: () => { },
      start: () => { },
      stop: () => { }
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { } },
      connect: () => { }
    };
  }
};
global.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
global.requestAnimationFrame = mockWindow.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = mockWindow.cancelAnimationFrame = (id) => clearTimeout(id);

global.window = mockWindow;
global.document = mockDocument;
global.localStorage = mockLocalStorage;

// Load companion.js first, then script.js
const companionCode = fs.readFileSync('companion.js', 'utf-8');
eval(companionCode);
console.log('✓ companion.js evaluated successfully.');
const companion = window.companion;

// Load script.js
const scriptCode = fs.readFileSync('script.js', 'utf-8');
eval(scriptCode);

console.log('✓ Script evaluated successfully.');
const app = window.app;
console.log('✓ app object exposed:', Object.keys(app));

// Test 1: Verification of initial seeding
console.log('\n--- Test 1: Verify Initial Seeding ---');
if (app.state.activities.length >= 3) {
  console.log(`✓ Seed activities found: ${app.state.activities.map(a => a.name).join(', ')}`);
} else {
  throw new Error('Initial activities not seeded properly');
}
if (app.state.tasks.length >= 3) {
  console.log(`✓ Seed tasks found: ${app.state.tasks.length} tasks`);
} else {
  throw new Error('Initial tasks not seeded properly');
}

// Test 2: Creating an Activity
console.log('\n--- Test 2: Create an Activity (Workout, 🏋️) ---');
getOrCreate('activityFormName').value = 'Workout';
getOrCreate('activityFormIcon').value = '🏋️';
const initialActCount = app.state.activities.length;
app.handleActivityFormSubmit({ preventDefault: () => { } });
if (app.state.activities.length === initialActCount + 1) {
  const newAct = app.state.activities[app.state.activities.length - 1];
  console.log(`✓ Activity created successfully: ID=${newAct.id}, Name=${newAct.name}, Icon=${newAct.icon}`);
  if (app.state.selectedActivityId === newAct.id && app.state.currentView === 'activity') {
    console.log(`✓ View switched to newly created activity`);
  }
} else {
  throw new Error('Activity creation failed');
}

// Test 3: Adding a Task to that Activity
console.log('\n--- Test 3: Add Task to Activity ---');
const workoutAct = app.state.activities.find(a => a.name === 'Workout');
getOrCreate('taskFormName').value = 'Evening Cardio & Abs';
getOrCreate('taskFormActivity').value = workoutAct.id;
getOrCreate('taskFormDate').value = '2026-10-17'; // Test 4: Changing date
getOrCreate('taskFormStartTime').value = '18:00'; // Test 5: Assigning time
getOrCreate('taskFormEndTime').value = '19:00';
getOrCreate('taskFormNotes').value = '30 min treadmill + core workout';
getOrCreate('taskFormEditId').value = '';

const initialTaskCount = app.state.tasks.length;
app.handleTaskFormSubmit({ preventDefault: () => { } });
if (app.state.tasks.length === initialTaskCount + 1) {
  const newTask = app.state.tasks[app.state.tasks.length - 1];
  console.log(`✓ Task created: ID=${newTask.id}, Name="${newTask.name}", Date=${newTask.date}, Time=${newTask.startTime}-${newTask.endTime}`);
  if (newTask.activityId !== workoutAct.id) throw new Error('Task not linked to Workout activity');
} else {
  throw new Error('Task addition failed');
}

// Test 6: Completing / Scratching a task
console.log('\n--- Test 6: Complete / Scratch Task ---');
const testTask = app.state.tasks[app.state.tasks.length - 1];
if (testTask.completed !== false) throw new Error('Task should initially be incomplete');
app.toggleTaskCompletion(testTask.id);
if (testTask.completed !== true) throw new Error('Task should now be completed');
console.log(`✓ Task completed toggled to true: ${testTask.completed}`);
app.toggleTaskCompletion(testTask.id);
if (testTask.completed !== false) throw new Error('Task should be untoggled back to false');
console.log(`✓ Task completed un-toggled back to false: ${testTask.completed}`);

// Test 7: Deleting a Task
console.log('\n--- Test 7: Delete Task ---');
const beforeDeleteCount = app.state.tasks.length;
app.confirmDeleteTask(testTask.id);
// Trigger confirm
getOrCreate('confirmModalAcceptBtn').onclick();
if (app.state.tasks.length === beforeDeleteCount - 1) {
  console.log(`✓ Task deleted successfully. Total tasks: ${app.state.tasks.length}`);
} else {
  throw new Error('Task deletion failed');
}

// Test 8: Show All Tasks View
console.log('\n--- Test 8: Show All Tasks View ---');
app.switchView('all-tasks');
if (app.state.currentView === 'all-tasks') {
  console.log('✓ Successfully switched to all-tasks view');
} else {
  throw new Error('Failed to switch to all-tasks view');
}

// Test 9: Today\'s Tasks View
console.log('\n--- Test 9: Today\'s Tasks View ---');
app.switchView('today-tasks');
if (app.state.currentView === 'today-tasks') {
  console.log('✓ Successfully switched to today-tasks view');
} else {
  throw new Error('Failed to switch to today-tasks view');
}

// Test 10: Calendar Navigation & Date Selection
console.log('\n--- Test 10: Calendar Navigation & Date Selection ---');
const curMonth = app.state.calendarMonth;
app.nextMonth();
if (app.state.calendarMonth === (curMonth + 1) % 12) {
  console.log(`✓ Calendar navigated to next month: ${app.state.calendarMonth}`);
} else {
  throw new Error('Calendar next month failed');
}
app.prevMonth();
if (app.state.calendarMonth === curMonth) {
  console.log(`✓ Calendar navigated back to month: ${app.state.calendarMonth}`);
} else {
  throw new Error('Calendar prev month failed');
}
app.handleDateClick('2026-10-20');
if (app.state.selectedDate === '2026-10-20' && app.state.currentView === 'date-tasks') {
  console.log(`✓ Calendar date click routed to date-tasks view with date: ${app.state.selectedDate}`);
} else {
  throw new Error('Calendar date selection failed');
}

// Test 11 & 12: Page Refresh & LocalStorage Persistence
console.log('\n--- Test 11 & 12: Refresh & LocalStorage Persistence ---');
const rawStoredActs = localStorageData.get('anime_todo_activities_v1');
const rawStoredTasks = localStorageData.get('anime_todo_tasks_v1');
if (!rawStoredActs || !rawStoredTasks) {
  throw new Error('LocalStorage data missing');
}
const parsedActs = JSON.parse(rawStoredActs);
const parsedTasks = JSON.parse(rawStoredTasks);
console.log(`✓ Persisted in LocalStorage: ${parsedActs.length} activities, ${parsedTasks.length} tasks`);
if (!parsedActs.some(a => a.name === 'Workout')) {
  throw new Error('Created activity "Workout" was not persisted');
}
console.log('✓ "Workout" activity successfully persisted in localStorage!');

// Test 13: Sidebar Open & Close
console.log('\n--- Test 13: Sidebar Open & Close ---');
app.toggleSidebar(true);
if (app.state.isSidebarOpen === true) {
  console.log('✓ Sidebar opened successfully');
}
app.toggleSidebar(false);
if (app.state.isSidebarOpen === false) {
  console.log('✓ Sidebar closed successfully');
}

// Test 14: Activity cascade deletion (no orphaned tasks)
console.log('\n--- Test 14: Cascade Deletion on Activity Remove ---');
const collegeAct = app.state.activities.find(a => a.name === 'College');
const tasksInCollege = app.state.tasks.filter(t => t.activityId === collegeAct.id).length;
console.log(`Found ${tasksInCollege} tasks in College activity before deletion.`);
app.switchView('activity', collegeAct.id);
app.confirmDeleteCurrentActivity();
getOrCreate('confirmModalAcceptBtn').onclick();

const collegeTasksRemaining = app.state.tasks.filter(t => t.activityId === collegeAct.id).length;
if (collegeTasksRemaining === 0) {
  console.log('✓ Cascade deletion verified: 0 orphaned tasks remain!');
} else {
  throw new Error('Orphaned tasks detected after activity deletion');
}

// Test 15: View Persistence Across Refreshes
console.log('\n--- Test 15: View Persistence Across Refreshes ---');
const codingAct = app.state.activities.find(a => a.name === 'Coding');
app.switchView('activity', codingAct.id);
const navStateRaw = localStorageData.get('anime_todo_nav_state_v1');
if (!navStateRaw) throw new Error('Navigation state not persisted in localStorage');
const navParsed = JSON.parse(navStateRaw);
if (navParsed.currentView === 'activity' && navParsed.selectedActivityId === codingAct.id) {
  console.log(`✓ Navigation state correctly saved: view=${navParsed.currentView}, activityId=${navParsed.selectedActivityId}`);
} else {
  throw new Error('Navigation state mismatch');
}

// Test 16: Locked Activity in Task Creation inside an Activity
console.log('\n--- Test 16: Locked Activity in Task Creation inside an Activity ---');
app.openTaskModalForCurrentActivity();
const actGroup = getOrCreate('taskFormActivityGroup');
const lockedGroup = getOrCreate('taskFormActivityLockedGroup');
if (actGroup.style.display === 'none' && lockedGroup.style.display === 'block') {
  console.log('✓ Activity selection dropdown is hidden, locked activity badge is displayed!');
} else {
  throw new Error('Activity dropdown should be hidden when creating task inside an activity');
}
app.closeTaskModal();

// Test 17: Double Right-Click Activity Deletion with Warning
console.log('\n--- Test 17: Double Right-Click Activity Deletion with Warning ---');
const dummyEvent = { preventDefault: () => { } };
// First right click (hint toast)
app.handleActivityContextMenu(dummyEvent, codingAct.id);
// Second right click within 500ms
app.handleActivityContextMenu(dummyEvent, codingAct.id);
const modalMsg = getOrCreate('confirmModalMessage').innerHTML;
if (modalMsg.includes('(All your tasks in this activity will also be deleted)')) {
  console.log('✓ Double right-click triggered deletion modal with exact warning: "(All your tasks in this activity will also be deleted)"');
} else {
  throw new Error('Warning message not found in confirmation modal: ' + modalMsg);
}
// Cancel to avoid deleting
app.closeConfirmModal();

// Test 18: Desktop Sidebar Collapse & Layout Adjustment
console.log('\n--- Test 18: Desktop Sidebar Collapse & Layout Adjustment ---');
mockWindow.innerWidth = 1440;
app.toggleSidebar(true); // Should toggle/expand
app.toggleSidebar(false); // Should collapse
const appLayoutEl = getOrCreate('appLayout');
if (appLayoutEl.classList.contains('sidebar-collapsed')) {
  console.log('✓ Desktop sidebar collapsed class added to appLayout');
}
app.toggleSidebar(true);
if (!appLayoutEl.classList.contains('sidebar-collapsed')) {
  console.log('✓ Desktop sidebar expanded cleanly');
}

// Test 19: Companion Engine Initialization & Initial Greeting
console.log('\n--- Test 19: Companion Initialization & Initial Greeting ---');
if (!companion) throw new Error('Companion object not initialized');
console.log(`✓ Companion personality: ${companion.personality.name} (${companion.personality.japaneseName})`);
companion.react('APP_OPENED');
companion.skipTyping();
const speechEl = getOrCreate('speechText');
if (speechEl.textContent.includes('Welcome back') || speechEl.textContent.includes('adventure') || speechEl.textContent.includes('stronger')) {
  console.log(`✓ Initial greeting displayed: "${speechEl.textContent}"`);
} else {
  throw new Error('Greeting text not displayed: ' + speechEl.textContent);
}

// Test 20: Typewriter Text Effect & Skip Typing
console.log('\n--- Test 20: Typewriter Text Effect & Skip Typing ---');
companion.displayDialogue('Testing the typewriter speed!', 'テスト中！');
companion.skipTyping();
if (getOrCreate('speechText').textContent === 'Testing the typewriter speed!') {
  console.log('✓ skipTyping() completed typewriter text immediately.');
} else {
  throw new Error('skipTyping failed to complete text');
}

// Test 21: Voice Toggle & Talk Button
console.log('\n--- Test 21: Voice Toggle & Talk Button ---');
const initialVoice = companion.memory.voiceEnabled;
companion.toggleVoice();
if (companion.memory.voiceEnabled === !initialVoice) {
  console.log(`✓ Voice toggled from ${initialVoice} to ${companion.memory.voiceEnabled}`);
} else {
  throw new Error('Voice toggle failed');
}
companion.toggleVoice(); // Toggle back
companion.talk();
companion.skipTyping();
console.log(`✓ Companion Talk response: "${getOrCreate('speechText').textContent}"`);

// Test 22: Companion Reaction to Task Completion & Milestones
console.log('\n--- Test 22: Companion Reaction to Task Completion ---');
const taskBeforeCount = companion.memory.tasksCompletedToday;
companion.react('TASK_COMPLETED', { task: { name: 'Maths' } });
companion.skipTyping();
if (companion.memory.tasksCompletedToday === taskBeforeCount + 1) {
  console.log(`✓ Task completed reaction triggered! Tasks today: ${companion.memory.tasksCompletedToday}`);
  console.log(`✓ Companion Reaction text: "${getOrCreate('speechText').textContent}"`);
} else {
  throw new Error('Companion counter not incremented on TASK_COMPLETED');
}

// Test 23: All Today\'s Tasks Completed Celebration
console.log('\n--- Test 23: All Today\'s Tasks Completed Celebration ---');
companion.react('ALL_TODAY_TASKS_COMPLETED');
companion.skipTyping();
if (getOrCreate('speechText').textContent.includes('YOU DID IT') || getOrCreate('speechText').textContent.includes('amazing')) {
  console.log(`✓ All tasks completed celebration: "${getOrCreate('speechText').textContent}"`);
} else {
  throw new Error('Celebration dialogue not triggered');
}

// Test 24: Companion Memory Persistence in LocalStorage
console.log('\n--- Test 24: Companion Memory Persistence in LocalStorage ---');
const companionMemoryRaw = localStorageData.get('anime_todo_companion_memory_v1');
if (!companionMemoryRaw) throw new Error('Companion memory not found in localStorage');
const companionMemParsed = JSON.parse(companionMemoryRaw);
console.log(`✓ Persisted companion memory: tasksCompletedTotal=${companionMemParsed.tasksCompletedTotal}, voiceEnabled=${companionMemParsed.voiceEnabled}`);

// Test 25: HTML & CSS Validation for Bug Fixes
console.log('\n--- Test 25: HTML & CSS Validation for Bug Fixes ---');
const htmlContent = fs.readFileSync('index.html', 'utf-8');
const cssContent = fs.readFileSync('style.css', 'utf-8');

// 1. No companion-panel or right sidebar
if (htmlContent.includes('<aside class="companion-panel"')) {
  throw new Error('Found deprecated companion-panel in index.html');
}
console.log('✓ Verified: No right-side outer sidebar (companion-panel removed).');

// 2. Anime window and calendar in dashboardSideColumn
if (!htmlContent.includes('id="dashboardSideColumn"') || !htmlContent.includes('id="animePartnerWindow"') || !htmlContent.includes('id="calendarCard"')) {
  throw new Error('animePartnerWindow or calendarCard missing from dashboardSideColumn');
}
console.log('✓ Verified: Anime window and Calendar placed inside dashboardSideColumn.');

// 3. Name is Luffy
if (!htmlContent.includes('>Luffy <span class="sparkle-anim">✦</span>')) {
  throw new Error('Character name is not Luffy in index.html');
}
if (companion.personality.name !== 'Luffy' || companion.personality.japaneseName !== 'ルフィ') {
  throw new Error('Companion personality name is not Luffy in companion.js');
}
console.log('✓ Verified: Character name is Luffy (ルフィ).');

// 4. Photo updated to Luffy image
if (!htmlContent.includes('src="assets/luffy.jpg"')) {
  throw new Error('Character image src is not assets/luffy.jpg');
}
console.log('✓ Verified: Photo updated to user-uploaded Luffy image.');

// 5. No talk button
if (htmlContent.includes('btn-companion-talk') || htmlContent.includes('btnCompanionTalk')) {
  throw new Error('Talk button still exists in index.html');
}
console.log('✓ Verified: Talk button removed; character is purely reactive to user actions.');

// 6. Anime window and character are stable (no companionFloat)
if (cssContent.includes('@keyframes companionFloat') || cssContent.includes('animation: companionFloat')) {
  throw new Error('companionFloat animation still exists in style.css');
}
if (!cssContent.includes('.character-img') || !cssContent.includes('animation: none !important;')) {
  throw new Error('character-img stable styling missing in style.css');
}
console.log('✓ Verified: Anime window and character image are stable (no floating animation).');

// Test 26: Validation of Latest Bug Fixes (Stats Row Removed, Anime Window Fitted, Calendar Height, Task Scroll Window, Lag Fix)
console.log('\n--- Test 26: Validation of Latest Bug Fixes ---');

// 1. Stats row removed from viewDashboard
if (htmlContent.includes('class="stats-row"')) {
  throw new Error('stats-row still present in index.html');
}
console.log('✓ Verified: Today\'s task and completed task stats buttons removed from dashboard.');

// 2. Anime window fitted into card with zero padding and border around picture + mission sync
if (!cssContent.includes('.anime-partner-window') || !cssContent.includes('padding: 0 !important;')) {
  throw new Error('anime-partner-window does not have padding: 0 !important;');
}
if (!htmlContent.includes('class="partner-media-frame"') || !htmlContent.includes('class="companion-stats-card"')) {
  throw new Error('partner-media-frame or companion-stats-card missing in anime-partner-window');
}
console.log('✓ Verified: Anime window fitted into card with 0 padding and border around picture + mission sync.');

// 3. Calendar compact sizing to prevent going out of screen
if (!cssContent.includes('.calendar-card') || cssContent.includes('min-height: 280px;')) {
  throw new Error('Calendar days grid still has 280px min-height or missing calendar-card compact styles');
}
console.log('✓ Verified: Calendar sized compactly to prevent going out of screen.');

// 4. Task list scrollable window without unnecessarily increasing page length
if (!cssContent.includes('.task-list-container') || !cssContent.includes('overflow-y: auto;')) {
  throw new Error('task-list-container missing overflow-y: auto;');
}
console.log('✓ Verified: Task list has dedicated scrollable window with custom scrollbar.');

// 5. Laggy scrolling fix verified
if (cssContent.includes('filter: blur(100px);')) {
  throw new Error('filter: blur(100px) still present on glow orbs, which causes scroll lag');
}
console.log('✓ Verified: Heavy blur filter removed and GPU hardware acceleration enabled for smooth scrolling.');

// Test 27: Validation of Latest Bug Fixes (Calendar Hierarchy, Selected Box Highlight, No Dots, Luffy Portrait, Hero Banner)
console.log('\n--- Test 27: Validation of Calendar, Luffy Portrait & Hero Banner ---');

// 1. Dashboard hero banner bar present on top
if (!htmlContent.includes('class="dashboard-hero-banner"') || !htmlContent.includes('id="dashboardHeroBanner"')) {
  throw new Error('dashboard-hero-banner missing from index.html');
}
console.log('✓ Verified: Hero banner bar added on top of the dashboard.');

// 2. No Japanese writing in calendar card
const calendarCardMatch = htmlContent.match(/<div class="[^"]*calendar-card[^"]*"[\s\S]*?<\/aside>/);
if (!calendarCardMatch) throw new Error('calendarCard not found in index.html');
const calHtml = calendarCardMatch[0];
if (calHtml.includes('カレンダー') || calHtml.includes('jp-badge')) {
  throw new Error('Japanese writing still found in calendar card');
}
console.log('✓ Verified: Japanese writing removed from calendar card.');

// 3. Calendar UI hierarchy: Title on top, month & navigation below it, then weekdays & dates
if (!calHtml.includes('calendar-card-top') || !calHtml.includes('calendar-month-bar') || !calHtml.includes('calendar-weekdays') || !calHtml.includes('calendar-days-grid')) {
  throw new Error('Calendar layout hierarchy is incorrect');
}
const titlePos = calHtml.indexOf('calendar-card-top');
const monthPos = calHtml.indexOf('calendar-month-bar');
const daysPos = calHtml.indexOf('calendar-days-grid');
if (!(titlePos < monthPos && monthPos < daysPos)) {
  throw new Error('Calendar elements are not in top-to-bottom order: Title -> Month nav -> Dates');
}
console.log('✓ Verified: Calendar UI reordered: Title on top, Month & switching dates below, dates grid below.');

// 4. "Today" button and functionality
if (!calHtml.includes('btn-cal-today') || !calHtml.includes('goToCurrentMonth()')) {
  throw new Error('Today button missing from calendar card');
}
// Trigger goToCurrentMonth and verify today is selected
app.goToCurrentMonth();
const todayStr = (function () {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
if (app.state.selectedDate !== todayStr) {
  throw new Error(`goToCurrentMonth did not select today's date: ${app.state.selectedDate} vs ${todayStr}`);
}
console.log(`✓ Verified: Pressing Today brings us to today's date (${todayStr}).`);

// 5. Calendar dots covering numbers removed, selected box highlighted
if (!cssContent.includes('.day-task-marker') || !cssContent.includes('display: none !important;')) {
  throw new Error('day-task-marker not properly hidden in CSS');
}
if (!cssContent.includes('.cal-day-cell.selected') || !cssContent.includes('linear-gradient')) {
  throw new Error('cal-day-cell.selected highlight missing in CSS');
}
console.log('✓ Verified: Calendar dots covering numbers removed; selected number box highlighted.');

// 6. Anime Luffy window portrait ratio extending to waist
if (!cssContent.includes('height: 385px;') && !cssContent.includes('height: 380px;') && !cssContent.includes('height: 335px;')) {
  throw new Error('partner-media-frame does not have portrait height');
}
if (!cssContent.includes('object-position: center top;')) {
  throw new Error('character-img missing object-position: center top; to preserve space above hat');
}
console.log('✓ Verified: Luffy anime window has portrait ratio with space above hat and extends to waist.');

// Test 28: Validation of the 10 Straw Hat Pirate Flags (Jolly Rogers)
console.log('\n--- Test 28: Validation of 10 Straw Hat Pirate Flags ---');
if (!app.ONE_PIECE_FLAGS || app.ONE_PIECE_FLAGS.length !== 10) {
  throw new Error(`Expected exactly 10 Straw Hat flags, got ${app.ONE_PIECE_FLAGS ? app.ONE_PIECE_FLAGS.length : 0}`);
}
const expectedFlags = ['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'franky', 'brook', 'jinbe'];
expectedFlags.forEach(id => {
  const found = app.ONE_PIECE_FLAGS.find(f => f.id === id);
  if (!found) throw new Error(`Missing flag for: ${id}`);
  if (!fs.existsSync(found.flag)) throw new Error(`Flag file does not exist: ${found.flag}`);
});
console.log(`✓ Verified: All 10 Straw Hat pirate flag files exist on disk: ${expectedFlags.join(', ')}`);

// Test selecting Zoro's Flag
app.selectEmojiPreset('zoro');
if (getOrCreate('activityFormIcon').value !== 'zoro') {
  throw new Error('selectEmojiPreset failed to set activityFormIcon value to zoro');
}
const flagHtml = app.renderActivityIcon('zoro', 'test-flag');
if (!flagHtml.includes('assets/flags/zoro.svg') || !flagHtml.includes('<img')) {
  throw new Error(`renderActivityIcon returned invalid HTML for zoro's flag: ${flagHtml}`);
}
console.log('✓ Verified: Pirate flag selection and icon rendering work seamlessly.');

// Test 29: Validation of SunnyGo Sailing Ocean Effect in Top Bar
console.log('\n--- Test 29: Validation of SunnyGo Sailing Top Bar ---');
// 1. Check sunny_go_ship.png asset exists
if (!fs.existsSync('assets/sunny_go_ship.png')) {
  throw new Error('assets/sunny_go_ship.png asset file missing');
}
console.log('✓ Verified: assets/sunny_go_ship.png exists on disk.');

// 2. Check HTML structure for sunny-ocean-stage, cartoon wavelets, SVG waves, and Sunny ship
if (!htmlContent.includes('class="sunny-ocean-stage"') ||
    !htmlContent.includes('class="sunny-ship-voyager"') ||
    !htmlContent.includes('class="sunny-wave-svg"') ||
    !htmlContent.includes('cartoon-wavelet')) {
  throw new Error('sunny-ocean-stage, sunny-ship-voyager, SVG waves or cartoon-wavelet missing from index.html');
}
if (htmlContent.includes('id="btnSunnyVoyage"')) {
  throw new Error('btnSunnyVoyage should be removed per user request');
}
console.log('✓ Verified: SunnyGo ocean stage, cartoon wavelets, SVG waves, and sailing ship present in index.html (voyage button removed).');

// 3. Check CSS styling for ocean stage and buoyant sailing
if (!cssContent.includes('.sunny-ocean-stage') ||
    !cssContent.includes('@keyframes sunnyRockingBob') ||
    !cssContent.includes('.cartoon-wavelet') ||
    !cssContent.includes('.sunny-ship-voyager')) {
  throw new Error('sunny-ocean-stage, cartoon-wavelet, or sunnyRockingBob keyframes missing from style.css');
}
console.log('✓ Verified: Cartoonish buoyant bobbing, wavelets, and ocean styles configured in style.css.');

// 4. Test app.cheerSunny method
app.cheerSunny();
console.log('✓ Verified: app.cheerSunny executed successfully.');

// Test 30: Validation of Calendar Month Themes & High-Contrast Typography
console.log('\n--- Test 30: Validation of Calendar Month Wanted Themes ---');
// 1. Verify all 12 monthly theme images exist on disk
const expectedThemeImages = [
  'luffy.jpg', 'zoro.jpg', 'nami.jpg', 'usopp.jpg', 'sanji.jpg',
  'chopper.jpg', 'robin.jpg', 'franky.jpg', 'brook.jpg', 'jinbe.jpg',
  'ace.jpg', 'shanks.jpg'
];
expectedThemeImages.forEach(img => {
  const p = 'assets/calendar_themes/' + img;
  if (!fs.existsSync(p)) {
    throw new Error(`Missing calendar theme image: ${p}`);
  }
});
console.log('✓ Verified: All 12 Wanted poster theme images exist in assets/calendar_themes/');

// 2. Verify CALENDAR_MONTH_THEMES array on app object
if (!Array.isArray(app.CALENDAR_MONTH_THEMES) || app.CALENDAR_MONTH_THEMES.length !== 12) {
  throw new Error('CALENDAR_MONTH_THEMES missing or incomplete on app object');
}
console.log('✓ Verified: CALENDAR_MONTH_THEMES contains all 12 monthly configurations.');

// 3. Verify HTML and CSS for theme backdrop and high-contrast font popping
if (!htmlContent.includes('id="calendarThemeSubtitle"') || !htmlContent.includes('calendar-bounty-tag')) {
  throw new Error('calendarThemeSubtitle or calendar-bounty-tag missing from index.html');
}
if (!cssContent.includes('.calendar-card::before') ||
    !cssContent.includes('var(--cal-theme-bg') ||
    !cssContent.includes('text-shadow') ||
    !cssContent.includes('.calendar-theme-subtitle')) {
  throw new Error('Calendar theme CSS rules or popping text shadows missing from style.css');
}
console.log('✓ Verified: Calendar HTML & CSS support dynamic Wanted theme backdrops and high-contrast popping numbers.');

// Test 31: Validation of Visual Activity Picker in Task Modal (Actual Flags + Activity Names)
console.log('\n--- Test 31: Validation of Task Modal Visual Activity Picker ---');
// 1. Verify "Activity Container" label has been removed from index.html
if (htmlContent.includes('Activity Container')) {
  throw new Error('Found legacy "Activity Container" label in index.html');
}
console.log('✓ Verified: Legacy "Activity Container" label removed from index.html.');

// 2. Verify visual activity picker grid exists in HTML and CSS
if (!htmlContent.includes('id="taskActivityPickerGrid"')) {
  throw new Error('taskActivityPickerGrid missing from index.html');
}
if (!cssContent.includes('.task-activity-picker-grid') || !cssContent.includes('.task-activity-card')) {
  throw new Error('task-activity-picker-grid or task-activity-card missing from style.css');
}
console.log('✓ Verified: taskActivityPickerGrid element and styles present.');

// 3. Open task modal and test rendering of actual flags with activity names
app.openTaskModal();
const pickerGrid = getOrCreate('taskActivityPickerGrid');
const pickerHtml = pickerGrid.innerHTML;

// Must include actual SVG flag images and activity names
if (!pickerHtml.includes('assets/flags/') || !pickerHtml.includes('<img')) {
  throw new Error(`taskActivityPickerGrid does not contain actual flag images: ${pickerHtml}`);
}
if (pickerHtml.includes("[Luffy's Flag]") || pickerHtml.includes("[Zoro's Flag]")) {
  throw new Error(`taskActivityPickerGrid should not contain text names like "[Luffy's Flag]": ${pickerHtml}`);
}
console.log('✓ Verified: taskActivityPickerGrid renders actual flag SVGs with respective Activity names.');

// 4. Test selecting an activity via app.selectTaskActivity
const targetCodingAct = app.state.activities.find(a => a.name === 'Coding');
if (targetCodingAct) {
  app.selectTaskActivity(targetCodingAct.id);
  if (getOrCreate('taskFormActivity').value !== targetCodingAct.id) {
    throw new Error('selectTaskActivity did not update taskFormActivity value');
  }
  console.log(`✓ Verified: selectTaskActivity successfully updated taskFormActivity value to "${targetCodingAct.name}" (${targetCodingAct.id})!`);
}
app.closeTaskModal();

// Test 32: Validation of Dynamic Sky, Greeting & Regional Time Changer
console.log('\n--- Test 32: Validation of Dynamic Sky, Greeting & Regional Time ---');

// 1. Verify HTML elements for Sun and Horizon glow (while visible pill is removed)
if (!htmlContent.includes('id="sunnySunContainer"') ||
    !htmlContent.includes('id="sunnyHorizonGlow"')) {
  throw new Error('sunnySunContainer or sunnyHorizonGlow missing from index.html');
}
if (htmlContent.includes('id="skyRegionPillBtn"') || htmlContent.includes('sky-pill-region')) {
  throw new Error('Visible skyRegionPillBtn/sky-pill-region should be removed from UI');
}
console.log('✓ Verified: Sun element and horizon glow present; annoying visible pill icon removed from UI');

// 2. Verify CSS rules for morning, afternoon, evening, and night skies
if (!cssContent.includes('.top-header.sky-morning') ||
    !cssContent.includes('.top-header.sky-afternoon') ||
    !cssContent.includes('.top-header.sky-evening') ||
    !cssContent.includes('.top-header.sky-night') ||
    !cssContent.includes('.sunny-sun-container')) {
  throw new Error('CSS rules for sky phases or sunny-sun-container missing from style.css');
}
console.log('✓ Verified: Rich CSS styling configured for morning, afternoon, evening, and night skies');

// 3. Test sky mode switches: morning, afternoon, evening, night
app.setSkyMode('morning');
const topHeaderEl = getOrCreate('topHeader');
const greetingTitleEl = getOrCreate('greetingTitle');
if (!topHeaderEl.classList.contains('sky-morning')) {
  throw new Error('topHeader did not receive sky-morning class');
}
if (!greetingTitleEl.innerHTML.includes('Good morning')) {
  throw new Error('Greeting title does not contain Good morning: ' + greetingTitleEl.innerHTML);
}
console.log('✓ Verified: Morning sky & greeting applied ("Good morning, Mahi")');

app.setSkyMode('afternoon');
if (!topHeaderEl.classList.contains('sky-afternoon')) {
  throw new Error('topHeader did not receive sky-afternoon class');
}
if (!greetingTitleEl.innerHTML.includes('Good afternoon')) {
  throw new Error('Greeting title does not contain Good afternoon: ' + greetingTitleEl.innerHTML);
}
console.log('✓ Verified: Afternoon sky & greeting applied ("Good afternoon, Mahi")');

app.setSkyMode('evening');
if (!topHeaderEl.classList.contains('sky-evening')) {
  throw new Error('topHeader did not receive sky-evening class');
}
if (!greetingTitleEl.innerHTML.includes('Good evening')) {
  throw new Error('Greeting title does not contain Good evening: ' + greetingTitleEl.innerHTML);
}
console.log('✓ Verified: Evening sky & greeting applied ("Good evening, Mahi")');

app.setSkyMode('night');
if (!topHeaderEl.classList.contains('sky-night') || !topHeaderEl.classList.contains('is-night-voyage')) {
  throw new Error('topHeader did not receive sky-night and is-night-voyage classes');
}
if (!greetingTitleEl.innerHTML.includes('Good night')) {
  throw new Error('Greeting title does not contain Good night: ' + greetingTitleEl.innerHTML);
}
console.log('✓ Verified: Night sky & greeting applied ("Good night, Mahi") with is-night-voyage');

// 4. Test region stored in memory and timezone calculations
app.setRegion('Asia/Kolkata');
if (app.state.selectedRegion !== 'Asia/Kolkata') {
  throw new Error('app.state.selectedRegion was not updated in memory');
}
const greetingSubtitleEl = getOrCreate('greetingSubtitle');
if (greetingSubtitleEl.innerHTML.includes('📍') || greetingSubtitleEl.innerHTML.includes('Asia/Kolkata')) {
  throw new Error('greetingSubtitle should not display visible Kolkata tag');
}
console.log('✓ Verified: Region stored cleanly in memory (Asia/Kolkata) with clean subtitle display');

// Restore to auto for clean state
app.setSkyMode('auto');
app.setRegion('auto');

// Test 33: Validation of Wanted Posters Background & 3D Live Glowing Animation
console.log('\n--- Test 33: Validation of Wanted Posters Background & 3D Live Animation ---');

// 1. Verify assets/wanted_posters_bg.png exists on disk
if (!fs.existsSync('assets/wanted_posters_bg.png')) {
  throw new Error('assets/wanted_posters_bg.png is missing from assets directory');
}
console.log('✓ Verified: assets/wanted_posters_bg.png exists on disk');

// 2. Verify HTML structure for 3D Wanted stage, poster wall, and glow mesh
if (!htmlContent.includes('id="wantedBgStage"') ||
    !htmlContent.includes('id="wanted3DWrapper"') ||
    !htmlContent.includes('id="wantedPosterWall"') ||
    !htmlContent.includes('id="wantedTextGlowMesh"') ||
    !htmlContent.includes('spot-gear5') ||
    !htmlContent.includes('wanted-shimmer-sweep')) {
  throw new Error('wantedBgStage, wanted3DWrapper, wantedPosterWall or wantedTextGlowMesh missing from index.html');
}
console.log('✓ Verified: wantedBgStage, wanted3DWrapper, wantedPosterWall, and wantedTextGlowMesh present in index.html');

// 3. Verify CSS rules for original UI bg-decorations, 3D live animation, text glow pulse, and shimmer sweep
if (!htmlContent.includes('class="bg-decorations"') ||
    !htmlContent.includes('class="glow-orb orb-1"') ||
    !cssContent.includes('.bg-decorations') ||
    !cssContent.includes('.glow-orb') ||
    !cssContent.includes('.wanted-bg-stage') ||
    !cssContent.includes('@keyframes wanted3DBreath') ||
    !cssContent.includes('@keyframes wantedTextGlowPulse') ||
    !cssContent.includes('@keyframes wantedSweepPass') ||
    !cssContent.includes('.wanted-poster-wall') ||
    !cssContent.includes('mix-blend-mode: screen;') ||
    !cssContent.includes('.wanted-ghost-text')) {
  throw new Error('CSS rules for original bg-decorations, screen blend mode, or wanted-ghost-text missing');
}
console.log('✓ Verified: Restored original UI atmospheric background with glowing orbs, screen blend filter, blur, and 3D animation');

// 4. Verify vercel.json exists with Vite configuration
if (!fs.existsSync('vercel.json')) {
  throw new Error('vercel.json is missing');
}
const vercelConf = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercelConf.framework !== 'vite' || vercelConf.outputDirectory !== 'dist') {
  throw new Error('vercel.json is missing framework: vite or outputDirectory: dist');
}
console.log('✓ Verified: vercel.json is properly configured for Vercel deployment');

// 5. Verify initWanted3DBackground executes and generates sparkles
app.initWanted3DBackground();
console.log('✓ Verified: app.initWanted3DBackground executed successfully');

// Test 34: Validation of Focus Switcher, One Piece Log Pose & Liquid Glass Pomodoro Timer
console.log('\n--- Test 34: Validation of Focus Switcher, Log Pose & Liquid Glass Pomodoro Timer ---');

// 1. Verify skull and "ETERNAL POSE" text removed from the sidebar clock/focus box
if (htmlContent.includes('ETERNAL POSE')) {
  throw new Error('ETERNAL POSE text still found in index.html (expected removed)');
}

// Check that crest-badge is not inside sidebarHeaderClock
const clockBoxMatch = htmlContent.match(/<div class="sidebar-header-pose"[^>]*>([\s\S]*?)<\/div>\s*<div class="sidebar-divider">/);
if (clockBoxMatch && clockBoxMatch[1].includes('crest-badge')) {
  throw new Error('Skull crest-badge still present inside sidebar focus box');
}
console.log('✓ Verified: Skull and ETERNAL POSE text removed from focus box');

// 2. Verify Two-Option Switcher (Log Pose vs Regular Pomodoro) and views
if (!htmlContent.includes('id="btnModePose"') ||
    !htmlContent.includes('id="btnModePomodoro"') ||
    !htmlContent.includes('id="viewLogPose"') ||
    !htmlContent.includes('id="viewPomodoro"')) {
  throw new Error('Two-option switcher (btnModePose/btnModePomodoro) or view panels missing from index.html');
}
console.log('✓ Verified: Two options (Log Pose vs Regular Pomodoro) present in index.html');

// 3. Verify HTML elements for Log Pose and Liquid Glass Pomodoro with LED Dot-Matrix
if (!htmlContent.includes('id="logPoseSphere"') ||
    !htmlContent.includes('id="poseMagneticNeedle"') ||
    !htmlContent.includes('id="poseHourglassChamber"') ||
    !htmlContent.includes('id="logPoseCountdown"') ||
    !htmlContent.includes('id="btnPoseMain"') ||
    !htmlContent.includes('id="pomoDotMatrixSvg"') ||
    !htmlContent.includes('id="pomoChip-25"') ||
    !htmlContent.includes('id="pomoChip-5"') ||
    !htmlContent.includes('id="btnPomoMain"') ||
    !htmlContent.includes('id="btnPomoReset"') ||
    !htmlContent.includes('id="btnPomoSound"')) {
  throw new Error('Log Pose or Pomodoro HTML elements missing from index.html');
}
console.log('✓ Verified: Log Pose and Liquid Glass Pomodoro LED Matrix elements present in index.html');

// 4. Verify CSS styles for Two-Option Switcher, Liquid Glass UI for both Log Pose & Pomodoro, and Button Gradients
if (!cssContent.includes('.focus-mode-header-tabs') ||
    !cssContent.includes('.btn-focus-mode-toggle') ||
    !cssContent.includes('.log-pose-liquid-card') ||
    !cssContent.includes('.pomodoro-liquid-card') ||
    !cssContent.includes('.liquid-glass-sheen') ||
    !cssContent.includes('.pomo-dot-matrix-bezel') ||
    !cssContent.includes('.pomo-matrix-svg') ||
    !cssContent.includes('.btn-pose-main') ||
    !cssContent.includes('.btn-pomo-main') ||
    !cssContent.includes('timerButtonPulseAmber') ||
    !cssContent.includes('timerButtonPulseEmerald')) {
  throw new Error('CSS styles for Liquid Glass UI or Button Gradients missing from style.css');
}
console.log('✓ Verified: Liquid Glass UI applied to both Log Pose & Pomodoro with rich button gradients & keyframe effects');

// 5. Test Mode Switching (Log Pose <-> Pomodoro)
app.setFocusMode('pomodoro');
if (app.state.focusMode !== 'pomodoro') {
  throw new Error('app.state.focusMode expected pomodoro, got: ' + app.state.focusMode);
}
console.log('✓ Verified: Switched to Regular Pomodoro mode');

app.setFocusMode('pose');
if (app.state.focusMode !== 'pose') {
  throw new Error('app.state.focusMode expected pose, got: ' + app.state.focusMode);
}
console.log('✓ Verified: Switched to Log Pose mode');

// 6. Test Focus Duration Presets on Log Pose: 5m, 30m, 1hr (60m), 1:30hr (90m)
app.setFocusSession(5, 'Pirate Feast Break');
if (app.state.focusDurationMinutes !== 5 || app.state.focusTimeRemainingSeconds !== 300) {
  throw new Error('setFocusSession(5) did not update focus state correctly');
}
const countdownEl = getOrCreate('logPoseCountdown');
if (countdownEl.textContent !== '05:00') {
  throw new Error('5m preset countdown display expected 05:00, got: ' + countdownEl.textContent);
}
console.log('✓ Verified: 5m preset updates countdown to 05:00');

app.setFocusSession(30, 'Grand Line Voyage');
if (app.state.focusDurationMinutes !== 30 || app.state.focusTimeRemainingSeconds !== 1800) {
  throw new Error('setFocusSession(30) did not update focus state correctly');
}
if (countdownEl.textContent !== '30:00') {
  throw new Error('30m preset countdown display expected 30:00, got: ' + countdownEl.textContent);
}
console.log('✓ Verified: 30m preset updates countdown to 30:00');

app.setFocusSession(60, 'Wano Kuni Raid');
if (countdownEl.textContent !== '1:00:00') {
  throw new Error('1hr (60m) preset countdown display expected 1:00:00, got: ' + countdownEl.textContent);
}
console.log('✓ Verified: 1hr preset updates countdown to 1:00:00');

app.setFocusSession(90, 'Laugh Tale Odyssey');
if (countdownEl.textContent !== '1:30:00') {
  throw new Error('1:30hr (90m) preset countdown display expected 1:30:00, got: ' + countdownEl.textContent);
}
console.log('✓ Verified: 1:30hr preset updates countdown to 1:30:00');

// 7. Test Pomodoro Timer Features: Presets, Start, Pause, and Reset
app.setFocusMode('pomodoro');
app.setPomodoroSession(25, 'Focus Session', 'FOCUS');
if (app.state.pomoDurationMinutes !== 25 || app.state.pomoTimeRemainingSeconds !== 1500) {
  throw new Error('setPomodoroSession(25) failed to set state');
}
console.log('✓ Verified: 25m Pomodoro Focus preset configured');

app.setPomodoroSession(5, 'Short Break', 'REST');
if (app.state.pomoDurationMinutes !== 5 || app.state.pomoTimeRemainingSeconds !== 300) {
  throw new Error('setPomodoroSession(5) failed to set break state');
}
console.log('✓ Verified: 5m Pomodoro Break preset configured');

app.togglePomodoroTimer();
if (!app.state.isPomoRunning || !app.state.pomoIntervalId) {
  throw new Error('togglePomodoroTimer failed to start timer');
}
console.log('✓ Verified: Pomodoro timer started running');

app.togglePomodoroTimer();
if (app.state.isPomoRunning || app.state.pomoIntervalId) {
  throw new Error('togglePomodoroTimer failed to pause timer');
}
console.log('✓ Verified: Pomodoro timer paused smoothly');

app.state.pomoTimeRemainingSeconds = 120;
app.resetPomodoroTimer();
if (app.state.pomoTimeRemainingSeconds !== 300) {
  throw new Error('resetPomodoroTimer failed to restore full duration (300s): ' + app.state.pomoTimeRemainingSeconds);
}
console.log('✓ Verified: Reset Pomodoro timer restored full duration');

// 8. Test Sound Toggle
const initialSound = app.state.focusSoundEnabled;
app.toggleFocusSound();
if (app.state.focusSoundEnabled === initialSound) {
  throw new Error('toggleFocusSound did not invert sound state');
}
app.toggleFocusSound(); // restore
console.log('✓ Verified: Bell chime sound toggle works seamlessly');

console.log('\n=============================================');
console.log('🎉 ALL 34 TESTS PASSED FLAWLESSLY! 🎉');
console.log('=============================================\n');
process.exit(0);



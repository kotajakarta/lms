# Pastel Bento LMS Portal Siswa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 100% faithful Pastel Bento UI designs for the LMS Student Portal across 5 core views (Dashboard/Syllabus, Schedule/Calendar, Discussion, Analytics, and Library) with full interactivity and data fallback.

**Architecture:** A reusable `StudentLayout` shell encapsulates the left rail navigation and top header bar, hosting 5 dedicated, modular page components under `/siswa/*`. Design tokens, typography (Plus Jakarta Sans), and Google Material Symbols Outlined are integrated globally into Tailwind CSS.

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript, React Router v7, TanStack Query, Zustand, Lucide React, Google Material Symbols.

**Spec:** `docs/superpowers/specs/2026-09-22-pastel-bento-lms-design.md`

## Global Constraints
- Appearance must match 100% identically with the mockups in `frontend/stitch/frontend/`.
- Colors: `surface: #fcf9f3`, `canvas: #b8b0cc`, `primary-container: #1c1d22`, `secondary-container: #e4dbfe`, `secondary-fixed: #e7deff`, `tertiary-fixed: #fbdcd7`.
- Font: `Plus Jakarta Sans`, Icon font: `Material Symbols Outlined`.
- Interactive functionality must work smoothly with fallback mock data when backend data is unavailable.

---

### Task 1: Setup Design System Tokens, Google Fonts, & Material Symbols

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/index.css`
- Create: `frontend/src/types/lms.ts`

**Interfaces:**
- Produces: Global CSS classes (`bg-surface`, `bg-surface-container`, `font-sans`, `hide-scrollbar`, `material-symbols-outlined`) and TypeScript types for Course, Material, CalendarEvent, DiscussionTopic, and LibraryAsset.

- [ ] **Step 1: Update `frontend/index.html` with Google Fonts & Material Symbols**
Add `<link>` tags for `Plus Jakarta Sans` and `Material Symbols Outlined`.

- [ ] **Step 2: Update `frontend/src/index.css` with Pastel Bento tokens and utilities**
Configure root CSS variables and custom utility classes for scrollbars and bento shadows.

- [ ] **Step 3: Create `frontend/src/types/lms.ts`**
Define interfaces for Course, Material, ScheduleEvent, DiscussionTopic, AnalyticsData, and VaultAsset.

- [ ] **Step 4: Verify build and types**
Ensure Vite dev server compiles without error.

---

### Task 2: Create Reusable Layout Shell (`StudentLayout.tsx`)

**Files:**
- Create: `frontend/src/layouts/StudentLayout.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `useLocation`, `Link`, `Outlet`.
- Produces: `StudentLayout` wrapping `/siswa/dashboard`, `/siswa/calendar`, `/siswa/diskusi`, `/siswa/analitik`, `/siswa/library`.

- [ ] **Step 1: Create `StudentLayout.tsx`**
Implement the left sidebar rail (`w-20`) with flower icon, 5 nav icons (`menu_book`, `calendar_today`, `chat_bubble`, `explore`, `grid_view`), notification button, and user avatar with active badge, plus the sticky top header.

- [ ] **Step 2: Update `App.tsx` routes**
Configure `/siswa` routes nested under `StudentLayout` with `ProtectedRoute`.

- [ ] **Step 3: Verify navigation bar rendering**
Check that `/siswa/dashboard` renders within the layout shell.

---

### Task 3: Build Syllabus & Interactive Video Lecture Dashboard (`/siswa/dashboard`)

**Files:**
- Create: `frontend/src/pages/siswa/SyllabusDashboardPage.tsx`
- Create: `frontend/src/data/mockSyllabus.ts`

**Interfaces:**
- Consumes: `StudentLayout` outlet.
- Produces: Full syllabus view with 3D gradient card, module list, video player with scrubbing controls, interactive Course Chat, and Course Playlist.

- [ ] **Step 1: Create `mockSyllabus.ts`**
Provide initial course, modules, video playlist, and chat messages matching `frontend/stitch/frontend/dashboard/code.html`.

- [ ] **Step 2: Build `SyllabusDashboardPage.tsx`**
Implement Left Column (Header, search, filter tags, "Spatial Aptitude" bento card with spherical visual, module list) and Right Column (Video Player hero, Course Chat with send input, Course Playlist with tabs).

- [ ] **Step 3: Connect interactive controls**
Wire play/pause toggle, scrubbing bar click, module selection, and sending messages in chat.

---

### Task 4: Build Studio Academic Schedule & Calendar (`/siswa/calendar`)

**Files:**
- Create: `frontend/src/pages/siswa/CalendarPage.tsx`
- Create: `frontend/src/data/mockCalendar.ts`

**Interfaces:**
- Consumes: `StudentLayout` outlet.
- Produces: Full monthly and weekly academic schedule matching `frontend/stitch/frontend/schedule_calendar/code.html`.

- [ ] **Step 1: Create `mockCalendar.ts`**
Provide calendar event data (Webinars, Live Sessions, Assignment Deadlines) with dates, times, and tags.

- [ ] **Step 2: Build `CalendarPage.tsx`**
Implement calendar grid, month selector (prev/next), day grid with event badges, upcoming live sessions side panel, and category filter pills.

- [ ] **Step 3: Connect calendar interactivity**
Support switching months, filtering events by category, and viewing event details.

---

### Task 5: Build Discussion & Critique Community Hub (`/siswa/diskusi`)

**Files:**
- Create: `frontend/src/pages/siswa/DiscussionPage.tsx`
- Create: `frontend/src/data/mockDiscussion.ts`

**Interfaces:**
- Consumes: `StudentLayout` outlet.
- Produces: Discussion forum and critique hub matching `frontend/stitch/frontend/diskusi/code.html`.

- [ ] **Step 1: Create `mockDiscussion.ts`**
Provide channels list, pinned room "Live Pin-up Studio", message threads, and critique feedback.

- [ ] **Step 2: Build `DiscussionPage.tsx`**
Implement channel sidebar, search capsule, pinned room lilac card, critique thread messages, reactions, and reply input bar.

- [ ] **Step 3: Connect discussion interactivity**
Support typing and sending replies, switching channels, and clicking reactions.

---

### Task 6: Build Spatial Progress & Learning Analytics (`/siswa/analitik`)

**Files:**
- Create: `frontend/src/pages/siswa/AnalyticsPage.tsx`
- Create: `frontend/src/data/mockAnalytics.ts`

**Interfaces:**
- Consumes: `StudentLayout` outlet.
- Produces: Learning analytics dashboard matching `frontend/stitch/frontend/analitik/code.html`.

- [ ] **Step 1: Create `mockAnalytics.ts`**
Provide analytics stats (88% Mastery Index, competency progress, quiz performance, radar metrics).

- [ ] **Step 2: Build `AnalyticsPage.tsx`**
Implement Hello Anna greeting, category pills, Mastery Index bento card with circular SVG radial gauge, competency breakdown cards, and skill metrics.

- [ ] **Step 3: Verify visual accuracy**
Confirm radial SVG gauge, percentages, and color styling match stitch HTML 100%.

---

### Task 7: Build Resource Library & Model Bank (`/siswa/library`)

**Files:**
- Create: `frontend/src/pages/siswa/LibraryPage.tsx`
- Create: `frontend/src/data/mockLibrary.ts`

**Interfaces:**
- Consumes: `StudentLayout` outlet.
- Produces: Resource vault matching `frontend/stitch/frontend/library/code.html`.

- [ ] **Step 1: Create `mockLibrary.ts`**
Provide digital vault assets (3D Models, CAD files, Textures, Linework, PDFs) with file sizes and download metadata.

- [ ] **Step 2: Build `LibraryPage.tsx`**
Implement Vault Repository greeting, "Studio Box v2.4 (Live)" status, Lilac Studio Digital Vault card with 68.4 GB storage bar, asset filter tabs, and asset grid.

- [ ] **Step 3: Connect asset search & filtering**
Filter assets dynamically by type and search keyword.

---

### Task 8: Verification & Final Polish

**Files:**
- Check: All 5 pages in browser and run validation tests.

- [ ] **Step 1: Verify all 5 routes**
Test `/siswa/dashboard`, `/siswa/calendar`, `/siswa/diskusi`, `/siswa/analitik`, `/siswa/library`.

- [ ] **Step 2: Check responsive layout**
Verify desktop, laptop, and tablet viewports.

- [ ] **Step 3: Document walkthrough**
Create `walkthrough.md` with screenshots and summary.

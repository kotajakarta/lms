# Pastel Bento LMS Portal Siswa - Technical Design Spec

## 1. Overview
Transform the LMS Portal Siswa (`/siswa/*`) to match 100% identically with the "Pastel Bento Learning" UI design specifications and mockups located in `frontend/stitch/frontend/`. The design features an organic, high-touch pastel aesthetic, asymmetric bento grid layouts, Plus Jakarta Sans typography, Material Symbols Outlined icons, and responsive interactive modules.

## 2. Design Tokens & Visual Architecture

### 2.1 Typography
- Primary Font: `Plus Jakarta Sans` (weights: 300, 400, 500, 600, 700).
- Icon System: Google `Material Symbols Outlined` (variable optical sizes, fill 0/1) complemented by clean SVG paths for custom graphics.

### 2.2 Color System
- Surface & Canvas:
  - `canvas`: `#b8b0cc` (outer canvas wrapper)
  - `surface`: `#fcf9f3` (inner bento card foundation)
  - `surface-container`: `#f1ede7`
  - `surface-container-low`: `#f6f3ed`
  - `surface-container-high`: `#ebe8e2`
  - `surface-container-lowest`: `#ffffff`
- Brand & Accent Accents:
  - `primary`: `#020306` (deep ink)
  - `primary-container`: `#1c1d22` (charcoal dark pills & buttons)
  - `secondary`: `#615a77` (slate purple)
  - `secondary-container`: `#e4dbfe` (soft lilac)
  - `secondary-fixed`: `#e7deff`
  - `secondary-fixed-dim`: `#cbc2e4`
  - `tertiary-fixed`: `#fbdcd7` (pastel blush/peach)
  - Bento Module Cards: `#fadad1` (peach), `#cbe9e3` (mint), `#dad3eb` (lavender), `#d5e4f7` (soft sky blue).

## 3. Modular Component Structure

### 3.1 Layout Shell (`StudentLayout.tsx`)
- **Left Rail Navigation (`SidebarRail`)**:
  - Top Brand Logo: Stylized petal/clover icon.
  - Core Navigation Links with active pill highlights (`#1c1d22` background, white icon, drop shadow):
    - `menu_book` -> `/siswa/dashboard` (Syllabus & Video Player)
    - `calendar_today` -> `/siswa/calendar` (Studio Calendar)
    - `chat_bubble` -> `/siswa/diskusi` (Discussion & Critique)
    - `explore` -> `/siswa/analitik` (Spatial Progress & Analytics)
    - `grid_view` -> `/siswa/library` (Resource & Asset Bank)
  - Bottom Status: Notifications badge and student profile avatar with active online indicator.
- **Top Header Bar**:
  - Cohort identifier pill ("Arch & Urban Studio 04").
  - Omnisearch capsule input ("Search cohorts, models, lectures...").
  - Quick action avatar / info modal trigger.

### 3.2 Modules & Pages

#### Page 1: Syllabus & Video Player (`/siswa/dashboard`)
- Left Column:
  - Header greeting ("Hello, Anna"), Search bar, filter pills.
  - Featured Syllabus Card ("Spatial Aptitude") with metrics (24 Pages, 5 Videos, 1.5 Hour) and 3D spherical gradient visual.
  - Interactive Module List: Engineering Graphics, 3D Modeling & CAD, Design Theory, Design Ethics Discussion, Principles of Design.
- Right Column:
  - Video Player Hero Card: Perspective Basics still, video time indicator, progress scrubbing bar, rewind 15s, fast-forward 15s, play/pause toggle, volume, and fullscreen.
  - Bottom Asymmetric Split:
    - Course Chat: Interactive message thread, student & instructor bubbles, typing indicator, quick attachment buttons (Files, Images, Audio).
    - Course Playlist: Segment tabs (Files, Videos, Audio), active track item ("Perspective Basics - 23:28"), selectable playlist items.

#### Page 2: Studio Academic Schedule & Calendar (`/siswa/calendar`)
- Full interactive Calendar:
  - Month navigation (previous/next month, current date indicator).
  - Day & Week view toggle.
  - Calendar grid with color-coded event pills (Pastel peach for Assignment Deadlines, Lilac for Live Critique Sessions, Mint for Webinars).
  - Upcoming Events list & quick join links.

#### Page 3: Discussion & Critique Hub (`/siswa/diskusi`)
- Channel Explorer:
  - Search capsule, filter tags ("All Channels", "Studio A", "Housing", "CAD & Renders").
  - Pinned room lilac card ("Live Pin-up Studio", 48 active, 12 unread).
  - Channel list with unread counter badges.
- Active Critique & Thread View:
  - Thread header, author info, timestamp.
  - Message exchange with peer commentary and critique attachments.
  - Reply input box with rich formatting options and submit button.

#### Page 4: Learning Analytics & Spatial Progress (`/siswa/analitik`)
- Top Grid:
  - Hello greeting & course tag.
  - Overall Mastery Index Bento Card (88% Top Studio Quintile with circular radial gauge SVG, +4.2% trend).
  - Competency flow breakdown and progress bars.
  - Spatial skill radar/progress visualization.
  - Evaluation & quiz score logs.

#### Page 5: Resource Library & Model Bank (`/siswa/library`)
- Vault Repository Header:
  - "Sync: Studio Box v2.4 (Live)", Deposit Asset button.
- Studio Digital Vault Bento Card:
  - Storage meter (68.4 GB / 100 GB used: 3D Assets, Textures, Linework).
  - Upload file trigger.
- Asset Grid & Asset Categories:
  - Filterable by type (3D Models, CAD files, Textures, PDF Handouts).
  - Resource cards with download buttons, file size tags, and preview thumbnails.

## 4. State Management & Data Handling
- Real User Profile integration via `useAuthStore` (displays real logged-in student name or defaults gracefully to "Anna").
- Realistic initial mock data populated for all 5 modules matching the Stitch prototypes, seamlessly wired to Axios/TanStack Query so any backend API data automatically enhances/replaces mock data without breaking the layout.
- Interactive states:
  - Video Player: play/pause, time progression, track change.
  - Chat: optimistic message addition upon typing and pressing enter/send.
  - Calendar: month/week toggle, selecting a day.
  - Library: filtering assets by category, search query filtering.
  - Analytics: animated progress indicators.

## 5. Verification Plan
- Verify dev server build and TypeScript types.
- Check all 5 routes in browser (`/siswa/dashboard`, `/siswa/calendar`, `/siswa/diskusi`, `/siswa/analitik`, `/siswa/library`).
- Ensure responsive behavior on desktop and tablet/mobile viewports.

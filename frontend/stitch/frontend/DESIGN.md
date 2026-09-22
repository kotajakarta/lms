---
name: Pastel Bento Learning
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f1ede7'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#46464b'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0ea'
  outline: '#77767b'
  outline-variant: '#c7c6cb'
  surface-tint: '#5e5e64'
  primary: '#020306'
  on-primary: '#ffffff'
  primary-container: '#1c1d22'
  on-primary-container: '#85858b'
  inverse-primary: '#c7c6cc'
  secondary: '#615a77'
  on-secondary: '#ffffff'
  secondary-container: '#e4dbfe'
  on-secondary-container: '#655f7c'
  tertiary: '#0a0201'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1916'
  on-tertiary-container: '#997f7b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3e2e9'
  primary-fixed-dim: '#c7c6cc'
  on-primary-fixed: '#1a1b20'
  on-primary-fixed-variant: '#46464c'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#cbc2e4'
  on-secondary-fixed: '#1d1831'
  on-secondary-fixed-variant: '#49435f'
  tertiary-fixed: '#fbdcd7'
  tertiary-fixed-dim: '#dec0bb'
  on-tertiary-fixed: '#281715'
  on-tertiary-fixed-variant: '#57423e'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 15px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 1.75rem
  space-2xl: 2.5rem
---

## Brand & Style

This design system embodies a modern, calm, and intellectually engaging aesthetic tailored for higher education, creative cohorts, and next-generation Learning Management Systems (LMS). Balancing Scandinavian warmth with Japanese editorial restraint, it replaces sterile, clinical school portals with an inviting studio sanctuary.

### Tone & Personality
- **Sophisticated yet Gentle:** Tactile, calm, and focused without visual noise. Surfaces are organic and comforting, removing academic anxiety.
- **Curated & Structured:** Bento-tiled modules create self-contained islands for media, chat discussions, schedules, and active coursework.
- **Tactile & Fluid:** Generously radiused containers (24px to 32px), pill-shaped control caps, and subtle surface elevations give UI components a soft, clay-like presence.

### Target Audience
Modern self-directed learners, creative professionals, design academy students, and forward-thinking educators who thrive in focused, aesthetically inspiring virtual studio environments.

## Colors

The palette uses warm mineral tones punctuated by high-contrast charcoal black accents for clarity, alongside soft pastel lilac, peach, and mint tints for categorizing educational content.

### Palette Architecture
- **Primary (`#1c1d22` - Deep Charcoal):** Serves as an anchor. Used for active floating pill selectors, high-emphasis icons, hero CTA triggers, and primary headlines.
- **Secondary (`#cfc6e8` - Pastel Lilac / Lavender):** Highlights primary learning containers, active syllabus modules, lecture playlists, and focus state washes.
- **Tertiary (`#f6d7d2` - Soft Muted Peach):** Used for tags, progress badges, warm accents, and secondary status markers.
- **Neutral Surface Canvas (`#ebe8e2` / `#f4f3f0` - Warm Sand Base):** Provides an organic, paper-like background that eliminates glare and reduces screen fatigue during extended study sessions.
- **Complementary Mint (`#d1eae4`):** Categorizes secondary coursework, positive completion rates, and file indicators.
- **Pure White (`#ffffff`):** Reserved for elevated child cards, message input fields, chat balloons, and nested action pills.

## Typography

Typography relies entirely on **Plus Jakarta Sans**, utilizing its geometric clarity, friendly counters, and modern typographic finish. It achieves clear scannability across diverse interfaces: lecture video metadata, course playlists, syllabus streams, and interactive live chat threads.

### Typographic Hierarchy
- **Headline XL / LG:** Expresses prominent dashboard module titles (e.g., "Your Custom Syllabus", "Perspective Basics"). Tight letter spacing creates a crisp, editorial character.
- **Titles & Subtitles:** Used for course track names and list headers with moderate semibold weighting (`600`).
- **Body:** Kept between 13px and 15px with relaxed line heights for effortless reading within collaborative chat windows and syllabus summaries.
- **Labels & Tags:** Set in medium/semibold weights to ensure legibility on soft pastel badge surfaces.

## Layout & Spacing

The layout is built upon an asymmetric **Bento Grid** architecture that arranges complex LMS workflows into balanced, distinct viewports.

### Grid & Composition
- **Desktop (1024px+):** A 3-column asymmetric layout inside an outer canvas envelope.
  - **Left Column (280px–340px):** Vertical navigation rail, profile context, search bar, filter pills, and syllabus progress stream.
  - **Center/Primary Column (Flexible 1fr):** Video stage, interactive media viewer, and collaborative discussion chat.
  - **Right Column (320px–360px):** Modular course playlists, contextual asset banks, and interactive lecture tabs.
- **Tablet (768px–1023px):** Collapses into a 2-column format with the navigation docked into a compact left rail and secondary content stacked below media viewers.
- **Mobile (<768px):** Single-column stacked stream with horizontal gesture carousels for pill tags and floating bottom drawer navigation.

### Rhythm & Density
Inner panel padding ranges from `space-md` (14px) on tight lists to `space-xl` (28px) on major bento tiles. Modules retain visible breathing room through uniform `gutter` spacing of 16px to 20px, maintaining visual independence across every container.

## Elevation & Depth

Visual hierarchy uses **tonal layer stacking** combined with **diffused, low-opacity ambient shadows**. Hard drop shadows and heavy borders are avoided in favor of calm, dimensional depth.

### Depth Mechanics
- **Base Level (Canvas):** Soft off-white / beige substrate (`#ebe8e2` or `#f4f3f0`) providing a quiet, ground-level warmth.
- **Level 1 (Bento Panels):** Elevated structural cards using tinted tones (e.g., `#cfc6e8` for lilac modules, `#ffffff` for neutral modules). Framed with a 1px ghost border using `rgba(0, 0, 0, 0.04)`.
- **Level 2 (Active Pills & Interactive Elements):** Deep charcoal floating pills (`#1c1d22`) and elevated search fields cast an extra-diffused, tinted shadow: `box-shadow: 0 8px 24px -4px rgba(28, 29, 34, 0.12)`.
- **Level 3 (Modals, Overlays & Media Floating Badges):** Pure white circular pills and floating video controls hover over content with frosted backdrop filters (`backdrop-filter: blur(12px)`) and subtle ambient dispersion: `box-shadow: 0 12px 32px -6px rgba(28, 29, 34, 0.08)`.

## Shapes

The design system relies on ultra-soft, organic, and friendly geometries. Radii fall into two main categories:

### Shape Hierarchy
- **Bento Modules & Major Shells:** Large rounded envelopes calibrated between `24px` and `32px` (`rounded-2xl` to `rounded-3xl`), creating a soft, pillowy outline for all major panels.
- **Pill Controls & Interactive Surfaces:** Full continuous radius (`border-radius: 9999px`) applied to buttons, segment switchers, tag chips, input containers, and lecture playlist rows.
- **Sub-Component Asset Thumbnails:** Modest soft corners (`14px` to `16px`) for embedded media, lecture icons, and course avatar modules.

## Components

### Buttons & Action Controls
- **Primary Pill Buttons:** Solid deep charcoal (`#1c1d22`) fill with high-contrast pure white text, fully rounded (capsule), accompanied by centered micro-icons.
- **Secondary / Ghost Pills:** White or semi-translucent background with a fine outline (`border: 1px solid rgba(28, 29, 34, 0.08)`), charcoal text, expanding gently on hover.
- **Circular Icon Buttons:** Symmetrical 40px–48px circles with soft white or neutral fills, used for overflow menus (`···`), maximize controls, and close triggers.

### Filter Chips & Tags
- **Category Chips:** Floating capsule shapes in pastel mint (`#d1eae4`), muted peach (`#f6d7d2`), and lavender (`#d8d0ee`). Include a dismiss "×" mark or mini category glyph.
- **Active Segment Pills:** Nestled within a warm grey tray; the active state triggers an inverted `#1c1d22` fill with white text, while inactive items remain muted charcoal.

### Search & Text Inputs
- **Capsule Search Bar:** Integrated white pill with an embedded search icon on the left, an inset circular dark action button on the right, and soft placeholder styling.
- **Chat Input Field:** Elevated rounded-full container (`#ffffff`) featuring an inline attachment tray (`Files`, `Images`, `Audio`) at the bottom and a dark circular send trigger.

### Course Playlists & Syllabus Lists
- **Item Rows:** Stadium-shaped pill cards (`border-radius: 9999px`) or soft rounded rectangles (`20px`) with subtle off-white or soft lilac background fills.
- **Playback States:** Active media row transitions into a crisp white pill with outline accents, displaying a pause icon, real-time audio wave indicator, and active timestamp.

### Media Player Stage
- **Video Envelopes:** Enclosed in a large 24px–32px radius mask with a full-bleed picture plane.
- **Floating HUD:** Frosted translucent overlays housing lecture titles, transport controls, scrub lines, and volume controls docked inside floating pill assemblies directly over the video frame.
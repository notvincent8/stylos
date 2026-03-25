# Design System: Stylos

## 1. Visual Theme & Atmosphere

Dark, warm, and forensic. The interface sits on a near-black canvas with a barely perceptible warm undertone — not a cold pure black, but something closer to a moonlit wall. A fine film-grain texture floats over the entire screen at near-invisible opacity, lending the UI a tactile, almost printed quality. The mood is deliberate restraint: a professional instrument that does not announce itself. Think high-end analog equipment, not consumer software.

Two typefaces do all the expressive work. The display face — Bebas Neue — is bold, condensed, and uppercase by nature; it handles section headers and numerical readouts with editorial weight. Archivo carries everything else: functional, neutral, and quietly precise at small sizes. Together they create a pairing that feels both designed and workhorse-ready.

The sole accent — a sharp electric chartreuse — cuts cleanly through the dark surfaces. It is used sparingly: active states, the main action button, confidence scores that pass the threshold. Everything else stays in muted warm neutrals.

## 2. Color Palette & Roles

- **Warm Void** (`#0e0e0c`) — The page canvas. Slightly warm-toned near-black; the base layer everything sits on.
- **Dark Surface** (`#161614`) — The sidebar background. One step lighter than void, defining the panel boundary.
- **Lifted Surface** (`#1d1d1a`) — Hover and input backgrounds. The second elevation; used for interactive fills on hover and textarea backgrounds.
- **Elevated Panel** (`#242420`) — Tooltip and floating element backgrounds. The highest surface level; creates pop-over depth.
- **Warm Parchment** (`#edeae4`) — Primary text. Not a clean white — it has warmth, softened to reduce eye fatigue on dark backgrounds. Used at full opacity for active elements and at progressive fractions (42%, 25%, 18%) for secondary and tertiary text.
- **Electric Chartreuse** (`#d4ff00`) — The singular accent. Active field selections, locked keyword indicators, the primary extract button fill, high-confidence scores. High voltage against dark; signals "selected" and "live."
- **Chartreuse Whisper** (`rgb(212 255 0 / 0.08)`) — The accent at near-transparency. Used as the fill behind active state buttons — a faint wash that ties selection states together without competing with the border.
- **Alert Red** (`#ff4040`) — Error states and low-confidence keyword scores exclusively. No softening — it reads as urgent.
- **Warm Hairline** (`rgb(237 234 228 / 0.07)`) — The softest structural line; section separators and panel dividers. Felt more than seen.
- **Warm Border** (`rgb(237 234 228 / 0.13)`) — Standard component borders. Buttons, inputs, the scope stepper. Present but unobtrusive.
- **Warm Edge** (`rgb(237 234 228 / 0.22)`) — Stronger borders for active or focus states; tooltip outlines.

## 3. Typography Rules

- **Display face — Bebas Neue:** Condensed, caps-only, used at large sizes (1.5–3.8rem). Reserved for section headings ("Fashion," "Architecture"), the app title, and the loading state message. Wide tracking (`tracking-widest` to `tracking-[0.25em]`) gives it room to breathe despite its density.

- **Body face — Archivo:** The workhorse. Used for everything functional — labels, buttons, metadata, keyword text, microcopy — at tight sizes (0.55–0.78rem). Uppercase with generous letter-spacing at small sizes; mixed-case for longer content like hints and descriptions.

- **Micro-labels (0.58–0.6rem, uppercase, 0.18–0.22em tracking):** Section labels, status indicators, layout toggle text. Present but receding — structural scaffolding, not content.

- **Keyword rows (0.78rem, tracking-widest, semibold, uppercase):** The primary output of the tool. Given maximum legibility within the Archivo weight range.

- **CTA button (0.72rem, 0.22em tracking, bold, uppercase):** The single most intentional typographic moment. Wide-tracked Archivo bold at small size reads as deliberate and final.

- **Hierarchy principle:** Size differences are minimal — the system spans roughly 0.55–0.78rem for body content, with display elements jumping to 1.5rem and above. Contrast is carried by opacity, weight, and color rather than size alone.

## 4. Component Stylings

- **Field toggle buttons:** Sharp, squared-off edges — no radius. Default: transparent fill, a warm hairline border, text at 42% ink opacity. Active: left-edge accent stripe (2px chartreuse), chartreuse whisper fill, full-opacity chartreuse text. Transitions are fast (150ms) — the feedback is immediate, not animated.

- **Primary action button ("Extract Keywords"):** Full-width, bold, uppercase. Active: solid chartreuse fill, near-black text — the only filled chartreuse surface in the UI. Disabled: mid-grey surface fill, ink at 18% opacity, `not-allowed` cursor. The button visually withdraws rather than disappearing.

- **Keyword rows:** Not chips — full-width interactive rows with a bottom border. A small diamond glyph (◆) in the left margin indicates locked state in chartreuse. A confidence bar (0.5rem tall, running across 72px) fills proportionally from the left; color shifts from danger red through neutral to chartreuse based on score (1–4 / 5–7 / 8–10). A numeric score sits at the right edge.

- **Scope stepper (keyword count):** Two square icon buttons flanking a large Bebas Neue numeral. Border follows the standard warm border; disabled state loses hover behavior silently.

- **Textarea (hint input):** Warm surface-2 fill, standard warm border. No radius. Focus state: border brightens to edge-mid. Character count shown in the header row; turns danger red when over limit.

- **Tooltips:** Elevated panel background (`#242420`), strong warm border. A 45° rotated corner nib at the bottom-left. Appear on hover or focus via CSS group state — no JS state involved.

- **Loading animation:** Three scanbar lines of varying width — a clip-path animation sweeps left-to-right then exits right, looping. Paired with a large Bebas Neue message split across two tones (muted ink / chartreuse). No spinners.

- **Film grain overlay:** A fixed SVG fractal noise texture tiled at 180px, opacity 3.2%, sits above all content via `z-index: 9999`. Adds analog texture without altering readability.

## 5. Layout Principles

- **Two-zone split:** A fixed-width sidebar (`~268px`) on the left holds all controls. The right zone fills the remaining space with image and keyword areas side by side (or stacked in row mode).

- **Image / keyword toggle:** Two layout modes — Columns (image left at fixed `440px`, keywords right flex) and Rows (image top at `38vh`, keywords scrollable below). Switched from the sidebar with icon buttons.

- **Sidebar rhythm:** Controls are stacked vertically with `1.5rem` gaps, separated by hairline `<Rule>` dividers. Generous internal padding (`2.5rem`), tight between sibling elements.

- **Whitespace as structure:** The near-black canvas is not empty — it is the frame. Components float within it with deliberate breathing room. Nothing competes for attention except the chartreuse accent.

- **No border radius anywhere:** Every container, button, input, and panel uses sharp corners. The geometry is rectilinear throughout — this is consistent and intentional.

- **Bottom status bar:** A thin pinned bar at the viewport bottom carries the AI/legal notice and a link. Tiny typography, minimal visual weight — disclosure without distraction.

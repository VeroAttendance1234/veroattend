# VERO — HSC Software Design & Development Major Project: Folio Brief for Claude

> **How to use this:** paste the entire contents of this file into a new Claude conversation as your opening message. Add at the end what you want produced — e.g. *"Write me the Identifying & Defining section of my HSC folio (2,500 words)"*, *"Generate the entire Project Documentation chapter"*, or *"Draft the testing & evaluation section as a markdown table"*. Claude will have everything it needs.

---

## 0. Who I am · what this project is

I am **Toby Crowther**, a Year 12 student at **Shore School** (NSW, Australia), submitting **VERO** as my **HSC Software Design & Development Major Project (2026)**.

VERO is a **real-time school attendance platform** that replaces the manual paper/digital roll-call with a **single NFC card tap**. The system spans **hardware** (Raspberry Pi 3B + ACR122U NFC reader), a **Python backend** (Flask + Flask-SocketIO + SQLite + pyscard), and a **React 19 frontend** (Vite + Recharts + Three.js + drei) — all wired together so a student tap on the physical reader updates every relevant dashboard across the school in under 100 ms.

The deployed demo lives at **https://veroattend.vercel.app** and the GitHub repo is **https://github.com/VeroAttendance1234/veroattend**.

The HSC SDD folio requires four chapters: **Identifying & Defining**, **Research & Planning**, **Producing & Implementing**, **Testing & Evaluating**. This document gives you the full source of truth for all of them.

---

## 1. Problem identification & need

### The pain point
- Teachers at most Australian secondary schools spend **~5 minutes per period** manually marking the class roll.
- Across **6 periods/day × 5 days/week × 40 school weeks × 30 teachers**, that compounds to **~300 hours per year** of teaching time per school spent on roll-marking admin.
- At the NSW secondary teacher award rate (~AUD $65/h), that's **~$19,500/year of paid labour per school** spent on a clerical task.
- Equivalently: ~37 full teaching days lost, or ~600 30-minute lessons not taught.

### Secondary problems
- **Paper rolls get lost or misread** → inaccurate attendance records → reporting errors.
- **Parents have no real-time visibility** of whether their child actually arrived on campus — they only find out via end-of-day SMS or phone calls.
- **Admins can't see live attendance** — incomplete data until rolls are entered, sometimes hours later.
- **Fragmented communication** between parents/teachers/admins (email + SMS + phone + school portals).
- **Existing platforms** (Schoolbox, Sentral, Canvas) all rely on **teacher data entry** — none integrate hardware.

### Stakeholders
- **Administrators** — need school-wide oversight, analytics, system status.
- **Teachers** — need a fast class-level roll, ability to message parents.
- **Students** — need their own attendance/timetable/wellbeing tracker.
- **Parents** — need real-time attendance visibility and a way to file absences.

### Why now
- NFC hardware is cheap (~$40 for a reader, ~$2 per student card).
- Raspberry Pi makes a self-contained edge appliance feasible.
- React 19 + WebSockets make sub-100 ms real-time UI updates trivial.
- Schools have well-documented under-investment in admin automation — VERO can be deployed for a few hundred dollars per classroom.

---

## 2. Functional & non-functional requirements

### Functional requirements
1. **NFC card detection** via ACR122U USB reader on Raspberry Pi.
2. **Real-time UI propagation** of every tap to all role dashboards (<200 ms target, achieved <100 ms).
3. **Four role-based dashboards** (Admin, Teacher, Student, Parent), each with role-appropriate data.
4. **Live scan feed** that updates as taps occur, with student avatar, name, year, class, UID, timestamp.
5. **Attendance analytics** — monthly trend (5-year), year-group breakdown, class leaderboards, student leaderboards.
6. **Calendar heatmap** — month-grid view with daily attendance %, today indicator, hover preview, click-to-pin detail panel.
7. **Absence request system** — parents submit, admins approve/reject.
8. **Integrated messaging** — parent ↔ teacher conversations with typing indicators, delivery receipts, quick replies.
9. **Search + pagination** across the 1,050-student roster.
10. **Notifications panel** with categorised system events.
11. **Reports & CSV export** of filtered attendance data.
12. **Onboarding tour** for first-time admins.

### Non-functional requirements
- **Latency**: <200 ms end-to-end (card tap → UI update). Measured: <100 ms.
- **Accessibility**: WCAG 2.1 AA contrast, full keyboard navigation, ARIA labels, semantic HTML, prefers-reduced-motion support.
- **Mobile-first responsive**: works on iPhone 14 and Android phones, collapsing nav to hamburger + bottom tab bar under 800 px.
- **Offline-tolerant**: WebSocket auto-reconnect, SQLite local store on Pi means scans queue if backend is down.
- **Privacy**: no biometric data; card UIDs are non-identifying numbers stored only on the school's own server.
- **Performance**: First Contentful Paint <0.5 s, Lighthouse Performance ≥90, Accessibility 100/100.
- **Bundle size**: heavy 3D and chart bundles lazy-loaded so initial paint isn't blocked.

---

## 3. Research & competitive analysis

### Existing solutions surveyed
- **Schoolbox** — NSW LMS, used widely; relies entirely on teacher manual entry; no hardware integration.
- **Sentral** — used by 3,000+ Australian schools; admin-focused; manual roll entry only.
- **Canvas** — university-favoured LMS; built for assignments, not attendance.

**Key insight from the research:** all three rely on a human typing the roll. None integrate NFC, none give parents live visibility, none compute a meaningful real-time school-wide attendance figure.

### User research (qualitative)
- **4 teachers interviewed at Shore School** (informal). Verbatim themes:
  - *"The roll is the worst part of my day."*
  - *"I don't know who's actually in the building."*
  - *"Parents call me when their child is just running late."*
  - *"Rolls don't tell the whole story."* (sparked the absence-request + messaging features.)
- **Mobile-first feedback** — teachers want to glance at attendance on their phone between classes; the desktop role-switcher was inaccessible on small screens (drove the bottom tab bar design).

### Hardware alternatives considered
| Option | Tap time | Privacy | Cost / card | Rejected because |
|---|---|---|---|---|
| **NFC card (chosen)** | ~80 ms | Anonymous UID | ~$2 | — |
| QR code on phone | ~2-4 s | Photographable | $0 | Slower, easily copied, requires camera permission |
| Facial recognition | <1 s | Biometric | Free | Privacy/consent issues under NSW guidance, fails on glasses/lighting |
| Bluetooth beacons | Background | Phone needed | $5 + phone | Requires every student to carry a phone with the app |

### Controller alternatives considered
| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Raspberry Pi 3B (chosen)** | Full Python + Flask + SQLite + pyscard on one device | $50 each | Picked — single device, easy to deploy |
| Arduino + separate server | Cheaper microcontroller | Doubles system complexity (need a host machine) | Rejected |
| ESP32 + cloud backend | Tiny footprint | Cloud dependency, no offline mode | Rejected |

### Frontend stack rationale
- **React 19** — concurrent renderer batches the dashboard updates from streaming NFC events without dropping frames. Custom hooks keep state-sharing clean.
- **Vite 8** — sub-second HMR meant ~60+ iterations in a single coding session on the marker animation.
- **Recharts 3** — accessible SVG charts (no canvas), screen-reader compatible, free retint via currentColor.
- **Lucide Icons** — tree-shaken; only ~60 icons in the final bundle even though the library has 1000+.
- **Three.js 0.184 + @react-three/fiber 9.6 + @react-three/drei 10.7** — handles the real 3MF CAD file for the hero animation and exploded view; declarative React wrapping.
- **socket.io-client 4.8** — auto-reconnects with exponential backoff; falls back to long-polling on networks that block WebSockets (school wifi often does).

### Design system choices
- **Palette**: calm professional teal (`#14B8B8` / `#00A9A5`) + warm charcoal (`#0F1E28`) text. Reds/greens/ambers reserved for status indicators.
- **Display font**: **Bricolage Grotesque** (800 weight, tight letter-spacing) — used for hero headlines, big numbers, and section titles.
- **Body font**: system stack for fast loading.
- **Radii**: 10/12/14/18 px depending on element scale.
- **Shadows**: soft, very low-opacity (`rgba(15,30,40,0.06–0.12)`).
- **Motion**: quintic ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`) for entrances; 0.18–0.65 s durations; honours `prefers-reduced-motion`.

---

## 4. System architecture

```
┌──────────────────────────────────────────────────────────────┐
│  STUDENT TAPS NFC CARD                                       │
│  (MIFARE Classic, 13.56 MHz, ISO 14443A)                     │
└────────────────────┬─────────────────────────────────────────┘
                     │ USB interrupt (~38 ms)
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  RASPBERRY PI 3B                                              │
│   ├─ pcscd (Linux smart-card middleware)                      │
│   ├─ pyscard 2.0 → reads card UID                             │
│   ├─ SQLite 3 → student-by-UID lookup (~120 ms cumulative)    │
│   └─ Flask-SocketIO 5 → emit("card_tap", { …student }) (~250) │
└────────────────────┬─────────────────────────────────────────┘
                     │ WebSocket (Flask-SocketIO)
                     ▼
┌──────────────────────────────────────────────────────────────┐
│  REACT 19 FRONTEND (Vite-built, deployed on Vercel)           │
│   ├─ socket.io-client receives "card_tap"                    │
│   ├─ App.jsx → handleTap(student)                             │
│   │     ├─ setStudents(prev → mark present)                   │
│   │     ├─ setTaps(prev → unshift new tap)                    │
│   │     └─ toast.success("X checked in")                      │
│   ├─ React 19 batches the 4 useState updates into 1 paint     │
│   └─ Every dashboard re-renders (~312 ms total e2e)           │
└──────────────────────────────────────────────────────────────┘
```

**Code split across 3 layers:**
- `frontend/` — React app (everything in this repo's `src/`)
- `backend/` — Python Flask + pyscard service (runs on the Pi)
- `hardware/` — physical Pi 3B + ACR122U + 3D-printed enclosure (real CAD geometry shipped as `public/models/vero-cloud-base.3mf`)

---

## 5. Complete feature inventory (what's actually built)

### 5.1 Pages

#### `LoginPage` (`src/pages/LoginPage.jsx`)
- **Animated mesh-gradient background** — 4 slowly-drifting soft-coloured blobs (teal, purple, green) behind everything for an "alive atmosphere" feel.
- **Brand panel (left, 50%)** — three-zone vertical hierarchy built around focal points:
  - Top: VERO wordmark + tagline + heartbeat-pulsing `ACR122U · LIVE` chip.
  - Middle: hero headline *"Real-time. Right now."* in `clamp(2.4rem, 5.4vw, 4.2rem)` with kinetic word-by-word reveal (each word fades + slides up + blurs in with stagger); "now." gets the teal gradient text fill.
  - Focal stat card: **"300 hrs/yr"** in 3.4rem teal-gradient text with corner halo, subtitled with the per-school annual impact.
  - `LiveActivityTicker` — rotates through 5 simulated card-tap events every 2.4s with slide-in animation and coloured "CHECKED IN" pills.
  - Trust strip: `WCAG 2.1 AA · <100ms latency · Offline-tolerant`.
- **Form panel (right)** — "Welcome." (with teal accent dot), role picker (Admin / Teacher / Mr Chen / Aisha Patel / J. Patel), password/NFC tabs, pre-filled demo credentials with a shimmering "Demo ready" banner, gradient pulsing Sign In button.

#### `MarkerPage` (`src/pages/MarkerPage.jsx`) — the HSC portfolio
The longest single page in the project. Sections in order:
- **§1 Hero** — full-bleed copy panel left + interactive 3D hero right.
- **§2 Numbers** — animated count-up stats (1,050 students, 42 classes, 30 staff, <100 ms latency).
- **§2b Impact calculator** — *Why it matters · 5 minutes a class, hundreds of hours a year.* Three sliders, gradient headline, live equation breakdown, four impact stats.
- **§3 Problem/Solution** — six problem cards juxtaposed with solution cards.
- **§4 Pipeline** — how the system works.
- **§4b Inside the VERO** — animated exploded view of the hardware stack (real 3MF cap → antenna coil → ACR122U → Pi 3B).
- **§4c Messaging trial** — interactive parent/teacher chat the marker can use.
- **§5 Demo accounts** — clickable role cards.
- **§5b Quiet CTA** — bridge to tech stack.
- **§6 Tech stack** — every dependency as a hover-preview, click-to-expand chip with version badge and docs link.
- **§7 Timeline** — Oct 2025 → May 2026 build journey.
- **§8 Built by / share** — credits + share buttons.
- **Scroll progress bar** — pinned teal gradient bar at the top.
- **First-visit welcome overlay** — `MarkerWelcomeDemo` modal that gates once-per-session via sessionStorage.

#### Other pages
- **`ReportsPage`** — exports, school-wide CSV download.
- **`AboutPage`** — design process documentation, key decisions, testing results, reflections.

### 5.2 Dashboards (`src/dashboards/*.jsx`)

#### `AdminDashboard`
- Current leader strip + hero status widget (pulsing green dot when school > 90 %).
- Six-up stat grid (Total students, Present, Absent, Late, Staff, Classes) with animated count-ups.
- Trend analytics — Recharts area chart of monthly attendance over 5 years with 6M/1Y/2Y/5Y toggles.
- Year-group bar chart (Year 7-12 side-by-side).
- Searchable, filterable, paginated student roster (30 per page).
- System Status panel + Quick Actions (Simulate tap, Refresh device, Export CSV).
- Calendar heatmap (interactive — see below).
- Absence requests inbox with one-click approve/reject.
- Class & student leaderboards with medals.
- Live scan feed with per-student sparklines.
- Onboarding tour for first-time admin sign-ins.

#### `TeacherDashboard`
- Class roll (visual grid of students with present/absent badges).
- Click any student → `StudentDetailModal` opens.
- Messaging panel for parent conversations.

#### `StudentDashboard`
- Personal timetable, wellbeing check-in, attendance streak.
- Messaging with teachers.

#### `ParentDashboard`
- Their child's attendance + absence-request form.
- Messaging with teachers.

### 5.3 Components (`src/components/*.jsx`) — exhaustive list

| Component | Purpose | Notable features |
|---|---|---|
| `VeroTapAnimation` | 3D hero — blank white cards tapping the real CAD enclosure | Loads `vero-cloud-base.3mf` via three's `ThreeMFLoader`, white satin material, 3 staggered cards lay flat face-down with teal ripple, OrbitControls + auto-rotate + "Drag to spin" chip, lazy-loaded chunk |
| `VeroExplodedView` | Animated 4-layer exploded view | Real 3MF enclosure as top layer + stylised antenna coil + detailed ACR122U board + detailed Pi 3B (with 40 gold GPIO pins, USB/Ethernet/HDMI ports, microSD slot), stack→explode→hold→collapse cycle, drei `<Html>` annotations |
| `MarkerWelcomeDemo` | First-visit pipeline cascade for markers | sessionStorage gated, beckoning "Tap to scan" card, plays back the real NFC pipeline step-by-step (38 ms → 122 ms → 188 ms → 246 ms → 312 ms) with live latency counter |
| `RollImpactCalculator` | Live impact-of-manual-rolls calculator | Three sliders, gradient headline that updates live, equation breakdown in monospace, four impact stats, recovery bar showing 99.3 % time reclaimed |
| `MessagingDemo` | Interactive parent/teacher chat trial on marker page | Intent matcher (keywords like *absent / meeting / homework / thanks* → contextually appropriate replies), typing delay scales with reply length, sent/received counter, Reset button |
| `MessagingPanel` | Production messaging UI used in all dashboards | Typing indicator (3 bouncing dots), delivery ticks (sent / read), quick-reply chips, gradient teal bubbles with shadows, emoji + paperclip ghost composer buttons, focus ring, gradient send button with squash-on-send |
| `CommandPalette` | ⌘K spotlight search | Indexes all 1,050 students + role switches + quick actions, built-from-scratch fuzzy ranker (prefix > substring > subsequence with hit-count weighting), full keyboard nav (↑↓ ⏎ ⎋), ARIA combobox |
| `MilestoneConfetti` | Celebration when school crosses 95 % | Pure-DOM 80-particle burst (no `canvas-confetti` dep), gradient banner slides down from top, gated once per session per role |
| `Sparkline` | Zero-dep mini trend chart | SVG polyline + area fill + end dot, ~80 LOC, used in LiveFeed rows, deterministic seed function so the same student always gets the same trend |
| `AttendanceHeatmap` | Month-grid attendance % heatmap | Hover for preview, click to pin a rich detail panel with Present/Absent/Late counts, deterministic per-date, ARIA labels, max-width 520 px |
| `LiveFeed` | Real-time tap stream | Auto-scrolls to top on new tap, fade-highlight on the newest entry, per-student 7-day sparkline beside each row |
| `StudentDetailModal` | Full student profile drill-down | 12-week area chart, stat grid (term average, streak, card UID, joined), recent activity, emergency contact, working "Message parent" + "Email student" buttons that open prefilled mailto: |
| `Card` | Base surface | **Cursor-following teal spotlight** on hover (radial gradient tracks the mouse), lift + soft shadow, opt-out-able via `spotlight={false}` |
| `Reveal` | Scroll-triggered entrance | Fade + slide + slight scale + small blur with quintic ease (650 ms), `from="up\|down\|left\|right\|scale"` direction |
| `Nav` | Global header | Sticky with scroll-shrink, live wall-clock with heartbeat-pulsing connection dot, role pills, ⌘K search button, notifications dropdown, mobile hamburger + drawer + bottom tab bar |
| `Toast` | Notification system | Stacked, auto-dismiss, success/warn variants |
| `OnboardingTour` | First-visit guided tour | Step-by-step with spotlight, gated via storageKey |
| `RFIDSimulator` | Manual "Simulate tap" widget | Pulls a random not-yet-present student and fires the tap pipeline |
| `AbsenceRequestForm` | Parent-side form | Validation, date picker, reason textarea |
| `AbsenceRequestsAdmin` | Admin inbox | Expandable cards, one-click approve/reject |
| `AttendanceLeaders` | Top-attendance leaderboard | Animated progress bars, medals |
| `CountUp` | Animated number counter | Eases from 0 to target on mount/intersection |
| `Modal` | Reusable modal | Backdrop blur, focus trap, ESC to close |
| `Tagline` | "ATTENDANCE / MADE REAL" stacked typography | Animated word-by-word reveal |
| `Avatar` | Initials avatar with optional status ring | Colour derived deterministically from name |
| `Badge` | Status pill | `present / absent / late / info / teal / warn` variants |

### 5.4 Hooks (`src/hooks/*.js`)
- `useReveal` — IntersectionObserver wrapped as a hook (returns `[ref, visible]`).
- `useToast` / `ToastProvider` — context-based notification system.
- `useMediaQuery` / `useIsMobile` — viewport-aware responsive logic.
- `useCommandPaletteHotkey` — global ⌘K / Ctrl-K key binding.

### 5.5 Data (`src/data/*.js`)
- `sampleData.js` — 1,050 seeded students × 42 classes, 30 teachers, `monthlyAttendance` (5-year array), `yearlyStats`, `yearGroupRates`, `classLeaderboard`, `notifications`.
- `initialState.js` — `initialAbsenceRequests`, `initialThreads`, `extraNotifications`.

---

## 6. Key design decisions log (for the *Producing & Implementing* chapter)

### 6.1 Why NFC over QR/face/Bluetooth
- 80 ms tap, works in any light, can't be photographed/copied, students already carry IDs.
- QR requires camera permission, slower interaction, photographable.
- Facial recognition has consent issues under NSW privacy guidance.
- Bluetooth requires every student to own a phone running the app.

### 6.2 Why Raspberry Pi 3B over an Arduino
- Pi runs Python + Flask + Flask-SocketIO + SQLite + pyscard natively → single device handles everything.
- Arduino would need a separate host machine → doubles system complexity.
- Pi 3B retails for ~AUD $50 — affordable for a per-classroom deployment.

### 6.3 Why React 19 + Vite over Next.js
- Vercel hosts SPAs fine; no need for server-side rendering since dashboards are gated behind sign-in anyway.
- Vite gives sub-second cold start and ~100 ms HMR — critical for fast iteration.
- React 19 concurrent renderer batches the streaming NFC updates into one paint.

### 6.4 Why four role dashboards instead of one
- Each user has radically different needs: admin = school-wide analytics, teacher = single class roll, student = personal timetable, parent = their child + absence requests.
- A unified view would dilute every experience.
- Role-based access also satisfies the privacy non-functional requirement.

### 6.5 Why a 3MF model in the browser
- The 3D-printed enclosure CAD file is the source of truth — using a generic placeholder would misrepresent the actual product.
- Three.js ships a `ThreeMFLoader` that handles the file natively (it's a zip with XML inside; loader uses `fflate` internally).
- The 3MF lives at `public/models/vero-cloud-base.3mf` (321 KB).

### 6.6 Why the welcome demo
- A marker opening the project for the first time should immediately *see* the system's value.
- Showed a real NFC pipeline cascade (38 → 122 → 188 → 246 → 312 ms with realistic delays) gated via `sessionStorage` so it shows once per session and doesn't nag.

### 6.7 Why an in-browser messaging trial
- Static screenshots don't convey real-time messaging.
- The marker plays Mr Chen, types anything → tiny intent matcher (keywords: *absent / meeting / homework / thanks / question / behaviour*) generates contextually appropriate parent replies.
- Typing delay scales with reply length (`600 ms + 18 ms/char`, capped at 2.2 s) so it feels human.

### 6.8 Why I dropped `drei <Environment preset="studio" />`
- It fetches a 1 MB HDRI from `market.pmnd.rs` CDN at runtime — works in dev because three caches it, fails in production whenever that CDN is slow or blocked (school wifi, ad blockers, anti-tracking extensions).
- Replaced with pure-local lighting (hemisphere + ambient + 3 directionals) — visually almost identical for white plastic surfaces, **zero external runtime dependencies**.

### 6.9 Why I built confetti from scratch instead of using `canvas-confetti`
- 80 absolutely-positioned divs with CSS-transform animations ≈ 6 KB minified.
- `canvas-confetti` adds a canvas allocation per burst and ~12 KB.
- Pure DOM cleans up cleanly when the component unmounts.

### 6.10 Why the cursor-following spotlight on every Card
- Tiny effect (~20 LOC inside the base Card) that makes every dashboard surface feel premium without changing each page.
- Opt-out per card via `<Card spotlight={false}>` if a card has heavy nested content.

---

## 7. Testing & evaluation data (for the *Testing & Evaluating* chapter)

### 7.1 Measured metrics
| Metric | Value | Method |
|---|---|---|
| Card tap → UI update | **<100 ms** | `performance.now()` instrumented around the pyscard read → socket emit → React render loop |
| First Contentful Paint | **0.4 s** | Vercel production build, Lighthouse mobile run |
| Lighthouse Performance | **94/100** | Mobile, throttled 4G |
| Lighthouse Accessibility | **100/100** | Mobile, full audit |
| Teacher feedback score | **4.8/5** | n=4 teachers, post-demo questionnaire |
| Hardware uptime | **99.6 %** | 14-day continuous test on the Pi |

### 7.2 Iterations driven by feedback
1. **Iteration 1** — First teacher feedback: *"too many numbers, I just want to see who's missing."* Response: put the visual class roll **above** the analytics on the Teacher dashboard.
2. **Iteration 2** — Added the live scan feed pulse animation so teachers can see check-ins happen in real time.
3. **Iteration 3** — Teacher said *"rolls don't tell the whole story"* → built the absence-request system.
4. **Iteration 4** — Observed parents/teachers resorting to email/SMS → added the integrated messaging system with typing indicators and read receipts.
5. **Iteration 5** — Mobile testing on iPhone 14 + Android → desktop role-switcher was inaccessible → added bottom tab bar.
6. **Iteration 6** — Accessibility audit → added ARIA labels, full keyboard navigation, `prefers-reduced-motion` support.

### 7.3 Testing methodology
- **Unit-level**: deterministic seed functions for sparklines/profiles tested via property checks (same input → same output).
- **Integration**: scripted card-tap simulation that fires fake `card_tap` events into the WebSocket and asserts the dashboard re-renders within 200 ms.
- **End-to-end**: actual Pi 3B + ACR122U with real MIFARE cards, 14-day continuous run.
- **Accessibility**: Lighthouse audit + manual keyboard-only navigation pass + screen-reader (VoiceOver on macOS) walk-through.
- **Cross-browser**: Chrome, Safari, Firefox on macOS; mobile Safari on iPhone 14; Chrome on Android Pixel 6.
- **Performance**: Vite bundle analyser to confirm heavy chunks (Three.js, Recharts) are code-split and lazy-loaded.

### 7.4 What I'd build next (for the *Evaluation/Reflection* chapter)
1. Multi-campus support — tenancy + a school selector in the nav.
2. Native iOS/Android parent apps via React Native (sharing the same SocketIO backend).
3. Integration with school information systems (Sentral/Schoolbox) via standard APIs.
4. Real ML-based "predict absent" model trained on historical attendance trends.
5. Hardware revision — bring-up cost down to ~$25/classroom by switching to a Pi Zero 2 W.

---

## 8. Complete tech stack with versions and rationale

### Frontend
| Dep | Version | Role | Rationale |
|---|---|---|---|
| `react` / `react-dom` | 19.2.6 | UI framework | Concurrent renderer batches streaming NFC updates without dropped frames; custom hooks keep state clean |
| `vite` | 8.0.12 | Build tool | Sub-second HMR, native ES modules, esbuild-fast cold start |
| `recharts` | 3.8.1 | Charts | Accessible SVG (no canvas) → screen-reader friendly + free retint via `currentColor` |
| `lucide-react` | 1.16 | Icon set | Tree-shaken; only ~60 of 1,000+ icons end up in the bundle |
| `socket.io-client` | 4.8.3 | WebSocket | Auto-reconnect with exponential backoff; long-polling fallback for restrictive networks |
| `three` | 0.184 | 3D engine | Handles the real 3MF CAD geometry via bundled `ThreeMFLoader` |
| `@react-three/fiber` | 9.6.1 | R3F | Declarative React wrapper around three.js |
| `@react-three/drei` | 10.7.7 | R3F helpers | `OrbitControls`, `ContactShadows`, `Html` annotations |

### Backend (deployed on Raspberry Pi)
| Dep | Version | Role |
|---|---|---|
| Python | 3.11 | Pi-native runtime (Bookworm) |
| Flask | 3.0 | WSGI microframework |
| Flask-SocketIO | 5.3 | Bidirectional events |
| pyscard | 2.0 | PC/SC bindings for NFC reader |
| SQLite | 3 | Embedded relational store, single file |

### Hardware
- Raspberry Pi 3B rev 1.2 — quad-core ARM Cortex-A53
- ACR122U USB NFC reader — PN532 controller, ISO 14443 A/B
- PC/SC daemon (`pcscd`) — Linux smart-card middleware
- MIFARE Classic 13.56 MHz student cards
- 3D-printed PETG enclosure (CAD designed in Fusion 360, exported as 3MF)

### Deployment
- **Hosting**: Vercel (free tier).
- **Repository**: GitHub.
- **CI/CD**: Vercel auto-deploys on every push to `main`.
- **Configuration**: `vercel.json` sets `framework: "vite"`, `outputDirectory: "dist"`, SPA rewrite to `/index.html`.

---

## 9. Code architecture & file layout

```
veroattend/
├── public/
│   ├── models/
│   │   └── vero-cloud-base.3mf       (real CAD geometry, 321 KB)
│   ├── vero-wordmark.png
│   └── ...other static assets
├── src/
│   ├── main.jsx                       (entry point)
│   ├── App.jsx                        (auth + role state, routing, auto-tap simulator,
│   │                                    command palette mount, milestone confetti mount,
│   │                                    role-switch page transitions)
│   ├── pages/
│   │   ├── LoginPage.jsx              (mesh gradient bg, brand panel, role picker, form)
│   │   ├── MarkerPage.jsx             (full HSC portfolio, 8 sections + 2 overlays)
│   │   ├── ReportsPage.jsx
│   │   └── AboutPage.jsx
│   ├── dashboards/
│   │   ├── AdminDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── ParentDashboard.jsx
│   ├── components/  (24 files — see §5.3 table)
│   ├── hooks/
│   │   ├── useReveal.js
│   │   ├── useMediaQuery.js
│   │   └── (useToast lives in Toast.jsx)
│   ├── data/
│   │   ├── sampleData.js              (1,050 students + 5-year analytics)
│   │   └── initialState.js            (absence requests, threads, notifications)
│   └── styles/
│       └── global.css                 (design tokens, keyframes, base styles)
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

**Architecture conventions:**
- **State lives at the top** — `App.jsx` owns `students`, `taps`, `absenceRequests`, `threads`; dashboards receive them as props.
- **No global state library** — React 19's `useState` + Context (for toast) is enough at this scale.
- **Lazy-load heavy stuff** — `VeroTapAnimation`, `VeroExplodedView`, `MarkerWelcomeDemo`, `RollImpactCalculator`, `MessagingDemo` are all `lazy()`-imported so the initial bundle stays small.
- **Error boundaries** around every 3D component so a WebGL failure doesn't take down the page.
- **WebGL feature detection** before mounting any Canvas — fall back to a "3D preview unavailable" card if absent.

---

## 10. Animation & visual polish (for the *aesthetic criteria* part of the folio)

- **Login**: 4 drifting mesh-gradient blobs (22-30 s loops), kinetic word-by-word headline reveal with blur-pull, 300 hrs/yr focal stat with gradient text, live activity ticker rotating every 2.4 s.
- **Cards everywhere**: cursor-following teal radial-gradient spotlight on hover.
- **Reveals**: every section uses the `Reveal` component — fade + slide + slight scale + small blur with quintic ease (`cubic-bezier(0.22, 1, 0.36, 1)`, 650 ms).
- **Role switching**: keyed remount with `roleSlideIn` keyframe (translate-up + scale + blur).
- **Milestone**: 80-particle confetti burst from bottom corners + slide-down banner when school crosses 95 %.
- **Live feed**: new entries pulse-highlight teal then fade to neutral.
- **Live ticker**: simulated tap events rotate with slide-in animation.
- **Heartbeat dots**: pulsing radial shadow around the green "live" indicators in the nav and login chip.
- **Marker scroll bar**: pinned teal gradient bar at the top of the marker page that fills as you scroll.
- **3D cards**: rounded extruded rectangles, slight bevels, soft shadows, lay face-flat onto product top with a teal ripple ring.

All of this honours `prefers-reduced-motion` because the underlying CSS keyframes don't fight the OS-level reduce-motion setting (transitions only, no autoplay).

---

## 11. What I want you to do

When I send you this brief, I will follow with **one specific request**, e.g.:

- *"Write the Identifying & Defining chapter of my HSC folio (~2,500 words). Use the problem statement, stakeholder analysis, and requirements in this brief. Reference real data points (300 hrs/yr, $19,500/yr, the four teachers I interviewed)."*
- *"Generate the Research & Planning chapter (~2,000 words). Cover existing-solutions analysis, hardware/software alternatives considered, design system rationale, and project timeline."*
- *"Write the Producing & Implementing chapter (~3,000 words). Walk through system architecture, the four dashboards, key components (focus on VeroTapAnimation, MessagingDemo, CommandPalette, MilestoneConfetti), and at least 8 of the design decisions in §6."*
- *"Write the Testing & Evaluating chapter (~2,000 words). Include the measured metrics table, the six iteration-driven improvements, the testing methodology breakdown, and a critical reflection on what I'd do differently."*
- *"Generate a 1-page executive summary I can put on the front of the folio."*
- *"Generate a 30-second elevator pitch for the marker presentation."*
- *"Write me bullet-point talking points for a 5-minute live demo of the project."*

**Style rules for any folio writing:**
- First person ("I built…", "I chose…", "I tested…").
- Active voice.
- Concrete numbers and named technologies where possible — markers reward specificity.
- Reference iteration evidence (e.g. *"after teacher feedback that…"*).
- Australian English spelling (`colour`, `realise`, `centre`, `behaviour`).
- HSC SDD examiners look for: *design opportunity → research → criteria → prototype → evaluate → refine*. Make this loop visible.

---

**End of brief.** Append your specific ask below this line:

---

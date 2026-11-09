# DESIGN.md — GitPulse Analytics Design System (Awwwards Caliber)

## Phase 0: Brief
- **Subject:** GitPulse Analytics — High-Performance GitHub Developer Intelligence & DORA Engineering Health Engine powered by DuckDB.
- **Audience:** Engineering Leaders, VP of Eng, Staff Engineers, Tech Leads, and Open Source Maintainers.
- **Job:** Provide instant, high-density, sub-second visibility into team velocity, PR lifecycle funnels, DORA metrics, and AI text-to-insight.
- **Constraints:** Zero breaking changes with the existing FastAPI backend + DuckDB warehouse. High accessibility, 60fps local performance, and zero AI-slop clichés.

---

## Phase 1: Concept Card
```
Idea:        GitPulse is an engineering telemetry deck where every commit is a heartbeat and every metric measures software vitality.
Metaphor:    Mission-critical avionics & high-frequency developer telemetry (oscilloscope meets terminal).
Signature:   The Live Heartbeat Beacon & Micro-Telemetry Ribbon — interactive tactile status pins that breathe at rest and lock into place on sync.
Emotion:     Clinical precision, speed, and deep engineering confidence within 3 seconds.
Motion verb: Pulse & Lock (indicators breathe, values count in tabular mono, cards settle into laser-ruled hairlines).
Screenshot:  The Bento Telemetry Deck: dark obsidian ground (#07080a), laser-cut hairlines (#ffffff12), neon status beacons (Emerald, Indigo, Cyan), and tabular-num counters.
```

---

## Phase 2: Art Direction & System Tokens

### 1. Palette Archetype: Tech Precise (Obsidian & Laser Signal)
| Role | Token / Value | Purpose |
|---|---|---|
| `ground` | `#07080a` | Deep obsidian base, absorbing visual noise |
| `surface-1` | `#0d0f14` | Primary card container background with subtle matte blur |
| `surface-2` | `#13161f` | Elevated interactive controls, dropdowns, input fields |
| `line` | `rgba(255, 255, 255, 0.08)` | Ultra-fine laser-cut hairlines (1px crisp borders) |
| `line-active` | `rgba(99, 102, 241, 0.4)` | Focus & active hover border illumination |
| `ink-primary` | `#f3f4f6` | High-contrast text, headings, primary values |
| `ink-secondary` | `#9ca3af` | Telemetry labels, units, metadata (AA contrast certified) |
| `signal-pulse` | `#6366f1` | Electric Indigo — Git lineage & primary velocity |
| `signal-health`| `#10b981` | Emerald — Elite DORA status & merged throughput |
| `signal-stream`| `#06b6d4` | Cyan — Code volume & real-time telemetry |
| `signal-alert` | `#f59e0b` | Amber — Bottlenecks & latency warnings |

### 2. Typography
- **Primary Sans:** Inter / Geist / System Neo-Grotesk (`font-sans`), tight tracking (-0.025em to -0.04em for display titles).
- **Telemetry Mono:** JetBrains Mono / Geist Mono / UI Monospace (`font-mono`), `tabular-nums` applied strictly to all counts, timestamps, commit hashes, and percentages.
- **Hierarchy:**
  - Micro-tags: 10px - 11px uppercase `tracking-wider font-mono font-medium`.
  - Body & Table: 12px - 13px with 1.5 leading.
  - Metrics Values: 20px - 28px `font-mono font-bold tracking-tight`.
  - Section Headers: 14px - 16px with crisp icon pairing.

### 3. Rhythm & Grid
- **Global Frame:** Maximum width 1320px (`max-w-[1320px]`), balanced 24px gutters, asymmetric 8:4 column layout for analytical balance (wide timeline chart + focused funnel; wide contributor table + focused anomaly feed).
- **Surface Elevation:** Dual-border technique — 1px outer hairline (`border-white/[0.08]`) over subtle drop-shadow with inset highlight (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`).
- **Interactive Feedback:** Every button and interactive card utilizes micro-transitions (150ms ease-out) with active scale compression (`active:scale-[0.98]`) and laser border intensification.

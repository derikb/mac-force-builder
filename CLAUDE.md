# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server on port 8087 with live bundling (esbuild)
npm run build    # Production build: minified + sourcemap → www/
npm run release  # Semver release via commit-and-tag-version
```

Linting: `npx eslint src/` (4-space indent, semicolons, single quotes — see `eslint.config.mjs`)

No tests are implemented.

## Architecture

Single-page app built with **Lit web components** + **Bootstrap 5** + **esbuild**. All persistence is browser **LocalStorage** only — no backend.

### Layers

**Components** (`src/components/`) — Lit elements that extend `BaseElement` (which injects Bootstrap styles). Layout is a 3-column desktop / 1-column mobile design managed by `ForcePage`.

**EventEmitter** (`src/models/EventEmitter.js`) — Singleton pub-sub bus used instead of a state store. Components communicate exclusively through events (e.g., `force:show:edit`, `mac:module:update`). The emitter instance is imported and shared across the app.

**Services** (`src/services/`) — Business logic layer. `ForceService` is the central orchestrator: Force CRUD, import/export from JSON, validation. `HardwareService` wrap the static game data in `src/data/`.

**Models** (`src/models/`) — Plain JS classes: `Force` (root aggregate) → contains `MAC[]` + `AuxUnit[]`. Each `MAC` has 6 `Module` slots; each module holds a `Weapon` or `Hardware`.

**Data** (`src/data/`) — Static game constants: weapon ranges, types, subtypes, hardware definitions.

**Storage** (`src/store/Storage.js`) — Thin LocalStorage wrapper with a `"mac-"` key prefix.

### Typical data flow

User interaction → component calls `emitter.trigger(event)` → listener components respond → services fetch/mutate data → `ForceService.saveForce()` persists to LocalStorage → storage change re-triggers events → components re-render.

### Build output

`www/` contains the compiled bundle (`index.js`), source map, and three HTML entry points: `index.html` (builder), `play.html` (gameplay), `print.html` (print view). The `www/index.js` checked in is the production build artifact.

## Game domain

This is a force builder for the **MAC Attack** tabletop miniature game. Key concepts:

- **Force** — a named collection of MACs and AUs with a faction and point total
- **MAC** (Mechanized Armor Unit) — class 1–3, has 6 module slots (1 main gun + others); base cost 12–20 pts
- **Module** — a slot on a MAC holding either a Weapon or Hardware item
- **AuxUnit** (Auxiliary Unit) — support unit; cost = 1 + hardware count + weapon class sum
- **Weapon** — defined by Range (S/L/A), Power (1–4), Type (B/P/G/M), Subtype (T/J/R/X)
- Cost calculation lives in `src/CostCalculator.js`; game rules are documented in `notes.md`

## Incomplete areas

- `ForcePrint` components exist but are not wired up in `src/index.js`

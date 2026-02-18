# Pitcher
Pitcher is a lightweight training aid that helps aspiring musicians improve pitch recognition through synchronized visual and auditory cues.

## Features

- [x] Virtual piano for practicing and replaying tones
- [x] Virtual guitar for practicing and replaying tones
- [x] Full-screen color panel that mirrors the note currently being played
- [x] Tone quiz where a tone is played and student tries to guess the correct tone.
- [x] Listen mode where any instrument or voice can be used to train pitch

Each note keeps the same hue across octaves, while brightness indicates register—higher octaves appear lighter and lower octaves darker. The palette mirrors the traditional Boomwhackers color system:

| Note   | Color        |
|--------|--------------|
| C      | Red          |
| C#/Db  | Red-orange   |
| D      | Orange       |
| D#/Eb  | Yellow-orange|
| E      | Yellow       |
| F      | Green        |
| F#/Gb  | Dark green   |
| G      | Teal         |
| G#/Ab  | Blue         |
| A      | Indigo       |
| A#/Bb  | Purple       |
| B      | Violet       |

## Technical Overview

Pitcher is a React 19 + TypeScript 5.9 single-page application scaffolded with Vite 7. It has no router library — page switching is handled by a simple state string in the root `App` component. All styling is inline (no CSS framework).

### Architecture

| Layer | Details |
|-------|---------|
| Framework | React 19, TypeScript 5.9, Vite 7 (ESM) |
| Audio synthesis | Tone.js `PolySynth` (triangle8 oscillator, ADSR envelope) via `useSynth` hook |
| Pitch detection | Custom YIN algorithm (de Cheveigné & Kawahara, 2002) over Web Audio API — zero external deps — in `usePitchDetector` hook |
| Color system | Boomwhackers standard, HSL-based with octave → lightness mapping (`noteColors.ts`) |
| Styling | 100 % inline React styles; glassmorphism via `backdropFilter` |
| Input handling | Pointer Events with `setPointerCapture` for reliable multi-touch on Piano & Guitar |
| State management | Local `useState` / `useCallback` / `useRef` — no global store |

### Source map

```
src/
├── main.tsx              # Entry point — renders <App /> into #root
├── App.tsx               # Root shell: NavMenu + state-based page routing
├── NavMenu.tsx           # Fixed hamburger menu with glassmorphism dropdown
│
├── PracticePage.tsx      # "Free Play" — piano/guitar + full-screen color region
├── Piano.tsx             # Responsive piano keyboard (configurable octave range)
├── GuitarNeck.tsx        # Responsive 6-string fretboard (standard tuning, 15 frets)
├── ColorRegion.tsx       # Full-viewport color panel showing active note + label
│
├── ToneQuizPage.tsx      # "Tone Quiz" — random note playback, 12-button guess grid
│                         #   State machine: idle → listening → correct/wrong
│                         #   Two difficulty toggles: color hint + button colors
│
├── ListenerPage.tsx      # "Note Listener" — mic input, real-time pitch display
│                         #   Shows note, color, frequency, cents-offset tuning bar
│
├── AboutPage.tsx         # Static about / info page
│
├── noteColors.ts         # Core data: Boomwhackers HSL map, pitch-class constants,
│                         #   getNoteColor(), isBlackKey()
├── useSynth.ts           # Hook: Tone.js PolySynth (lazy init, playNote/stopNote)
├── usePitchDetector.ts   # Hook: YIN pitch detection via Web Audio API
│                         #   Returns { frequency, note, cents, clarity }
└── index.css             # Global reset (dark bg, box-sizing, font stack)
```

### Key patterns

- **Responsive instruments** — both `Piano` and `GuitarNeck` derive key/fret sizes from container width via a shared `useContainerWidth` hook (ResizeObserver). Dimensions are capped at an ideal maximum and shrink proportionally on narrow viewports.
- **Pointer capture** — instrument components use `setPointerCapture` on `pointerdown` so note-off fires reliably even when the pointer leaves the element.
- **Lazy audio** — the Tone.js synth and `AudioContext` are created on first user gesture to comply with browser autoplay policies.
- **YIN pitch detection** — runs in a `requestAnimationFrame` loop at ~60 fps. Includes an RMS silence gate, a clarity threshold (0.8), and parabolic interpolation for sub-sample accuracy. No external pitch-detection library.
- **State-machine quiz** — `ToneQuizPage` uses a `QuizState` union (`idle | listening | correct | wrong`) to drive UI transitions, with two independent boolean toggles producing four difficulty levels.

### Getting started

```bash
npm install
npm run dev      # Vite dev server with HMR
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve production build locally
```
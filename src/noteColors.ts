/**
 * Boomwhackers color mapping.
 *
 * Each note class maps to an HSL hue + saturation.
 * Octave controls lightness: higher octaves → lighter colors.
 */

export interface NoteColor {
  /** CSS color string */
  color: string;
  /** Human-readable label */
  label: string;
}

// Hue / saturation for each pitch class (Boomwhackers scheme)
const pitchClassHSL: Record<string, { h: number; s: number; label: string }> = {
  C:  { h: 0,   s: 80, label: "Red" },
  "C#": { h: 20,  s: 85, label: "Red-orange" },
  D:  { h: 30,  s: 90, label: "Orange" },
  "D#": { h: 45,  s: 90, label: "Yellow-orange" },
  E:  { h: 55,  s: 90, label: "Yellow" },
  F:  { h: 130, s: 70, label: "Green" },
  "F#": { h: 150, s: 60, label: "Dark green" },
  G:  { h: 175, s: 60, label: "Teal" },
  "G#": { h: 215, s: 75, label: "Blue" },
  A:  { h: 245, s: 60, label: "Indigo" },
  "A#": { h: 280, s: 65, label: "Purple" },
  B:  { h: 295, s: 60, label: "Violet" },
};

/**
 * MIDI note range we support (piano‐like: C1 – C7 = MIDI 24–96).
 * Lightness scales from ~25 % (lowest octave) to ~75 % (highest).
 */
const MIN_OCTAVE = 1;
const MAX_OCTAVE = 7;

function lightnessForOctave(octave: number): number {
  const t = (octave - MIN_OCTAVE) / (MAX_OCTAVE - MIN_OCTAVE);
  return 25 + t * 50; // 25 % → 75 %
}

/**
 * Given a note name like "C4", "F#3", "Bb5" etc., return its
 * Boomwhackers color as a CSS hsl() string.
 */
export function getNoteColor(noteName: string): NoteColor {
  // Parse e.g. "F#3" → pitchClass "F#", octave 3
  const match = noteName.match(/^([A-G]#?)(\d)$/);
  if (!match) return { color: "#222", label: "" };
  const [, pitchClass, octStr] = match;
  const octave = parseInt(octStr, 10);
  const entry = pitchClassHSL[pitchClass];
  if (!entry) return { color: "#222", label: "" };
  const l = lightnessForOctave(octave);
  return {
    color: `hsl(${entry.h}, ${entry.s}%, ${l}%)`,
    label: entry.label,
  };
}

/** All 12 pitch classes in chromatic order */
export const PITCH_CLASSES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

/** Is the given pitch class a "black key"? */
export function isBlackKey(pitchClass: string): boolean {
  return pitchClass.includes("#");
}

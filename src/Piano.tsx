import React, { useCallback, useRef, useState, useEffect } from "react";
import { PITCH_CLASSES, isBlackKey, getNoteColor } from "./noteColors";

/* ── types ─────────────────────────────────────────────── */

interface PianoProps {
  /** Lowest octave shown (default 2) */
  startOctave?: number;
  /** Highest octave shown (default 6) */
  endOctave?: number;
  /** Called when a note starts sounding */
  onNoteOn: (note: string) => void;
  /** Called when a note stops sounding */
  onNoteOff: (note: string) => void;
}

/* ── constants ─────────────────────────────────────────── */

// Ideal (max) pixel sizes – used on wide viewports
const MAX_WHITE_KEY_WIDTH = 48;
const WHITE_HEIGHT_RATIO = 180 / 48;   // height relative to width
const BLACK_WIDTH_RATIO = 30 / 48;     // black key width relative to white
const BLACK_HEIGHT_RATIO = 110 / 180;  // black key height relative to white height

// Offset of each black key relative to the start of the natural note
// that precedes it, expressed as a fraction of WHITE_KEY_WIDTH.
const BLACK_KEY_OFFSETS: Record<string, number> = {
  "C#": 0.65,
  "D#": 1.65,
  "F#": 3.65,
  "G#": 4.65,
  "A#": 5.65,
};

/* ── helpers ───────────────────────────────────────────── */

function buildKeys(startOctave: number, endOctave: number) {
  const whites: { note: string; octave: number; index: number }[] = [];
  const blacks: { note: string; octave: number; offsetWhites: number }[] = [];

  let whiteIndex = 0;

  for (let oct = startOctave; oct <= endOctave; oct++) {
    const octaveWhiteStart = whiteIndex;
    for (const pc of PITCH_CLASSES) {
      const name = `${pc}${oct}`;
      if (isBlackKey(pc)) {
        const offset = octaveWhiteStart + BLACK_KEY_OFFSETS[pc]!;
        blacks.push({ note: name, octave: oct, offsetWhites: offset });
      } else {
        whites.push({ note: name, octave: oct, index: whiteIndex });
        whiteIndex++;
      }
    }
  }

  return { whites, blacks, totalWhites: whiteIndex };
}

/** Hook that tracks an element's width via ResizeObserver. */
function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/* ── component ─────────────────────────────────────────── */

const Piano: React.FC<PianoProps> = ({
  startOctave = 2,
  endOctave = 6,
  onNoteOn,
  onNoteOff,
}) => {
  const { whites, blacks, totalWhites } = buildKeys(startOctave, endOctave);

  // Measure container to derive responsive key sizes
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  // Key dimensions scale with viewport; capped at ideal max
  const whiteKeyW = Math.min(MAX_WHITE_KEY_WIDTH, (containerWidth - 16) / totalWhites);
  const whiteKeyH = whiteKeyW * WHITE_HEIGHT_RATIO;
  const blackKeyW = whiteKeyW * BLACK_WIDTH_RATIO;
  const blackKeyH = whiteKeyH * BLACK_HEIGHT_RATIO;
  const totalWidth = totalWhites * whiteKeyW;
  const gap = Math.max(1, whiteKeyW * 0.04); // thin gap between white keys

  // Track which notes are pressed (for visual highlighting)
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const pressedRef = useRef(pressed);
  pressedRef.current = pressed;

  // Keep track of pointer captures so we can handle drag‐off correctly
  const pointerNoteRef = useRef<Map<number, string>>(new Map());

  const noteOn = useCallback(
    (note: string, pointerId: number) => {
      pointerNoteRef.current.set(pointerId, note);
      setPressed((prev) => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });
      onNoteOn(note);
    },
    [onNoteOn],
  );

  const noteOff = useCallback(
    (note: string, pointerId: number) => {
      pointerNoteRef.current.delete(pointerId);
      setPressed((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      onNoteOff(note);
    },
    [onNoteOff],
  );

  /* ── render ─────────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        justifyContent: "center",
        padding: "clamp(4px, 1.5vw, 12px) 0 clamp(4px, 1vw, 8px)",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: totalWidth,
          height: whiteKeyH,
          flexShrink: 0,
        }}
      >
        {/* White keys */}
        {whites.map(({ note, index }) => {
          const { color } = getNoteColor(note);
          const isActive = pressed.has(note);
          return (
            <div
              key={note}
              onPointerDown={(e) => {
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                noteOn(note, e.pointerId);
              }}
              onPointerUp={(e) => noteOff(note, e.pointerId)}
              onPointerCancel={(e) => noteOff(note, e.pointerId)}
              onPointerLeave={(e) => {
                if (pressedRef.current.has(note)) noteOff(note, e.pointerId);
              }}
              style={{
                position: "absolute",
                left: index * whiteKeyW,
                top: 0,
                width: whiteKeyW - gap,
                height: whiteKeyH,
                background: isActive
                  ? `linear-gradient(180deg, ${color} 0%, #fff 100%)`
                  : "linear-gradient(180deg, #ffffff 0%, #e8e8e8 85%, #d0d0d0 100%)",
                border: "1px solid #999",
                borderRadius: "0 0 6px 6px",
                cursor: "pointer",
                boxShadow: isActive
                  ? `0 0 18px ${color}, inset 0 -4px 6px rgba(0,0,0,0.15)`
                  : "inset 0 -4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.2)",
                transition: "background 0.06s, box-shadow 0.06s",
                zIndex: 1,
              }}
            />
          );
        })}

        {/* Black keys */}
        {blacks.map(({ note, offsetWhites }) => {
          const { color } = getNoteColor(note);
          const isActive = pressed.has(note);
          return (
            <div
              key={note}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                noteOn(note, e.pointerId);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                noteOff(note, e.pointerId);
              }}
              onPointerCancel={(e) => noteOff(note, e.pointerId)}
              onPointerLeave={(e) => {
                if (pressedRef.current.has(note)) noteOff(note, e.pointerId);
              }}
              style={{
                position: "absolute",
                left: offsetWhites * whiteKeyW,
                top: 0,
                width: blackKeyW,
                height: blackKeyH,
                background: isActive
                  ? `linear-gradient(180deg, ${color} 0%, #555 100%)`
                  : "linear-gradient(180deg, #333 0%, #111 100%)",
                border: "1px solid #000",
                borderRadius: "0 0 4px 4px",
                cursor: "pointer",
                boxShadow: isActive
                  ? `0 0 14px ${color}`
                  : "0 3px 6px rgba(0,0,0,0.5)",
                transition: "background 0.06s, box-shadow 0.06s",
                zIndex: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Piano;

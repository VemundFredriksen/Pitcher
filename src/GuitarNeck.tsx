import React, { useCallback, useRef, useState, useEffect } from "react";
import { PITCH_CLASSES, getNoteColor } from "./noteColors";

/* ── types ──────────────────────────────────────────────── */

interface GuitarNeckProps {
  /** Number of frets to display (default 15) */
  frets?: number;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
}

/* ── constants ──────────────────────────────────────────── */

// Standard tuning, ordered high-to-low visually (high E at top, low E at bottom)
// but we'll reverse when rendering so low E is at the bottom (tab style).
const OPEN_STRINGS: { note: string; pitchClassIndex: number; octave: number }[] = [
  { note: "E4", pitchClassIndex: 4, octave: 4 },  // high E (1st string) — top row
  { note: "B3", pitchClassIndex: 11, octave: 3 },  // B      (2nd string)
  { note: "G3", pitchClassIndex: 7, octave: 3 },   // G      (3rd string)
  { note: "D3", pitchClassIndex: 2, octave: 3 },   // D      (4th string)
  { note: "A2", pitchClassIndex: 9, octave: 2 },   // A      (5th string)
  { note: "E2", pitchClassIndex: 4, octave: 2 },   // low E  (6th string) — bottom row
];

/** Get the note name at a given fret for a given open string. */
function noteAt(
  pitchClassIndex: number,
  octave: number,
  fret: number,
): string {
  const totalSemitones = pitchClassIndex + fret;
  const pc = PITCH_CLASSES[totalSemitones % 12];
  const oct = octave + Math.floor(totalSemitones / 12);
  return `${pc}${oct}`;
}

// Position dots (standard guitar inlays)
const DOT_FRETS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21]);
const DOUBLE_DOT_FRETS = new Set([12]);

/* ── responsive hook ────────────────────────────────────── */

function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/* ── component ──────────────────────────────────────────── */

const GuitarNeck: React.FC<GuitarNeckProps> = ({
  frets = 15,
  onNoteOn,
  onNoteOff,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const pressedRef = useRef(pressed);
  pressedRef.current = pressed;

  const noteOnCb = useCallback(
    (note: string, pointerId: number) => {
      void pointerId;
      setPressed((prev) => new Set(prev).add(note));
      onNoteOn(note);
    },
    [onNoteOn],
  );

  const noteOffCb = useCallback(
    (note: string, pointerId: number) => {
      void pointerId;
      setPressed((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      onNoteOff(note);
    },
    [onNoteOff],
  );

  /* ── sizing ─────────────────────────────────────────── */

  const numStrings = OPEN_STRINGS.length;
  const totalFrets = frets + 1; // include open (fret 0)

  // Leave room for string labels on the left
  const labelWidth = 36;
  const availW = Math.max(0, containerWidth - labelWidth - 8);
  const cellW = Math.max(28, availW / totalFrets);
  const cellH = Math.max(24, Math.min(36, cellW * 0.7));

  // Strings rendered bottom-to-top: index 0 = low E (bottom), 5 = high E (top)
  // OPEN_STRINGS is already high-to-low, so we reverse for rendering.
  const stringsBottomUp = [...OPEN_STRINGS].reverse();

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflowX: "auto",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)",
        padding: "clamp(6px, 1.5vw, 14px) 0",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ flexShrink: 0 }}>
          {/* Fret numbers */}
          <div style={{ display: "flex", marginLeft: labelWidth, marginBottom: 2 }}>
            {Array.from({ length: totalFrets }, (_, f) => (
              <div
                key={f}
                style={{
                  width: cellW,
                  textAlign: "center",
                  fontSize: Math.min(11, cellW * 0.35),
                  color: "rgba(255,255,255,0.3)",
                  lineHeight: 1,
                }}
              >
                {f === 0 ? "" : f}
              </div>
            ))}
          </div>

          {/* Strings (top = high E when viewed, bottom = low E) */}
          {stringsBottomUp
            .slice()
            .reverse()
            .map((str, visualRow) => {
              // visualRow 0 = top of grid = high E (1st string)
              const strData = stringsBottomUp[numStrings - 1 - visualRow];
              return (
                <div key={str.note} style={{ display: "flex", alignItems: "center" }}>
                  {/* String label */}
                  <div
                    style={{
                      width: labelWidth,
                      textAlign: "center",
                      fontSize: Math.min(13, cellW * 0.4),
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {strData.note.replace(/\d/, "")}
                  </div>

                  {/* Frets */}
                  {Array.from({ length: totalFrets }, (_, fret) => {
                    const note = noteAt(strData.pitchClassIndex, strData.octave, fret);
                    const { color } = getNoteColor(note);
                    const isActive = pressed.has(note);
                    const isOpen = fret === 0;
                    const isDot =
                      DOT_FRETS.has(fret) &&
                      (visualRow === Math.floor(numStrings / 2) ||
                        (DOUBLE_DOT_FRETS.has(fret) &&
                          (visualRow === Math.floor(numStrings / 2) - 1 ||
                            visualRow === Math.floor(numStrings / 2) + 1)));

                    return (
                      <div
                        key={fret}
                        onPointerDown={(e) => {
                          (e.target as HTMLElement).setPointerCapture(e.pointerId);
                          noteOnCb(note, e.pointerId);
                        }}
                        onPointerUp={(e) => noteOffCb(note, e.pointerId)}
                        onPointerCancel={(e) => noteOffCb(note, e.pointerId)}
                        onPointerLeave={(e) => {
                          if (pressedRef.current.has(note)) noteOffCb(note, e.pointerId);
                        }}
                        style={{
                          position: "relative",
                          width: cellW,
                          height: cellH,
                          background: isActive
                            ? color
                            : isOpen
                              ? "rgba(255,255,255,0.04)"
                              : "#2a1f0f",
                          borderRight: isOpen
                            ? "3px solid #aaa"
                            : "1px solid rgba(180,140,80,0.35)",
                          borderBottom: `2px solid ${
                            visualRow >= numStrings - 2
                              ? "rgba(200,180,140,0.7)"
                              : "rgba(200,180,140,0.45)"
                          }`,
                          cursor: "pointer",
                          transition: "background 0.08s",
                          boxShadow: isActive ? `0 0 10px ${color}` : "none",
                        }}
                      >
                        {/* Fret dot markers */}
                        {isDot && (
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              width: Math.min(8, cellW * 0.22),
                              height: Math.min(8, cellW * 0.22),
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.12)",
                              pointerEvents: "none",
                            }}
                          />
                        )}

                        {/* Note label when pressed */}
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: Math.min(11, cellW * 0.32),
                              fontWeight: 700,
                              color: "#fff",
                              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                              pointerEvents: "none",
                            }}
                          >
                            {note.replace(/\d/, "")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default GuitarNeck;

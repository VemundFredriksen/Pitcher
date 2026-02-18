import { useState, useCallback } from "react";
import Piano from "./Piano";
import GuitarNeck from "./GuitarNeck";
import ColorRegion from "./ColorRegion";
import { getNoteColor } from "./noteColors";
import { useSynth } from "./useSynth";

type Instrument = "piano" | "guitar";

export default function PracticePage() {
  const { playNote, stopNote } = useSynth();

  const [instrument, setInstrument] = useState<Instrument>("piano");
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [, setActiveNotes] = useState<Set<string>>(new Set());

  const handleNoteOn = useCallback(
    (note: string) => {
      playNote(note);
      setActiveNote(note);
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });
    },
    [playNote],
  );

  const handleNoteOff = useCallback(
    (note: string) => {
      stopNote(note);
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        if (note === activeNote) {
          if (next.size > 0) {
            setActiveNote([...next].pop()!);
          } else {
            setActiveNote(null);
          }
        }
        return next;
      });
    },
    [stopNote, activeNote],
  );

  const { color, label } = activeNote
    ? getNoteColor(activeNote)
    : { color: "#222", label: "" };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Color region ───────────────────────────────── */}
      <div style={{ flex: "7 1 0", minHeight: 0, display: "flex" }}>
        <ColorRegion color={color} label={label} note={activeNote ?? ""} />
      </div>

      {/* ── Instrument area ────────────────────────────── */}
      <div
        style={{
          flex: "3 1 0",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Instrument switcher */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            padding: "6px 0 0",
            background: "linear-gradient(180deg, #13132a 0%, #1a1a2e 100%)",
          }}
        >
          <InstrumentTab
            icon="🎹"
            label="Piano"
            active={instrument === "piano"}
            onClick={() => setInstrument("piano")}
          />
          <InstrumentTab
            icon="🎸"
            label="Guitar"
            active={instrument === "guitar"}
            onClick={() => setInstrument("guitar")}
          />
        </div>

        {/* Active instrument */}
        {instrument === "piano" ? (
          <Piano
            startOctave={2}
            endOctave={6}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />
        ) : (
          <GuitarNeck
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />
        )}
      </div>
    </div>
  );
}

/* ── Instrument tab button ──────────────────────────────── */

function InstrumentTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 16px",
        fontSize: "0.85rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#fff" : "rgba(255,255,255,0.45)",
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        border: "none",
        borderBottom: active
          ? "2px solid rgba(255,255,255,0.7)"
          : "2px solid transparent",
        borderRadius: "8px 8px 0 0",
        cursor: "pointer",
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
      }}
    >
      <span style={{ fontSize: "1.15rem" }}>{icon}</span>
      {label}
    </button>
  );
}

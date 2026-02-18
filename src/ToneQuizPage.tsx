import { useState, useCallback, useRef, useEffect } from "react";
import { PITCH_CLASSES, getNoteColor } from "./noteColors";
import { useSynth } from "./useSynth";

/* ── helpers ────────────────────────────────────────────── */

/** Build a flat list of all note names in a given octave range. */
function allNotes(startOct: number, endOct: number): string[] {
  const notes: string[] = [];
  for (let o = startOct; o <= endOct; o++) {
    for (const pc of PITCH_CLASSES) notes.push(`${pc}${o}`);
  }
  return notes;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── types ──────────────────────────────────────────────── */

type QuizState = "idle" | "listening" | "correct" | "wrong";

/* ── component ──────────────────────────────────────────── */

export default function ToneQuizPage() {
  const { playNote, stopNote } = useSynth();

  const notes = useRef(allNotes(3, 5)).current; // C3 – B5

  const [state, setState] = useState<QuizState>("idle");
  const [targetNote, setTargetNote] = useState<string | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [showButtonColors, setShowButtonColors] = useState(true);

  // Stop any lingering note on unmount
  const lastPlayed = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (lastPlayed.current) stopNote(lastPlayed.current);
    };
  }, [stopNote]);

  /* ── actions ─────────────────────────────────────────── */

  const playTarget = useCallback(
    async (note: string) => {
      if (lastPlayed.current) stopNote(lastPlayed.current);
      await playNote(note);
      lastPlayed.current = note;
      // Release after 1.5 s so it doesn't ring forever
      setTimeout(() => {
        stopNote(note);
        lastPlayed.current = null;
      }, 1500);
    },
    [playNote, stopNote],
  );

  const startRound = useCallback(async () => {
    const note = pickRandom(notes);
    setTargetNote(note);
    setGuess(null);
    setState("listening");
    await playTarget(note);
  }, [notes, playTarget]);

  const handleGuess = useCallback(
    (pc: string) => {
      if (state !== "listening" || !targetNote) return;
      setGuess(pc);
      // Compare pitch class only (ignore octave)
      const targetPC = targetNote.replace(/\d/, "");
      if (pc === targetPC) {
        setState("correct");
        setStreak((s) => {
          const next = s + 1;
          setBest((b) => Math.max(b, next));
          return next;
        });
      } else {
        setState("wrong");
        setStreak(0);
      }
    },
    [state, targetNote],
  );

  const replayTarget = useCallback(async () => {
    if (targetNote) await playTarget(targetNote);
  }, [targetNote, playTarget]);

  /* ── derived values ──────────────────────────────────── */

  const targetColor = targetNote ? getNoteColor(targetNote) : null;

  const bgColor =
    state === "correct"
      ? targetColor?.color ?? "#222"
      : state === "wrong"
        ? "#c0392b"
        : state === "listening" && showHint
          ? targetColor?.color ?? "#222"
          : "#222";

  /* ── render ──────────────────────────────────────────── */

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        background: bgColor,
        transition: "background 0.3s ease",
      }}
    >
      {/* ── Top area ────────────────────────────────────── */}
      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
        }}
      >
        {/* Streak counter */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
            color: "rgba(255,255,255,0.5)",
            textAlign: "right",
            lineHeight: 1.5,
          }}
        >
          <div>
            Streak: <strong style={{ color: "#fff" }}>{streak}</strong>
          </div>
          <div>
            Best: <strong style={{ color: "#fff" }}>{best}</strong>
          </div>
        </div>

        {/* Color hint toggle */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 60,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Toggle
            checked={showHint}
            onChange={() => setShowHint((v) => !v)}
            label="Color hint"
          />
          <Toggle
            checked={showButtonColors}
            onChange={() => setShowButtonColors((v) => !v)}
            label="Button colors"
          />
        </div>

        {state === "idle" && (
          <>
            <span
              style={{
                fontSize: "clamp(1.2rem, 4vw, 2rem)",
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
              }}
            >
              Tone Quiz
            </span>
            <span
              style={{
                fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                maxWidth: 420,
              }}
            >
              A note will be played. Try to identify it by clicking the correct
              pitch below.
            </span>
            <button onClick={startRound} style={btnStyle}>
              Start
            </button>
          </>
        )}

        {state === "listening" && (
          <>
            <span
              style={{
                fontSize: "clamp(1.4rem, 5vw, 2.4rem)",
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Which note is this?
            </span>
            <button onClick={replayTarget} style={{ ...btnStyle, background: "rgba(255,255,255,0.12)" }}>
              Replay ▶
            </button>
          </>
        )}

        {state === "correct" && (
          <>
            <span
              style={{
                fontSize: "clamp(1.6rem, 6vw, 3rem)",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              ✓ Correct!
            </span>
            <span
              style={{
                fontSize: "clamp(1rem, 3vw, 1.4rem)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              It was <strong>{targetNote}</strong>{" "}
              ({targetColor?.label})
            </span>
            <button onClick={startRound} style={btnStyle}>
              Next →
            </button>
          </>
        )}

        {state === "wrong" && (
          <>
            <span
              style={{
                fontSize: "clamp(1.6rem, 6vw, 3rem)",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              ✗ Not quite
            </span>
            <span
              style={{
                fontSize: "clamp(1rem, 3vw, 1.4rem)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              You guessed <strong>{guess}</strong> — it was{" "}
              <strong>{targetNote}</strong> ({targetColor?.label})
            </span>
            <button onClick={startRound} style={btnStyle}>
              Try again →
            </button>
          </>
        )}
      </div>

      {/* ── Pitch-class buttons ─────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
          gap: 6,
          padding: "12px clamp(8px, 3vw, 32px) clamp(12px, 3vh, 28px)",
          background: "rgba(0,0,0,0.35)",
        }}
      >
        {PITCH_CLASSES.map((pc) => {
          const { color } = getNoteColor(`${pc}4`);
          const isGuessed = guess === pc;
          const isTarget =
            (state === "correct" || state === "wrong") &&
            targetNote?.replace(/\d/, "") === pc;

          // Show real color only when toggle is on, OR after answering
          const useColor =
            showButtonColors || state === "correct" || state === "wrong";
          const btnBg = useColor ? color : "rgba(255,255,255,0.1)";

          return (
            <button
              key={pc}
              disabled={state !== "listening"}
              onClick={() => handleGuess(pc)}
              style={{
                padding: "clamp(10px, 2.5vh, 20px) 0",
                fontSize: "clamp(0.85rem, 2.5vw, 1.15rem)",
                fontWeight: 700,
                border: isTarget
                  ? "2px solid #fff"
                  : isGuessed
                    ? "2px solid rgba(255,255,255,0.6)"
                    : "2px solid transparent",
                borderRadius: 8,
                background: btnBg,
                color: "#fff",
                cursor: state === "listening" ? "pointer" : "default",
                opacity: state === "listening" ? 1 : 0.55,
                transition:
                  "opacity 0.15s, border 0.15s, transform 0.1s, background 0.2s",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                transform: isGuessed ? "scale(1.08)" : "scale(1)",
              }}
            >
              {pc}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── shared button style ────────────────────────────────── */

const btnStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "12px 32px",
  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
  fontWeight: 600,
  color: "#fff",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 10,
  cursor: "pointer",
  backdropFilter: "blur(4px)",
  transition: "background 0.15s",
};

/* ── reusable toggle ────────────────────────────────────── */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={onChange}
    >
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked
            ? "rgba(74,222,128,0.7)"
            : "rgba(255,255,255,0.15)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "clamp(0.7rem, 1.8vw, 0.85rem)",
          color: "rgba(255,255,255,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

import { getNoteColor } from "./noteColors";
import { usePitchDetector } from "./usePitchDetector";

export default function ListenerPage() {
  const { listening, pitch, start, stop } = usePitchDetector();

  const noteColor = pitch.note ? getNoteColor(pitch.note) : null;
  const bgColor = noteColor?.color ?? "#222";

  /* ── cents indicator ──────────────────────────────────── */
  // Map −50…+50 cents to a visual bar offset
  const centsNorm = pitch.cents / 50; // −1 … +1
  const inTune = Math.abs(pitch.cents) <= 5;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        background: bgColor,
        transition: "background 0.18s ease",
      }}
    >
      {/* ── Main display ────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
          minHeight: 0,
        }}
      >
        {!listening ? (
          <>
            <span
              style={{
                fontSize: "clamp(1.2rem, 4vw, 2rem)",
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
              }}
            >
              Note Listener
            </span>
            <span
              style={{
                fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                maxWidth: 440,
                lineHeight: 1.5,
              }}
            >
              Tap Start to open your microphone. Play any instrument or sing a
              note — the detected pitch and its Boomwhacker color will appear
              in real time.
            </span>
            <button onClick={start} style={btnStyle}>
              🎤&ensp;Start listening
            </button>
          </>
        ) : (
          <>
            {/* Detected note */}
            {pitch.note ? (
              <>
                <span
                  style={{
                    fontSize: "clamp(3rem, 12vw, 7rem)",
                    fontWeight: 800,
                    color: "#fff",
                    textShadow: "0 4px 24px rgba(0,0,0,0.35)",
                    lineHeight: 1,
                  }}
                >
                  {pitch.note}
                </span>

                <span
                  style={{
                    fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {noteColor?.label}
                </span>

                {/* Frequency readout */}
                <span
                  style={{
                    fontSize: "clamp(0.8rem, 2vw, 1rem)",
                    color: "rgba(255,255,255,0.45)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {pitch.frequency} Hz
                </span>

                {/* ── Cents bar ─────────────────────────── */}
                <div
                  style={{
                    width: "clamp(200px, 60vw, 400px)",
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {/* Track */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.12)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Centre line */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        width: 2,
                        height: "100%",
                        background: "rgba(255,255,255,0.3)",
                        transform: "translateX(-50%)",
                      }}
                    />
                    {/* Indicator dot */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: `${50 + centsNorm * 45}%`,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: inTune ? "#4ade80" : "#facc15",
                        transform: "translate(-50%, -50%)",
                        transition: "left 0.08s ease-out, background 0.15s",
                        boxShadow: inTune
                          ? "0 0 8px rgba(74,222,128,0.6)"
                          : "0 0 6px rgba(250,204,21,0.5)",
                      }}
                    />
                  </div>

                  {/* Cents label */}
                  <span
                    style={{
                      fontSize: "clamp(0.7rem, 1.8vw, 0.85rem)",
                      color: inTune
                        ? "rgba(74,222,128,0.9)"
                        : "rgba(250,204,21,0.85)",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                    }}
                  >
                    {inTune
                      ? "In tune ✓"
                      : `${pitch.cents > 0 ? "+" : ""}${pitch.cents} cents`}
                  </span>
                </div>
              </>
            ) : (
              <span
                style={{
                  fontSize: "clamp(1rem, 3vw, 1.5rem)",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 300,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Listening…
              </span>
            )}

            {/* Stop button */}
            <button
              onClick={stop}
              style={{
                ...btnStyle,
                marginTop: 24,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              ■&ensp;Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── shared button style ────────────────────────────────── */

const btnStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "14px 36px",
  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
  fontWeight: 600,
  color: "#fff",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 12,
  cursor: "pointer",
  backdropFilter: "blur(4px)",
  transition: "background 0.15s",
};

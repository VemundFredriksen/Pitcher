import React from "react";

interface ColorRegionProps {
  /** CSS color string, e.g. "hsl(…)" or "#222" */
  color: string;
  /** Human-readable colour label, e.g. "Red-orange" */
  label: string;
  /** Note name, e.g. "C#4" */
  note: string;
}

const ColorRegion: React.FC<ColorRegionProps> = ({ color, label, note }) => {
  const isIdle = color === "#222";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: color,
        transition: "background 0.12s ease",
        overflow: "hidden",
      }}
    >
      {isIdle ? (
        <span
          style={{
            fontSize: "clamp(1rem, 3vw, 1.6rem)",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 300,
            letterSpacing: 2,
            textTransform: "uppercase",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          Play a note…
        </span>
      ) : (
        <>
          <span
            style={{
              fontSize: "clamp(2rem, 8vw, 4rem)",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              lineHeight: 1.1,
            }}
          >
            {note}
          </span>
          <span
            style={{
              marginTop: 8,
              fontSize: "clamp(0.8rem, 2.5vw, 1.2rem)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {label}
          </span>
        </>
      )}
    </div>
  );
};

export default ColorRegion;

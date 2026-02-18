export default function AboutPage() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        background: "#111",
        display: "flex",
        justifyContent: "center",
        padding: "clamp(24px, 6vh, 80px) clamp(16px, 4vw, 48px)",
      }}
    >
      <article
        style={{
          maxWidth: 640,
          width: "100%",
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.7,
          fontSize: "clamp(0.95rem, 2.4vw, 1.1rem)",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 700,
            marginBottom: 8,
            color: "#fff",
          }}
        >
          About Pitcher
        </h1>

        <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
          A multi-sensory pitch training tool
        </p>

        <Section title="The idea">
          <p>
            Most musicians develop relative pitch through years of practice, but
            the process can be accelerated by engaging more than one sense at a
            time. Pitcher pairs every musical note with a distinct colour,
            creating a <strong>sound → colour → note name</strong> association
            that reinforces memory through multiple neural pathways.
          </p>
        </Section>

        <Section title="Why colour + pitch?">
          <p>
            Research on multi-sensory learning shows that combining auditory and
            visual stimuli improves recall and speeds up recognition. Some people
            naturally experience this connection — a phenomenon called{" "}
            <em>chromesthesia</em> (sound-to-colour synaesthesia). Pitcher
            simulates that experience for everyone.
          </p>
          <p>
            The colour mapping follows the{" "}
            <strong>Boomwhackers</strong> system — a widely adopted,
            standardised palette used in music education around the world. Each
            of the twelve pitch classes is assigned a unique hue, while octave
            is encoded as brightness: lower octaves are darker, higher octaves
            lighter.
          </p>
        </Section>

        <Section title="The tools">
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>
              <strong>Free Play</strong> — an interactive piano or guitar neck.
              Press a note and the screen floods with its colour, building the
              visual association naturally through play.
            </li>
            <li>
              <strong>Tone Quiz</strong> — the app plays a random note and you
              guess the pitch class. Toggle colour hints on or off to adjust
              difficulty across four levels, from fully guided to pure ear
              training.
            </li>
            <li>
              <strong>Note Listener</strong> — uses your microphone to detect
              pitch in real time. Sing, play guitar, blow a whistle — any
              periodic sound works. The screen shows the detected note, its
              colour, frequency, and tuning accuracy.
            </li>
          </ul>
        </Section>

        <Section title="How to practise">
          <p>
            Start with Free Play to build the colour associations. Move to Tone
            Quiz with both hints enabled. As you improve, progressively disable
            the colour hint and button colours until you can identify notes by
            ear alone. Use the Note Listener to verify your own singing or
            playing.
          </p>
        </Section>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)",
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
          }}
        >
          Built with React, TypeScript &amp; Tone.js
        </div>
      </article>
    </div>
  );
}

/* ── section helper ─────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: "clamp(1.15rem, 3vw, 1.4rem)",
          fontWeight: 600,
          color: "rgba(255,255,255,0.9)",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "rgba(255,255,255,0.65)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

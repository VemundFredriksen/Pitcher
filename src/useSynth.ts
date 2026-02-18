import { useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";

/**
 * Hook that exposes a simple `playNote(noteName)` / `stopNote(noteName)`
 * API backed by a Tone.js PolySynth with a piano‐like timbre.
 */
export function useSynth() {
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Lazily create the synth (avoids issues with AudioContext before gesture)
  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle8" },
        envelope: {
          attack: 0.005,
          decay: 0.3,
          sustain: 0.4,
          release: 1.2,
        },
      }).toDestination();
      synthRef.current.maxPolyphony = 16;
    }
    return synthRef.current;
  }, []);

  const playNote = useCallback(
    async (note: string) => {
      await Tone.start(); // resume AudioContext on user gesture
      getSynth().triggerAttack(note, Tone.now());
    },
    [getSynth],
  );

  const stopNote = useCallback(
    (note: string) => {
      getSynth().triggerRelease(note, Tone.now());
    },
    [getSynth],
  );

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  return { playNote, stopNote };
}

import { useRef, useState, useCallback, useEffect } from "react";
import { PITCH_CLASSES } from "./noteColors";

/* ── public types ───────────────────────────────────────── */

export interface PitchResult {
  /** Detected frequency in Hz, or null when silent / unclear */
  frequency: number | null;
  /** Note name like "A4", or null */
  note: string | null;
  /** Cents offset from the nearest note (−50 … +50) */
  cents: number;
  /** Pitch‑detection confidence 0 … 1 */
  clarity: number;
}

/* ── YIN pitch detection ────────────────────────────────── */

/**
 * A minimal YIN‐based pitch detector.
 * Reference: de Cheveigné & Kawahara (2002).
 *
 * Works well on monophonic sources (voice, single instrument string,
 * single piano note).  Timbre doesn't matter — it extracts the
 * fundamental regardless of harmonic content.
 */
function yinDetect(
  buf: Float32Array,
  sampleRate: number,
  threshold = 0.15,
): { frequency: number; clarity: number } | null {
  const halfLen = Math.floor(buf.length / 2);
  const yinBuf = new Float32Array(halfLen);

  // Step 1 – squared difference
  for (let tau = 0; tau < halfLen; tau++) {
    let sum = 0;
    for (let i = 0; i < halfLen; i++) {
      const delta = buf[i] - buf[i + tau];
      sum += delta * delta;
    }
    yinBuf[tau] = sum;
  }

  // Step 2 – cumulative mean normalised difference
  yinBuf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfLen; tau++) {
    runningSum += yinBuf[tau];
    yinBuf[tau] *= tau / runningSum;
  }

  // Step 3 – absolute threshold
  let tauEstimate = -1;
  for (let tau = 2; tau < halfLen; tau++) {
    if (yinBuf[tau] < threshold) {
      // Walk to the dip minimum
      while (tau + 1 < halfLen && yinBuf[tau + 1] < yinBuf[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) return null;

  // Step 4 – parabolic interpolation for sub‑sample accuracy
  const s0 = yinBuf[tauEstimate - 1] ?? yinBuf[tauEstimate];
  const s1 = yinBuf[tauEstimate];
  const s2 = yinBuf[tauEstimate + 1] ?? yinBuf[tauEstimate];
  const betterTau =
    tauEstimate + (s0 - s2) / (2 * (s0 - 2 * s1 + s2) || 1);

  const frequency = sampleRate / betterTau;
  const clarity = 1 - (yinBuf[tauEstimate] ?? 1);

  // Reject implausible pitches
  if (frequency < 50 || frequency > 2000) return null;

  return { frequency, clarity };
}

/* ── frequency → note mapping ───────────────────────────── */

/** Concert pitch */
const A4_HZ = 440;

function frequencyToNote(freq: number): { note: string; cents: number } {
  // Semitones from A4
  const semitones = 12 * Math.log2(freq / A4_HZ);
  const rounded = Math.round(semitones);
  const cents = Math.round((semitones - rounded) * 100);

  // A4 = MIDI 69.  PITCH_CLASSES index 0 = C.
  const midi = 69 + rounded;
  const pcIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const note = `${PITCH_CLASSES[pcIndex]}${octave}`;

  return { note, cents };
}

/* ── React hook ─────────────────────────────────────────── */

export function usePitchDetector() {
  const [listening, setListening] = useState(false);
  const [pitch, setPitch] = useState<PitchResult>({
    frequency: null,
    note: null,
    cents: 0,
    clarity: 0,
  });

  // refs survive re‑renders
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const bufRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  const detect = useCallback(() => {
    const analyser = analyserRef.current;
    const buf = bufRef.current;
    const ctx = audioCtxRef.current;
    if (!analyser || !buf || !ctx) return;

    analyser.getFloatTimeDomainData(buf);

    // Check if there's meaningful signal (avoid detecting silence)
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / buf.length);

    if (rms < 0.008) {
      setPitch({ frequency: null, note: null, cents: 0, clarity: 0 });
    } else {
      const result = yinDetect(buf, ctx.sampleRate);
      if (result && result.clarity > 0.8) {
        const { note, cents } = frequencyToNote(result.frequency);
        setPitch({
          frequency: Math.round(result.frequency * 10) / 10,
          note,
          cents,
          clarity: Math.round(result.clarity * 100) / 100,
        });
      } else {
        setPitch((prev) => ({ ...prev, frequency: null, note: null, cents: 0, clarity: 0 }));
      }
    }

    rafRef.current = requestAnimationFrame(detect);
  }, []);

  const start = useCallback(async () => {
    if (listening) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;

    source.connect(analyser);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    streamRef.current = stream;
    bufRef.current = new Float32Array(analyser.fftSize);

    setListening(true);
    rafRef.current = requestAnimationFrame(detect);
  }, [listening, detect]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();

    audioCtxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    bufRef.current = null;

    setListening(false);
    setPitch({ frequency: null, note: null, cents: 0, clarity: 0 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      sourceRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { listening, pitch, start, stop };
}

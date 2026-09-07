"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type ActiveNodes = {
  stop: () => void;
};

/**
 * Toggleable ambient soundscape, synthesized entirely with the Web Audio
 * API (filtered noise for wind + two soft detuned drone tones) — no audio
 * files to license or host. Only ever starts on a click, per autoplay
 * rules.
 */
export default function AmbientSound() {
  const [playing, setPlaying] = useState(false);
  const activeRef = useRef<ActiveNodes | null>(null);

  const start = () => {
    const ctx = new AudioContext();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);

    // filtered brown-ish noise for a soft wind bed
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 700;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.5;

    noise.connect(noiseFilter).connect(noiseGain).connect(master);

    // slow LFO "breathing" the filter, like gusts through the trees
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(noiseFilter.frequency);

    // two soft detuned drone tones underneath
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 110;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 110 * 1.5;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.35;
    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(master);

    noise.start();
    lfo.start();
    osc1.start();
    osc2.start();

    activeRef.current = {
      stop: () => {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 0.8);
        setTimeout(() => {
          [noise, lfo, osc1, osc2].forEach((node) => {
            try {
              node.stop();
            } catch {
              // already stopped
            }
          });
          ctx.close();
        }, 900);
      },
    };

    setPlaying(true);
  };

  const stop = () => {
    activeRef.current?.stop();
    activeRef.current = null;
    setPlaying(false);
  };

  return (
    <button
      type="button"
      onClick={() => (playing ? stop() : start())}
      aria-pressed={playing}
      aria-label={
        playing ? "Vypnout ambientní zvuk lesa" : "Zapnout ambientní zvuk lesa"
      }
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-current transition-colors hover:bg-black/5"
    >
      {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {playing && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
        </span>
      )}
    </button>
  );
}

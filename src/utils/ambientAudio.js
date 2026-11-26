/**
 * ambientAudio.js — Subtle Web Audio / MP3 controller
 * Attempts to play /music/our-song.mp3 if available; falls back to a warm,
 * gentle synthesized ambient chord pad so "Enter with sound" always works softly.
 */
class AmbientAudioController {
  constructor() {
    this.audioEl = null;
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.intervalId = null;
  }

  async start(mp3Src = '/music/our-song.mp3') {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      const res = await fetch(mp3Src, { method: 'HEAD' });
      if (res.ok) {
        this.audioEl = new Audio(mp3Src);
        this.audioEl.loop = true;
        this.audioEl.volume = 0.35;
        await this.audioEl.play();
        return;
      }
    } catch {
      // Fallback to gentle ambient Web Audio pad
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 2.5);
      this.masterGain.connect(this.ctx.destination);

      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 329.63], // G6
      ];
      let chordIdx = 0;

      const playChord = () => {
        if (!this.ctx || !this.isPlaying) return;
        const now = this.ctx.currentTime;
        const notes = chords[chordIdx % chords.length];
        chordIdx++;

        notes.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.linearRampToValueAtTime(0.22, now + 1.4);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 4.4);

          osc.connect(noteGain);
          noteGain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 4.5);
        });
      };

      playChord();
      this.intervalId = setInterval(playChord, 4200);
    } catch {
      // Ignore audio context restrictions
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const ambientAudio = new AmbientAudioController();

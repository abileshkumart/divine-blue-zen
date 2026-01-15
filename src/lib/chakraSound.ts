// Chakra Sound Generator using Web Audio API

class ChakraSoundGenerator {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private frequencies: Record<string, number> = {
    'root': 396,
    'sacral': 417,
    'solar': 528,
    'heart': 639,
    'throat': 741,
    'third-eye': 852,
    'crown': 963
  };

  private init(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playChakraSound(chakraId: string, volume: number = 0.3): void {
    this.init();
    if (!this.audioContext) return;
    this.stop();
    const frequency = this.frequencies[chakraId] || 528;
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);
    oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    oscillator.start();
    this.oscillators = [oscillator];
    this.isPlaying = true;
  }

  playBinauralBeat(chakraId: string, volume: number = 0.3): void {
    this.init();
    if (!this.audioContext) return;
    this.stop();
    const baseFrequency = this.frequencies[chakraId] || 528;
    const beatFrequency = 7;
    const oscLeft = this.audioContext.createOscillator();
    const oscRight = this.audioContext.createOscillator();
    oscLeft.type = 'sine';
    oscRight.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFrequency, this.audioContext.currentTime);
    oscRight.frequency.setValueAtTime(baseFrequency + beatFrequency, this.audioContext.currentTime);
    const panLeft = this.audioContext.createStereoPanner();
    const panRight = this.audioContext.createStereoPanner();
    panLeft.pan.setValueAtTime(-1, this.audioContext.currentTime);
    panRight.pan.setValueAtTime(1, this.audioContext.currentTime);
    const gainLeft = this.audioContext.createGain();
    const gainRight = this.audioContext.createGain();
    this.gainNode = this.audioContext.createGain();
    gainLeft.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainRight.gain.setValueAtTime(volume, this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 2);
    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);
    gainLeft.connect(panLeft);
    gainRight.connect(panRight);
    panLeft.connect(this.gainNode);
    panRight.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    oscLeft.start();
    oscRight.start();
    this.oscillators = [oscLeft, oscRight];
    this.isPlaying = true;
  }

  playLayeredSound(chakraId: string, volume: number = 0.3): void {
    this.init();
    if (!this.audioContext) return;
    this.stop();
    const baseFrequency = this.frequencies[chakraId] || 528;
    const mainOsc = this.audioContext.createOscillator();
    mainOsc.type = 'sine';
    mainOsc.frequency.setValueAtTime(baseFrequency, this.audioContext.currentTime);
    const harmonic1 = this.audioContext.createOscillator();
    harmonic1.type = 'sine';
    harmonic1.frequency.setValueAtTime(baseFrequency * 2, this.audioContext.currentTime);
    const harmonic2 = this.audioContext.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(baseFrequency * 3, this.audioContext.currentTime);
    this.gainNode = this.audioContext.createGain();
    const gainMain = this.audioContext.createGain();
    const gainH1 = this.audioContext.createGain();
    const gainH2 = this.audioContext.createGain();
    gainMain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainH1.gain.setValueAtTime(volume * 0.25, this.audioContext.currentTime);
    gainH2.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 2);
    mainOsc.connect(gainMain);
    harmonic1.connect(gainH1);
    harmonic2.connect(gainH2);
    gainMain.connect(this.gainNode);
    gainH1.connect(this.gainNode);
    gainH2.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    mainOsc.start();
    harmonic1.start();
    harmonic2.start();
    this.oscillators = [mainOsc, harmonic1, harmonic2];
    this.isPlaying = true;
  }

  transitionToChakra(toChakraId: string, duration: number = 3000): void {
    if (!this.audioContext || this.oscillators.length === 0) return;
    const toFreq = this.frequencies[toChakraId] || 528;
    this.oscillators.forEach((osc, index) => {
      const multiplier = index === 0 ? 1 : index + 1;
      osc.frequency.linearRampToValueAtTime(
        toFreq * multiplier, 
        this.audioContext!.currentTime + (duration / 1000)
      );
    });
  }

  stop(): void {
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    }
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 1100);
  }

  setVolume(volume: number): void {
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, volume)), 
        this.audioContext.currentTime + 0.1
      );
    }
  }
}

export const chakraSoundGenerator = new ChakraSoundGenerator();

export type ChakraSoundMode = 'pure' | 'binaural' | 'layered';

export const playChakraSound = (
  chakraId: string, 
  mode: ChakraSoundMode = 'pure',
  volume: number = 0.3
): void => {
  switch (mode) {
    case 'binaural':
      chakraSoundGenerator.playBinauralBeat(chakraId, volume);
      break;
    case 'layered':
      chakraSoundGenerator.playLayeredSound(chakraId, volume);
      break;
    default:
      chakraSoundGenerator.playChakraSound(chakraId, volume);
  }
};

export const stopChakraSound = (): void => {
  chakraSoundGenerator.stop();
};

export const setChakraVolume = (volume: number): void => {
  chakraSoundGenerator.setVolume(volume);
};

export const transitionChakra = (toChakraId: string, duration?: number): void => {
  chakraSoundGenerator.transitionToChakra(toChakraId, duration);
};

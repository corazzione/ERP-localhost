// Utility para sons e feedback sonoro
class SoundManager {
    constructor() {
        this.sounds = {
            success: this.createBeep(800, 100, 0.1),
            error: this.createBeep(300, 200, 0.15),
            beep: this.createBeep(600, 50, 0.08),
            complete: this.createBeep(1000, 150, 0.1)
        };
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    }

    // Criar som usando Web Audio API
    createBeep(frequency, duration, volume) {
        return () => {
            if (!this.enabled) return;

            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            } catch (error) {
                console.warn('Audio not supported:', error);
            }
        };
    }

    play(type) {
        if (this.sounds[type]) {
            this.sounds[type]();
        }
    }

    enable() {
        this.enabled = true;
        localStorage.setItem('soundEnabled', 'true');
    }

    disable() {
        this.enabled = false;
        localStorage.setItem('soundEnabled', 'false');
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled.toString());
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

// Singleton instance
const soundManager = new SoundManager();

export const playSound = (type) => soundManager.play(type);
export const toggleSound = () => soundManager.toggle();
export const isSoundEnabled = () => soundManager.isEnabled();

export default soundManager;

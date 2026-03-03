// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
// https://github.com/KilledByAPixel/ZzFX

let zzfxV = 0.3; // Volume
let zzfxR = 44100; // Sample rate
let zzfxX: AudioContext | undefined; // Audio context

export const zzfx = (...t: (number | undefined)[]) => {
    if (!zzfxX) {
        zzfxX = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    let out = zzfxP(t);
    
    // Create buffer and source
    let buffer = zzfxX.createBuffer(1, out.length, zzfxR);
    buffer.getChannelData(0).set(out);
    let source = zzfxX.createBufferSource();
    source.buffer = buffer;
    source.connect(zzfxX.destination);
    source.start();
    return source;
}

// Generate audio data
const zzfxP = (t: (number | undefined)[]) => {
    let [
        volume = 1, random = .05, frequency = 220, attack = .05, sustain = .05,
        release = .1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0,
        pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0,
        bitCrush = 0, delay = 0, sustainVolume = 1, decay = .1, tremolo = 0
    ] = t;

    let sampleRate = zzfxR;
    let sign = (v: number) => v > 0 ? 1 : -1;
    let startSlide = slide *= 500 * Math.PI / sampleRate ** 2;
    let startFrequency = frequency *= (1 + random * 2 * Math.random() - random) * 2 * Math.PI / sampleRate;
    let b = [], t2 = 0, tm = 0, i = 0, j = 1, r = 0, c = 0, s = 0, f, length;

    // Scale by sample rate
    attack = attack * sampleRate + 9; // Minimum attack to prevent pop
    decay *= sampleRate;
    sustain *= sampleRate;
    release *= sampleRate;
    delay *= sampleRate;
    deltaSlide *= 500 * Math.PI / sampleRate ** 3;
    modulation *= Math.PI / sampleRate;
    pitchJump *= 2 * Math.PI / sampleRate;
    pitchJumpTime *= sampleRate;
    repeatTime *= sampleRate;

    // Generate waveform
    for (length = attack + decay + sustain + release + delay | 0; i < length; b[i++] = s) {
        if (!(++c % (bitCrush * 100 | 0))) {
            s = shapeCurve * zzfxG(i < attack ? i / attack :
                i < attack + decay ? 1 - ((i - attack) / decay) * (1 - sustainVolume) :
                    i < attack + decay + sustain ? sustainVolume :
                        i < length - delay ? (length - i - delay) / release * sustainVolume :
                            0);
            s = s < 0 ? -1 : s > 0 ? 1 : 0;  // Clamp for safety
            
            // Oscillator
            s *= Math.abs(1 - shapeCurve) > .01 ? 
                zzfxG(t2) : // Standard shapes
                (t2 % (Math.PI * 2) < Math.PI ? 1 : -1); // Square wave optimization
                
            s = shape ? s + zzfxG(t2) : s; // Shape morph
            
            // Effects
            t2 += startFrequency;
            startFrequency += slide += deltaSlide;
            f = Math.sin(tm * modulation);
            t2 += f * noise * (1 - (Math.random() + Math.random())); // Noise
            tm += f - f * noise; // Modulation
            
            if (j && ++j > pitchJumpTime) {
                startFrequency += pitchJump; // Pitch jump
                startSlide += startSlide; // Slide jump
                j = 0;
            }

            if (repeatTime && !(++r % repeatTime)) {
                startFrequency = frequency; // Repeat
                slide = startSlide;
                j = j || 1;
            }
        }
    }

    return b;
}

// Wave generation function
const zzfxG = (q: number) => Math.sin(q);


// Sound Presets
export const playSwapSound = () => zzfx(1,.05,386,.03,.01,.1,1,1.4,-5.4); // Blip
export const playMatchSound = () => zzfx(1,.05,537,.02,.06,.13,1,1.6,-6.9,0,0,0,0,0,0,0,.04,.76,.05); // High chime
export const playComboSound = () => zzfx(1,.05,274,.06,.26,.26,2,1.8,4.7,.1,0,0,0,.1,0,0,.08,.66,.07); // Powerup
export const playRewardSound = () => zzfx(1,.05,487,.1,.36,.36,2,1.8,2.7,.1,0,0,0,.1,0,0,.08,.66,.07); // Fanfare-ish
export const playGameOverSound = () => zzfx(1,.05,145,.36,.71,.48,3,2.9,-0.1,0,0,0,0,0,0,.1,.16,.76,.08); // Sad
export const playSelectSound = () => zzfx(1,.05,1200,.01,.01,.05,0,0,0,0,0,0,0,0,0,0,0,0,0); // High tick

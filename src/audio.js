let audioCtx;
let element, sourceNode, analyserNode, compressor, gainNode;
const compressorStart = {};
const DEFAULTS = Object.freeze({
    gain: 1,
    numSamples: 32
});

let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

function setupWebaudio(filePath) {
    const AudioContext = window.AudioContext || windows.webkitAudioContext;
    audioCtx = new AudioContext();

    element = new Audio();

    loadSoundFile(filePath);

    sourceNode = audioCtx.createMediaElementSource(element);

    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = DEFAULTS.numSamples;

    compressor = audioCtx.createDynamicsCompressor();
    compressorStart.threshold = compressor.threshold.value;
    compressorStart.knee = compressor.knee.value;
    compressorStart.ratio = compressor.ratio.value;
    compressorStart.attack = compressor.attack.value;
    compressorStart.release = compressor.release.value;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    sourceNode.connect(compressor);
    compressor.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

function loadSoundFile(filePath) {
    element.src = filePath;
}

function playCurrentSound() {
    element.play();
}

function pauseCurrentSound() {
    element.pause();
}

function activateCompressor() {
    compressor.threshold.value = -65;
    compressor.knee.value = 40;
    compressor.ratio.value = 20;
    compressor.attack.value = 0
    compressor.release.value = 0.25;
}

function deactivateCompressor() {
    compressor.threshold.value = compressorStart.threshold;
    compressor.knee.value = compressorStart.knee;
    compressor.ratio.value = compressorStart.ratio;
    compressor.attack.value = compressorStart.attack;
    compressor.release.value = compressorStart.release;
}

function setVolume(value) {
    value = Number(value);
    gainNode.gain.value = value;
}

function getCurrentTime() {
    return element.currentTime;
}

function setCurrentTime(time) {
    element.currentTime = time;
}

function getDuration() {
    return element.duration;
}

export {
    audioCtx,
    setupWebaudio,
    playCurrentSound,
    pauseCurrentSound,
    loadSoundFile,
    activateCompressor,
    deactivateCompressor,
    setVolume,
    getCurrentTime,
    setCurrentTime,
    getDuration,
    analyserNode
};

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as visualizer from './visualizer.js';

const drawParams = {
    numOfStingers   : 4,
    speed           : 50,
    gradientOff     : false,
    showFish        : true,
    showJelly       : true,
    showBubbles     : true,
    showInvert      : false,
    showEmboss      : false,
    isPlaying       : false
};

const DEFAULTS = Object.freeze({
    sound1: "media/Jellyfish Jam.mp3"
});

let lastUpdate;

function init() {
    audio.setupWebaudio(DEFAULTS.sound1);
    let canvasElement = document.querySelector("canvas");
    setupUI(canvasElement);
    visualizer.setupCanvas(canvasElement, audio.analyserNode);
    lastUpdate = Date.now();
    loop();
}

function setupUI(canvasElement) {
    const fsButton = document.querySelector("#fsButton");
    fsButton.onclick = e => {
        utils.goFullscreen(canvasElement);
    };

    playButton.onclick = e => {        
        // Check if context is in suspended state (autoplay policy)
        if(audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }
        
        if(drawParams.isPlaying) {
            audio.pauseCurrentSound();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            drawParams.isPlaying = false;
        } else {
            audio.playCurrentSound();
            playButton.innerHTML = '<i class="fas fa-pause"></i>'
            drawParams.isPlaying = true;
        }
    };

    let scrubber = document.querySelector("#scrubber");
    scrubber.oninput = e => {
        audio.setCurrentTime(scrubber.value);
    };

    let volumeSlider = document.querySelector("#volumeSlider");
    volumeSlider.oninput = e => {
        audio.setVolume(e.target.value);
    };
    volumeSlider.dispatchEvent(new Event("input"));

    let stingersSlider = document.querySelector("#stingersSlider");
    let stingersLabel = document.querySelector("#stingersLabel");
    stingersSlider.oninput = e => {
        switch(Number(e.target.value)) {
            case 0:
                drawParams.numOfStingers = 1;
                break;
            case 1:
                drawParams.numOfStingers = 2;
                break;
            case 2:
                drawParams.numOfStingers = 4;
                break;
            case 3:
                drawParams.numOfStingers = 8;
                break;
        }
        stingersLabel.innerHTML = drawParams.numOfStingers;
    };
    stingersSlider.dispatchEvent(new Event("input"));

    let speedSlider = document.querySelector("#speedSlider");
    let speedLabel = document.querySelector("#speedLabel");
    speedSlider.oninput = e => {
        drawParams.speed = Number(e.target.value);
        speedLabel.innerHTML = drawParams.speed;
    };
    speedSlider.dispatchEvent(new Event("input"));

    let trackSelect = document.querySelector("#trackSelect");
    trackSelect.onchange = e => {
        audio.loadSoundFile(e.target.value);

        if (drawParams.isPlaying) {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    };

    // Event handlers for checkboxes
    document.querySelector("#gradientCB").onchange = e => {
        drawParams.gradientOff = e.target.checked;
    };
    document.querySelector("#fishCB").onchange = e => {
        drawParams.showFish = e.target.checked;
    };
    document.querySelector("#invertCB").onchange = e => {
        drawParams.showInvert = e.target.checked;
    };
    document.querySelector("#embossCB").onchange = e => {
        drawParams.showEmboss = e.target.checked;
    };
    document.querySelector("#jellyCB").onchange = e => {
        drawParams.showJelly = e.target.checked;
    };
    document.querySelector("#bubblesCB").onchange = e => {
        drawParams.showBubbles = e.target.checked;
    };
    document.querySelector("#compressionCB").onchange = e => {
        if(e.target.checked) audio.activateCompressor();
        else audio.deactivateCompressor();
    };
}

function loop() {
    // Calculate delta time
    let now = Date.now();
    let dt = (now - lastUpdate) / 1000;
    lastUpdate = now;

    // Update the scrubber
    let scrubber = document.querySelector("#scrubber");
    let currentTimeLabel = document.querySelector("#currentTime");
    let totalTimeLabel = document.querySelector("#totalTime");
    let currentTime = audio.getCurrentTime();
    let duration = audio.getDuration();

    scrubber.max = audio.getDuration();

    currentTimeLabel.innerHTML = utils.getTimestampFromSeconds(currentTime);
    totalTimeLabel.innerHTML = utils.getTimestampFromSeconds(duration);
    scrubber.value = currentTime;

    // Reset song if it is over
    if(currentTime >= duration) {
        drawParams.isPlaying = false;
        document.querySelector("#playButton").innerHTML = '<i class="fas fa-play"></i>';
        audio.setCurrentTime(0);
        audio.pauseCurrentSound();
    }

    // Draw the visualizer
    visualizer.draw(drawParams, dt);

    requestAnimationFrame(loop);
}

export {
    init
};
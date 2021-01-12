import * as utils from './utils.js';
import * as classes from "./classes.js";

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData;
let jellySprite, fishSprites = [], bubbleSprites = [];
let bubbleMinSize = 10, bubbleMaxSize = 30;
let mousePos = { x: 0, y: 0 }, mouseOver, jellyTarget = mousePos;

function setupCanvas(canvasElement, analyserNodeRef) {
    // Create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;

    // Get mouse position
    canvasElement.onmousemove = e => {
        mouseOver = true;
        let rect = canvasElement.getBoundingClientRect();
        mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    canvasElement.onmouseout = () => {
        mouseOver = false;
    }

    // Create background gradient
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{
        percent: 0,
        color: "rgba(85, 204, 217)"
    }, {
        percent: .25,
        color: "rgb(85, 146, 217)"
    }, {
        percent: 1,
        color: "rgb(43, 41, 105)"
    }]);

    // Initialize audioData
    analyserNode = analyserNodeRef;
    audioData = new Uint8Array(analyserNode.fftSize / 2);

    // Load sprites
    utils.preloadImage("media/jelly.png", function (image) {
        jellySprite = new classes.Sprite(image, canvasWidth / 2, canvasHeight / 2 - 85, 150, 110, 50);
    });
    utils.preloadImage("media/fish.png", function (image) {
        for (let i = 0; i < audioData.length; i++) {
            fishSprites.push(new classes.Sprite(image, 25, canvasHeight - 70, 50, 143, 0));
        }
    });
    utils.preloadImage("media/bubble.png", function (image) {
        for (let i = 0; i < audioData.length; i++) {
            let x = utils.randomRange(0, canvasWidth);
            let y = utils.randomRange(0, canvasHeight);
            let speed = utils.randomRange(10, 50);
            bubbleSprites.push(new classes.Sprite(image, x, y, bubbleMinSize, bubbleMinSize, speed));
        }
    });
}

function draw(params = {}, dt) {
    // Fill canvas with black
    ctx.save();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Populate audioData array with frequency data from analyserNode
    analyserNode.getByteFrequencyData(audioData);

    // Draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // Draw gradient
    if (!params.gradientOff) {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // Draw half of bubbles in foreground
    if (params.showBubbles) {
        for (let i = 0; i < audioData.length / 2; i++) {
            drawBubbles(i, params.isPlaying, dt);
        }
    }

    // Draw frequency fish
    if (params.showFish && fishSprites[0] != null) {
        let maxHeight = 70;

        let totalFishWidth = fishSprites[0].width * audioData.length;
        let padding = (canvasWidth - totalFishWidth) / (audioData.length - 1);

        for (let i = 0; i < audioData.length; i++) {
            let percent = audioData[i] / 255;

            if (fishSprites[i] != null) {
                if (i > 0) fishSprites[i].x = fishSprites[i - 1].x + fishSprites[i].width + padding;
                fishSprites[i].y = canvasHeight - (maxHeight * percent);
                fishSprites[i].draw(ctx);
            }
        }
    }

    // Draw Jellyfish
    if (params.showJelly && jellySprite != null) {
        // Change audioData from frequency to waveform data
        analyserNode.getByteTimeDomainData(audioData);

        // Set jellySprite's target to mouse or up/down
        if (mouseOver) {
            jellyTarget = mousePos;
            jellySprite.speed = params.speed;
        } else {
            let top = canvasHeight / 2 - 90;
            let bottom = canvasHeight / 2 - 80;

            jellySprite.speed = 5;

            // Make sure the target is either top or bottom
            if (jellyTarget.y != top &&
                jellyTarget.y != bottom)
                jellyTarget = { x: canvasWidth / 2, y: bottom };

            if (jellySprite.y >= bottom) jellyTarget = { x: canvasWidth / 2, y: top };
            else if (jellySprite.y <= top) jellyTarget = { x: canvasWidth / 2, y: bottom };
        }

        jellySprite.moveTowards(jellyTarget, dt);

        // Draw waveform stingers
        let numStingers = params.numOfStingers;
        let maxStingerLength = 150;
        let stingerColor = "rgb(252, 179, 252)";

        let stingerWidth, stingerPadding, stingerIntensity;

        // Apply appropriate settings based on amount of stingers
        switch (params.numOfStingers) {
            case 1:
                stingerWidth = 2;
                stingerPadding = 0;
                stingerIntensity = 100;
                break;
            case 2:
                stingerWidth = 3;
                stingerPadding = 60;
                stingerIntensity = 60;
                break;
            case 4:
                stingerWidth = 4;
                stingerPadding = 30;
                stingerIntensity = 40;
                break;
            case 8:
                stingerWidth = 5;
                stingerPadding = 15;
                stingerIntensity = 30;
                break;
        }

        let segmentsPerStinger = audioData.length / numStingers;
        let segmentLength = maxStingerLength / segmentsPerStinger;
        let intialX = jellySprite.x - (((numStingers - 1) * stingerPadding) / 2);
        let initialY = jellySprite.y + 45;

        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineWidth = stingerWidth;
        ctx.strokeStyle = stingerColor;
        for (let i = 0; i < numStingers; i++) {
            let x = intialX + (stingerPadding * i);

            ctx.beginPath();
            ctx.moveTo(x, initialY);
            for (let j = 0; j < segmentsPerStinger; j++) {
                let currentAudioData = audioData[j + (i * segmentsPerStinger)];
                let xOffset = ((currentAudioData / 128.0) - 1.0) * stingerIntensity;
                let nextY = initialY + (segmentLength * (j + 1));

                // Shake stingers if no music is playing
                if (!params.isPlaying) {
                    xOffset = utils.randomRange(-5, 5);
                }

                ctx.quadraticCurveTo(
                    x + xOffset,
                    nextY - (segmentLength / 2),
                    x,
                    nextY);
                ctx.moveTo(x, nextY);
            }
            ctx.stroke();
        }
        ctx.restore();

        // Draw head
        jellySprite.draw(ctx);
    }

    // Change audioData back to frequency
    analyserNode.getByteFrequencyData(audioData);

    // Draw half of bubbles in background
    if (params.showBubbles) {
        for (let i = audioData.length / 2; i < audioData.length; i++) {
            drawBubbles(i, params.isPlaying, dt);
        }
    }

    // Apply image effects
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let noiseValue = document.querySelector("input[name=noise]:checked").value;

    if (noiseValue != "none" || params.showInvert) {
        for (let i = 0; i < data.length; i += 4) {
            // Show noise based on selected color
            if (noiseValue != "none" && Math.random() < 0.05) {
                data[i] = data[i + 1] = data[i + 2] = 0;
                switch (noiseValue) {
                    case "red":
                        data[i] = 255;
                        break;
                    case "green":
                        data[i + 1] = 255;
                        break;
                    case "blue":
                        data[i + 2] = 255;
                        break;
                }
            }

            // Invert the colors
            if (params.showInvert) {
                let red = data[i], green = data[i + 1], blue = data[i + 2];
                data[i] = 255 - red;
                data[i + 1] = 255 - green;
                data[i + 2] = 255 - blue;
            }
        }
    }

    // Add emboss effect
    if (params.showEmboss) {
        for (let i = 0; i < data.length; i++) {
            // Skip alpha channel
            if (i % 4 == 3) continue;

            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + imageData.width * 4];
        }
    }

    // Copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

function drawBubbles(i, isPlaying, dt) {
    // Make sure bubble exists
    if (bubbleSprites[i] == null) return;

    // Resize bubble based on frequency
    let percent = audioData[i] / 255;
    if (isPlaying) bubbleSprites[i].resizeUniformly(bubbleMaxSize * percent);
    else bubbleSprites[i].resizeUniformly(bubbleMinSize);

    // Move bubble upwards
    bubbleSprites[i].y -= bubbleSprites[i].speed * dt;

    // Re-position bubble if off screen
    if (bubbleSprites[i].y < -10) {
        let x = utils.randomRange(0, canvasWidth);
        let y = utils.randomRange(canvasHeight + 10, canvasHeight + 150);
        let speed = utils.randomRange(10, 50);
        bubbleSprites[i].x = x;
        bubbleSprites[i].y = y;
        bubbleSprites[i].speed = speed;
    }

    bubbleSprites[i].draw(ctx);
}

export {
    setupCanvas,
    draw
};
const makeColor = (red, green, blue, alpha = 1) => {
    return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => {
    return Math.random() * (max - min) + min;
};

const getRandomColor = () => {
    const floor = 35;
    const getByte = () => getRandom(floor, 255 - floor);
    return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx, startX, startY, endX, endY, colorStops) => {
    let lg = ctx.createLinearGradient(startX, startY, endX, endY);
    for (let stop of colorStops) {
        lg.addColorStop(stop.percent, stop.color);
    }
    return lg;
};


const goFullscreen = (element) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullscreen) {
        element.mozRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
};

const preloadImage = (url, callback) => {
    let img = new Image();
    img.src = url;
    img.onload = _ => {
        callback(img)
    };
    img.onerror = _ => {
        console.log(`Image at url "${url}" wouldn't load! Check your URL!`);
    };
}

const randomRange = (min, max) => {
    return Math.random() * (max - min) + min;
}

const getTimestampFromSeconds = (time) => {
    let mins = Math.floor(time / 60);
    let secs = Math.floor(time % 60);

    if(mins < 10) mins = "0" + mins.toString();
    if(secs < 10) secs = "0" + secs.toString();

    return `${mins}:${secs}`
}

export {
    makeColor,
    getRandomColor,
    getLinearGradient,
    goFullscreen,
    preloadImage,
    randomRange,
    getTimestampFromSeconds
};
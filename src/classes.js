class Sprite {
    constructor(image, x, y, width, height, speed) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    moveTowards(target, dt) {
        // Find vector to target
        let vector = {
            x: target.x - this.x,
            y: target.y - this.y
        };
        let magnitude = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));

        // Normalize the vector
        vector.x /= magnitude;
        vector.y /= magnitude;

        // Get movement amounts
        let dX = this.speed * dt * vector.x;
        let dY = this.speed * dt * vector.y;

        // Make sure dX and dY are not NaN
        if (!isNaN(dX) && !isNaN(dY)) {
            this.x += dX;
            this.y += dY;
        }
    }

    resizeUniformly(size) {
        this.width = size;
        this.height = size;
    }
}

export { Sprite };
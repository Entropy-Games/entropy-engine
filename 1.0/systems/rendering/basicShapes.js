import { v2 } from "../../maths/maths.js";
export function reset(ctx) {
    ctx.transform(1, 0, 0, -1, 0, ctx.canvas.height);
}
export function rotateAroundPointWrapper(ctx, p, theta, cb) {
    ctx.translate(p.x, p.y);
    ctx.rotate(theta * Math.PI / 180);
    ctx.translate(-p.x, -p.y);
    cb();
    ctx.translate(p.x, p.y);
    ctx.rotate(-theta * Math.PI / 180);
    ctx.translate(-p.x, -p.y);
}
// draw functions
export function roundedRect(ctx, width, height, pos, colour, radius) {
    // src: https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
    ctx.beginPath();
    ctx.moveTo(pos.x + radius, pos.y);
    ctx.lineTo(pos.x + width - radius, pos.y);
    ctx.quadraticCurveTo(pos.x + width, pos.y, pos.x + width, pos.y + radius);
    ctx.lineTo(pos.x + width, pos.y + height - radius);
    ctx.quadraticCurveTo(pos.x + width, pos.y + height, pos.x + width - radius, pos.y + height);
    ctx.lineTo(pos.x + radius, pos.y + height);
    ctx.quadraticCurveTo(pos.x, pos.y + height, pos.x, pos.y + height - radius);
    ctx.lineTo(pos.x, pos.y + radius);
    ctx.quadraticCurveTo(pos.x, pos.y, pos.x + radius, pos.y);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
}
export function circle(ctx, position, radius, colour) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
}
export function rect(ctx, position, width, height, colour, rotDeg) {
    rotateAroundPointWrapper(ctx, position.clone.add(new v2(width / 2, height / 2)), rotDeg, () => {
        ctx.beginPath();
        ctx.rect(position.x, position.y, width, height);
        ctx.fillStyle = colour;
        ctx.fill();
        ctx.closePath();
    });
}
export function polygon(ctx, points, fillColour, fill = true, rotDeg) {
    rotateAroundPointWrapper(ctx, v2.avPoint(points), rotDeg, () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.strokeStyle = fillColour;
        for (let point of points.slice(1, points.length))
            ctx.lineTo(point.x, point.y);
        if (fill) {
            ctx.fillStyle = fillColour;
            ctx.fill();
            ctx.closePath();
        }
        else {
            ctx.stroke();
        }
    });
}
export function text(ctx, text, fontSize, font, colour, position, alignment = 'center', rotDeg = 0) {
    const size = new v2(ctx.measureText(text).width, fontSize);
    const center = position.clone.add(size.clone.scale(0.5));
    rotateAroundPointWrapper(ctx, center, rotDeg, () => {
        ctx.beginPath();
        ctx.font = `${fontSize}px ${font}`;
        ctx.fillStyle = colour;
        ctx.textBaseline = "middle";
        ctx.textAlign = alignment;
        // flip text as the whole canvas is actually flipped
        ctx.translate(center.x, center.y);
        ctx.rotate(Math.PI);
        ctx.scale(-1, 1);
        ctx.translate(-center.x, -center.y);
        ctx.fillText(text, position.x, position.y);
        ctx.translate(center.x, center.y);
        ctx.rotate(-Math.PI);
        ctx.scale(-1, 1);
        ctx.translate(-center.x, -center.y);
        ctx.closePath();
    });
}
export function image(ctx, position, size, src, rotDeg) {
    rotateAroundPointWrapper(ctx, position.clone.add(size.clone.scale(0.5)), rotDeg, () => {
        position = position.clone;
        ctx.beginPath();
        let img = new Image;
        img.src = src;
        const center = position.clone.add(size.clone.scale(0.5));
        // center rotation on image
        ctx.translate(center.x, center.y);
        ctx.rotate(Math.PI);
        ctx.scale(-1, 1);
        ctx.translate(-center.x, -center.y);
        ctx.drawImage(img, position.x, position.y, size.x, size.y); // draw the image
        // undo 180 transform
        ctx.translate(center.x, center.y);
        ctx.rotate(-Math.PI);
        ctx.scale(-1, 1);
        ctx.translate(-center.x, -center.y);
        ctx.closePath();
    });
}

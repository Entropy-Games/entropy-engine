import { Component } from "../ECS/component.js";
import { getCanvasSize, getZoomScaledPosition, JSONifyComponent } from "../util/general.js";
export class Camera extends Component {
    constructor({ zoom = 1, far = 1000, near = 0.1, fov = 90 }) {
        super('Camera');
        this.addPublic({
            name: 'zoom',
            value: zoom,
            description: '2D only camera zoom - does not affect 3D rendering'
        });
        this.addPublic({
            name: 'far',
            value: far,
            description: 'The far clipping plane. Does not affect 2D rendering.'
        });
        this.addPublic({
            name: 'near',
            value: near,
            description: 'The near clipping plane. Does not affect 2D rendering.'
        });
        this.addPublic({
            name: 'fov',
            value: fov,
            description: 'Field of view - like zoom for 3D'
        });
    }
    json() {
        return JSONifyComponent(this, 'Camera');
    }
    screenSpaceToWorldSpace(point, canvas, cameraPos) {
        point = point.clone;
        const center = getCanvasSize(canvas).scale(0.5);
        point.set(getZoomScaledPosition(point, 1 / this.zoom, center));
        point.add(cameraPos.v2);
        point.sub(center);
        return point;
    }
    worldSpaceToScreenSpace(point, canvas, cameraPos) {
        const canvasSize = getCanvasSize(canvas);
        const mid = canvasSize.clone.scale(0.5);
        cameraPos = cameraPos.clone
            .sub(mid.v3);
        const renderPos = point.clone.sub(cameraPos.v2);
        return getZoomScaledPosition(renderPos, this.zoom, mid);
    }
}

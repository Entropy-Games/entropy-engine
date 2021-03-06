import {Component} from "../ECS/component";
import {v2, v3} from "../maths/maths";
import {JSONifyComponent} from "../util/general";
import {getCanvasSize, getZoomScaledPosition} from '../util/rendering';
import type {Entity} from "../ECS/entity";

export class Camera extends Component {
    zoom = 1;
    far = 1000;
    near = 0.1;
    fov = 90;

    constructor({
        zoom = 1,
        far = 1000,
        near = 0.1,
        fov = 90
    }={}) {
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

    json () {
        return JSONifyComponent(this, 'Camera');
    }

    screenSpaceToWorldSpace (point: v2, canvas: HTMLCanvasElement, cameraPos: v3): v2 {
        point = point.clone;
        const center = getCanvasSize(canvas).scale(0.5);

        point.set(getZoomScaledPosition(point, 1/this.zoom, center));
        point.add(cameraPos.v2);
        point.sub(center);

        return point;
    }

    worldSpaceToScreenSpace (point: v2, canvas: HTMLCanvasElement, cameraPos: v3): v2 {
        const canvasSize = getCanvasSize(canvas);
        const mid = canvasSize.clone.scale(0.5);

        cameraPos = cameraPos.clone
            .sub(mid.v3);

        const renderPos = point.clone.sub(cameraPos.v2);

        return getZoomScaledPosition(renderPos, this.zoom, mid);
    }

    // STATIC
    static main: Entity;
}
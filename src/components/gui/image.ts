import {Transform} from "../transform";
import {image} from "../../systems/rendering/basicShapes";
import {GUIElement} from "./gui";
import {v2} from "../../maths/v2";

export class GUIImage extends GUIElement {
    width = 0;
    height = 0;
    url = '';

    constructor ({
         zLayer = 1,
         width = 100,
         height = 100,
         url = '',
     }) {
        super('GUIImage', zLayer);

        this.addPublic({
            name: 'height',
            value: height,
        });

        this.addPublic({
            name: 'width',
            value: width,
        });

        this.addPublic({
            name: 'url',
            value: url,
        });
    }

    draw (ctx: CanvasRenderingContext2D, transform: Transform): void {
        if (!this.url) {
            return;
        }
        const width = this.width * transform.scale.x;
        const height = this.height * transform.scale.y;

        if (height <= 0 || width <= 0) {
            return;
        }

        image(ctx, transform.position.v2, new v2(width, height), this.url, transform.rotation.z);
    }

    touchingPoint (point: v2, ctx: CanvasRenderingContext2D, transform: Transform): boolean {
        // quite hard to implement as a polygon is a very complex shape
        // very expensive calculation
        const width = this.width * transform.scale.x;
        const height = this.height * transform.scale.y;

        return point.isInRect(transform.position.v2, new v2(width, height));
    }
}
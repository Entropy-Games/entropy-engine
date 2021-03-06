import * as Matter from 'matter-js';

import { Component } from "../ECS/component"
import {v2} from "../maths/v2"
import {Transform} from "../index";

export abstract class Collider extends Component {
    offset = v2.zero;
    solid = true;
    MatterBody: Matter.Body;

    protected constructor (subtype: string, solid: boolean, offset: v2, matterBody: Matter.Body) {
        super("Collider", subtype);

        this.addPublic({
            name: 'solid',
            value: solid,
            description: 'If the collider should interact with other colliders or not',
            default: true,
            type: "boolean"
        });

        this.addPublic({
            name: 'offset',
            value: offset,
            type: 'v2',
            description: 'Offsets the renderer from the transform of the entity',
            default: v2.zero
        });

        this.MatterBody = matterBody;
    }

    abstract overlapsPoint(transform: Transform, point: v2): boolean;
}

export class CircleCollider extends Collider {
    radius = 0;

    constructor ({
         radius = 1,
         solid = true,
         offset = new v2(0, 0),
    }={}) {
        super("CircleCollider", solid, offset,
            Matter.Bodies.circle(0, 0, radius, {})
        );

        this.addPublic({
            name: 'radius',
            value: radius,
            default: 1
        });
    }

    overlapsPoint(transform: Transform, point: v2): boolean {
        const testMBody = Matter.Bodies.circle(
            transform.position.x, transform.position.y,
            this.radius * transform.scale.x,
            {
                angle: transform.rotation.z
            }
        );

        const collisionRes = Matter.Query.point(
            [testMBody],
            Matter.Vector.create(point.x, point.y),
        );

        return collisionRes.length > 0;
    }

    json () {
        return {
            type: 'CircleCollider',
            radius: this.radius,
            solid: this.solid,
            offset: this.offset.array
        }
    }
}

export class RectCollider extends Collider {
    width = 0;
    height = 0;

    constructor ({
        width = 1,
        height = 1,
        solid = true,
        offset = new v2(0, 0)
    }={}) {
        super("RectCollider", solid, offset,
            Matter.Bodies.rectangle(0, 0, width, height, {})
        );

        this.addPublic({
            name: 'height',
            value: height
        });

        this.addPublic({
            name: 'width',
            value: width
        });
    }

    overlapsPoint(transform: Transform, point: v2): boolean {

        const testMBody = Matter.Bodies.rectangle(
            transform.position.x, transform.position.y,
            this.width * transform.scale.x,
            this.height * transform.scale.y,
            {
                angle: transform.rotation.z
            }
        );

        const collisionRes = Matter.Query.point(
            [testMBody],
            Matter.Vector.create(point.x, point.y),
        );

        return collisionRes.length > 0;
    }

    json () {
        return {
            type: 'RectCollider',
            height: this.height,
            width: this.width,
            solid: this.solid,
            offset: this.offset.array
        }
    }
}
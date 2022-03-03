import {Collider} from './components/colliders.js';
import {Scene} from './ECS/scene.js';
import {v2} from "./maths/v2";
import {Entity} from "./ECS/entity";
import {GUIElement, GUITextBox} from "./components/gui/gui";
import {Camera} from "./components/camera";
import {setCanvasSize} from './util/general.js';
import {canvases, getCTX} from './util/rendering.js';

export function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent) {
    let rect = canvas.getBoundingClientRect();

    const pos = new v2 (
        event.pageX - rect.left - scrollX,
        // invert
        rect.height - (
            event.pageY - rect.top - scrollY
        )
    );

    const scale = new v2(
        canvas.width / rect.width,
        canvas.height / rect.height
    );

    pos.mul(scale);

    return pos;
}

export function getMousePosWorldSpace (canvas: HTMLCanvasElement, event: MouseEvent) {
    const mousePos = getMousePos(canvas, event);
    return (<Entity>Camera.main)
        .getComponent<Camera>('Camera')
        .screenSpaceToWorldSpace(mousePos, canvas, Camera.main.transform.position);
}

export const input: {[k: string]: any} = {
    listen: (type: string, handler: EventListenerOrEventListenerObject) => {
        document.addEventListener(type, handler);
    },
    'mouseDown': false,
    'cursorPosition': v2.zero,
    'cursorPosWorldSpace': v2.zero
};
// init input for keycodes
for (let i = 8; i < 123; i++) {
    input[i] = false;
    input[String.fromCharCode(i)] = i;
}

input.Space = 32;
input.Enter = 13;
input.Shift = 16;
input.Backspace = 8;
input.Ctrl = 17;
input.Alt = 18;
input.CmdR = 93;
input.CmdL = 91;
input.WindowsKey = 91;
input.Left = 37;
input.Right = 39;
input.Up = 38;
input.Down = 40;

document.addEventListener('keydown', event => {
    input[event.keyCode] = true;
});

document.addEventListener('keyup', event => {
    input[event.keyCode] = false;
});

document.addEventListener('keypress', event => {
    Entity.loop(sprite => {
        if (!sprite.hasComponent('GUIElement', 'GUITextBox')) return;

        const element = sprite.getComponent<GUITextBox>('GUIElement', 'GUITextBox');
        if (element.selected)
            element.keyPress(event);
    });
});

// for backspace and enter
// backspace: delete last character on selected text boxes
// enter:     unselect all text boxes
document.addEventListener('keydown', event => {
    if (event.keyCode !== 8) return;

    Entity.loop(sprite => {
        if (!sprite.hasComponent('GUIElement', 'GUITextBox')) return;

        const element = sprite.getComponent<GUITextBox>('GUIElement', 'GUITextBox');

        if (element.selected)
            element.backspace();
    });
});

export function setMousePos(event: any, canvas: HTMLCanvasElement) {
    input.cursorPosition = getMousePos(canvas, event);
    input.cursorPosWorldSpace = getMousePosWorldSpace(canvas, event);
}

/**
 * Adds the event listeners to the input canvas
 */
export function addEventListeners (canvases: canvases, isInitialised: () => boolean) {
    const canvas = canvases.input;
    canvas?.parentNode?.addEventListener('resize', () => {
        // TO-DO: this doesn't work
        setCanvasSize(canvases);
    });


    // managers and constants
    canvas.addEventListener('mousemove', (evt: any) => {
        if (!isInitialised()) return;

        setMousePos(evt, canvas);

        Entity.loop(sprite => {
            if (!(sprite.sceneID === Scene.active)) return;

            for (const component of sprite.components) {
                if (component.type !== 'GUIElement') return;

                const component_ = (<unknown>component) as GUIElement;
                component_.hovered = component_.touchingPoint(input.cursorPosition, getCTX(canvas), sprite.transform);
            }
        });
    }, false);

    canvas.addEventListener('mousedown', (evt: any) => {
        if (!isInitialised()) return;
        input.mouseDown = true;

        setMousePos(evt, canvas);

        Scene.activeScene.loopThroughScripts((script, sprite) => {
            if (!(sprite.sceneID === Scene.active)) return;
            if (!sprite.hasComponent('Collider')) return;

            let collider = sprite.getComponent<Collider>('Collider');
            const mousePos = getMousePos(canvas, evt);

            if (!collider.overlapsPoint(sprite.transform, mousePos)) {
                return;
            }

            //script.runMethod('onMouseDown', []);
        });
    }, false);

    canvas.addEventListener('keydown', (event) => {
        setMousePos(event, canvas);
    });
    canvas.addEventListener('keyup', (event) => {
        setMousePos(event, canvas);
    });

    canvas.addEventListener('mouseup', (evt) => {
        if (!isInitialised()) return;

        input.mouseDown = false;
        setMousePos(evt, canvas);

        Scene.activeScene.loopThroughScripts((script, entity) => {
            if (!(entity.sceneID === Scene.active)) return;
            if (entity.hasComponent('Collider')){

                let collider = entity.getComponent<Collider>('Collider');
                const mousePos = getMousePos(canvas, evt);

                if (!collider.overlapsPoint(entity.transform, mousePos)) {
                    return;
                }

                script.runMethod('onMouseUp', entity, []);

            } else if (entity.hasComponent('GUIElement')) {
                const ui = entity.getComponent<GUIElement>('GUIElement');
                if (ui.hovered) {
                    script.runMethod('onClick', entity, []);
                }

                if (ui.subtype !== 'GUITextBox') return;

                // sets it to be selected if it is being hovered over,
                // and not selected if it is not hovered over
                let ui_ = ui as GUITextBox;
                ui_.selected = ui_.hovered;
            }
        });
    }, false);
}
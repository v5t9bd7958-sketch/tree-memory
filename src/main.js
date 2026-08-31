// 001
import {
    Application,
    Color,
    Entity,
    StandardMaterial,
    Vec3,
    TouchDevice,
    Mouse,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";

// 002
const canvas = document.getElementById("application");

// 003
const status = document.getElementById("status");

// 004
const hint = document.getElementById("hint");

// 005
const app = new Application(canvas, {
    graphicsDeviceOptions: {
        antialias: true,
        alpha: false
    },
    mouse: new Mouse(canvas),
    touch: new TouchDevice(canvas)
});

// 006
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);

// 007
app.setCanvasResolution(RESOLUTION_AUTO);

// 008
app.start();

// 009
window.addEventListener("resize", () => {
    app.resizeCanvas();
});

// 010
app.scene.ambientLight = new Color(0.3, 0.28, 0.24);

// 011
const camera = new Entity("Camera");

// 012
camera.addComponent("camera", {
    clearColor: new Color(0.025, 0.035, 0.025),
    fov: 50,
    nearClip: 0.1,
    farClip: 100
});

// 013
camera.setPosition(0, 3, 8);

// 014
camera.lookAt(0, 1.8, 0);

// 015
app.root.addChild(camera);

// 016
const light = new Entity("MainLight");

// 017
light.addComponent("light", {
    type: "directional",
    color: new Color(1, 0.9, 0.75),
    intensity: 2
});

// 018
light.setEulerAngles(45, -35, 0);

// 019
app.root.addChild(light);

// 020
const fill = new Entity("FillLight");

// 021
fill.addComponent("light", {
    type: "omni",
    color: new Color(0.45, 0.55, 1),
    intensity: 1.2,
    range: 15
});

// 022
fill.setPosition(-4, 5, 5);

// 023
app.root.addChild(fill);

// 024
const ground = new Entity("Ground");

// 025
ground.addComponent("render", {
    type: "plane"
});

// 026
ground.setLocalScale(12, 1, 12);

// 027
const groundMaterial = new StandardMaterial();

// 028
groundMaterial.diffuse = new Color(0.11, 0.09, 0.06);

// 029
groundMaterial.gloss = 0.15;

// 030
groundMaterial.update();

// 031
ground.render.material = groundMaterial;

// 032
app.root.addChild(ground);

// 033
const trunk = new Entity("TreeTrunk");

// 034
trunk.addComponent("render", {
    type: "cylinder"
});

// 035
trunk.setLocalScale(2, 5, 2);

// 036
trunk.setPosition(0, 2.5, 0);

// 037
const trunkMaterial = new StandardMaterial();

// 038
trunkMaterial.diffuse = new Color(0.18, 0.10, 0.05);

// 039
trunkMaterial.gloss = 0.2;

// 040
trunkMaterial.update();

// 041
trunk.render.material = trunkMaterial;

// 042
app.root.addChild(trunk);

// 043
const crown = new Entity("TreeCrown");

// 044
crown.addComponent("render", {
    type: "sphere"
});

// 045
crown.setLocalScale(5.8, 3.8, 5.8);

// 046
crown.setPosition(0, 5.4, 0);

// 047
const crownMaterial = new StandardMaterial();

// 048
crownMaterial.diffuse = new Color(0.04, 0.15, 0.06);

// 049
crownMaterial.gloss = 0.25;

// 050
crownMaterial.update();

// 051
crown.render.material = crownMaterial;

// 052
app.root.addChild(crown);

// 053
const bell = new Entity("InteractiveBell");

// 054
bell.addComponent("render", {
    type: "sphere"
});

// 055
bell.setLocalScale(0.65, 0.65, 0.65);

// 056
bell.setPosition(1.7, 3.2, 1);

// 057
const bellMaterial = new StandardMaterial();

// 058
bellMaterial.diffuse = new Color(0.85, 0.55, 0.05);

// 059
bellMaterial.emissive = new Color(0.5, 0.25, 0.02);

// 060
bellMaterial.emissiveIntensity = 2;

// 061
bellMaterial.gloss = 0.8;

// 062
bellMaterial.update();

// 063
bell.render.material = bellMaterial;

// 064
app.root.addChild(bell);

// 065
let activated = false;

// 066
let pulse = 0;

// 067
function activateBell() {
    
    activated = true;
    
    pulse = 1;
    
    status.textContent = "INTERACTION: OK";
    
    status.style.background = "rgba(20,110,50,0.8)";
    
    hint.textContent = "✓ Объект обнаружен — реакция работает";
    
    window.dispatchEvent(
        new CustomEvent("tree-memory:interaction", {
            detail: {
                object: "bell",
                action: "activate"
            }
        })
    );
}

// 068
function checkTap(x, y) {

    const screenPosition = camera.camera.worldToScreen(
        bell.getPosition()
    );

    const dx = x - screenPosition.x;
    
    const dy = y - screenPosition.y;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    if (distance <= 120) {
        activateBell();
    }
}

// 069
if (app.touch) {

    app.touch.on("touchend", event => {

        if (!event.changedTouches.length) {
            return;
        }

        const touch = event.changedTouches[0];

        checkTap(
            touch.x,
            touch.y
        );
    });
}

// 070
if (app.mouse) {

    app.mouse.on("mouseup", event => {

        if (event.button !== 0) {
            return;
        }

        checkTap(
            event.x,
            event.y
        );
    });
}

// 071
app.on("update", dt => {

    const time = performance.now() * 0.001;

    crown.setEulerAngles(
        0,
        Math.sin(time * 0.4) * 2,
        0
    );

    bell.setEulerAngles(
        0,
        Math.sin(time * 2) * 10,
        Math.sin(time * 3.2) * 5
    );

    if (pulse > 0) {

        pulse -= dt * 2;

        const amount = Math.max(
            0,
            pulse
        );

        const scale =
            1 +
            Math.sin(amount * Math.PI * 8) *
            0.2 *
            amount;

        bell.setLocalScale(
            0.65 * scale,
            0.65 * scale,
            0.65 * scale
        );
    } else {

        bell.setLocalScale(
            0.65,
            0.65,
            0.65
        );
    }
});

// 072
status.textContent = "3D RUNTIME: READY";

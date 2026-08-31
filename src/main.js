import {
    Application,
    Color,
    Entity,
    StandardMaterial,
    Mouse,
    TouchDevice,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";
const canvas = document.getElementById("application");
const status = document.getElementById("status");
if (!canvas) {
    throw new Error("Canvas #application не найден.");
}
const app = new Application(canvas, {
    graphicsDeviceOptions: {
        antialias: true,
        alpha: false
    },
    mouse: new Mouse(canvas),
    touch: new TouchDevice(canvas)
});
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);
app.scene.ambientLight = new Color(0.35, 0.35, 0.35);
const camera = new Entity("Camera");
camera.addComponent("camera", {
    clearColor: new Color(0.035, 0.045, 0.035),
    fov: 45,
    nearClip: 0.1,
    farClip: 100
});
camera.setPosition(0, 2.2, 7);
camera.lookAt(0, 1.2, 0);
app.root.addChild(camera);
const light = new Entity("MainLight");
light.addComponent("light", {
    type: "directional",
    color: new Color(1, 0.92, 0.78),
    intensity: 2
});
light.setEulerAngles(35, -30, 0);
app.root.addChild(light);
const fillLight = new Entity("FillLight");
fillLight.addComponent("light", {
    type: "omni",
    color: new Color(0.45, 0.55, 1),
    intensity: 1,
    range: 15
});
fillLight.setPosition(-4, 4, 4);
app.root.addChild(fillLight);
const ground = new Entity("Ground");
ground.addComponent("render", {
    type: "plane"
});
ground.setLocalScale(8, 1, 8);
const groundMaterial = new StandardMaterial();
groundMaterial.diffuse = new Color(0.12, 0.09, 0.055);
groundMaterial.update();
ground.render.material = groundMaterial;
app.root.addChild(ground);
const testObject = new Entity("TestObject");
testObject.addComponent("render", {
    type: "box"
});
testObject.setPosition(0, 1, 0);
testObject.setLocalScale(1.5, 2, 1.5);
const objectMaterial = new StandardMaterial();
objectMaterial.diffuse = new Color(0.15, 0.55, 0.22);
objectMaterial.emissive = new Color(0.015, 0.03, 0.01);
objectMaterial.update();
testObject.render.material = objectMaterial;
app.root.addChild(testObject);
let rotation = 0;
app.on("update", (dt) => {
    rotation += dt * 25;
    testObject.setEulerAngles(
        0,
        rotation,
        0
    );
});
app.start();
status.textContent = "PLAYCANVAS: OK";
status.style.background = "rgba(20, 120, 55, 0.85)";

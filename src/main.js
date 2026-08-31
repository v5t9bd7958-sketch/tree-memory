// 001
import {
    Application,
    Color,
    Entity,
    StandardMaterial,
    TouchDevice,
    Mouse,
    BoundingBox,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";
// 002
// Создаём canvas и UI сами, поэтому текущий index.html можно пока не трогать.
const oldGame = document.getElementById("game");
if (oldGame) {
    oldGame.innerHTML = "";
}
// 003
const canvas = document.createElement("canvas");
canvas.id = "application";
canvas.style.position = "fixed";
canvas.style.left = "0";
canvas.style.top = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
canvas.style.touchAction = "none";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.width = "100%";
document.body.style.height = "100%";
document.body.style.overflow = "hidden";
document.body.style.background = "#202020";
document.body.appendChild(canvas);
// 004
const status = document.createElement("div");
status.id = "status";
status.style.position = "fixed";
status.style.left = "50%";
status.style.top = "18px";
status.style.transform = "translateX(-50%)";
status.style.zIndex = "20";
status.style.padding = "8px 14px";
status.style.borderRadius = "10px";
status.style.background = "rgba(0,0,0,0.65)";
status.style.color = "#ffffff";
status.style.fontFamily =
    "-apple-system,BlinkMacSystemFont,sans-serif";
status.style.fontSize = "14px";
status.style.pointerEvents = "none";
status.style.whiteSpace = "nowrap";
status.textContent = "Загрузка 3D runtime…";
document.body.appendChild(status);
// 005
const hint = document.createElement("div");
hint.id = "hint";
hint.style.position = "fixed";
hint.style.left = "50%";
hint.style.bottom = "24px";
hint.style.transform = "translateX(-50%)";
hint.style.zIndex = "20";
hint.style.padding = "8px 14px";
hint.style.borderRadius = "10px";
hint.style.background = "rgba(0,0,0,0.55)";
hint.style.color = "#ffffff";
hint.style.fontFamily =
    "-apple-system,BlinkMacSystemFont,sans-serif";
hint.style.fontSize = "13px";
hint.style.pointerEvents = "none";
hint.style.textAlign = "center";
hint.textContent = "Подготовка сцены…";
document.body.appendChild(hint);
// 006
const app = new Application(canvas, {
    graphicsDeviceOptions: {
        antialias: true,
        alpha: false
    },
    mouse: new Mouse(canvas),
    touch: new TouchDevice(canvas)
});
// 007
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);
app.start();
// 008
window.addEventListener("resize", () => {
    app.resizeCanvas();
});
// 009
app.scene.ambientLight =
    new Color(0.32, 0.30, 0.28);
// 010
const camera = new Entity("Camera");
camera.addComponent("camera", {
    clearColor: new Color(0.025, 0.035, 0.025),
    fov: 50,
    nearClip: 0.1,
    farClip: 100
});
// 011
camera.setPosition(0, 3.2, 12);
camera.lookAt(0, 1.8, 0);
app.root.addChild(camera);
// 012
const mainLight = new Entity("MainLight");
mainLight.addComponent("light", {
    type: "directional",
    color: new Color(1, 0.9, 0.75),
    intensity: 2
});
mainLight.setEulerAngles(45, -35, 0);
app.root.addChild(mainLight);
// 013
const fillLight = new Entity("FillLight");
fillLight.addComponent("light", {
    type: "omni",
    color: new Color(0.45, 0.55, 1),
    intensity: 1.2,
    range: 20
});
fillLight.setPosition(-4, 5, 6);
app.root.addChild(fillLight);
// 014
const ground = new Entity("Ground");
ground.addComponent("render", {
    type: "plane"
});
ground.setLocalScale(12, 1, 12);
const groundMaterial = new StandardMaterial();
groundMaterial.diffuse =
    new Color(0.11, 0.09, 0.06);
groundMaterial.gloss = 0.15;
groundMaterial.update();
ground.render.material = groundMaterial;
app.root.addChild(ground);
// 015
const trunk = new Entity("TreeTrunk");
trunk.addComponent("render", {
    type: "cylinder"
});
trunk.setLocalScale(2, 5, 2);
trunk.setPosition(0, 2.5, 0);
const trunkMaterial = new StandardMaterial();
trunkMaterial.diffuse =
    new Color(0.18, 0.10, 0.05);
trunkMaterial.gloss = 0.2;
trunkMaterial.update();
trunk.render.material = trunkMaterial;
app.root.addChild(trunk);
// 016
const crown = new Entity("TreeCrown");
crown.addComponent("render", {
    type: "sphere"
});
crown.setLocalScale(5.8, 3.8, 5.8);
crown.setPosition(0, 5.4, 0);
const crownMaterial = new StandardMaterial();
crownMaterial.diffuse =
    new Color(0.04, 0.15, 0.06);
crownMaterial.gloss = 0.25;
crownMaterial.update();
crown.render.material = crownMaterial;
app.root.addChild(crown);
// 017
const bell = new Entity("InteractiveBell");
bell.addComponent("render", {
    type: "sphere"
});
bell.setLocalScale(0.65, 0.65, 0.65);
bell.setPosition(1.7, 3.2, 1);
const bellMaterial = new StandardMaterial();
bellMaterial.diffuse =
    new Color(0.85, 0.55, 0.05);
bellMaterial.emissive =
    new Color(0.5, 0.25, 0.02);
bellMaterial.emissiveIntensity = 2;
bellMaterial.gloss = 0.8;
bellMaterial.update();
bell.render.material = bellMaterial;
app.root.addChild(bell);
// 018
let pulse = 0;
function activateBell() {
    pulse = 1;
    status.textContent =
        "INTERACTION: OK";
    status.style.background =
        "rgba(20,110,50,0.85)";
    hint.textContent =
        "✓ Объект обнаружен — реакция работает";
}
// 019
function checkTap(x, y) {
    const screenPosition =
        camera.camera.worldToScreen(
            bell.getPosition()
        );
    const dx =
        x - screenPosition.x;
    const dy =
        y - screenPosition.y;
    const distance =
        Math.sqrt(dx * dx + dy * dy);
    if (distance <= 120) {
        activateBell();
    }
}
// 020
if (app.touch) {
    app.touch.on("touchend", event => {
        if (!event.changedTouches.length) {
            return;
        }
        const touch =
            event.changedTouches[0];
        checkTap(
            touch.x,
            touch.y
        );
    });
}
// 021
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
// 022
let character = null;
let characterReady = false;
// 023
// Надёжный путь для GitHub Pages.
// main.js находится в /tree-memory/src/
// GLB находится в /tree-memory/
const characterUrl =
    new URL(
        "../characterRIGGED.glb",
        import.meta.url
    ).href;
// 024
function collectMeshInstances(entity, result) {
    if (
        entity.render &&
        entity.render.meshInstances
    ) {
        for (
            const meshInstance
            of entity.render.meshInstances
        ) {
            result.push(meshInstance);
        }
    }
    for (
        const child
        of entity.children
    ) {
        collectMeshInstances(
            child,
            result
        );
    }
}
// 025
function calculateBounds(entity) {
    const meshes = [];
    collectMeshInstances(
        entity,
        meshes
    );
    if (meshes.length === 0) {
        throw new Error(
            "В GLB не найдены MeshInstance."
        );
    }
    const bounds =
        new BoundingBox();
    bounds.copy(
        meshes[0].aabb
    );
    for (
        let i = 1;
        i < meshes.length;
        i++
    ) {
        bounds.add(
            meshes[i].aabb
        );
    }
    return bounds;
}
// 026
function normalizeCharacter(entity) {
    const originalBounds =
        calculateBounds(entity);
    const originalHeight =
        originalBounds.halfExtents.y * 2;
    if (
        !Number.isFinite(originalHeight) ||
        originalHeight <= 0
    ) {
        throw new Error(
            "Некорректная высота GLB."
        );
    }
    // Целевой рост персонажа в сцене.
    // Нам нужен весь персонаж, а не крупный план головы.
    const targetHeight = 2.6;
    const scale =
        targetHeight /
        originalHeight;
    entity.setLocalScale(
        scale,
        scale,
        scale
    );
    app.root.syncHierarchy();
    const scaledBounds =
        calculateBounds(entity);
    // Ставим нижнюю точку модели на землю.
    const bottom =
        scaledBounds.center.y -
        scaledBounds.halfExtents.y;
    const position =
        entity.getPosition();
    entity.setPosition(
        position.x,
        position.y - bottom,
        position.z
    );
    app.root.syncHierarchy();
    const finalBounds =
        calculateBounds(entity);
    // Центрируем модель по X/Z.
    const finalPosition =
        entity.getPosition();
    entity.setPosition(
        finalPosition.x -
            finalBounds.center.x,
        finalPosition.y,
        finalPosition.z -
            finalBounds.center.z
    );
    app.root.syncHierarchy();
    return {
        originalHeight,
        finalHeight:
            calculateBounds(entity)
                .halfExtents.y * 2,
        scale
    };
}
// 027
function loadCharacter() {
    status.textContent =
        "Загрузка 3D-персонажа…";
    hint.textContent =
        "GLB → PlayCanvas";
// 028
    app.assets.loadFromUrl(
        characterUrl,
        "container",
        (error, asset) => {
            if (error) {
                console.error(
                    "GLB LOAD ERROR:",
                    error
                );
                status.textContent =
                    "ОШИБКА GLB";
                status.style.background =
                    "rgba(150,30,30,0.9)";
                hint.textContent =
                    "Не удалось загрузить characterRIGGED.glb";
                return;
            }
// 029
            try {
                character =
                    asset.resource
                        .instantiateRenderEntity({
                            castShadows: false,
                            receiveShadows: true
                        });
                character.name =
                    "TreeMemoryCharacter";
                // Временно ставим персонажа
                // перед деревом.
                character.setPosition(
                    0,
                    0,
                    1.8
                );
                app.root.addChild(
                    character
                );
                app.root.syncHierarchy();
// 030
                const info =
                    normalizeCharacter(
                        character
                    );
                characterReady = true;
                status.textContent =
                    "3D CHARACTER: READY";
                status.style.background =
                    "rgba(20,110,50,0.85)";
                hint.textContent =
                    "✓ Персонаж целиком загружен";
                console.log(
                    "TREE MEMORY CHARACTER READY"
                );
                console.log(
                    "GLB URL:",
                    characterUrl
                );
                console.log(
                    "Original height:",
                    info.originalHeight
                );
                console.log(
                    "Final height:",
                    info.finalHeight
                );
                console.log(
                    "Applied scale:",
                    info.scale
                );
            } catch (setupError) {
                console.error(
                    "GLB SETUP ERROR:",
                    setupError
                );
                status.textContent =
                    "ОШИБКА 3D-ПЕРСОНАЖА";
                status.style.background =
                    "rgba(150,30,30,0.9)";
                hint.textContent =
                    setupError.message;
            }
        }
    );
}
// 031
loadCharacter();
// 032
app.on("update", dt => {
    const time =
        performance.now() * 0.001;
// 033
    crown.setEulerAngles(
        0,
        Math.sin(time * 0.4) * 2,
        0
    );
// 034
    if (pulse > 0) {
        pulse -= dt * 2;
        const amount =
            Math.max(0, pulse);
        const scale =
            1 +
            Math.sin(
                amount *
                Math.PI *
                8
            ) *
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
// 035
    // Персонаж здесь НЕ вращаем.
    // Следующий этап — настоящий Character Controller.
    if (characterReady && character) {
        character.setEulerAngles(
            0,
            0,
            0
        );
    }
});
// 036
status.textContent =
    "3D RUNTIME: READY";
hint.textContent =
    "Загрузка персонажа…";

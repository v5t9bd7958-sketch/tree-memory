import {
    Application,
    Color,
    Entity,
    StandardMaterial,
    TouchDevice,
    Mouse,
    BoundingBox,
    Vec3,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";
const canvas = document.getElementById("application");
const status = document.getElementById("status");
const hint = document.getElementById("hint");
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
app.start();
window.addEventListener("resize", () => {
    app.resizeCanvas();
});
app.scene.ambientLight = new Color(0.3, 0.28, 0.24);
const camera = new Entity("Camera");
camera.addComponent("camera", {
    clearColor: new Color(0.035, 0.04, 0.035),
    fov: 45,
    nearClip: 0.1,
    farClip: 100
});
camera.setPosition(0, 3.0, 9);
camera.lookAt(0, 2.0, 0);
app.root.addChild(camera);
const mainLight = new Entity("MainLight");
mainLight.addComponent("light", {
    type: "directional",
    color: new Color(1, 0.9, 0.75),
    intensity: 2
});
mainLight.setEulerAngles(45, -35, 0);
app.root.addChild(mainLight);
const fillLight = new Entity("FillLight");
fillLight.addComponent("light", {
    type: "omni",
    color: new Color(0.45, 0.55, 1),
    intensity: 1.2,
    range: 15
});
fillLight.setPosition(-4, 5, 5);
app.root.addChild(fillLight);
const ground = new Entity("Ground");
ground.addComponent("render", {
    type: "plane"
});
ground.setLocalScale(12, 1, 12);
const groundMaterial = new StandardMaterial();
groundMaterial.diffuse = new Color(0.11, 0.09, 0.06);
groundMaterial.gloss = 0.15;
groundMaterial.update();
ground.render.material = groundMaterial;
app.root.addChild(ground);
const trunk = new Entity("TreeTrunk");
trunk.addComponent("render", {
    type: "cylinder"
});
trunk.setLocalScale(2, 5, 2);
trunk.setPosition(0, 2.5, 0);
const trunkMaterial = new StandardMaterial();
trunkMaterial.diffuse = new Color(0.18, 0.10, 0.05);
trunkMaterial.gloss = 0.2;
trunkMaterial.update();
trunk.render.material = trunkMaterial;
app.root.addChild(trunk);
const crown = new Entity("TreeCrown");
crown.addComponent("render", {
    type: "sphere"
});
crown.setLocalScale(5.8, 3.8, 5.8);
crown.setPosition(0, 5.4, 0);
const crownMaterial = new StandardMaterial();
crownMaterial.diffuse = new Color(0.04, 0.15, 0.06);
crownMaterial.gloss = 0.25;
crownMaterial.update();
crown.render.material = crownMaterial;
app.root.addChild(crown);
const bell = new Entity("InteractiveBell");
bell.addComponent("render", {
    type: "sphere"
});
bell.setLocalScale(0.65, 0.65, 0.65);
bell.setPosition(1.7, 3.2, 1);
const bellMaterial = new StandardMaterial();
bellMaterial.diffuse = new Color(0.85, 0.55, 0.05);
bellMaterial.emissive = new Color(0.5, 0.25, 0.02);
bellMaterial.emissiveIntensity = 2;
bellMaterial.gloss = 0.8;
bellMaterial.update();
bell.render.material = bellMaterial;
app.root.addChild(bell);
let pulse = 0;
function activateBell() {
    pulse = 1;
    status.textContent = "INTERACTION: OK";
    status.style.background = "rgba(20,110,50,0.8)";
    hint.textContent = "✓ Объект обнаружен — реакция работает";
}
function checkTap(x, y) {
    const screenPosition = camera.camera.worldToScreen(
        bell.getPosition()
    );
    const dx = x - screenPosition.x;
    const dy = y - screenPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= 120) {
        activateBell();
    }
}
if (app.touch) {
    app.touch.on("touchend", event => {
        if (!event.changedTouches.length) {
            return;
        }
        const touch = event.changedTouches[0];
        checkTap(touch.x, touch.y);
    });
}
if (app.mouse) {
    app.mouse.on("mouseup", event => {
        if (event.button !== 0) {
            return;
        }
        checkTap(event.x, event.y);
    });
}
let character = null;
let characterReady = false;
const characterUrl = "./characterRIGGED.glb";
function collectMeshInstances(entity, result) {
    if (entity.render && entity.render.meshInstances) {
        for (const meshInstance of entity.render.meshInstances) {
            result.push(meshInstance);
        }
    }
    for (const child of entity.children) {
        collectMeshInstances(child, result);
    }
}
function normalizeCharacter(entity) {
    const meshInstances = [];
    collectMeshInstances(entity, meshInstances);
    if (meshInstances.length === 0) {
        throw new Error("GLB содержит Entity, но MeshInstance не найден.");
    }
    const bounds = new BoundingBox();
    bounds.copy(meshInstances[0].aabb);
    for (let i = 1; i < meshInstances.length; i++) {
        bounds.add(meshInstances[i].aabb);
    }
    const height = bounds.halfExtents.y * 2;
    if (!Number.isFinite(height) || height <= 0) {
        throw new Error("Не удалось определить высоту персонажа.");
    }
    const targetHeight = 3.2;
    const scale = targetHeight / height;
    entity.setLocalScale(scale, scale, scale);
    entity.setPosition(0, 0, 2);
    app.root.syncHierarchy();
    const normalizedMeshes = [];
    collectMeshInstances(entity, normalizedMeshes);
    const normalizedBounds = new BoundingBox();
    normalizedBounds.copy(normalizedMeshes[0].aabb);
    for (let i = 1; i < normalizedMeshes.length; i++) {
        normalizedBounds.add(normalizedMeshes[i].aabb);
    }
    const bottom = normalizedBounds.center.y -
        normalizedBounds.halfExtents.y;
    entity.translateLocal(0, -bottom, 0);
    app.root.syncHierarchy();
    const finalMeshes = [];
    collectMeshInstances(entity, finalMeshes);
    const finalBounds = new BoundingBox();
    finalBounds.copy(finalMeshes[0].aabb);
    for (let i = 1; i < finalMeshes.length; i++) {
        finalBounds.add(finalMeshes[i].aabb);
    }
    const centerX = finalBounds.center.x;
    const centerZ = finalBounds.center.z;
    entity.translateLocal(-centerX, 0, -centerZ);
    app.root.syncHierarchy();
    return {
        scale,
        height,
        finalHeight: finalBounds.halfExtents.y * 2
    };
}
function loadCharacter() {
    status.textContent = "Загрузка 3D-персонажа…";
    hint.textContent = "GLB → PlayCanvas";
    app.assets.loadFromUrl(
        characterUrl,
        "container",
        (err, asset) => {
            if (err) {
                console.error("Character GLB load error:", err);
                status.textContent = "ОШИБКА ЗАГРУЗКИ GLB";
                status.style.background = "rgba(150,30,30,0.9)";
                hint.textContent = "Путь characterRIGGED.glb не найден";
                return;
            }
            try {
                character = asset.resource.instantiateRenderEntity({
                    castShadows: false,
                    receiveShadows: true
                });
                character.name = "TreeMemoryCharacter";
                app.root.addChild(character);
                const info = normalizeCharacter(character);
                characterReady = true;
                status.textContent = "3D CHARACTER: READY";
                status.style.background = "rgba(20,110,50,0.8)";
                hint.textContent =
                    `✓ Персонаж загружен · ${info.finalHeight.toFixed(1)}m`;
                console.log("Tree Memory character loaded.");
                console.log("Original height:", info.height);
                console.log("Applied scale:", info.scale);
                console.log("Final height:", info.finalHeight);
            } catch (error) {
                console.error("Character setup error:", error);
                status.textContent = "ОШИБКА ПОДГОТОВКИ GLB";
                status.style.background = "rgba(150,30,30,0.9)";
                hint.textContent = error.message;
            }
        }
    );
}
loadCharacter();
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
        const amount = Math.max(0, pulse);
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
        bell.setLocalScale(0.65, 0.65, 0.65);
    }
    if (characterReady && character) {
        character.rotate(
            0,
            Math.sin(time * 0.5) * 0.08,
            0
        );
    }
});
status.textContent = "3D RUNTIME: READY";
hint.textContent = "Загрузка персонажа…";

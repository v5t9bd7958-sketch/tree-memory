import {
    Application,
    Color,
    Entity,
    Ray,
    StandardMaterial,
    Vec3,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";
/*
 * =========================================================
 * DOM
 * =========================================================
 */
const canvas =
    document.getElementById(
        "application"
    );
const status =
    document.getElementById(
        "status"
    );
/*
 * =========================================================
 * STATUS / ERROR SYSTEM
 * =========================================================
 */
function setStatus(
    message,
    error = false
) {
    if (!status) {
        return;
    }
    status.textContent =
        message;
    status.style.background =
        error
            ? "rgba(145, 25, 25, 0.92)"
            : "rgba(0, 0, 0, 0.72)";
}
function reportError(
    prefix,
    error
) {
    console.error(
        prefix,
        error
    );
    const message =
        error?.message ??
        String(error);
    setStatus(
        `${prefix}: ${message}`,
        true
    );
}
/*
 * =========================================================
 * DOM VALIDATION
 * =========================================================
 */
if (
    !(canvas instanceof HTMLCanvasElement)
) {
    throw new Error(
        "Canvas #application не найден."
    );
}
if (!status) {
    throw new Error(
        "Элемент #status не найден."
    );
}
/*
 * =========================================================
 * GLOBAL ERROR HANDLERS
 * =========================================================
 */
window.addEventListener(
    "error",
    (event) => {
        reportError(
            "JS ERROR",
            event.error ??
            event.message ??
            "Неизвестная ошибка"
        );
    }
);
window.addEventListener(
    "unhandledrejection",
    (event) => {
        reportError(
            "PROMISE ERROR",
            event.reason ??
            "Неизвестная ошибка"
        );
    }
);
/*
 * =========================================================
 * PLAYCANVAS APPLICATION
 * =========================================================
 */
let app;
try {
    app =
        new Application(
            canvas,
            {
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: false
                }
            }
        );
    app.setCanvasFillMode(
        FILLMODE_FILL_WINDOW
    );
    app.setCanvasResolution(
        RESOLUTION_AUTO
    );
} catch (error) {
    reportError(
        "PLAYCANVAS INIT ERROR",
        error
    );
    throw error;
}
/*
 * =========================================================
 * SCENE
 * =========================================================
 */
app.scene.ambientLight =
    new Color(
        0.32,
        0.32,
        0.32
    );
/*
 * =========================================================
 * CAMERA
 * =========================================================
 */
const camera =
    new Entity(
        "Camera"
    );
camera.addComponent(
    "camera",
    {
        clearColor:
            new Color(
                0.025,
                0.035,
                0.025
            ),
        fov: 45,
        nearClip: 0.1,
        farClip: 100
    }
);
camera.setPosition(
    0,
    2.2,
    7
);
camera.lookAt(
    0,
    1.2,
    0
);
app.root.addChild(
    camera
);
/*
 * =========================================================
 * MAIN LIGHT
 * =========================================================
 */
const mainLight =
    new Entity(
        "MainLight"
    );
mainLight.addComponent(
    "light",
    {
        type:
            "directional",
        color:
            new Color(
                1,
                0.92,
                0.78
            ),
        intensity: 2
    }
);
mainLight.setEulerAngles(
    35,
    -30,
    0
);
app.root.addChild(
    mainLight
);
/*
 * =========================================================
 * FILL LIGHT
 * =========================================================
 */
const fillLight =
    new Entity(
        "FillLight"
    );
fillLight.addComponent(
    "light",
    {
        type:
            "omni",
        color:
            new Color(
                0.45,
                0.55,
                1
            ),
        intensity: 1,
        range: 15
    }
);
fillLight.setPosition(
    -4,
    4,
    4
);
app.root.addChild(
    fillLight
);
/*
 * =========================================================
 * GROUND
 * =========================================================
 */
const ground =
    new Entity(
        "Ground"
    );
ground.addComponent(
    "render",
    {
        type:
            "plane"
    }
);
ground.setLocalScale(
    8,
    1,
    8
);
const groundMaterial =
    new StandardMaterial();
groundMaterial.diffuse =
    new Color(
        0.12,
        0.09,
        0.055
    );
groundMaterial.update();
ground.render.material =
    groundMaterial;
app.root.addChild(
    ground
);
/*
 * =========================================================
 * INTERACTIVE TEST OBJECT
 * =========================================================
 *
 * Это временный объект для проверки всей цепочки:
 *
 * iPhone touch
 *      ↓
 * pointer event
 *      ↓
 * screen coordinates
 *      ↓
 * 3D ray
 *      ↓
 * AABB hit test
 *      ↓
 * interaction
 *
 * =========================================================
 */
const testObject =
    new Entity(
        "InteractiveObject"
    );
testObject.addComponent(
    "render",
    {
        type:
            "box"
    }
);
testObject.setPosition(
    0,
    1,
    0
);
testObject.setLocalScale(
    1.5,
    2,
    1.5
);
const objectMaterial =
    new StandardMaterial();
objectMaterial.diffuse =
    new Color(
        0.15,
        0.55,
        0.22
    );
objectMaterial.emissive =
    new Color(
        0.015,
        0.03,
        0.01
    );
objectMaterial.update();
testObject.render.material =
    objectMaterial;
app.root.addChild(
    testObject
);
/*
 * =========================================================
 * RAYCAST OBJECTS
 * =========================================================
 */
const ray =
    new Ray();
const rayStart =
    new Vec3();
const rayEnd =
    new Vec3();
const rayDirection =
    new Vec3();
/*
 * =========================================================
 * INPUT STATE
 * =========================================================
 */
const input = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    moved: false
};
const INPUT_CONFIG = {
    tapMoveThreshold: 12
};
/*
 * =========================================================
 * INTERACTION STATE
 * =========================================================
 */
const interaction = {
    cooldown: 0,
    animationTime: 1,
    rotation: 0
};
const INTERACTION_CONFIG = {
    cooldown: 0.18,
    animationDuration: 0.45
};
/*
 * =========================================================
 * INPUT RESET
 * =========================================================
 */
function resetInput() {
    input.active =
        false;
    input.pointerId =
        null;
    input.startX =
        0;
    input.startY =
        0;
    input.moved =
        false;
}
function cancelInput() {
    resetInput();
}
/*
 * =========================================================
 * CANVAS RESIZE
 * =========================================================
 */
function resizeCanvas() {
    if (!app) {
        return;
    }
    app.resizeCanvas();
}
/*
 * =========================================================
 * SCREEN → CANVAS COORDINATES
 * ========================================================= */
function getCanvasPoint(
    event
) {
    const rect =
        canvas.getBoundingClientRect();
    const width =
        canvas.offsetWidth;
    const height =
        canvas.offsetHeight;
    if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        width <= 0 ||
        height <= 0
    ) {
        return null;
    }
    return {
        x:
            (
                event.clientX -
                rect.left
            ) *
            (
                width /
                rect.width
            ),
        y:
            (
                event.clientY -
                rect.top
            ) *
            (
                height /
                rect.height
            )
    };
}
/*
 * =========================================================
 * 3D HIT TEST
 * ========================================================= */
function hitTest(
    entity,
    screenX,
    screenY
) {
    if (
        !entity ||
        !entity.render ||
        !entity.render.meshInstances ||
        entity.render.meshInstances.length === 0
    ) {
        return false;
    }
    /*
     * Получаем точку луча
     * возле камеры.
     */
    camera.camera.screenToWorld(
        screenX,
        screenY,
        camera.camera.nearClip,
        rayStart
    );
    /*
     * Получаем вторую точку
     * далеко от камеры.
     */
    camera.camera.screenToWorld(
        screenX,
        screenY,
        camera.camera.farClip,
        rayEnd
    );
    /*
     * Направление луча.
     */
    rayDirection.sub2(
        rayEnd,
        rayStart
    );
    if (
        rayDirection.lengthSq() <=
        0.00000001
    ) {
        return false;
    }
    rayDirection.normalize();
    ray.set(
        rayStart,
        rayDirection
    );
    /*
     * Гарантируем актуальные
     * мировые трансформации.
     */
    app.root.syncHierarchy();
    /*
     * Проверяем каждый mesh instance.
     */
    for (
        const meshInstance
        of entity.render.meshInstances
    ) {
        if (
            meshInstance.aabb &&
            meshInstance.aabb.intersectsRay(
                ray
            )
        ) {
            return true;
        }
    }
    return false;
}
/*
 * =========================================================
 * OBJECT INTERACTION
 * ========================================================= */
function interactWithObject() {
    if (
        interaction.cooldown > 0
    ) {
        return;
    }
    interaction.cooldown =
        INTERACTION_CONFIG.cooldown;
    interaction.animationTime =
        0;
    setStatus(
        "ТАП ✓ · объект активирован"
    );
}
/*
 * =========================================================
 * TAP PROCESSING
 * ========================================================= */
function processTap(
    event
) {
    const point =
        getCanvasPoint(
            event
        );
    if (!point) {
        return;
    }
    const hit =
        hitTest(
            testObject,
            point.x,
            point.y
        );
    if (hit) {
        interactWithObject();
        return;
    }
    setStatus(
        "ТАП ✓ · объект не найден"
    );
}
/*
 * =========================================================
 * POINTER DOWN
 * ========================================================= */
canvas.addEventListener(
    "pointerdown",
    (event) => {
        /*
         * Для мыши принимаем
         * только левую кнопку.
         */
        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }
        /*
         * Второй pointer
         * не вмешивается
         * в текущий tap.
         */
        if (input.active) {
            return;
        }
        input.active =
            true;
        input.pointerId =
            event.pointerId;
        input.startX =
            event.clientX;
        input.startY =
            event.clientY;
        input.moved =
            false;
        try {
            canvas.setPointerCapture(
                event.pointerId
            );
        } catch {
            /*
             * Pointer capture
             * необязателен.
             */
        }
    }
);
/*
 * =========================================================
 * POINTER MOVE
 * ========================================================= */
canvas.addEventListener(
    "pointermove",
    (event) => {
        if (
            !input.active ||
            event.pointerId !==
                input.pointerId
        ) {
            return;
        }
        const dx =
            event.clientX -
            input.startX;
        const dy =
            event.clientY -
            input.startY;
        const distanceSquared =
            dx * dx +
            dy * dy;
        if (
            distanceSquared >
            INPUT_CONFIG.tapMoveThreshold *
            INPUT_CONFIG.tapMoveThreshold
        ) {
            input.moved =
                true;
        }
    }
);
/*
 * =========================================================
 * POINTER UP
 * ========================================================= */
canvas.addEventListener(
    "pointerup",
    (event) => {
        if (
            !input.active ||
            event.pointerId !==
                input.pointerId
        ) {
            return;
        }
        const isTap =
            !input.moved;
        const pointerId =
            input.pointerId;
        /*
         * Сначала сохраняем
         * факт tap и очищаем input.
         */
        resetInput();
        try {
            canvas.releasePointerCapture(
                pointerId
            );
        } catch {
            /*
             * Pointer capture
             * уже мог быть потерян.
             */
        }
        if (isTap) {
            processTap(
                event
            );
        }
    }
);
/*
 * =========================================================
 * POINTER CANCEL
 * ========================================================= */
canvas.addEventListener(
    "pointercancel",
    (event) => {
        if (
            event.pointerId ===
            input.pointerId
        ) {
            cancelInput();
        }
    }
);
/*
 * =========================================================
 * LOST POINTER CAPTURE
 * ========================================================= */
canvas.addEventListener(
    "lostpointercapture",
    (event) => {
        if (
            input.active &&
            event.pointerId ===
                input.pointerId
        ) {
            cancelInput();
        }
    }
);
/*
 * =========================================================
 * BROWSER BEHAVIOUR
 * ========================================================= */
canvas.addEventListener(
    "contextmenu",
    (event) => {
        event.preventDefault();
    }
);
window.addEventListener(
    "blur",
    cancelInput
);
window.addEventListener(
    "pagehide",
    cancelInput
);
document.addEventListener(
    "visibilitychange",
    () => {
        if (
            document.hidden
        ) {
            cancelInput();
        }
    }
);
/*
 * =========================================================
 * RESIZE EVENTS
 * ========================================================= */
window.addEventListener(
    "resize",
    resizeCanvas
);
window.addEventListener(
    "orientationchange",
    resizeCanvas
);
/*
 * =========================================================
 * GAME LOOP
 * ========================================================= */
app.on(
    "update",
    (dt) => {
        /*
         * Ограничиваем большой
         * скачок времени.
         */
        const safeDt =
            Math.min(
                Math.max(
                    dt,
                    0
                ),
                0.05
            );
        /*
         * Interaction cooldown.
         */
        interaction.cooldown =
            Math.max(
                0,
                interaction.cooldown -
                    safeDt
            );
        /*
         * Постоянное вращение
         * тестового объекта.
         */
        interaction.rotation +=
            safeDt * 25;
        /*
         * Реакция после tap.
         */
        if (
            interaction.animationTime <
            INTERACTION_CONFIG.animationDuration
        ) {
            interaction.animationTime +=
                safeDt;
            const progress =
                Math.min(
                    1,
                    interaction.animationTime /
                        INTERACTION_CONFIG.animationDuration
                );
            const pulse =
                1 -
                progress;
            testObject.setEulerAngles(
                0,
                interaction.rotation +
                    pulse * 20,
                0
            );
        } else {
            testObject.setEulerAngles(
                0,
                interaction.rotation,
                0
            );
        }
    }
);
/*
 * =========================================================
 * START
 * ========================================================= */
try {
    app.start();
    resizeCanvas();
    setStatus(
        "PLAYCANVAS READY · тапните зелёный объект"
    );
} catch (error) {
    reportError(
        "RUNTIME ERROR",
        error
    );
    throw error;
}

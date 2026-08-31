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
const canvas =
    document.getElementById(
        "application"
    );
const status =
    document.getElementById(
        "status"
    );
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
            ? "rgba(145, 25, 25, 0.94)"
            : "rgba(0, 0, 0, 0.78)";
}
function fail(
    stage,
    error
) {
    console.error(
        `[Tree Memory] ${stage}`,
        error
    );
    const message =
        error &&
        typeof error === "object" &&
        "message" in error
            ? error.message
            : String(error);
    setStatus(
        `ОШИБКА ${stage}: ${message}`,
        true
    );
}
window.addEventListener(
    "error",
    (event) => {
        if (event.error) {
            fail(
                "JAVASCRIPT",
                event.error
            );
        }
    }
);
window.addEventListener(
    "unhandledrejection",
    (event) => {
        fail(
            "PROMISE",
            event.reason
        );
    }
);
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
let app;
try {
    setStatus(
        "1/5 · создание PlayCanvas…"
    );
    app =
        new Application(
            canvas,
            {
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: false
                },
                mouse:
                    new Mouse(canvas),
                touch:
                    new TouchDevice(canvas)
            }
        );
} catch (error) {
    fail(
        "ENGINE INIT",
        error
    );
    throw error;
}
try {
    setStatus(
        "2/5 · настройка Canvas…"
    );
    app.setCanvasFillMode(
        FILLMODE_FILL_WINDOW
    );
    app.setCanvasResolution(
        RESOLUTION_AUTO
    );
} catch (error) {
    fail(
        "CANVAS",
        error
    );
    throw error;
}
try {
    setStatus(
        "3/5 · создание сцены…"
    );
    app.scene.ambientLight =
        new Color(
            0.32,
            0.32,
            0.32
        );
    /*
     * CAMERA
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
     * LIGHT
     */
    const light =
        new Entity(
            "MainLight"
        );
    light.addComponent(
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
    light.setEulerAngles(
        35,
        -30,
        0
    );
    app.root.addChild(
        light
    );
    /*
     * GROUND
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
     * TEST OBJECT
     */
    const testObject =
        new Entity(
            "TestObject"
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
     * ANIMATION
     */
    let rotation = 0;
    app.on(
        "update",
        (dt) => {
            const safeDt =
                Math.min(
                    Math.max(
                        Number.isFinite(dt)
                            ? dt
                            : 0,
                        0
                    ),
                    0.05
                );
            rotation +=
                safeDt * 25;
            testObject.setEulerAngles(
                0,
                rotation,
                0
            );
        }
    );
    /*
     * RESIZE
     */
    const resize =
        () => {
            try {
                app.resizeCanvas();
            } catch (error) {
                fail(
                    "RESIZE",
                    error
                );
            }
        };
    window.addEventListener(
        "resize",
        resize,
        {
            passive: true
        }
    );
    window.addEventListener(
        "orientationchange",
        resize,
        {
            passive: true
        }
    );
} catch (error) {
    fail(
        "SCENE",
        error
    );
    throw error;
}
try {
    setStatus(
        "4/5 · запуск графического цикла…"
    );
    app.start();
    app.resizeCanvas();
} catch (error) {
    fail(
        "START",
        error
    );
    throw error;
}
setStatus(
    "5/5 · PLAYCANVAS ✓"
);
console.log(
    "[Tree Memory] ENGINE READY"
);

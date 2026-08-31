import {
    Application,
    Color,
    Entity,
    StandardMaterial,
    TouchDevice,
    Mouse,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";

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
document.body.style.overflow = "hidden";
document.body.style.background = "#202020";

document.body.appendChild(canvas);

const status = document.createElement("div");

status.style.position = "fixed";
status.style.left = "50%";
status.style.top = "18px";
status.style.transform = "translateX(-50%)";
status.style.zIndex = "20";
status.style.padding = "10px 15px";
status.style.borderRadius = "10px";
status.style.background = "rgba(0,0,0,0.75)";
status.style.color = "#fff";
status.style.fontFamily =
    "-apple-system,BlinkMacSystemFont,sans-serif";
status.style.fontSize = "14px";
status.style.textAlign = "center";
status.style.maxWidth = "90%";

status.textContent = "Запуск PlayCanvas…";

document.body.appendChild(status);

const hint = document.createElement("div");

hint.style.position = "fixed";
hint.style.left = "50%";
hint.style.bottom = "24px";
hint.style.transform = "translateX(-50%)";
hint.style.zIndex = "20";
hint.style.padding = "8px 14px";
hint.style.borderRadius = "10px";
hint.style.background = "rgba(0,0,0,0.55)";
hint.style.color = "#fff";
hint.style.fontFamily =
    "-apple-system,BlinkMacSystemFont,sans-serif";
hint.style.fontSize = "13px";
hint.style.textAlign = "center";
hint.style.maxWidth = "90%";

hint.textContent = "Подготовка…";

document.body.appendChild(hint);

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

app.scene.ambientLight =
    new Color(0.3, 0.28, 0.24);

const camera = new Entity("Camera");

camera.addComponent("camera", {
    clearColor:
        new Color(0.025, 0.035, 0.025),
    fov: 50,
    nearClip: 0.1,
    farClip: 100
});

camera.setPosition(
    0,
    3,
    10
);

camera.lookAt(
    0,
    1.5,
    0
);

app.root.addChild(camera);

const light = new Entity("Light");

light.addComponent("light", {
    type: "directional",
    color:
        new Color(1, 0.9, 0.75),
    intensity: 2
});

light.setEulerAngles(
    45,
    -35,
    0
);

app.root.addChild(light);

const ground = new Entity("Ground");

ground.addComponent("render", {
    type: "plane"
});

ground.setLocalScale(
    10,
    1,
    10
);

const material =
    new StandardMaterial();

material.diffuse =
    new Color(0.12, 0.10, 0.08);

material.update();

ground.render.material =
    material;

app.root.addChild(ground);

const characterUrl =
    new URL(
        "../characterRIGGED.glb",
        import.meta.url
    ).href;

async function diagnoseGLB() {
    status.textContent =
        "Проверяем GLB…";

    hint.textContent =
        characterUrl;

    console.log(
        "GLB URL:",
        characterUrl
    );

    try {
        const response =
            await fetch(
                characterUrl,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        console.log(
            "GLB HTTP status:",
            response.status
        );

        console.log(
            "GLB content type:",
            response.headers.get(
                "content-type"
            )
        );

        console.log(
            "GLB content length:",
            response.headers.get(
                "content-length"
            )
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const buffer =
            await response.arrayBuffer();

        console.log(
            "GLB bytes:",
            buffer.byteLength
        );

        if (buffer.byteLength < 4) {
            throw new Error(
                "Файл слишком маленький."
            );
        }

        const magic =
            new TextDecoder()
                .decode(
                    new Uint8Array(
                        buffer,
                        0,
                        4
                    )
                );

        console.log(
            "GLB magic:",
            magic
        );

        if (magic !== "glTF") {
            throw new Error(
                "Файл найден, но это не GLB."
            );
        }

        status.textContent =
            "GLB НАЙДЕН ✓";

        hint.textContent =
            `Файл: ${(
                buffer.byteLength /
                1024
            ).toFixed(1)} KB · GLB OK`;

        console.log(
            "GLB DIAGNOSTIC: SUCCESS"
        );

    } catch (error) {
        console.error(
            "GLB DIAGNOSTIC ERROR:",
            error
        );

        status.textContent =
            "ОШИБКА GLB";

        hint.textContent =
            error.message;

        status.style.background =
            "rgba(150,30,30,0.9)";
    }
}

diagnoseGLB();

app.on("update", () => {});

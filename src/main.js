import {
    Application,
    Asset,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    Ray,
    RESOLUTION_AUTO,
    StandardMaterial,
    Vec3
} from "playcanvas";

const canvas = document.getElementById("application");
const status = document.getElementById("status");

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Canvas #application не найден.");
}

if (!status) {
    throw new Error("Элемент #status не найден.");
}

function setStatus(message, error = false) {
    status.textContent = message;
    status.style.background = error
        ? "rgba(145, 25, 25, 0.94)"
        : "rgba(0, 0, 0, 0.78)";
}

function fail(stage, error) {
    console.error(`[Tree Memory] ${stage}`, error);

    const message =
        error instanceof Error
            ? error.message
            : String(error);

    setStatus(`ОШИБКА ${stage}: ${message}`, true);
}

window.addEventListener("error", (event) => {
    if (event.error) {
        fail("JAVASCRIPT", event.error);
    }
});

window.addEventListener("unhandledrejection", (event) => {
    fail("PROMISE", event.reason);
});

let app = null;
let camera = null;
let character = null;
let characterScale = 1;

try {
    setStatus("1/6 · запуск PlayCanvas…");

    app = new Application(canvas, {
        graphicsDeviceOptions: {
            antialias: true,
            alpha: false
        }
    });

    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);
} catch (error) {
    fail("ENGINE INIT", error);
    throw error;
}

try {
    setStatus("2/6 · создание сцены…");

    app.scene.ambientLight = new Color(
        0.38,
        0.38,
        0.38
    );

    camera = new Entity("Camera");

    camera.addComponent("camera", {
        clearColor: new Color(
            0.025,
            0.035,
            0.025
        ),
        fov: 45,
        nearClip: 0.05,
        farClip: 100
    });

    camera.setPosition(0, 1.5, 5);

    app.root.addChild(camera);

    const mainLight = new Entity("MainLight");

    mainLight.addComponent("light", {
        type: "directional",
        color: new Color(
            1,
            0.92,
            0.78
        ),
        intensity: 2
    });

    mainLight.setEulerAngles(
        35,
        -30,
        0
    );

    app.root.addChild(mainLight);

    const fillLight = new Entity("FillLight");

    fillLight.addComponent("light", {
        type: "directional",
        color: new Color(
            0.65,
            0.75,
            1
        ),
        intensity: 0.55
    });

    fillLight.setEulerAngles(
        -25,
        140,
        0
    );

    app.root.addChild(fillLight);

    const ground = new Entity("Ground");

    ground.addComponent("render", {
        type: "plane"
    });

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

    app.root.addChild(ground);
} catch (error) {
    fail("SCENE", error);
    throw error;
}

function getCharacterBounds(root) {
    const renderEntities =
        root.findComponents("render");

    if (!renderEntities.length) {
        throw new Error(
            "В GLB не найден render-компонент."
        );
    }

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;

    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (const entity of renderEntities) {
        if (!entity.render) {
            continue;
        }

        for (
            const meshInstance
            of entity.render.meshInstances
        ) {
            const aabb =
                meshInstance.aabb;

            const min =
                aabb.getMin();

            const max =
                aabb.getMax();

            minX = Math.min(
                minX,
                min.x
            );

            minY = Math.min(
                minY,
                min.y
            );

            minZ = Math.min(
                minZ,
                min.z
            );

            maxX = Math.max(
                maxX,
                max.x
            );

            maxY = Math.max(
                maxY,
                max.y
            );

            maxZ = Math.max(
                maxZ,
                max.z
            );
        }
    }

    if (
        !Number.isFinite(minX) ||
        !Number.isFinite(minY) ||
        !Number.isFinite(minZ) ||
        !Number.isFinite(maxX) ||
        !Number.isFinite(maxY) ||
        !Number.isFinite(maxZ)
    ) {
        throw new Error(
            "Не удалось определить bounds персонажа."
        );
    }

    return {
        min: new Vec3(
            minX,
            minY,
            minZ
        ),
        max: new Vec3(
            maxX,
            maxY,
            maxZ
        ),
        center: new Vec3(
            (minX + maxX) * 0.5,
            (minY + maxY) * 0.5,
            (minZ + maxZ) * 0.5
        ),
        size: new Vec3(
            maxX - minX,
            maxY - minY,
            maxZ - minZ
        )
    };
}

function frameCharacter() {
    if (!character || !camera) {
        return;
    }

    const originalBounds =
        getCharacterBounds(
            character
        );

    const largestDimension =
        Math.max(
            originalBounds.size.x,
            originalBounds.size.y,
            originalBounds.size.z
        );

    if (
        !Number.isFinite(largestDimension) ||
        largestDimension <= 0
    ) {
        throw new Error(
            "Некорректный размер GLB."
        );
    }

    const targetSize = 2.4;

    characterScale =
        targetSize /
        largestDimension;

    character.setLocalScale(
        characterScale,
        characterScale,
        characterScale
    );

    character.setLocalPosition(
        -originalBounds.center.x *
            characterScale,
        -originalBounds.center.y *
            characterScale,
        -originalBounds.center.z *
            characterScale
    );

    const bounds =
        getCharacterBounds(
            character
        );

    const center =
        bounds.center;

    const size =
        Math.max(
            bounds.size.x,
            bounds.size.y,
            bounds.size.z,
            0.1
        );

    const distance =
        Math.max(
            3.2,
            size * 2.4
        );

    camera.setPosition(
        center.x,
        center.y + size * 0.08,
        center.z + distance
    );

    camera.lookAt(center);
}

async function loadCharacter() {
    try {
        setStatus(
            "3/6 · загрузка characterRIGGED.glb…"
        );

        const characterUrl =
            new URL(
                "../characterRIGGED.glb",
                import.meta.url
            ).href;

        const response =
            await fetch(
                characterUrl,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `GLB HTTP ${response.status}`
            );
        }

        const blob =
            await response.blob();

        if (blob.size === 0) {
            throw new Error(
                "GLB-файл пустой."
            );
        }

        console.log(
            "[Tree Memory] GLB:",
            characterUrl
        );

        console.log(
            "[Tree Memory] GLB bytes:",
            blob.size
        );

        setStatus(
            "4/6 · импорт 3D-персонажа…"
        );

        const asset =
            new Asset(
                "Character",
                "container",
                {
                    url: characterUrl
                }
            );

        const loadedAsset =
            await new Promise(
                (resolve, reject) => {
                    asset.once(
                        "load",
                        () => {
                            resolve(asset);
                        }
                    );

                    asset.once(
                        "error",
                        (error) => {
                            reject(error);
                        }
                    );

                    app.assets.add(asset);
                    app.assets.load(asset);
                }
            );

        if (
            !loadedAsset.resource
        ) {
            throw new Error(
                "PlayCanvas не создал GLB resource."
            );
        }

        character =
            loadedAsset.resource
                .instantiateRenderEntity();

        if (!character) {
            throw new Error(
                "Не удалось создать персонажа."
            );
        }

        character.name =
            "Character";

        app.root.addChild(
            character
        );

        setStatus(
            "5/6 · масштабирование и камера…"
        );

        frameCharacter();

        const renderEntities =
            character.findComponents(
                "render"
            );

        if (!renderEntities.length) {
            throw new Error(
                "У персонажа отсутствует render."
            );
        }

        for (
            const entity
            of renderEntities
        ) {
            if (!entity.render) {
                continue;
            }

            for (
                const meshInstance
                of entity.render.meshInstances
            ) {
                meshInstance.castShadow = true;
                meshInstance.receiveShadow = true;
            }
        }

        setStatus(
            "6/6 · ПЕРСОНАЖ ✓ · ТАП ПО ГЕРОЮ"
        );

        console.log(
            "[Tree Memory] CHARACTER READY"
        );
    } catch (error) {
        fail(
            "CHARACTER LOAD",
            error
        );
    }
}

function characterHit(
    clientX,
    clientY
) {
    if (
        !character ||
        !camera ||
        !camera.camera
    ) {
        return false;
    }

    const rect =
        canvas.getBoundingClientRect();

    if (
        rect.width <= 0 ||
        rect.height <= 0
    ) {
        return false;
    }

    const x =
        clientX - rect.left;

    const y =
        clientY - rect.top;

    const near =
        camera.camera.screenToWorld(
            x,
            y,
            0
        );

    const far =
        camera.camera.screenToWorld(
            x,
            y,
            1
        );

    const direction =
        far
            .clone()
            .sub(near)
            .normalize();

    const ray =
        new Ray(
            near,
            direction
        );

    const renderEntities =
        character.findComponents(
            "render"
        );

    for (
        const entity
        of renderEntities
    ) {
        if (!entity.render) {
            continue;
        }

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
    }

    return false;
}

function characterReaction() {
    if (!character) {
        return;
    }

    setStatus(
        "ГЕРОЙ НАЙДЕН ✓"
    );

    character.setLocalScale(
        characterScale * 1.08,
        characterScale * 1.08,
        characterScale * 1.08
    );

    window.setTimeout(
        () => {
            if (!character) {
                return;
            }

            character.setLocalScale(
                characterScale,
                characterScale,
                characterScale
            );
        },
        160
    );

    console.log(
        "[Tree Memory] CHARACTER TAP"
    );
}

canvas.addEventListener(
    "pointerup",
    (event) => {
        if (
            event.pointerType !== "touch"
        ) {
            return;
        }

        if (
            characterHit(
                event.clientX,
                event.clientY
            )
        ) {
            characterReaction();
        }
    },
    {
        passive: true
    }
);

window.addEventListener(
    "resize",
    () => {
        try {
            app.resizeCanvas();

            if (character) {
                frameCharacter();
            }
        } catch (error) {
            fail(
                "RESIZE",
                error
            );
        }
    },
    {
        passive: true
    }
);

window.addEventListener(
    "orientationchange",
    () => {
        window.setTimeout(
            () => {
                try {
                    app.resizeCanvas();

                    if (character) {
                        frameCharacter();
                    }
                } catch (error) {
                    fail(
                        "ORIENTATION",
                        error
                    );
                }
            },
            100
        );
    },
    {
        passive: true
    }
);

try {
    setStatus(
        "Запуск графического цикла…"
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

loadCharacter();

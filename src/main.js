import {
    Application,
    Asset,
    BoundingBox,
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
        ? "rgba(145,25,25,.94)"
        : "rgba(0,0,0,.78)";
}

function fail(stage, error) {
    console.error(`[Tree Memory] ${stage}`, error);

    const message =
        error instanceof Error
            ? error.message
            : String(error);

    setStatus(
        `ОШИБКА ${stage}: ${message}`,
        true
    );
}

window.addEventListener("error", (event) => {
    if (event.error) {
        fail(
            "JAVASCRIPT",
            event.error
        );
    }
});

window.addEventListener(
    "unhandledrejection",
    (event) => {
        fail(
            "PROMISE",
            event.reason
        );
    }
);

let app;
let camera;
let character;

let characterScale = 1;
let characterHitBox = null;

const CHARACTER_TARGET_SIZE = 2.4;

const CAMERA_TARGET = new Vec3(
    0,
    CHARACTER_TARGET_SIZE * 0.42,
    0
);

try {
    setStatus(
        "1/6 · запуск PlayCanvas…"
    );

    app = new Application(
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
    fail(
        "ENGINE INIT",
        error
    );

    throw error;
}

try {
    setStatus(
        "2/6 · создание сцены…"
    );

    app.scene.ambientLight =
        new Color(
            0.38,
            0.38,
            0.38
        );

    camera =
        new Entity("Camera");

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

            nearClip: 0.05,

            farClip: 100
        }
    );

    camera.setPosition(
        0,
        CAMERA_TARGET.y,
        4.2
    );

    app.root.addChild(
        camera
    );

    const mainLight =
        new Entity(
            "MainLight"
        );

    mainLight.addComponent(
        "light",
        {
            type: "directional",

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

    const fillLight =
        new Entity(
            "FillLight"
        );

    fillLight.addComponent(
        "light",
        {
            type: "directional",

            color:
                new Color(
                    0.65,
                    0.75,
                    1
                ),

            intensity: 0.55
        }
    );

    fillLight.setEulerAngles(
        -25,
        140,
        0
    );

    app.root.addChild(
        fillLight
    );

    const ground =
        new Entity(
            "Ground"
        );

    ground.addComponent(
        "render",
        {
            type: "plane"
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
} catch (error) {
    fail(
        "SCENE",
        error
    );

    throw error;
}

function isFiniteBounds(box) {
    if (!box) {
        return false;
    }

    const min =
        box.getMin();

    const max =
        box.getMax();

    return [
        min.x,
        min.y,
        min.z,
        max.x,
        max.y,
        max.z
    ].every(
        Number.isFinite
    );
}

function getStaticCharacterBounds(root) {
    const renderEntities =
        root.findComponents(
            "render"
        );

    if (!renderEntities.length) {
        throw new Error(
            "В GLB не найден render-компонент."
        );
    }

    const aggregate =
        new BoundingBox(
            new Vec3(
                0,
                0,
                0
            ),
            new Vec3(
                0,
                0,
                0
            )
        );

    let found = false;

    for (
        const entity
        of renderEntities
    ) {
        if (!entity.render) {
            continue;
        }

        /*
         * Для skinned-модели НЕ используем
         * meshInstance.aabb на старте.
         *
         * Берём стабильный object-space
         * mesh.aabb и трансформируем его
         * узлом.
         */

        for (
            const meshInstance
            of entity.render.meshInstances
        ) {
            const meshBounds =
                meshInstance.mesh?.aabb;

            if (
                !isFiniteBounds(
                    meshBounds
                )
            ) {
                continue;
            }

            const worldTransform =
                meshInstance.node
                    ?.getWorldTransform();

            if (!worldTransform) {
                continue;
            }

            const transformed =
                new BoundingBox(
                    new Vec3(
                        0,
                        0,
                        0
                    ),
                    new Vec3(
                        0,
                        0,
                        0
                    )
                );

            transformed.setFromTransformedAabb(
                meshBounds,
                worldTransform
            );

            if (
                !isFiniteBounds(
                    transformed
                )
            ) {
                continue;
            }

            if (!found) {
                aggregate.copy(
                    transformed
                );

                found = true;
            } else {
                aggregate.add(
                    transformed
                );
            }
        }
    }

    if (
        !found ||
        !isFiniteBounds(
            aggregate
        )
    ) {
        throw new Error(
            "Не удалось определить статические bounds GLB."
        );
    }

    return aggregate;
}

function configureCharacterCulling(
    renderEntities
) {
    /*
     * Безопасный object-space AABB
     * для skinned персонажа.
     *
     * Это предотвращает преждевременный
     * frustum culling до обновления костей.
     */

    const safetyBox =
        new BoundingBox(
            new Vec3(
                0,
                1.2,
                0
            ),
            new Vec3(
                2.2,
                2.2,
                2.2
            )
        );

    for (
        const entity
        of renderEntities
    ) {
        if (entity.render) {
            entity.render.customAabb =
                safetyBox.clone();
        }
    }
}

function frameCharacter(
    staticBounds
) {
    const size =
        new Vec3(
            staticBounds.halfExtents.x * 2,
            staticBounds.halfExtents.y * 2,
            staticBounds.halfExtents.z * 2
        );

    const largestDimension =
        Math.max(
            size.x,
            size.y,
            size.z
        );

    if (
        !Number.isFinite(
            largestDimension
        ) ||
        largestDimension <= 0
    ) {
        throw new Error(
            "Некорректный размер GLB."
        );
    }

    characterScale =
        CHARACTER_TARGET_SIZE /
        largestDimension;

    character.setLocalScale(
        characterScale,
        characterScale,
        characterScale
    );

    const center =
        staticBounds.center;

    character.setLocalPosition(
        -center.x *
            characterScale,

        -center.y *
            characterScale,

        -center.z *
            characterScale
    );

    const distance =
        Math.max(
            3.2,
            CHARACTER_TARGET_SIZE * 1.55
        );

    camera.setPosition(
        CAMERA_TARGET.x,
        CAMERA_TARGET.y,
        CAMERA_TARGET.z +
            distance
    );

    camera.lookAt(
        CAMERA_TARGET
    );

    characterHitBox =
        new BoundingBox(
            new Vec3(
                0,
                0,
                0
            ),
            new Vec3(
                0,
                0,
                0
            )
        );

    characterHitBox
        .setFromTransformedAabb(
            staticBounds,
            character.getWorldTransform()
        );

    return {
        size,
        largestDimension
    };
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

        if (blob.size <= 0) {
            throw new Error(
                "GLB-файл пустой."
            );
        }

        console.log(
            "[Tree Memory] GLB",
            characterUrl,
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
                    url:
                        characterUrl
                }
            );

        const loadedAsset =
            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    asset.once(
                        "load",
                        () => {
                            resolve(
                                asset
                            );
                        }
                    );

                    asset.once(
                        "error",
                        reject
                    );

                    app.assets.add(
                        asset
                    );

                    app.assets.load(
                        asset
                    );
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
                "Не удалось создать Entity персонажа."
            );
        }

        character.name =
            "Character";

        app.root.addChild(
            character
        );

        const renderEntities =
            character.findComponents(
                "render"
            );

        if (
            !renderEntities.length
        ) {
            throw new Error(
                "У персонажа отсутствует render."
            );
        }

        configureCharacterCulling(
            renderEntities
        );

        setStatus(
            "5/6 · безопасный расчёт bounds и камера…"
        );

        const staticBounds =
            getStaticCharacterBounds(
                character
            );

        const metrics =
            frameCharacter(
                staticBounds
            );

        for (
            const entity
            of renderEntities
        ) {
            if (!entity.render) {
                continue;
            }

            entity.render.castShadows =
                true;

            entity.render.receiveShadows =
                true;
        }

        const animationCount =
            loadedAsset.resource
                .animations
                ?.length ?? 0;

        console.log(
            "[Tree Memory] CHARACTER READY",
            {
                bytes:
                    blob.size,

                animationCount,

                width:
                    metrics.size.x,

                height:
                    metrics.size.y,

                depth:
                    metrics.size.z
            }
        );

        setStatus(
            animationCount > 0
                ? `6/6 · ПЕРСОНАЖ ✓ · анимаций: ${animationCount}`
                : "6/6 · ПЕРСОНАЖ ✓ · анимаций в GLB не найдено"
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
        !camera?.camera ||
        !characterHitBox
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
        clientX -
        rect.left;

    const y =
        clientY -
        rect.top;

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

    return characterHitBox
        .intersectsRay(
            ray
        );
}

canvas.addEventListener(
    "pointerup",
    (event) => {
        if (
            event.pointerType !==
            "touch"
        ) {
            return;
        }

        if (
            !characterHit(
                event.clientX,
                event.clientY
            )
        ) {
            return;
        }

        setStatus(
            "ГЕРОЙ НАЙДЕН ✓"
        );

        character.setLocalScale(
            characterScale * 1.06,
            characterScale * 1.06,
            characterScale * 1.06
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
            140
        );
    },
    {
        passive: true
    }
);

function resize() {
    try {
        app.resizeCanvas();

        if (camera) {
            camera.lookAt(
                CAMERA_TARGET
            );
        }
    } catch (error) {
        fail(
            "RESIZE",
            error
        );
    }
}

window.addEventListener(
    "resize",
    resize,
    {
        passive: true
    }
);

window.addEventListener(
    "orientationchange",
    () => {
        window.setTimeout(
            resize,
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

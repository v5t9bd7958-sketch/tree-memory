// 001
import {
// 002
    Application,
// 003
    Color,
// 004
    Entity,
// 005
    StandardMaterial,
// 006
    TouchDevice,
// 007
    Mouse,
// 008
    FILLMODE_FILL_WINDOW,
// 009
    RESOLUTION_AUTO
// 010
} from "playcanvas";
// 011
const canvas = document.getElementById("application");
// 012
const status = document.getElementById("status");
// 013
const hint = document.getElementById("hint");
// 014
const app = new Application(canvas, {
// 015
    graphicsDeviceOptions: {
// 016
        antialias: true,
// 017
        alpha: false
// 018
    },
// 019
    mouse: new Mouse(canvas),
// 020
    touch: new TouchDevice(canvas)
// 021
});
// 022
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
// 023
app.setCanvasResolution(RESOLUTION_AUTO);
// 024
app.start();
// 025
window.addEventListener("resize", () => {
// 026
    app.resizeCanvas();
// 027
});
// 028
app.scene.ambientLight = new Color(0.3, 0.28, 0.24);
// 029
const camera = new Entity("Camera");
// 030
camera.addComponent("camera", {
// 031
    clearColor: new Color(0.025, 0.035, 0.025),
// 032
    fov: 50,
// 033
    nearClip: 0.1,
// 034
    farClip: 100
// 035
});
// 036
camera.setPosition(0, 3.2, 9);
// 037
camera.lookAt(0, 2.2, 0);
// 038
app.root.addChild(camera);
// 039
const mainLight = new Entity("MainLight");
// 040
mainLight.addComponent("light", {
// 041
    type: "directional",
// 042
    color: new Color(1, 0.9, 0.75),
// 043
    intensity: 2
// 044
});
// 045
mainLight.setEulerAngles(45, -35, 0);
// 046
app.root.addChild(mainLight);
// 047
const fillLight = new Entity("FillLight");
// 048
fillLight.addComponent("light", {
// 049
    type: "omni",
// 050
    color: new Color(0.45, 0.55, 1),
// 051
    intensity: 1.2,
// 052
    range: 15
// 053
});
// 054
fillLight.setPosition(-4, 5, 5);
// 055
app.root.addChild(fillLight);
// 056
const ground = new Entity("Ground");
// 057
ground.addComponent("render", {
// 058
    type: "plane"
// 059
});
// 060
ground.setLocalScale(12, 1, 12);
// 061
const groundMaterial = new StandardMaterial();
// 062
groundMaterial.diffuse = new Color(0.11, 0.09, 0.06);
// 063
groundMaterial.gloss = 0.15;
// 064
groundMaterial.update();
// 065
ground.render.material = groundMaterial;
// 066
app.root.addChild(ground);
// 067
const trunk = new Entity("TreeTrunk");
// 068
trunk.addComponent("render", {
// 069
    type: "cylinder"
// 070
});
// 071
trunk.setLocalScale(2, 5, 2);
// 072
trunk.setPosition(0, 2.5, 0);
// 073
const trunkMaterial = new StandardMaterial();
// 074
trunkMaterial.diffuse = new Color(0.18, 0.10, 0.05);
// 075
trunkMaterial.gloss = 0.2;
// 076
trunkMaterial.update();
// 077
trunk.render.material = trunkMaterial;
// 078
app.root.addChild(trunk);
// 079
const crown = new Entity("TreeCrown");
// 080
crown.addComponent("render", {
// 081
    type: "sphere"
// 082
});
// 083
crown.setLocalScale(5.8, 3.8, 5.8);
// 084
crown.setPosition(0, 5.4, 0);
// 085
const crownMaterial = new StandardMaterial();
// 086
crownMaterial.diffuse = new Color(0.04, 0.15, 0.06);
// 087
crownMaterial.gloss = 0.25;
// 088
crownMaterial.update();
// 089
crown.render.material = crownMaterial;
// 090
app.root.addChild(crown);
// 091
const bell = new Entity("InteractiveBell");
// 092
bell.addComponent("render", {
// 093
    type: "sphere"
// 094
});
// 095
bell.setLocalScale(0.65, 0.65, 0.65);
// 096
bell.setPosition(1.7, 3.2, 1);
// 097
const bellMaterial = new StandardMaterial();
// 098
bellMaterial.diffuse = new Color(0.85, 0.55, 0.05);
// 099
bellMaterial.emissive = new Color(0.5, 0.25, 0.02);
// 100
bellMaterial.emissiveIntensity = 2;
// 101
bellMaterial.gloss = 0.8;
// 102
bellMaterial.update();
// 103
bell.render.material = bellMaterial;
// 104
app.root.addChild(bell);
// 105
let pulse = 0;
// 106
function activateBell() {
// 107
    pulse = 1;
// 108
    status.textContent = "INTERACTION: OK";
// 109
    status.style.background = "rgba(20,110,50,0.8)";
// 110
    hint.textContent = "✓ Объект обнаружен — реакция работает";
// 111
}
// 112
function checkTap(x, y) {
// 113
    const screenPosition = camera.camera.worldToScreen(
// 114
        bell.getPosition()
// 115
    );
// 116
    const dx = x - screenPosition.x;
// 117
    const dy = y - screenPosition.y;
// 118
    const distance = Math.sqrt(dx * dx + dy * dy);
// 119
    if (distance <= 120) {
// 120
        activateBell();
// 121
    }
// 122
}
// 123
if (app.touch) {
// 124
    app.touch.on("touchend", event => {
// 125
        if (!event.changedTouches.length) {
// 126
            return;
// 127
        }
// 128
        const touch = event.changedTouches[0];
// 129
        checkTap(touch.x, touch.y);
// 130
    });
// 131
}
// 132
if (app.mouse) {
// 133
    app.mouse.on("mouseup", event => {
// 134
        if (event.button !== 0) {
// 135
            return;
// 136
        }
// 137
        checkTap(event.x, event.y);
// 138
    });
// 139
}
// 140
let character = null;
// 141
let characterReady = false;
// 142
const characterUrl = "./characterRIGGED.glb";
// 143
function loadCharacter() {
// 144
    status.textContent = "Загрузка 3D-персонажа…";
// 145
    hint.textContent = "GLB → PlayCanvas";
// 146
    app.assets.loadFromUrl(
// 147
        characterUrl,
// 148
        "container",
// 149
        (err, asset) => {
// 150
            if (err) {
// 151
                console.error("Character GLB load error:", err);
// 152
                status.textContent = "ОШИБКА ЗАГРУЗКИ GLB";
// 153
                status.style.background = "rgba(150,30,30,0.9)";
// 154
                hint.textContent = "Проверь путь characterRIGGED.glb";
// 155
                return;
// 156
            }
// 157
            try {
// 158
                character = asset.resource.instantiateRenderEntity({
// 159
                    castShadows: false,
// 160
                    receiveShadows: true
// 161
                });
// 162
                character.name = "TreeMemoryCharacter";
// 163
                character.setPosition(0, 0, 2);
// 164
                character.setLocalScale(1, 1, 1);
// 165
                app.root.addChild(character);
// 166
                characterReady = true;
// 167
                status.textContent = "3D CHARACTER: READY";
// 168
                status.style.background = "rgba(20,110,50,0.8)";
// 169
                hint.textContent = "✓ Персонаж загружен";
// 170
                console.log("Tree Memory character loaded:", asset);
// 171
            } catch (error) {
// 172
                console.error("Character instantiate error:", error);
// 173
                status.textContent = "ОШИБКА СОЗДАНИЯ ПЕРСОНАЖА";
// 174
                status.style.background = "rgba(150,30,30,0.9)";
// 175
                hint.textContent = "GLB загрузился, но не создался";
// 176
            }
// 177
        }
// 178
    );
// 179
}
// 180
loadCharacter();
// 181
app.on("update", dt => {
// 182
    const time = performance.now() * 0.001;
// 183
    crown.setEulerAngles(
// 184
        0,
// 185
        Math.sin(time * 0.4) * 2,
// 186
        0
// 187
    );
// 188
    bell.setEulerAngles(
// 189
        0,
// 190
        Math.sin(time * 2) * 10,
// 191
        Math.sin(time * 3.2) * 5
// 192
    );
// 193
    if (pulse > 0) {
// 194
        pulse -= dt * 2;
// 195
        const amount = Math.max(0, pulse);
// 196
        const scale =
// 197
            1 +
// 198
            Math.sin(amount * Math.PI * 8) *
// 199
            0.2 *
// 200
            amount;
// 201
        bell.setLocalScale(
// 202
            0.65 * scale,
// 203
            0.65 * scale,
// 204
            0.65 * scale
// 205
        );
// 206
    } else {
// 207
        bell.setLocalScale(0.65, 0.65, 0.65);
// 208
    }
// 209
    if (characterReady && character) {
// 210
        character.rotate(0, Math.sin(time * 0.5) * 0.08, 0);
// 211
    }
// 212
});
// 213
status.textContent = "3D RUNTIME: READY";
// 214
hint.textContent = "Загрузка персонажа…";

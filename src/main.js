import {
    Application,
    Color,
    FILLMODE_FILL_WINDOW,
    RESOLUTION_AUTO
} from "playcanvas";
const canvas = document.createElement("canvas");
canvas.id = "application";
canvas.style.position = "fixed";
canvas.style.inset = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
canvas.style.touchAction = "none";
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#111";
document.body.appendChild(canvas);
const status = document.createElement("div");
status.textContent = "PLAYCANVAS TEST: START";
status.style.position = "fixed";
status.style.top = "20px";
status.style.left = "50%";
status.style.transform = "translateX(-50%)";
status.style.zIndex = "10";
status.style.padding = "10px 16px";
status.style.borderRadius = "10px";
status.style.background = "rgba(0,0,0,.75)";
status.style.color = "#fff";
status.style.font =
    "14px -apple-system,BlinkMacSystemFont,sans-serif";
document.body.appendChild(status);
const app = new Application(canvas, {
    graphicsDeviceOptions: {
        antialias: true,
        alpha: false
    }
});
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);
app.start();
app.scene.ambientLight =
    new Color(0.35, 0.35, 0.35);
status.textContent =
    "PLAYCANVAS: WORKING ✓";
app.on("update", () => {});

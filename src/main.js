1   import {
2       Application,
3       Color,
4       Entity,
5       StandardMaterial,
6       Vec3,
7       Ray,
8       TouchDevice,
9       Mouse,
10      RESOLUTION_AUTO,
11      FILLMODE_FILL_WINDOW,
12      ELEMENTTYPE_WORLD
13  } from "playcanvas";
14
15  // ============================================================
16  // TREE MEMORY — TEST 02
17  // PlayCanvas 2.21.4
18  // ============================================================
19
20  const canvas = document.getElementById("application");
21  const status = document.getElementById("status");
22  const hint = document.getElementById("hint");
23
24  // ------------------------------------------------------------
25  // APPLICATION
26  // ------------------------------------------------------------
27
28  const app = new Application(canvas, {
29      graphicsDeviceOptions: {
30          antialias: true,
31          alpha: false
32      },
33
34      touch: new TouchDevice(canvas),
35      mouse: new Mouse(canvas)
36  });
37
38  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
39  app.setCanvasResolution(RESOLUTION_AUTO);
40
41  app.start();
42
43  window.addEventListener("resize", () => {
44      app.resizeCanvas();
45  });
46
47  // ------------------------------------------------------------
48  // RENDERING
49  // ------------------------------------------------------------
50
51  app.scene.ambientLight = new Color(
52      0.28,
53      0.25,
54      0.20
55  );
56
57  // ------------------------------------------------------------
58  // CAMERA
59  // ------------------------------------------------------------
60
61  const camera = new Entity("Camera");
62
63  camera.addComponent("camera", {
64      clearColor: new Color(
65          0.035,
66          0.045,
67          0.035
68      ),
69      fov: 48,
70      nearClip: 0.1,
71      farClip: 100
72  });
73
74  camera.setPosition(
75      0,
76      2.7,
77      7.5
78  );
79
80  camera.lookAt(
81      0,
82      1.1,
83      0
84  );
85
86  app.root.addChild(camera);
87
88  // ------------------------------------------------------------
89  // MAIN LIGHT
90  // ------------------------------------------------------------
91
92  const light = new Entity("MoonLight");
93
94  light.addComponent("light", {
95      type: "directional",
96      color: new Color(
97          1.0,
98          0.92,
99          0.78
100     ),
101     intensity: 2.0,
102     castShadows: true,
103     shadowDistance: 20,
104     shadowResolution: 1024
105 });
106
107 light.setEulerAngles(
108     42,
109     -35,
110     0
111 );
112
113 app.root.addChild(light);
114
115 // ------------------------------------------------------------
116 // FILL LIGHT
117 // ------------------------------------------------------------
118
119 const fillLight = new Entity("FillLight");
120
121 fillLight.addComponent("light", {
122     type: "omni",
123     color: new Color(
124         0.45,
125         0.55,
126         1.0
127     ),
128     intensity: 1.2,
129     range: 12
130 });
131
132 fillLight.setPosition(
133     -3,
134     4,
135     4
136 );
137
138 app.root.addChild(fillLight);
139
140 // ------------------------------------------------------------
141 // GROUND
142 // ------------------------------------------------------------
143
144 const ground = new Entity("Ground");
145
146 ground.addComponent("render", {
147     type: "plane"
148 });
149
150 ground.setLocalScale(
151     12,
152     1,
153     12
154 );
155
156 ground.setEulerAngles(
157     0,
158     0,
159     0
160 );
161
162 const groundMaterial = new StandardMaterial();
163
164 groundMaterial.diffuse = new Color(
165     0.12,
166     0.10,
167     0.075
168 );
169
170 groundMaterial.metalness = 0;
171 groundMaterial.gloss = 0.15;
172 groundMaterial.update();
173
174 ground.render.material = groundMaterial;
175
176 app.root.addChild(ground);
177
178 // ------------------------------------------------------------
179 // TREE TRUNK
180 // ------------------------------------------------------------
181
182 const trunk = new Entity("TreeTrunk");
183
184 trunk.addComponent("render", {
185     type: "cylinder"
186 });
187
188 trunk.setLocalScale(
189     2.0,
190     5.0,
191     2.0
192 );
193
194 trunk.setPosition(
195     0,
196     2.5,
197     0
198 );
199
200 const trunkMaterial = new StandardMaterial();
201
202 trunkMaterial.diffuse = new Color(
203     0.18,
204     0.105,
205     0.055
206 );
207
208 trunkMaterial.gloss = 0.18;
209 trunkMaterial.update();
210
211 trunk.render.material = trunkMaterial;
212
213 app.root.addChild(trunk);
214
215 // ------------------------------------------------------------
216 // TREE CROWN
217 // ------------------------------------------------------------
218
219 const crown = new Entity("TreeCrown");
220
221 crown.addComponent("render", {
222     type: "sphere"
223 });
224
225 crown.setLocalScale(
226     5.8,
227     3.8,
228     5.8
229 );
230
231 crown.setPosition(
232     0,
233     5.4,
234     0
235 );
236
237 const crownMaterial = new StandardMaterial();
238
239 crownMaterial.diffuse = new Color(
240     0.055,
241     0.16,
242     0.07
243 );
244
245 crownMaterial.gloss = 0.25;
246 crownMaterial.update();
247
248 crown.render.material = crownMaterial;
249
250 app.root.addChild(crown);
251
252 // ------------------------------------------------------------
253 // INTERACTIVE OBJECT
254 // ------------------------------------------------------------
255
256 const bell = new Entity("InteractiveBell");
257
258 bell.addComponent("render", {
259     type: "sphere"
260 });
261
262 bell.setLocalScale(
263     0.55,
264     0.55,
265     0.55
266 );
267
268 bell.setPosition(
269     1.65,
270     3.1,
271     1.0
272 );
273
274 const bellMaterial = new StandardMaterial();
275
276 bellMaterial.diffuse = new Color(
277     0.8,
278     0.55,
279     0.08
280 );
281
282 bellMaterial.emissive = new Color(
283     0.4,
284     0.22,
285     0.02
286 );
287
288 bellMaterial.emissiveIntensity = 2.0;
289 bellMaterial.gloss = 0.8;
290 bellMaterial.update();
291
292 bell.render.material = bellMaterial;
293
294 app.root.addChild(bell);
295
296 // ------------------------------------------------------------
297 // INTERACTION STATE
298 // ------------------------------------------------------------
299
300 const interaction = {
301     activated: false,
302     pulse: 0,
303     rotation: 0
304 };
305
306 // ------------------------------------------------------------
307 // TOUCH / CLICK
308 // ------------------------------------------------------------
309
310 function handlePointer(x, y) {
311
312     const cameraComponent = camera.camera;
313
314     const origin = cameraComponent.screenToWorld(
315         x,
316         y,
317         0
318     );
319
320     const farPoint = cameraComponent.screenToWorld(
321         x,
322         y,
323         100
324     );
325
326     const direction = new Vec3();
327
328     direction.sub2(
329         farPoint,
330         origin
331     );
332
333     direction.normalize();
334
335     const ray = new Ray(
336         origin,
337         direction
338     );
339
340     const hit = app.systems.rigidbody.raycastFirst(
341         ray
342     );
343
344     if (!hit) {
345         // Fallback: manual sphere hit test.
346         const worldPosition = bell.getPosition();
347
348         const distance = origin.distance(
349             worldPosition
350         );
351
352         if (distance < 3.5) {
353             activateBell();
354         }
355
356         return;
357     }
358
359     if (
360         hit.entity === bell ||
361         hit.entity.isDescendantOf(bell)
362     ) {
363         activateBell();
364     }
365 }
366
367 // ------------------------------------------------------------
368 // IMPORTANT:
369 // For TEST-02 we additionally use a direct
370 // screen-space proximity test.
371 //
372 // This guarantees that the interaction test
373 // does not silently fail because of physics.
374 // ------------------------------------------------------------
375
376 function handleScreenTap(x, y) {
377
378     const projected = camera.camera.worldToScreen(
379         bell.getPosition()
380     );
381
382     const dx = x - projected.x;
383     const dy = y - projected.y;
384
385     const distance = Math.sqrt(
386         dx * dx +
387         dy * dy
388     );
389
390     if (distance < 110) {
391         activateBell();
392         return true;
393     }
394
395     return false;
396 }
397
398 function onPointer(x, y) {
399
400     const handled = handleScreenTap(
401         x,
402         y
403     );
404
405     if (!handled) {
406         handlePointer(
407             x,
408             y
409         );
410     }
411 }
412
413 // ------------------------------------------------------------
414 // TOUCH EVENTS
415 // ------------------------------------------------------------
416
417 if (app.touch) {
418
419     app.touch.on(
420         "touchend",
421         function (event) {
422
423             if (!event.changedTouches.length) {
424                 return;
425             }
426
427             const touch =
428                 event.changedTouches[0];
429
430             onPointer(
431                 touch.x,
432                 touch.y
433             );
434         }
435     );
436 }
437
438 // ------------------------------------------------------------
439 // MOUSE FALLBACK
440 // ------------------------------------------------------------
441
442 if (app.mouse) {
443
444     app.mouse.on(
445         "mouseup",
446         function (event) {
447
448             if (event.button !== 0) {
449                 return;
450             }
451
452             onPointer(
453                 event.x,
454                 event.y
455             );
456         }
457     );
458 }
459
460 // ------------------------------------------------------------
461 // ACTIVATE BELL
462 // ------------------------------------------------------------
463
464 function activateBell() {
465
466     if (interaction.activated) {
467         interaction.pulse = 1;
468         return;
469     }
470
471     interaction.activated = true;
472     interaction.pulse = 1;
473
474     hint.textContent =
475         "✓ Объект обнаружен — реакция работает";
476
477     status.textContent =
478         "INTERACTION: OK";
479
480     status.style.background =
481         "rgba(20,110,50,0.72)";
482
483     // --------------------------------------------------------
484     // QUEST EVENT
485     // --------------------------------------------------------
486
487     window.dispatchEvent(
488         new CustomEvent(
489             "tree-memory:interaction",
490             {
491                 detail: {
492                     object: "bell",
493                     action: "activate"
494                 }
495             }
496         )
497     );
498 }
499
500 // ------------------------------------------------------------
501 // ANIMATION LOOP
502 // ------------------------------------------------------------
503
504 app.on(
505     "update",
506     function (dt) {
507
508         // Idle motion of the tree.
509         crown.rotate(
510             0,
511             Math.sin(
512                 performance.now() * 0.00025
513             ) * 0.01,
514             0
515         );
516
517         // Bell idle movement.
518         const time =
519             performance.now() * 0.002;
520
521         bell.setLocalEulerAngles(
522             0,
523             Math.sin(time) * 8,
524             Math.sin(time * 1.7) * 4
525         );
526
527         // Interaction pulse.
528         if (interaction.pulse > 0) {
529
530             interaction.pulse -=
531                 dt * 1.8;
532
533             const pulse =
534                 Math.max(
535                     0,
536                     interaction.pulse
537                 );
538
539             const scale =
540                 1 +
541                 Math.sin(
542                     pulse * Math.PI * 4
543                 ) *
544                 0.18 *
545                 pulse;
546
547             bell.setLocalScale(
548                 0.55 * scale,
549                 0.55 * scale,
550                 0.55 * scale
551             );
552         }
553     }
554 );
555
556 // ------------------------------------------------------------
557 // READY
558 // ------------------------------------------------------------
559
560 status.textContent =
561     "3D RUNTIME: READY";

const game = document.getElementById("game");

game.innerHTML = `
<style>
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #10100d;
  touch-action: manipulation;
}

#game {
  width: 100%;
  height: 100%;
}

#scene {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 72% 22%,
      rgba(224, 215, 177, 0.45) 0%,
      rgba(224, 215, 177, 0.08) 16%,
      transparent 30%
    ),
    linear-gradient(
      180deg,
      #35483c 0%,
      #25352c 45%,
      #151d17 100%
    );
}

/* ЛУНА */

.moon {
  position: absolute;
  width: 120px;
  height: 120px;
  top: 7%;
  right: 11%;
  border-radius: 50%;
  background: #e7dfb8;
  box-shadow:
    0 0 35px rgba(231, 223, 184, 0.45),
    0 0 90px rgba(231, 223, 184, 0.18);
}

/* ЗВЁЗДЫ */

.star {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  animation: twinkle 2.5s infinite alternate;
}

.star1 {
  left: 12%;
  top: 17%;
}

.star2 {
  left: 27%;
  top: 11%;
  animation-delay: .7s;
}

.star3 {
  left: 53%;
  top: 18%;
  animation-delay: 1.3s;
}

.star4 {
  right: 29%;
  top: 12%;
  animation-delay: .3s;
}

@keyframes twinkle {
  from {
    opacity: .25;
    transform: scale(.7);
  }

  to {
    opacity: 1;
    transform: scale(1.3);
  }
}

/* ДЕРЕВО */

.tree {
  position: absolute;
  width: 48vw;
  min-width: 330px;
  height: 115vh;
  left: 50%;
  bottom: -15vh;
  transform: translateX(-50%);
  border-radius: 45% 45% 8% 8%;
  background:
    radial-gradient(
      ellipse at 50% 20%,
      #765a40 0%,
      #513b2a 45%,
      #2b2018 100%
    );
  box-shadow:
    inset 20px 0 50px rgba(0,0,0,.3),
    inset -20px 0 50px rgba(0,0,0,.25);
}

/* ТЕКСТУРА КОРЫ */

.tree::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: .22;
  background:
    repeating-linear-gradient(
      82deg,
      transparent 0px,
      transparent 25px,
      rgba(0,0,0,.3) 27px,
      transparent 31px
    );
  border-radius: inherit;
}

/* ВЕТКА */

.branch {
  position: absolute;
  height: 85px;
  width: 88vw;
  left: 5vw;
  top: 52%;
  transform: rotate(-7deg);
  transform-origin: left center;
  border-radius: 100px;
  background:
    linear-gradient(
      180deg,
      #745339 0%,
      #4d3625 55%,
      #302217 100%
    );
  box-shadow:
    0 20px 30px rgba(0,0,0,.35);
  z-index: 3;
}

/* МАЛЕНЬКИЕ ВЕТКИ */

.branch-small {
  position: absolute;
  height: 32px;
  border-radius: 40px;
  background: #493321;
  transform-origin: left center;
  z-index: 2;
}

.branch-small.one {
  width: 160px;
  left: 55%;
  top: 45%;
  transform: rotate(-34deg);
}

.branch-small.two {
  width: 120px;
  left: 18%;
  top: 45%;
  transform: rotate(25deg);
}

/* МОХ */

.moss {
  position: absolute;
  width: 180px;
  height: 42px;
  border-radius: 50%;
  background:
    radial-gradient(
      ellipse,
      #526c45 0%,
      #344a31 65%,
      transparent 100%
    );
  filter: blur(1px);
  z-index: 5;
}

.moss.a {
  left: 15%;
  top: 50%;
}

.moss.b {
  right: 15%;
  top: 54%;
}

/* ГРИБ */

.mushroom {
  position: absolute;
  left: 10%;
  top: 46%;
  width: 32px;
  height: 22px;
  border-radius: 50% 50% 40% 40%;
  background: #a05b45;
  z-index: 6;
}

.mushroom::after {
  content: "";
  position: absolute;
  width: 9px;
  height: 23px;
  left: 12px;
  top: 17px;
  border-radius: 4px;
  background: #d0b28b;
}

/* КОЛОКОЛЬЧИК */

.bell {
  position: absolute;
  right: 19%;
  top: 42%;
  width: 40px;
  height: 46px;
  border-radius: 45% 45% 35% 35%;
  background:
    linear-gradient(
      90deg,
      #856b32,
      #d1ae55,
      #856b32
    );
  box-shadow:
    0 5px 14px rgba(0,0,0,.5),
    0 0 12px rgba(218,185,83,.2);
  z-index: 12;
  cursor: pointer;
  touch-action: manipulation;
}

.bell::before {
  content: "";
  position: absolute;
  width: 15px;
  height: 8px;
  left: 12px;
  top: -5px;
  border-radius: 10px 10px 2px 2px;
  background: #b99745;
}

.bell::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #57451d;
  bottom: -5px;
  left: 16px;
}

.bell.active {
  animation: bellShake .09s linear 8;
}

@keyframes bellShake {
  0% {
    transform: rotate(-10deg);
  }

  50% {
    transform: rotate(10deg);
  }

  100% {
    transform: rotate(-10deg);
  }
}

/* ГЕРОЙ */

.hero {
  position: absolute;
  left: 27%;
  top: 37%;
  width: 58px;
  height: 130px;
  transform-origin: bottom center;
  transition:
    left 1.2s cubic-bezier(.18,.78,.2,1),
    transform .3s ease;
  z-index: 20;
}

/* ТЕНЬ */

.hero-shadow {
  position: absolute;
  width: 55px;
  height: 12px;
  left: 2px;
  bottom: -2px;
  border-radius: 50%;
  background: rgba(0,0,0,.4);
  filter: blur(3px);
}

/* ГОЛОВА */

.hero .head {
  position: absolute;
  width: 43px;
  height: 44px;
  left: 7px;
  top: 0;
  border-radius: 48% 48% 45% 45%;
  background:
    radial-gradient(
      circle at 35% 30%,
      #e1ad84,
      #bd8763 70%
    );
  box-shadow:
    inset -6px -5px 0 rgba(0,0,0,.1);
}

/* ВОЛОСЫ */

.hero .hair {
  position: absolute;
  width: 43px;
  height: 17px;
  left: 7px;
  top: -2px;
  border-radius: 50% 50% 30% 30%;
  background: #29251f;
}

/* ГЛАЗА */

.hero .eye {
  position: absolute;
  width: 5px;
  height: 7px;
  top: 18px;
  border-radius: 50%;
  background: #211b17;
}

.hero .eye.one {
  left: 16px;
}

.hero .eye.two {
  left: 28px;
}

/* РОТ */

.hero .mouth {
  position: absolute;
  width: 10px;
  height: 4px;
  left: 17px;
  top: 30px;
  border-bottom: 2px solid #673e32;
  border-radius: 50%;
}

/* ТЕЛО */

.hero .body {
  position: absolute;
  width: 35px;
  height: 54px;
  left: 11px;
  top: 40px;
  border-radius: 15px 15px 9px 9px;
  background:
    linear-gradient(
      90deg,
      #46574f,
      #697b70,
      #3d4d46
    );
}

/* РУКИ */

.hero .arm {
  position: absolute;
  width: 9px;
  height: 43px;
  top: 44px;
  border-radius: 8px;
  background: #bd8965;
  transform-origin: top center;
}

.hero .arm.left {
  left: 4px;
  transform: rotate(12deg);
}

.hero .arm.right {
  right: 4px;
  transform: rotate(-12deg);
}

/* НОГИ */

.hero .leg {
  position: absolute;
  width: 10px;
  height: 42px;
  top: 91px;
  border-radius: 8px;
  background: #292c2a;
  transform-origin: top center;
}

.hero .leg.left {
  left: 13px;
}

.hero .leg.right {
  right: 13px;
}

/* ХОДЬБА */

.hero.walking .leg.left {
  animation: legLeft .28s infinite alternate;
}

.hero.walking .leg.right {
  animation: legRight .28s infinite alternate;
}

.hero.walking .arm.left {
  animation: armLeft .28s infinite alternate;
}

.hero.walking .arm.right {
  animation: armRight .28s infinite alternate;
}

@keyframes legLeft {
  from {
    transform: rotate(18deg);
  }

  to {
    transform: rotate(-18deg);
  }
}

@keyframes legRight {
  from {
    transform: rotate(-18deg);
  }

  to {
    transform: rotate(18deg);
  }
}

@keyframes armLeft {
  from {
    transform: rotate(-15deg);
  }

  to {
    transform: rotate(20deg);
  }
}

@keyframes armRight {
  from {
    transform: rotate(15deg);
  }

  to {
    transform: rotate(-20deg);
  }
}

/* ПОДСКАЗКА */

.hint {
  position: absolute;
  left: 50%;
  bottom: 5%;
  transform: translateX(-50%);
  padding: 11px 18px;
  border-radius: 22px;
  background: rgba(0,0,0,.48);
  color: #eee;
  font:
    14px system-ui,
    sans-serif;
  white-space: nowrap;
  z-index: 50;
  transition: opacity .4s ease;
}

/* ВСПЫШКА */

.memory-flash {
  position: absolute;
  inset: 0;
  background: rgba(230,220,175,.18);
  opacity: 0;
  pointer-events: none;
  z-index: 100;
}

.memory-flash.active {
  animation: memoryFlash .8s ease;
}

@keyframes memoryFlash {
  0% {
    opacity: 0;
  }

  25% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>

<div id="scene">

  <div class="moon"></div>

  <div class="star star1"></div>
  <div class="star star2"></div>
  <div class="star star3"></div>
  <div class="star star4"></div>

  <div class="tree"></div>

  <div class="branch"></div>

  <div class="branch-small one"></div>
  <div class="branch-small two"></div>

  <div class="moss a"></div>
  <div class="moss b"></div>

  <div class="mushroom"></div>

  <div class="bell" id="bell"></div>

  <div class="hero" id="hero">

    <div class="hair"></div>

    <div class="head">
      <div class="eye one"></div>
      <div class="eye two"></div>
      <div class="mouth"></div>
    </div>

    <div class="body"></div>

    <div class="arm left"></div>
    <div class="arm right"></div>

    <div class="leg left"></div>
    <div class="leg right"></div>

    <div class="hero-shadow"></div>

  </div>

  <div class="memory-flash" id="memoryFlash"></div>

  <div class="hint" id="hint">
    Нажми на колокольчик
  </div>

</div>
`;

const hero = document.getElementById("hero");
const bell = document.getElementById("bell");
const hint = document.getElementById("hint");
const memoryFlash = document.getElementById("memoryFlash");

let bellActivated = false;

function ringBell(event) {

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (bellActivated) {
    return;
  }

  bellActivated = true;

  /*
   * НАЧАЛО ДВИЖЕНИЯ
   */

  hero.classList.add("walking");

  hint.textContent = "Он услышал звон...";

  hero.style.left = "63%";

  /*
   * ОСТАНОВКА
   */

  setTimeout(() => {

    hero.classList.remove("walking");

    /*
     * ГЕРОЙ НАКЛОНЯЕТСЯ
     */

    hero.style.transform = "rotate(4deg)";

    /*
     * КОЛОКОЛЬЧИК ЗВЕНИТ
     */

    bell.classList.add("active");

    /*
     * ВСПЫШКА ВОСПОМИНАНИЯ
     */

    setTimeout(() => {

      bell.classList.remove("active");

      memoryFlash.classList.add("active");

      hint.textContent =
        "Ты разбудил дерево...";

      /*
       * Возврат героя
       */

      setTimeout(() => {

        hero.style.transform =
          "rotate(0deg)";

      }, 500);

    }, 700);

  }, 1200);
}

/*
 * iPhone / Android / мышь
 */

bell.addEventListener(
  "pointerdown",
  ringBell,
  { passive: false }
);

/*
 * Запасной вариант
 */

bell.addEventListener(
  "touchstart",
  ringBell,
  { passive: false }
);

bell.addEventListener(
  "click",
  ringBell
);

/*
 * Делаем кнопку физически интерактивной
 */

bell.style.touchAction = "manipulation";
bell.style.pointerEvents = "auto";

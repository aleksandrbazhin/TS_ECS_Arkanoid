import { Game } from './game/game';

const BGCOLOR = '#1d1f21';

document.body.style.margin = '0';
document.body.style.backgroundColor = BGCOLOR;

window.addEventListener("load", () => {
  let game = new Game(
    document.getElementById("pixi-canvas") as HTMLCanvasElement,
    window.innerWidth,
    window.innerHeight,
    BGCOLOR
  );
});

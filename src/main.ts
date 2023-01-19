import Const from './game/const';
import Game from './game/game';


document.body.style.margin = '0';
document.body.style.backgroundColor = Const.BGCOLOR;

window.addEventListener("load", () => {
  let game = new Game(
    document.getElementById("pixi-canvas") as HTMLCanvasElement,
    window.innerWidth,
    window.innerHeight,
    Const.BGCOLOR
  );
});

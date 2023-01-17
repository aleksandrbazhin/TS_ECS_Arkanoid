import { Application, Sprite } from 'pixi.js'


const app = new Application({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  backgroundColor: 0x1d1f21,
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.devicePixelRatio,
  antialias: true
});


window.addEventListener("load", () => {
  document.body.style.margin = '0';
  console.log(window.innerWidth, window.innerHeight);
})
  
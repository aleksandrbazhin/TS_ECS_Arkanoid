import { Application, Assets } from "pixi.js";

// TODO:
// Pixi game objects
// entities: ball, player, brick?
// systems: render, ball_move, control, ball_collision, score, destroy
// components: position, velocity, sprite, score
// 


export class Game {
    private app: Application;
    
    constructor(viewElement: HTMLCanvasElement, gameWidth: number, gameHeight: number, bgColor: string) {
        this.app = new Application({
            view: viewElement,
            backgroundColor: bgColor,
            width: gameWidth,
            height: gameHeight
        });
        Assets.add('ball','assets/ball.png');
        Assets.add('paddle','assets/paddle.png');
        Assets.add('brick','assets/brick.png');
        Assets.load(['ball', 'paddle', 'brick']).then(this.onAssetsLoaded);
    }

    private onAssetsLoaded() {
        console.log("loaded");
        // const clampy: Sprite = Sprite.from("clampy.png");
    }
}
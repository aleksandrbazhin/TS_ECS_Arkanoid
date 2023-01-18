import { Application, Assets, Sprite } from "pixi.js";
import { World } from "../ecs/src";
import DisplayComponent from "./components/display";
import PositionComponent from "./components/position";
import VelocityComponent from "./components/velocity";
import MoveSystem from "./systems/move";
import RenderSystem from "./systems/render";


export default class Game {
    private app: Application;
    private world: World;
    
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
        Assets.load(['ball', 'paddle', 'brick']).then(this.onAssetsLoaded.bind(this));
    }

    private onAssetsLoaded() {

        this.world = new World(10000);
        this.world.registerComponent(DisplayComponent);
        this.world.registerComponent(PositionComponent);
        this.world.registerComponent(VelocityComponent);

        const paddle = this.world.createEntity();
        this.world.addComponent(paddle, new DisplayComponent(Assets.get('paddle')));
        this.world.addComponent(paddle, new PositionComponent(
            this.app.screen.width * 0.5, 
            this.app.screen.height - 100,
        ));

        const ball = this.world.createEntity();
        this.world.addComponent(ball, new DisplayComponent(Assets.get('ball')));
        this.world.addComponent(ball, new PositionComponent( 
            this.app.screen.width * 0.5, 
            this.app.screen.height * 0.5, 
        ));
        this.world.addComponent(ball, new VelocityComponent(0, 0.1));

        this.world.addSystem(new RenderSystem(this.world, this.app));
        this.world.addSystem(new MoveSystem(this.world));
        
        this.app.ticker.add((delta) => {
            this.world.update(delta);
        });
    }
}
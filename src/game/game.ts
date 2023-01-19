import { Application, Assets, Sprite } from "pixi.js";
import { World } from "../ecs/src";
import DisplayComponent from "./components/display";
import PositionComponent from "./components/position";
import UserControlComponent from "./components/control";
import VelocityComponent from "./components/velocity";
import Const from "./const";
import ControlSystem from "./systems/control";
import MoveSystem from "./systems/move";
import RenderSystem from "./systems/render";
import ColliderSizeComponent from "./components/collider";
import CollisionSystem from "./systems/collision";
import DestroySystem from "./systems/destroy";
import DestroyComponent from "./components/destroy";


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
        Assets.add(Const.BALL_TEXTURE_KEY, 'assets/ball.png');
        Assets.add(Const.PADDLE_TEXTURE_KEY, 'assets/paddle.png');
        Assets.add(Const.BRICK_TEXTURE_KEY, 'assets/brick.png');
        Assets.load([
            Const.BALL_TEXTURE_KEY,
            Const.PADDLE_TEXTURE_KEY,
            Const.BRICK_TEXTURE_KEY
        ]).then(this.startGame.bind(this));
    }

    private startGame() {
        this.world = new World(10000);
        this.world.registerComponent(DisplayComponent);
        this.world.registerComponent(PositionComponent);
        this.world.registerComponent(ColliderSizeComponent);
        this.world.registerComponent(VelocityComponent);
        this.world.registerComponent(UserControlComponent);
        this.world.registerComponent(DestroyComponent);

        this.world.registerTags([Const.PLAYER_PADDLE_TAG, Const.BALL_TAG, Const.BRICK_TAG])

        this.world.addSystem(new RenderSystem(this.world, this.app));
        this.world.addSystem(new MoveSystem(this.world));
        this.world.addSystem(new ControlSystem(this.world, this.app));
        this.world.addSystem(new CollisionSystem(this.world, this.app));
        this.world.addSystem(new DestroySystem(this.world, this.app));

        this.createBricks();
        this.createPaddle(this.app.screen.width * 0.5, this.app.screen.height - 50);
        this.createBall(this.app.screen.width * 0.5, this.app.screen.height * 0.5);

        this.app.ticker.add((delta) => {
            this.world.update(delta);
        });
    }



    private createBricks() {
        for (let i = 0; i < 10; i++) {
            const brick = this.createVisualEntity(100.0 + i * 180, 100.0, Const.BRICK_TEXTURE_KEY);
            this.world.addTag(brick, Const.BRICK_TAG);
        }
    }


    private createPaddle(x: number, y: number) {
        const paddle = this.createVisualEntity(x, y, Const.PADDLE_TEXTURE_KEY);
        this.world.addComponent(paddle, new UserControlComponent());
        this.world.addTag(paddle, Const.PLAYER_PADDLE_TAG);
    }


    private createBall(x: number, y: number) {
        const ball = this.createVisualEntity(x, y, Const.BALL_TEXTURE_KEY);
        this.world.addComponent(ball, new VelocityComponent(2.0, 5.0));
        this.world.addTag(ball, Const.BALL_TAG)
    }


    private createVisualEntity(x: number, y: number, asset_key: string): number {
        const entity = this.world.createEntity();
        const sprite = Sprite.from(Assets.get(asset_key));
        this.world.addComponent(entity, new DisplayComponent(sprite));
        this.world.addComponent(entity, new PositionComponent(x, y));
        this.world.addComponent(entity, new ColliderSizeComponent(sprite.width, sprite.height));
        return entity;
    }

}
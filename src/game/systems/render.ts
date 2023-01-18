import { Query, System, World } from "ecs";
import { Application } from "pixi.js";
import DisplayComponent from "../components/display";
import PositionComponent from "../components/position";


export default class RenderSystem implements System {
  public query: Query;

  constructor(public world: World, public app: Application) {
    this.query = world.createQuery([DisplayComponent]);
  }

  update(): void {
    for (const entity of this.query.entities) {
      const display = this.world.getComponent(entity, DisplayComponent);
      const position = this.world.getComponent(entity, PositionComponent);
      display.sprite.x = position.x;
      display.sprite.y = position.y;
      this.app.stage.addChild(display.sprite);
    }
  }
}
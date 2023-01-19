import { Query, System, World } from "ecs";
import { Application } from "pixi.js";
import DisplayComponent from "../components/display";
import DestroyComponent from "../components/destroy";


export default class DestroySystem implements System {
  public query: Query;

  constructor(public world: World, public app: Application) {
    this.query = world.createQuery([DestroyComponent]);
  }

  update(dt: number): void {
    for (const entity of this.query.entities) {
        if (this.world.hasComponent(entity, DisplayComponent)) {
            const display = this.world.getComponent(entity, DisplayComponent);
            this.app.stage.removeChild(display.sprite);
        }
        this.world.removeEntity(entity);
    }
  }
}
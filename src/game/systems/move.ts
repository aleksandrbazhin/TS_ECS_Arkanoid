import { Query, System, World } from "ecs";
import PositionComponent from "../components/position";
import VelocityComponent from "../components/velocity";


export default class MoveSystem implements System {
  public query: Query;

  constructor(public world: World) {
    this.query = world.createQuery([PositionComponent, VelocityComponent]);
  }

  update(dt: number): void {
    for (const entity of this.query.entities) {
        const position = this.world.getComponent(entity, PositionComponent);
        const velocity = this.world.getComponent(entity, VelocityComponent);
        position.x += dt * velocity.x;
        position.y += dt * velocity.y;
    }
  }
}
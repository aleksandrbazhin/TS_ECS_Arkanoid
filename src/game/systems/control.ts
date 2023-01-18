import { Query, System, World } from "ecs";
import { Application, FederatedMouseEvent, FederatedPointerEvent, Point } from "pixi.js";
import PositionComponent from "../components/position";
import UserControlComponent from "../components/user-control";
import VelocityComponent from "../components/velocity";


export default class ControlSystem implements System {
  public query: Query;
  eventPosition: Point;

  constructor(public world: World, public app: Application) {
    this.query = world.createQuery([PositionComponent, UserControlComponent]);
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.interactive = true;
    this.eventPosition = new Point(this.app.screen.width * 0.5, 0);
    this.app.stage.onpointermove = this.onUserPointerInput.bind(this);
  }

  onUserPointerInput(event: FederatedPointerEvent): void {
    this.eventPosition.copyFrom(event.global);
  }

  update(dt: number): void {
    for (const entity of this.query.entities) {
        const position = this.world.getComponent(entity, PositionComponent);
        position.x = this.eventPosition.x;   
    }
  }
}
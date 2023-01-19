import { Query, System, World } from "ecs";
import { Application, FederatedPointerEvent, Point } from "pixi.js";
import PositionComponent from "../components/position";
import UserControlComponent from "../components/control";


export default class ControlSystem implements System {
  public query: Query;
  eventPosition: Point;

  constructor(public world: World, public app: Application) {
    this.query = world.createQuery([PositionComponent, UserControlComponent]);
    this.eventPosition = new Point(this.app.screen.width * 0.5, 0);
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.interactive = true;
    this.app.renderer.events.cursorStyles.default = 'none';
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
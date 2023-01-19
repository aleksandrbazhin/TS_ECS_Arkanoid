import { Query, System, World } from "ecs";
import { Application } from "pixi.js";
import ColliderSizeComponent from "../components/collider";
import UserControlComponent from "../components/control";
import PositionComponent from "../components/position";
import VelocityComponent from "../components/velocity";
import DestroyComponent from "../components/destroy";
import Const from "../const";


export default class CollisionSystem implements System {
    public allQuery: Query;
    public velocityQuery: Query;
    public controlQuery: Query;

    constructor(public world: World, public app: Application) {
        this.allQuery = world.createQuery([PositionComponent, ColliderSizeComponent]);
        this.controlQuery = world.createQuery([PositionComponent, ColliderSizeComponent, UserControlComponent]);
        this.velocityQuery = world.createQuery([PositionComponent, ColliderSizeComponent, VelocityComponent]);
    }

    update(dt: number): void {
        for (const controlledEntity of this.controlQuery.entities) {
            this.resolveBoundaryCollisions(controlledEntity);
        }
        for (const movingEntity of this.velocityQuery.entities) {
            this.resolveBoundaryCollisions(movingEntity);
            this.resolveDynamicCollisions(movingEntity)
        }
    }

    resolveDynamicCollisions(movingEntity: number): void {
        for (const otherEntity of this.allQuery.entities) {
            if (movingEntity == otherEntity) continue;

            const isBall: boolean = this.world.hasTag(movingEntity, Const.BALL_TAG);

            const movingPosition = this.world.getComponent(movingEntity, PositionComponent);
            const movingSize = this.world.getComponent(movingEntity, ColliderSizeComponent);
            const [left, right, top, bottom] = this.getAABB(movingPosition, movingSize);

            const otherPosition = this.world.getComponent(otherEntity, PositionComponent);
            const otherSize = this.world.getComponent(otherEntity, ColliderSizeComponent);
            const [otherLeft, otherRight, otherTop, otherBottom] = this.getAABB(otherPosition, otherSize);

            if (this.world.hasTag(otherEntity, Const.PLAYER_PADDLE_TAG)) {
                // moving entity (ball or bonus) to paddle collision
                if (isBall) {
                    // ball to paddle collision
                    if (left < otherRight && right > otherLeft && top < otherBottom && bottom > otherTop) {
                        this.solveBallPaddleCollision(movingEntity, movingPosition, movingSize, otherPosition, otherSize);
                    }
                }
            } else {
                // ball to brick or potential ball to ball collisions
                if (isBall && this.world.hasTag(otherEntity, Const.BRICK_TAG)) {
                    // ball to brick collision
                    if (left < otherRight && right > otherLeft && top < otherBottom && bottom > otherTop) {
                        const isColliding: boolean = this.solveBallBrickCollision(movingEntity, movingPosition, movingSize, otherPosition, otherSize);
                        if (isColliding) {
                            if (!this.world.hasComponent(otherEntity, DestroyComponent)) {
                                this.world.addComponent(otherEntity, new DestroyComponent(otherPosition.x, otherPosition.y))
                            }
                        }
                    }
                }
            }
        }
    }

    solveBallBrickCollision(ball: number, ballPosition: PositionComponent, ballSize: ColliderSizeComponent,
        paddlePosition: PositionComponent, paddleSize: ColliderSizeComponent): boolean {
        const velocity = this.world.getComponent(ball, VelocityComponent);
        return this.solveBallRectangleCollision(ballPosition, ballSize, velocity, paddlePosition, paddleSize);
    }

    solveBallPaddleCollision(ball: number, ballPosition: PositionComponent, ballSize: ColliderSizeComponent,
        paddlePosition: PositionComponent, paddleSize: ColliderSizeComponent) {
        const velocity = this.world.getComponent(ball, VelocityComponent);
        const yVel: number = velocity.y;
        this.solveBallRectangleCollision(ballPosition, ballSize, velocity, paddlePosition, paddleSize)
        if (yVel > 0 && yVel == -velocity.y) {
            // testing for collision from the top - to have different reflectons based on the contact position
            const rotateAngle = (ballPosition.x - paddlePosition.x) / paddleSize.width * Const.PADDLE_REFLECTION_ROTATE_FACTOR;
            const sin = Math.sin(rotateAngle);
            const cos = Math.cos(rotateAngle);
            const vx = velocity.x;
            const vy = velocity.y;
            velocity.x = cos * vx - sin * vy;
            velocity.y = sin * vx + cos * vy;
        }
    }

    solveBallRectangleCollision(ballPosition: PositionComponent, ballSize: ColliderSizeComponent,
        ballVelocity: VelocityComponent, rectPosition: PositionComponent, rectSize: ColliderSizeComponent): boolean {
        const r = ballSize.width * 0.5;
        const distanceX = Math.abs(ballPosition.x - rectPosition.x);
        const distanceY = Math.abs(ballPosition.y - rectPosition.y);

        let contactX: number = 0.0;
        let contactY: number = 0.0;
        let hasCollision = false;

        const [rectLeft, rectRight, rectTop, rectBottom] = this.getAABB(rectPosition, rectSize);

        if (distanceY <= (rectSize.height * 0.5)) {
            contactX = ballPosition.x < rectPosition.x ? rectLeft - r : rectRight + r;
            contactY = ballPosition.y;
            hasCollision = true;
        } else if (distanceX <= (rectSize.width * 0.5)) {
            contactX = ballPosition.x;
            // velocity is used since the ball can go far through the brick in one step
            contactY = ballVelocity.y > 0 ? rectTop - r : rectBottom + r;
            hasCollision = true;
        } else {
            // test corner intersection
            const cornerDistanceSq: number = (distanceX - rectSize.width * 0.5) ^ 2.0 + (distanceY - rectSize.height * 0.5) ^ 2.0;
            if (cornerDistanceSq < r * r) {
                // this is not a correct formula, it's just good enough
                contactX = ballPosition.x < rectPosition.x ? rectLeft - r * Math.SQRT2 : rectRight + r * Math.SQRT2;
                contactY = ballPosition.y < rectPosition.y ? rectTop - r * Math.SQRT2 : rectBottom + r * Math.SQRT2;
                hasCollision = true;
            }
        }
        if (hasCollision) {
            const displaceX = contactX - ballPosition.x;
            const displaceY = contactY - ballPosition.y;
            const displaceLength = Math.sqrt(displaceX * displaceX + displaceY * displaceY);
            const normalX = displaceX / displaceLength;
            const normalY = displaceY / displaceLength;

            const dotProd = ballVelocity.x * normalX + ballVelocity.y * normalY
            ballVelocity.x -= 2.0 * normalX * dotProd;
            ballVelocity.y -= 2.0 * normalY * dotProd;

            ballPosition.x = contactX;
            ballPosition.y = contactY;
            return true;
        }
        return false;
    }


    resolveBoundaryCollisions(entity: number): void {
        const position = this.world.getComponent(entity, PositionComponent);
        const size = this.world.getComponent(entity, ColliderSizeComponent);

        let boundary_collision_x = false;
        let boundary_collision_y = false;
        const [left, right, top, bottom] = this.getAABB(position, size);
        if (left < 0) {
            position.x = size.width * Const.SPRITE_ANCHOR;
            boundary_collision_x = true;
        } else if (right > this.app.screen.width) {
            position.x = this.app.screen.width - size.width * (1.0 - Const.SPRITE_ANCHOR);
            boundary_collision_x = true;
        }

        if (top < 0) {
            position.y = size.height * Const.SPRITE_ANCHOR;
            boundary_collision_y = true;
        } else if (bottom > this.app.screen.height) {
            position.y = this.app.screen.height - size.height * (1.0 - Const.SPRITE_ANCHOR);
            boundary_collision_y = true;
            if (!this.world.hasComponent(entity, DestroyComponent)) {
                this.world.addComponent(entity, new DestroyComponent(position.x, position.y))
            }
        }

        if (this.world.hasComponent(entity, VelocityComponent)) {
            const velocity = this.world.getComponent(entity, VelocityComponent);
            if (boundary_collision_x) {
                velocity.x = -velocity.x;
            }
            if (boundary_collision_y) {
                velocity.y = -velocity.y;
            }
        }
    }

    getAABB(position: PositionComponent, size: ColliderSizeComponent):
        [left: number, right: number, top: number, bottom: number] {
        return [
            position.x - size.width * Const.SPRITE_ANCHOR,
            position.x + size.width * (1.0 - Const.SPRITE_ANCHOR),
            position.y - size.height * Const.SPRITE_ANCHOR,
            position.y + size.height * (1.0 - Const.SPRITE_ANCHOR)
        ];
    }
}
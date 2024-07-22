import { toRad } from "../../lib/math";
import { Trait } from "./Trait";

export class MovesInDirection extends Trait
{
  constructor(vx, vy) {
    super();

    this.vx = vx;
    this.vy = vy;

    this.move = this.move.bind(this);
  }

  attach(entity) {
    super.attach(entity);

    entity.addEventListener('update', this.move);
  }

  move(delta) {
    this.entity.x += (this.vx * delta);
    this.entity.y += (this.vy * delta);
  }
}

MovesInDirection.fromDegreesAndSpeed = (degrees, speed) => {
  return MovesInDirection.fromRadiansAndSpeed(toRad(degrees), speed);
}
MovesInDirection.fromRadiansAndSpeed = (radians, speed) => {
  const vx = Math.sin(radians) * speed;
  const vy = Math.cos(radians) * speed;
  return new MovesInDirection(vx, vy);
}

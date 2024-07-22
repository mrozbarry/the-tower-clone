import { Trait } from "./Trait";

export class TargetsTower extends Trait
{
  constructor() {
    super();

    this.velocity = 0;
    this.angle = 0;

    this.move = this.move.bind(this);
  }

  attach(entity) {
    super.attach(entity);

    this.velocity = entity.speed;
    this.angle = Math.atan2(-this.entity.x, -this.entity.y)

    entity.addEventListener('update', this.move);
  }

  move(delta) {
    const v = this.velocity * delta;
    const vx = Math.sin(this.angle) * v;
    const vy = Math.cos(this.angle) * v;

    this.entity.x += vx;
    this.entity.y += vy;
  }
}

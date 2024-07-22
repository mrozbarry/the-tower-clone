import { distance } from "../../lib/math";
import { Trait } from "./Trait";

export class HasCollision extends Trait
{
  constructor(collidesWith = [], onCollision) {
    super();
    this.size = 1;
    this.collidesWith = collidesWith;
    this.onCollision = onCollision;

    this.findCollisions = this.findCollisions.bind(this);
  }

  attach(entity) {
    super.attach(entity);

    this.size = entity.size;

    entity.addEventListener('update', this.findCollisions);
  }

  findCollisions(_delta) {
    const entities = this.entity.game.entities();
    for(let entity of entities) {
      const isCollidable = this.collidesWith.some(instanceClass => entity instanceof instanceClass);
      if (!isCollidable) continue;

      const dist = distance(this.entity.position(), entity.position())
        - (this.size / 2);
        // - (target.size / 2); // how to get the other size

      if (dist > 0) {
        return;
      }

      this.onCollision(entity);
    }
  }
}

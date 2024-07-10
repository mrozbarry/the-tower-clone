import { distance } from './math.js';

export class Target {
  constructor(entity) {
    this.entity = entity;
    this.distance = distance(this.entity.position());
  }

  isEntity(other) {
    return this.entity === other;
  }
}

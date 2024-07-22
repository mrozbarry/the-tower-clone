import { Trait } from "./Trait";

export class RemovesAfterTTL extends Trait {
  constructor(seconds) {
    super();
    this.total = seconds;
    this.seconds = seconds;

    this.countdown = this.countdown.bind(this);
  }

  attach(entity) {
    super.attach(entity);

    entity.addEventListener('update', this.countdown);
  }

  countdown(delta) {
    this.seconds -= delta;
    this.entity.triggerEvent('RemovesAfterTTL:update', Math.max(0, this.seconds) / this.total);
    if (this.seconds <= 0) {
      this.removeEntity();
    }
  }

  removeEntity() {
    this.entity.game.removeLevelEntity(this.entity);
  }
}

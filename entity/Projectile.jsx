/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, Path, Arc } from 'declarativas';
import { Particle } from './Particle.jsx';
import { jitter, toRad, toDeg } from '../lib/math.js';

export class Projectile extends Entity {
  constructor(angle, velocity) {
    super(angle, velocity, 0, 0, 3);
    this.life = 45;
  }

  update(delta) {
    super.update(delta);
    this.life -= delta;
    if (this.life < 0) {
      this.game.removeEntity(this);
      return;
    }

    // if (Math.random() > 0.1) {
      this.game.addEntity(new Particle(
        toDeg(this.angle) + toRad(180),
        this.velocity * 0.1,
        this.x, this.y, 1,
      ))
    // }

    return this;
  }

  render() {
    return (
      <Stateful>
        <Properties strokeStyle='red' />
        <Path stroke isClosed>
          <Arc {...this.position()} radius={this.size} startAngle={0} endAngle={2 * Math.PI} />
        </Path>
      </Stateful>
    );
  }
}


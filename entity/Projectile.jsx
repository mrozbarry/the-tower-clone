/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, Path, Arc } from 'declarativas';
import { Particle } from './Particle.jsx';
import { jitter, toRad, toDeg, distance } from '../lib/math.js';

export class Projectile extends Entity {
  constructor(angle, velocity) {
    super(angle, velocity, 0, 0, 3);
  }

  update(delta) {
    super.update(delta);

    this.game.addLevelEntity(new Particle(
      toDeg(this.angle) + toRad(180),
      this.velocity * 0.1,
      this.x, this.y, 0.2,
    ));

    this.game.withTower((tower) => {
      if (distance(this.position()) > tower.range) {
        this.game.removeLevelEntity(this);
        this.game.soundEffects.playOneOf(
          'laser-explode-0',
          'laser-explode-1',
        );
        for(let i = 0; i < 10; i++) {
          this.game.addLevelEntity(new Particle(Math.random() * 360, 150, this.x, this.y, 0.1, { r:255, g:150, b:150 }));
        }
      }
    });

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


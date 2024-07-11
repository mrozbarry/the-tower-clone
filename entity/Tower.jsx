/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { Enemy } from './Enemy.jsx';
import { createElement, Group, Properties, Path, MoveTo, LineTo, Arc, Text } from 'declarativas';
import { toRad, toDeg, jitter } from '../lib/math.js';
import { Projectile } from './Projectile.jsx';
import { Target } from '../lib/Target.js';

export class Tower extends Entity {
  constructor(size, fireRate, range) {
    super(0, 0, 0, 0);
    this.size = size;
    this.fireRate = fireRate;
    this.range = range;
    this.targets = [];
    this.time = 0;
    this.lastFired = null;
    this.turrets = [];
    this.currentTurretId = 0;
    this
      .addTurret()
      .addTurret();
  }

  addTurret() {
    this.turrets.push({
      lastFired: null,
    });
    return this;
  }

  update(delta) {
    this.time += delta;
  }

  reaction() {
    this.targets = this.game.state.level.entities
      .filter(ent => (ent instanceof Enemy))
      .map(entity => new Target(entity))
      .filter(target => target.distance <= this.range)
      .sort((a, b) => {
        return a.distance - b.distance;
      });

    if (this.targets.length === 0) {
      return;
    }

    for(let i = 0; i < 10; i++) {
      const closest = this.targets[i];
      if (!closest) break;
      const firingAngle = toDeg(closest.entity.angle) + 180;
      this.fire(new Projectile(jitter(firingAngle, 10), 200));
    }
  }

  canFire() {
    return this.lastFired === null
      || ((this.time - this.lastFired) >=this.fireRate);
  }

  fire(projectile = null) {
    if (!this.canFire()) {
      return;
    }
    this.lastFired = this.time;
    this.game.addEntity(projectile || new Projectile(Math.random() * 359, 100));
    this.game.soundEffects.playOneOf(
      'laser-0',
      'laser-1',
      'laser-2',
      'laser-3',
      'laser-4',
    );
  }

  render() {
    const angleOffset = -90;
    const [move, ...angles] = Array.from({ length: 6 }, (_, index) => {
      return toRad((index * 60) + angleOffset);
    });
    const radius = this.size;
    return (
      <Group>
        <Properties fillStyle='#f0f' strokeStyle='white' />
        <Path stroke isClosed>
          <MoveTo x={radius * Math.sin(move)} y={radius * Math.cos(move)} />
          {angles.map((angle) => (
            <LineTo x={radius * Math.sin(angle)} y={radius * Math.cos(angle)} />
          ))}
        </Path>
        <Properties strokeStyle='yellow' />
        <Path stroke isClosed>
          <Arc x={0} y={0} radius={this.range} startAngle={0} endAngle={2 * Math.PI}/>
        </Path>
        <Properties strokeStyle='white' />
        {this.targets.map((target) => (
          <Group>
            <Path stroke isClosed>
              <Arc {...target.entity.position()} radius={10} startAngle={0} endAngle={2 * Math.PI}/>
            </Path>
          </Group>
        ))}
      </Group>
    );
  }

  collide(entity) {
    this.game.removeEntity(entity);
    this.game.shakeFor(2);
  }
}


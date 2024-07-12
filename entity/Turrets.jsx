/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { Enemy } from './Enemy.jsx';
import { createElement, Group, Properties, Path, MoveTo, LineTo, Arc, Text } from 'declarativas';
import { toRad, toDeg, jitter } from '../lib/math.js';
import { Projectile } from './Projectile.jsx';
import { Target } from '../lib/Target.js';

export class Turrets extends Entity {
  constructor(initialCount, fireRate, range) {
    super(0, 0, 0, 0);
    this.fireRate = fireRate;
    this.range = range;
    this.time = 0;
    this.turrets = [];
    for(let i = 0; i < initialCount; i++) {
      this.addTurret();
    }
  }

  addTurret() {
    this.turrets.push({
      target: null,
      lastFired: null,
    });
  }

  update(delta) {
    this.time += delta;
  }

  reaction() {
    this.turrets.forEach(t => {
      if (!t.target?.entity?.game) {
        t.target= null;
      }
    });
    const alreadyTargetted = this.turrets.map(t => t.target?.entity).filter(e => e);
    this.targets = this.game.state.level.entities
      .filter(ent => (ent instanceof Enemy) && !alreadyTargetted.includes(ent))
      .map(entity => new Target(entity))
      .filter(target => target.distance <= this.range)
      .sort((a, b) => {
        return a.distance - b.distance;
      });

    if (this.targets.length === 0) {
      return;
    }

    let index = 0;

    this.turrets.forEach(t => {
      if (index >= this.targets.length) return;

      if (!t.target?.entity) {
        t.target = this.targets[index];
        index += 1;
      }
      if ((this.time - t.lastFired) < this.fireRate) {
        return;
      }

      t.lastFired = this.time;
      const firingAngle = toDeg(t.target.entity.angle) + 180;
      this.game.addEntity(new Projectile(firingAngle, 100));
      this.game.soundEffects.playOneOf(
        'laser-0',
        'laser-1',
        'laser-2',
        'laser-3',
        'laser-4',
      );
    });
  }

  canFire() {
    return this.lastFired === null
      || ((this.time - this.lastFired) >=this.fireRate);
  }

  fire(projectile = null) {
    if (!this.canFire()) {
      return;
    }
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
        {this.turrets.map(turret => turret.target && (
          <Group>
            <Path stroke isClosed>
              <Arc {...turret.target.entity.position()} radius={10} startAngle={0} endAngle={2 * Math.PI}/>
            </Path>
          </Group>
        ))}
      </Group>
    );
  }

  collide(entity) {
    this.game.removeEntity(entity);
    this.game.shakeFor(2);
    this.health.value = Math.max(0, this.health.value - 1);
  }
}


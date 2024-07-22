/**
 * @jsx createElement
 */
import { Base } from './Base.js';
import { Enemy } from './Enemy.jsx';
import { createElement, Group, Properties, Path, MoveTo, LineTo, Arc, Text } from 'declarativas';
import { toRad, toDeg, jitter } from '../lib/math.js';
import { Projectile } from './Projectile.jsx';
import { Target } from '../lib/Target.js';

export class Tower extends Base {
  constructor(size, fireRate, range) {
    super(0, 0, 0, 0);
    this.size = size;
    this.fireRate = fireRate;
    this.range = range;
    this.targets = [];
    this.time = 0;
    this.lastFired = null;
    const initialHealth = 10;
    this.health = { max: initialHealth, value: initialHealth };
  }

  update(delta) {
    this.time += delta;
    this.attackTargets();
  }

  attackTargets() {
    if (this.health.value === 0) {
      return;
    }

    const alreadyAssigned = this.game
      .everyTurret((turret) => {
        return turret.target?.entity;
      })
      .filter(ent => ent);

    this.targets = this.game.state.level.entities
      .filter(ent => (ent instanceof Enemy) && !alreadyAssigned.includes(ent))
      .map(entity => new Target(entity))
      .filter(target => target.distance <= this.range)
      .sort((a, b) => {
        return a.distance - b.distance;
      });

    if (this.targets.length === 0) {
      return;
    }

    this.game.everyTurret((turretEntity) => turretEntity)
      .filter(t => t.canTarget())
      .forEach((t, index) => {
        t.setTarget(this.targets[index]);
      });
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
      </Group>
    );
  }

  collide(entity) {
    this.game.removeLevelEntity(entity);
    this.game.shakeFor(2);
    this.health.value = Math.max(0, this.health.value - 1);
  }
}


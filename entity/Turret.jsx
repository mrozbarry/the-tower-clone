/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { Enemy } from './Enemy.jsx';
import { createElement, Group, Properties, Path, MoveTo, LineTo, Arc, Text } from 'declarativas';
import { toRad, toDeg, jitter } from '../lib/math.js';
import { Projectile } from './Projectile.jsx';
import { Target } from '../lib/Target.js';

export class Turret extends Entity {
  constructor(fireRate, range, x = 0, y = 0) {
    super(0, 0, x, y);
    this.fireRate = fireRate;
    this.range = range;
    this.time = 0;
    this.lastFired = null;
    this.target = null;
  }

  prePhysics() {
  }

  canTarget() {
    return !this.target;
  }

  setTarget(target) {
    this.target = target;
    this.target?.entity?.onDetach(() => this.setTarget(null));
    return this;
  }

  prePhysics() {
    if (this.target && !this.target.entity.isAttached()) {
      this.setTarget(null);
    }
  }

  update(delta) {
    this.time += delta;
    this.fire();
  }

  canFire() {
    return (
      this.lastFired === null
      || ((this.time - this.lastFired) >= this.fireRate)
    );
  }

  fire() {
    if (!this.target || !this.canFire()) {
      return false;
    }

    this.lastFired = this.time;
    const firingAngle = toDeg(this.target.entity.angle) + 180;
    this.game.addLevelEntity(new Projectile(firingAngle, 200));
    this.game.soundEffects.playOneOf(
      'laser-0',
      'laser-1',
      'laser-2',
      'laser-3',
      'laser-4',
    );

    return true;
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
}


/*
        {this.targets.map((target) => (
          <Group>
            <Path stroke isClosed>
              <Arc {...target.entity.position()} radius={10} startAngle={0} endAngle={2 * Math.PI}/>
            </Path>
          </Group>
        ))}
 */

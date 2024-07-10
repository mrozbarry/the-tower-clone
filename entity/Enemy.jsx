/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, FillRect, StrokeRect } from 'declarativas';
import { distance, toRad, vecZero } from '../lib/math.js';

export class Enemy extends Entity {
  constructor(angle, velocity, distance, size, color) {
    super(angle, velocity);

    const positionAngle = toRad(angle);
    this.x = Math.sin(positionAngle) * distance;
    this.y = Math.cos(positionAngle) * distance;

    this.angle = toRad(angle - 180);
    this.vx = Math.sin(this.angle);
    this.vy = Math.cos(this.angle);

    this.size = size;
    this.color = color;
  }

  render() {
    const half = this.size / 2;
    return (
      <Stateful>
        <Properties fillStyle={this.color} />
        <FillRect x={this.x - half} y={this.y + -half} w={this.size} h={this.size} />
      </Stateful>
    );
  }

  // update(delta) {
  //   super.update(delta);
  //
  //   const x = Math.floor(this.x);
  //   const y = Math.floor(this.y);
  //   const dist = distance({ x, y })
  //
  //   // this.game.withTower((tower) => {
  //   //   if (dist <= tower.size) {
  //   //     this.game.removeEntity(this);
  //   //   }
  //   // });
  //
  //   return this;
  // }

  collide(entity) {
    this.game.removeEntity(this);
    this.game.removeEntity(entity);
  }
}


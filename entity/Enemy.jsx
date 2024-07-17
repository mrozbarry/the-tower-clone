/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, FillRect, StrokeRect } from 'declarativas';
import { distance, toRad, toDeg, vecZero } from '../lib/math.js';
import { Particle } from './Particle.jsx';

const presets = [
  { size: 4, speed: 100, hits: 1, rgb: { r: 180, g: 180, b: 255 } },
  { size: 10, speed: 60, hits: 3, rgb: { r: 255, g: 255, b: 180} },
  { size: 15, speed: 30, hits: 8, rgb: { r: 255, g: 180, b: 180} },
];

export class Enemy extends Entity {
  constructor(angle, distance, sizePreset) {
    const attributes =  { ...(presets[sizePreset] || presets[0]) };
    super(
      angle + 180, attributes.speed,
      Math.sin(toRad(angle)) * distance,
      Math.cos(toRad(angle)) * distance,
      attributes.size,
    );
    this.attributes = attributes;
  }

  render() {
    const half = this.attributes.size / 2;
    const { rgb } = this.attributes;
    return (
      <Stateful>
        <Properties fillStyle={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
        <FillRect x={this.x - half} y={this.y + -half} w={this.attributes.size} h={this.attributes.size} />
      </Stateful>
    );
  }

  collide(entity) {
    this.game.removeLevelEntity(entity);
    this.attributes.hits -= 1;
    if (this.attributes.hits === 0) {
      this.game.removeLevelEntity(this);
      for(let i = 0; i < 30; i++) {
        this.game.addLevelEntity(new Particle(
          Math.random() * 360,
          10 + (Math.random() * 10),
          this.x, this.y,
          2,
          this.attributes.rgb,
        ));
      }
    }
  }
}

Enemy.presets = presets;

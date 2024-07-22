/**
 * @jsx createElement
 */
import { Entity } from './Entity.js';
import { createElement, Stateful, Properties, FillRect } from 'declarativas';
import { Particle } from './Particle.jsx';
import { TargetsTower } from './Traits/TargetsTower.js';
import { HasCollision } from './Traits/HasCollision.js';
import { Projectile } from './Projectile.jsx';

export class Enemy extends Entity {
  constructor(x, y, speed = 1, size = 1, hits = 1, moneyValue = 0, rgb = { r: 255, g: 255, b: 255 }) {
    super(
      x, y,
      [
        new TargetsTower(speed),
        new HasCollision([Projectile], (projectile) => {
          this.collide(projectile);
        }),
        // new HealthBar
      ]
    );
    this.speed = speed;
    this.size = size;
    this.hits = hits
    this.moneyValue = moneyValue;
    this.rgb = rgb;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setHits(hits) {
    this.hits = hits;
    return this;
  }

  setMoneyValue(moneyValue) {
    this.moneyValue = moneyValue;
    return this;
  }

  setRgb(rgb) {
    this.rgb = rgb;
    return this;
  }

  render() {
    const half = this.size / 2;
    return (
      <Stateful>
        <Properties fillStyle={`rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`} />
        <FillRect x={this.x - half} y={this.y + -half} w={this.size} h={this.size} />
      </Stateful>
    );
  }

  collide(entity) {
    this.game.removeLevelEntity(entity);
    this.hits -= 1;
    if (this.hits === 0) {
      this.game.removeLevelEntity(this);
      Particle.explode(this.game, this.x, this.y, 30, this.rgb);
      this.game.state.player.money += this.moneyValue;
    }
  }
}

import { distance, toRad } from '../lib/math.js';

export class Base {
  constructor(angle, velocity, x = 0, y = 0, size = 1) {
    this.angle = toRad(angle);
    this.velocity = velocity;
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = Math.sin(this.angle);
    this.vy = Math.cos(this.angle);
    this.game = null;
    this.id = Math.random().toString(36).slice(2);

    this.onAttachCallback = () => {};
    this.onDetachCallback = () => {};
  }

  onAttach(callback) {
    this.onAttachCallback = callback;
    return this;
  }

  onDetach(callback) {
    this.onDetachCallback = callback;
    return this;
  }

  position() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  attach(game) {
    this.game = game;
    if (this.game) {
      this.onAttachCallback();
    } else {
      this.onDetachCallback();
    }
    return this;
  }

  isAttached() {
    return !!this.game;
  }

  update(delta) {
    const v = this.velocity * delta;

    const vx = this.vx * v;
    const vy = this.vy * v;

    this.x += vx;
    this.y += vy;

    return this;
  }

  reaction() {
  }

  prePhysics() {
  }

  postPhysics() {
  }

  render() {
    return null;
  }

  testCollision(target) {
    const dist = distance(this.position(), target.position())
      - (this.size / 2)
      - (target.size / 2);

    if (dist > 0) {
      return;
    }

    this.collide(target);
  }

  collide(target) {
  }
}


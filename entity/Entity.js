import { distance, toRad } from '../lib/math.js';
import { Base } from './Base.js';

export class Entity extends Base {
  constructor(x = 0, y = 0, traits = []) {
    super(0, 0)
    this.x = x;
    this.y = y;
    this.game = null;
    this.id = Math.random().toString(36).slice(2);
    this.events = {};
    this.pendingTraits = traits;
  }

  addTrait(trait) {
    trait.attach(this);
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
    this.pendingTraits.forEach(t => t.attach(this));
    this.triggerEvent('attach', game);
    return this;
  }

  isAttached() {
    return !!this.game;
  }

  addEventListener(event, callback) {
    this.events[event] ||= [];
    this.events[event].push(callback);
    return this;
  }

  removeEventListener(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event]
        .filter(cb => cb !== callback);
    }

    return this;
  }

  update(delta) {
    this.triggerEvent('update', delta);
  }

  reaction() {
    this.triggerEvent('reaction', {});
  }

  prePhysics() {
    this.triggerEvent('prePhysics', {});
  }

  postPhysics() {
    this.triggerEvent('postPhysics', {});
  }

  triggerEvent(event, payload) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(payload));
    }

    return this;
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


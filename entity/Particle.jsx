/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, FillRect } from 'declarativas';
import { Particle } from './Particle.jsx';
import { jitter } from '../lib/math.js';

export class Particle extends Entity
{
  constructor(angle, velocity, x, y, lifespanInSeconds) {
    super(angle, velocity, jitter(x, 2), jitter(y, 2))

    this.totalLife = lifespanInSeconds;
    this.lifespanInSeconds = lifespanInSeconds;
  }

  update(delta) {
    super.update(delta);
    this.lifespanInSeconds -= delta;
    if (this.lifespanInSeconds <= 0) {
      this.game.removeEntity(this);
    }
    return this;
  }

  render() {
    const complete = (this.lifespanInSeconds / this.totalLife) * .7;
    return (
      <Stateful>
        <Properties fillStyle={`rgba(200, 200, 200, ${complete})`} />
        <FillRect x={this.x} y={this.y} w={1} h={1} />
      </Stateful>
    );
  }
}

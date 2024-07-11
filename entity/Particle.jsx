/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, FillRect } from 'declarativas';
import { Particle } from './Particle.jsx';

export class Particle extends Entity
{
  constructor(angle, velocity, x, y, lifespanInSeconds) {
    super(angle, velocity, x, y)

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
    const complete = (this.lifespanInSeconds / this.totalLife) * .9;
    return (
      <Stateful>
        <Properties fillStyle={`rgba(255, 255, 255, ${complete})`} />
        <FillRect x={this.x} y={this.y} w={1} h={1} />
      </Stateful>
    );
  }
}

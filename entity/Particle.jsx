/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties } from 'declarativas';
import { Particle } from './Particle.jsx';
import { StrokeCircle } from '../components/Circle.jsx';

const white = { r: 255, g: 255, b: 255 };

export class Particle extends Entity
{
  constructor(angle, velocity, x, y, lifespanInSeconds, rgb = white) {
    super(angle, velocity, x, y)

    this.totalLife = lifespanInSeconds;
    this.lifespanInSeconds = lifespanInSeconds;
    this.rgb = rgb;
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
        <Properties strokeStyle={`rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${complete})`} />
        <StrokeCircle x={this.x} y={this.y} radius={1} />
      </Stateful>
    );
  }
}

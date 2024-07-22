/**
 * @jsx createElement
 */
import { Base } from './Base.js';
import { createElement, Stateful, Properties } from 'declarativas';
import { Particle } from './Particle.jsx';
import { StrokeCircle } from '../components/Circle.jsx';
import { Entity } from './Entity.js';
import { RemovesAfterTTL } from './Traits/RemovesAfterTTL.js';
import { MovesInDirection } from './Traits/MovesInDirection.js';

const white = { r: 255, g: 255, b: 255 };

export class Particle extends Entity {
  constructor(x, y, lifespanInSeconds, rgb = white) {
    super(x, y, [
      new RemovesAfterTTL(lifespanInSeconds),
    ]);

    this.alpha = 1.0;
    this.addEventListener('RemovesAfterTTL:update', (percent) => {
      this.alpha = percent * .9;
    });
    this.rgb = rgb;
  }

  render() {
    return (
      <Stateful>
        <Properties strokeStyle={`rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha})`} />
        <StrokeCircle x={this.x} y={this.y} radius={1} />
      </Stateful>
    );
  }
}

Particle.explode = (game, x, y, numberOfParticles, rgb) => {
  for (let i = 0; i < numberOfParticles; i++) {
    game.addLevelEntity(
      (new Particle(
        x, y,
        1, rgb 
      )).addTrait(MovesInDirection.fromDegreesAndSpeed(Math.random() * 359, 20 + (Math.random() * 30))),
    );
  }
}

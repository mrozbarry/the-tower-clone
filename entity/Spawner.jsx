/**
 * @jsx createElement
 */
import { Entity } from './Base.js';
import { createElement, Stateful, Properties, StrokeRect, Text } from 'declarativas';
import { toRad, toDeg } from '../lib/math.js';
import { Enemy } from './Enemy.jsx';

export class Spawner extends Entity
{
  constructor(angle, velocity, spawnRate, spawnCount, lastSpawned) {
    super(angle, velocity)

    this.spawnRate = spawnRate;
    this.spawnCount = spawnCount;
    this.orbitRadius = 250;
    this.calculateXY();
    this.time = 0;
    this.lastSpawned = 0 - lastSpawned;
  }

  calculateXY() {
    this.x = Math.sin(this.angle) * this.orbitRadius;
    this.y = Math.cos(this.angle) * this.orbitRadius;
  }

  canSpawn() {
    const canSpawnFromTime = this.lastSpawned === null
      || (this.time - this.lastSpawned) >= this.spawnRate;
    const canSpawnFromCount = this.spawnCount > 0;

    return canSpawnFromTime && canSpawnFromCount;
  }

  spawn() {
    if (!this.canSpawn()) {
      return;
    }
    this.lastSpawned = this.time;
    this.spawnCount -= 1;

    this.game.addEntity(new Enemy(toDeg(this.angle), 100, this.orbitRadius, 6, '#f0f'))
  }

  update(delta) {
    this.time += delta;
    this.angle += toRad(this.velocity * delta);
    this.calculateXY();
    this.spawn();
  }

  render() {
    return (
      <Stateful>
        <Properties strokeStyle='green' fillStyle='white'/>
        <StrokeRect x={this.x - 4} y={this.y - 4} w={8} h={8} />
        <Text {...this.position()} text={this.spawnCount} />
      </Stateful>
    );
  }
}


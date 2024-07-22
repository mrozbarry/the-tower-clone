/*f
 * @jsx createElement
 */
import { Base } from './Base.js';
import { createElement, Stateful, Properties, StrokeRect, Text } from 'declarativas';
import { toRad, toDeg } from '../lib/math.js';
import { Enemy } from './Enemy.jsx';

export class Spawner extends Base
{
  constructor(factoryFn, angle, velocity, spawnRate, spawnCount, radius = 250) {
    super(angle, velocity)

    this.spawnRate = spawnRate;
    this.spawnCount = spawnCount;
    this.orbitRadius = radius;
    this.calculateXY();
    this.time = 0;
    this.lastSpawned = 0;
    this.factoryFn = factoryFn;
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

    this.game.addLevelEntity(this.factoryFn(this.x, this.y));
  }

  update(delta) {
    this.time += delta;
    this.angle += toRad(this.velocity * delta);
    this.calculateXY();
    this.spawn();
  }

  postPhysics() {
    if (this.spawnCount === 0) {
      this.game.removeLevelEntity(this);
    }
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


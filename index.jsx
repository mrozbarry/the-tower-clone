/**
 * @jsx createElement
 */
import { render, createElement, createMutator, Group, Stateful, Translate, Properties, FillRect, Path, MoveTo, LineTo } from 'declarativas';
import { composable, select, replace, concat } from 'composable-state';
import { distance, toRad, toDeg, jitter } from './lib/math.js';
import { Enemy } from './entity/Enemy.jsx';
import { Projectile } from './entity/Projectile.jsx';
import { Tower } from './entity/Tower.jsx';
import { Spawner } from './entity/Spawner.jsx';


class Game {
  constructor(canvas) {
    this.context = canvas.getContext('2d');
    this.stateUpdates = [];
    this.state = {
      lastFrameTime: null,
      shakeFor: 0,
      level: {
        number: 1,
        entities: [],
      },
    };

    this.pushStateUpdate = this.pushStateUpdate.bind(this);
    this.loop = this.loop.bind(this);
    this.handleStateUpdates = this.handleStateUpdates.bind(this);
    this.draw = this.draw.bind(this);
    this.scheduleNextLoop = this.scheduleNextLoop.bind(this);
    this.handleEntities = this.handleEntities.bind(this);

    this
      .addEntity(new Tower(20, .1, 200))
      .addEntity(new Spawner(0, 10, 3, 99, 0))
      .addEntity(new Spawner(120, 10, 3, 99, 2))
      .addEntity(new Spawner(240, 10, 3, 99, 4))
  }

  entityHash() {
    const ids = this.state.level.entities.map(e => e.id).join(',')
  }

  pushStateUpdate(updaterFunction) {
    this.stateUpdates.push(updaterFunction);
    return this;
  }

  loop(milliseconds) {
    const delta = (milliseconds - this.state.lastFrameTime) / 1000;
    this.state.lastFrameTime = milliseconds;

    this.handleStateUpdates(delta)
      .handleEntities(delta)
      .handleCollisions(Tower, Enemy)
      .handleCollisions(Enemy, Projectile)
      .draw(delta)
      .scheduleNextLoop();

    return this;
  }

  handleStateUpdates() {
    if (this.stateUpdates.length === 0) return this;
    while (this.stateUpdates.length > 0) {
      const updateFn = this.stateUpdates.shift();
      this.state = composable(this.state, updateFn(this.state));
    }
    return this;
  }

  handleEntities(delta) {
    this.state.level.entities.forEach(p => p.update(delta));
    this.state.level.entities.forEach(p => p.reaction());
    return this;
  }

  handleCollisions(sourceClass, targetsClass) {
    for(const source of this.state.level.entities) {
      if (!(source instanceof sourceClass)) continue;

      for(const target of this.state.level.entities) {
        if (!(target instanceof targetsClass)) continue;

        source.testCollision(target);
      }
    }
    return this;
  }

  draw(delta) {
    const shouldShake = this.state.shakeFor > 0;
    if (shouldShake) {
      console.log('shaking', this.state.shakeFor, delta);
      this.state.shakeFor -= delta;
    }

    const jitterAmount = shouldShake ? 4 : 0;

    render(
      <Group>
        <Stateful>
          <Properties fillStyle='black' strokeStyle='white' />
          <FillRect x={0} y={0} w={this.context.canvas.width} h={this.context.canvas.height} />
          <Translate x={jitter(this.context.canvas.width / 2, jitterAmount)} y={jitter(this.context.canvas.height / 2, jitterAmount)} />
          {this.state.level.entities.map(p => p.render(this))}
        </Stateful>
      </Group>,
      this.context,
    );
    return this;
  }

  scheduleNextLoop() {
    requestAnimationFrame(this.loop);
    // setTimeout(() => this.loop(performance.now()), 0);
    return this;
  }

  removeEntity(entity) {
    this.pushStateUpdate(() => (
      select(
        'level.entities',
        replace(entities => {
          const updated = entities.filter(e => e != entity);
          entity.attach(null);
          return updated;
        }),
      )
    ));
  }

  addEntity(entity) {
    this.pushStateUpdate(() => (
      select(
        'level.entities',
        concat(entity.attach(this)),
      )
    ));
    return this;
  }

  addProjectile(projectile) {
    const now = performance.now();
    if ((now -this.state.tower.lastFiredAt) < (this.state.tower.fireRate * 1000)) {
      return;
    }
    console.log('addProjectile', projectile);
    this.state.tower.lastFiredAt = now;
    this.addEntity(projectile);
  }

  shakeFor(seconds) {
    this.state.shakeFor = Math.max(seconds, this.state.shakeFor);
    // this.pushStateUpdate(() => {
    //   select('shakeFor', replace(old => Math.max(old, seconds)))
    // });
  }

  withTower(callback) {
    callback(this.state.level.entities.find(e => e instanceof Tower));
  }
}


const debug = (...description) => (value) => {
  console.debug(...description, value);
  return value;
}

const game = (new Game(document.querySelector('canvas')))
  .pushStateUpdate(state => select('lastFrameTime', replace(performance.now())))
  // level initialization
  .scheduleNextLoop();

document.querySelector('button#fire')
  .addEventListener('click', () => {
    game.withTower((tower) => {
      const projectile = new Projectile(Math.random() * 359, 100);
      tower.fire(projectile);
    });
  });
document.querySelector('button#spawn')
  .addEventListener('click', () => {
    const enemy = new Enemy(Math.random() * 359, 100, 300, 10, 'blue');
    console.log(enemy);
    game.addEntity(enemy);
  });
document.querySelector('button#shake')
  .addEventListener('click', () => {
    game.shakeFor(1);
  });

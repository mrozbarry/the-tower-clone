/**
 * @jsx createElement
 */
import { render, createElement, Group, Stateful, Translate, Properties, FillRect, Text } from 'declarativas';
import { composable, select, replace, concat } from 'composable-state';
import { jitter } from '../lib/math.js';
import { Enemy } from '../entity/Enemy.jsx';
import { Projectile } from '../entity/Projectile.jsx';
import { Tower } from '../entity/Tower.jsx';
import { Spawner } from '../entity/Spawner.jsx';
import { Meter } from '../components/Meter.jsx';
import { Turret } from '../entity/Turret.jsx';

const mode = {
  startGame: Symbol('startGame'),
  playing: Symbol('playing'),
  upgrading: Symbol('upgrading'),
  superDead: Symbol('superDead'),
};


export class Game {
  constructor(canvas, soundEffects) {
    this.context = canvas.getContext('2d');
    this.soundEffects = soundEffects;
    this.accumulator = 0;
    this.timeStep = 1/120
    this.stateUpdates = [];
    this.state = {
      mode: mode.playing,
      lastFrameTime: null,
      shakeFor: 0,
      player: {
        entities: [],
      },
      level: {
        number: 1,
        entities: [],
      },
      points: 0,
    };

    this.pushStateUpdate = this.pushStateUpdate.bind(this);
    this.loop = this.loop.bind(this);
    this.handleStateUpdates = this.handleStateUpdates.bind(this);
    this.draw = this.draw.bind(this);
    this.scheduleNextLoop = this.scheduleNextLoop.bind(this);
    this.handleEntities = this.handleEntities.bind(this);

    this
      .addPlayerEntity(new Tower(20, 1, 200))

    for(let t= 0; t < 20; t++) {
      this.addPlayerEntity(new Turret(.8, 200))
    }
  }

  entities() {
    return [...this.state.player.entities, ...this.state.level.entities];
  }


  pushStateUpdate(updaterFunction) {
    this.stateUpdates.push(updaterFunction);
    return this;
  }

  loop(milliseconds) {
    const delta = (milliseconds - this.state.lastFrameTime) / 1000;
    this.state.lastFrameTime = milliseconds;

    this.handleStateUpdates(delta);

    this.prePhysics();

    if ([mode.superDead, mode.playing].includes(this.state.mode)) {
      this.accumulator += delta;

      while (this.accumulator > this.timeStep) {
        const entities = this.entities();
        this.accumulator -= this.timeStep;
        this
          .handleEntities(delta, entities)
          .handleCollisions(Tower, Enemy, entities)
          .handleCollisions(Enemy, Projectile, entities)
      }
    }

    this.postPhysics();

    this
      .draw(delta)
      .scheduleNextLoop();

    this.withTower((tower) => {
      if (tower.health.value === 0) {
        this.switchToSuperDead();
      }
    });

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

  handleEntities(delta, entities) {
    entities.forEach(p => p.update(delta));
    entities.forEach(p => p.reaction());
    return this;
  }

  handleCollisions(sourceClass, targetsClass, entities) {
    for(const source of entities) {
      if (!(source instanceof sourceClass)) continue;

      for(const target of entities) {
        if (!(target instanceof targetsClass)) continue;

        source.testCollision(target);
      }
    }
    return this;
  }

  prePhysics() {
    this.entities().forEach(p => p.prePhysics());
    return this;
  }

  postPhysics() {
    this.entities().forEach(p => p.postPhysics());
    return this;
  }

  draw(delta) {
    const shouldShake = this.state.shakeFor > 0;
    if (shouldShake) {
      this.state.shakeFor -= delta;
    }

    const jitterAmount = shouldShake ? 4 : 0;

    render(
      <Group>
        <Stateful>
          <Properties fillStyle='black' strokeStyle='white' />
          <FillRect x={0} y={0} w={this.context.canvas.width} h={this.context.canvas.height} />
          <Translate x={jitter(this.context.canvas.width / 2, jitterAmount)} y={jitter(this.context.canvas.height / 2, jitterAmount)} />
          {this.entities().map(p => p.render(this))}
        </Stateful>
        <Stateful>
          {this.withTower((tower) => (
            <Meter x={10} y={10} value={tower.health.value} max={tower.health.max} width={200} label="Health" />
          ))}
          {this.everyTurret((turret, index) => (
            <Meter x={10} y={30 + (index * 15)} value={(turret.time - turret.lastFired) / turret.fireRate} max={1} width={75} label={`Turret ${index + 1}`} barColor="yellow" />
          ))}
          {this.state.mode === mode.superDead && (
            <Group>
              <Properties textAlign="center" textBaseline="middle" font="32px bold sans-serif" fillStyle='#f0f' />
              <Text x={this.context.canvas.width / 2} y={this.context.canvas.height / 2} text="You dead"/>
            </Group>
          )}
        </Stateful>
      </Group>,
      this.context,
    );
    return this;
  }

  scheduleNextLoop() {
    requestAnimationFrame(this.loop);
    //setTimeout(() => this.loop(performance.now()), 0);
    return this;
  }

  addLevelEntity(entity) {
    this.pushStateUpdate(() => (
      select(
        'level.entities',
        concat(entity.attach(this)),
      )
    ));
    return this;
  }

  removeLevelEntity(entity) {
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

  addPlayerEntity(entity) {
    this.pushStateUpdate(() => (
      select(
        'player.entities',
        concat(entity.attach(this)),
      )
    ));
    return this;
  }

  removePlayerEntity(entity) {
    this.pushStateUpdate(() => (
      select(
        'player.entities',
        replace(entities => {
          const updated = entities.filter(e => e != entity);
          entity.attach(null);
          return updated;
        }),
      )
    ));
  }

  shakeFor(seconds) {
    this.state.shakeFor = Math.max(seconds, this.state.shakeFor);
  }

  withTower(callback) {
    return callback(this.state.player.entities.find(e => e instanceof Tower));
  }

  everyTurret(callback) {
    return this.state.player.entities
      .filter(e => e instanceof Turret)
      .map((turret, index) => callback(turret, index));
  }

  switchMode(toMode) {
    if (this.state.mode === toMode) {
      return false;
    }
    this.state.mode = toMode;
    return true;
  }

  switchToStartGame() {
    if (!this.switchMode(mode.startGame)) return;

    document.querySelector('dialog#dialog-start').showModal()

    return this;
  }

  switchToPlaying() {
    if (!this.switchMode(mode.playing)) return;

    document.querySelector('dialog#dialog-start').close()

    console.log('switchToPlaying');
    const numberOfSpawners = 10;
    const angleDelta = 360 / numberOfSpawners;
    for(let i = 0; i < numberOfSpawners; i++) {
    this
      .addLevelEntity(new Spawner(angleDelta * i, 10, 1.5, 50, 0))
    }

    return this;
  }

  switchToUpgrading() {
    if (!this.switchMode(mode.upgrading)) return;

    document.querySelector('dialog#dialog-start').close()

    return this;
  }

  switchToSuperDead() {
    if (!this.switchMode(mode.superDead)) return;

    document.querySelector('dialog#dialog-start').close()
    setTimeout(() => this.switchToStartGame(), 5000);

    return this;
  }
}

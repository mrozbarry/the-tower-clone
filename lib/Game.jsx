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
import { Money } from '../components/Money.jsx';
import { Grunt } from '../entity/Enemy/Grunt.jsx';
import { Thug } from '../entity/Enemy/Thug.jsx';

const mode = {
  startGame: Symbol('startGame'),
  playing: Symbol('playing'),
  upgrading: Symbol('upgrading'),
  superDead: Symbol('superDead'),
};


export class Game {
  constructor(canvas, soundEffects) {
    this.context = canvas.getContext('2d');
    this.scheduleHandler = null;
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
        money: 0,
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
      .addPlayerEntity(new Turret(1, 200))
  }

  calculateLevel(number) {
    return [
      new Spawner(
        (x, y) => new Grunt(x, y),
        0,
        30,
        1,
        10,
        500
      ),
      new Spawner(
        (x, y) => new Thug(x, y),
        180,
        30,
        11,
        1,
        500
      ),
    ];
  }

  entities() {
    return [...this.state.player.entities, ...this.state.level.entities];
  }

  entitiesOfType(instanceClass) {
    return this.entities.filter(e => e instanceof instanceClass);
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

    this.postPhysics()
      .checkWaveFinished();

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

  checkWaveFinished() {
    if (this.state.level.entities.length > 0) {
      return;
    }
    console.log('wave complete');
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
          <Money x={400} y={20} money={this.state.player.money}/>
        </Stateful>
      </Group>,
      this.context,
    );
    return this;
  }

  scheduleNextLoop() {
    this.scheduleHandler = requestAnimationFrame(this.loop);
    //this.scheduleHandler = setTimeout(() => this.loop(performance.now()), 0);
    return this;
  }

  unschedule() {
    cancelAnimationFrame(this.scheduleHandler);
    //clearTimeout(this.scheduleHandle);
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

    this.calculateLevel(1)
      .forEach(ent => this.addLevelEntity(ent));

    console.log('switchToPlaying');

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

  pause() {
    this.unschedule();
    this.state.lastFrameTime = null;
  }

  resume() {
    this.pause();
    this.state.lastFrameTime = performance.now();
    this.scheduleNextLoop();
  }
}

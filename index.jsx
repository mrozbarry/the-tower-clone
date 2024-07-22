import { select, replace } from 'composable-state';
import { Enemy } from './entity/Enemy.jsx';
import { Projectile } from './entity/Projectile.jsx';
import { Game } from './lib/Game.jsx';

import { SoundEffects } from './lib/SoundEffects.js';
import { Turret } from './entity/Turret.jsx';

(new SoundEffects())
  .queue('forceField-0', new URL('./assets/sfx/forceField_000.ogg', import.meta.url))
  .queue('forceField-1', new URL('./assets/sfx/forceField_001.ogg', import.meta.url))
  .queue('forceField-2', new URL('./assets/sfx/forceField_002.ogg', import.meta.url))
  .queue('forceField-3', new URL('./assets/sfx/forceField_003.ogg', import.meta.url))
  .queue('forceField-4', new URL('./assets/sfx/forceField_004.ogg', import.meta.url))
  .queue('forceField-4', new URL('./assets/sfx/forceField_004.ogg', import.meta.url))
  .queue('towerHit-0', new URL('./assets/sfx/impactMetal_000.ogg', import.meta.url))
  .queue('towerHit-1', new URL('./assets/sfx/impactMetal_001.ogg', import.meta.url))
  .queue('towerHit-2', new URL('./assets/sfx/impactMetal_002.ogg', import.meta.url))
  .queue('towerHit-3', new URL('./assets/sfx/impactMetal_003.ogg', import.meta.url))
  .queue('laser-0', new URL('./assets/sfx/laserSmall_000.ogg', import.meta.url))
  .queue('laser-1', new URL('./assets/sfx/laserSmall_001.ogg', import.meta.url))
  .queue('laser-2', new URL('./assets/sfx/laserSmall_002.ogg', import.meta.url))
  .queue('laser-3', new URL('./assets/sfx/laserSmall_003.ogg', import.meta.url))
  .queue('laser-4', new URL('./assets/sfx/laserSmall_004.ogg', import.meta.url))
  .queue('laser-explode-0', new URL('./assets/sfx/lowFrequency_explosion_000.ogg', import.meta.url))
  .queue('laser-explode-1', new URL('./assets/sfx/lowFrequency_explosion_001.ogg', import.meta.url))
  .load()
  .then((sfx) => {
    const game = (new Game(document.querySelector('canvas'), sfx))
      .pushStateUpdate(state => select('lastFrameTime', replace(performance.now())))
      // level initialization
      .scheduleNextLoop()
      .switchToStartGame()

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
        game.addLevelEntity(enemy);
      });
    document.querySelector('button#shake')
      .addEventListener('click', () => {
        game.shakeFor(1);
      });

    document.querySelector('button#mute')
      .addEventListener('click', () => {
        sfx.muted = !sfx.muted;
      });

    document.querySelector('button#start')
      .addEventListener('click', () => {
        game.switchToPlaying();
      });

    document.querySelector('button#dead')
      .addEventListener('click', () => {
        game.withTower(t => t.health.value = 0);
      });

    document.querySelector('button#add-turret')
      .addEventListener('click', () => {
        game.addPlayerEntity(new Turret(1, 200));
      });
  });

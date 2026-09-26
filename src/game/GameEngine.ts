// ============================================
// GAME ENGINE - Главный игровой цикл
// ============================================

import { InputState, PlayerState, WeaponType, EnemyType, EnemyState } from './types';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { ObjectPool } from './ObjectPool';
import { Renderer } from './Renderer';
import { LevelData, getLevel } from './Level';

export interface GameCallbacks {
  onHealthChange: (health: number, maxHealth: number) => void;
  onAmmoChange: (current: number, max: number) => void;
  onGoldChange: (gold: number) => void;
  onWeaponChange: (weapon: WeaponType) => void;
  onStateChange: (state: PlayerState) => void;
  onDeath: () => void;
  onLevelComplete: () => void;
  onEnemyKill: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private player: Player;
  private enemies: Enemy[] = [];
  private bulletPool: ObjectPool;
  private level: LevelData;
  private currentLevelNumber: number;
  private input: InputState;
  private callbacks: GameCallbacks;

  private lastTime: number = 0;
  private running: boolean = false;
  private animFrameId: number = 0;

  private canvasWidth: number = 800;
  private canvasHeight: number = 600;

  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyupHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks, startLevel: number = 1) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.callbacks = callbacks;

    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.bulletPool = new ObjectPool(100);
    this.currentLevelNumber = startLevel;
    this.level = getLevel(startLevel);

    this.renderer = new Renderer(
      this.ctx,
      this.canvasWidth,
      this.canvasHeight,
      this.level.width,
      this.level.height
    );

    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y,
      this.bulletPool
    );

    this.player.onHealthChange = callbacks.onHealthChange;
    this.player.onAmmoChange = callbacks.onAmmoChange;
    this.player.onGoldChange = callbacks.onGoldChange;
    this.player.onDeath = callbacks.onDeath;

    this.spawnEnemies();

    this.input = this.createEmptyInput();
    this.setupInput();
  }

  private createEmptyInput(): InputState {
    return {
      left: false, right: false, up: false, down: false,
      jump: false, jumpPressed: false,
      attack: false, attackPressed: false,
      shoot: false, shootPressed: false,
      reload: false,
      switchWeapon: false, switchWeaponPressed: false,
      interact: false, interactPressed: false,
    };
  }

  private setupInput(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (!this.keysDown.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysDown.add(e.code);
      // Не блокируем все клавиши - только игровые
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      this.keysDown.delete(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
  }

  private readInput(): void {
    this.input.left = this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft');
    this.input.right = this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight');
    this.input.up = this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp');
    this.input.down = this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown');
    this.input.jump = this.keysDown.has('Space');
    this.input.jumpPressed = this.keysJustPressed.has('Space');
    this.input.attack = this.keysDown.has('KeyJ') || this.keysDown.has('KeyZ');
    this.input.attackPressed = this.keysJustPressed.has('KeyJ') || this.keysJustPressed.has('KeyZ');
    this.input.shoot = this.keysDown.has('KeyK') || this.keysDown.has('KeyX');
    this.input.shootPressed = this.keysJustPressed.has('KeyK') || this.keysJustPressed.has('KeyX');
    this.input.reload = this.keysDown.has('KeyR');
    this.input.switchWeapon = this.keysDown.has('KeyQ') || this.keysDown.has('Tab');
    this.input.switchWeaponPressed = this.keysJustPressed.has('KeyQ') || this.keysJustPressed.has('Tab');
    this.input.interact = this.keysDown.has('KeyE');
    this.input.interactPressed = this.keysJustPressed.has('KeyE');

    this.keysJustPressed.clear();
  }

  private spawnEnemies(): void {
    this.enemies = [];
    for (const stats of this.level.enemies) {
      const enemy = new Enemy(stats, this.bulletPool);
      this.enemies.push(enemy);
    }
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    // Удаляем event listeners
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.keyupHandler) {
      window.removeEventListener('keyup', this.keyupHandler);
      this.keyupHandler = null;
    }
    this.keysDown.clear();
    this.keysJustPressed.clear();
  }

  private gameLoop = (timestamp: number): void => {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number): void {
    this.readInput();

    this.player.update(dt, this.input, this.level.platforms, this.level.ladders, this.level.width, this.level.height);

    for (const enemy of this.enemies) {
      enemy.update(dt, this.player.x, this.player.y, this.level.platforms, this.level.height);
    }

    this.updateBullets(dt);
    this.checkCombat();
    this.checkExit();

    this.callbacks.onStateChange(this.player.fsm.getCurrentState());
    this.callbacks.onWeaponChange(this.player.currentWeapon);

    if (this.input.reload) {
      this.player.reload();
    }

    this.enemies = this.enemies.filter(e => !e.isDead || e.deathTimer > 0);
  }

  private updateBullets(dt: number): void {
    const activeBullets = this.bulletPool.getActive();

    for (const bullet of activeBullets) {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.lifetime -= dt;

      if (bullet.lifetime <= 0) {
        this.bulletPool.release(bullet);
        continue;
      }

      if (bullet.x < 0 || bullet.x > this.level.width ||
          bullet.y < 0 || bullet.y > this.level.height) {
        this.bulletPool.release(bullet);
        continue;
      }

      for (const platform of this.level.platforms) {
        if (platform.isPassThrough) continue;
        if (bullet.x > platform.rect.x && bullet.x < platform.rect.x + platform.rect.width &&
            bullet.y > platform.rect.y && bullet.y < platform.rect.y + platform.rect.height) {
          this.bulletPool.release(bullet);
          break;
        }
      }
    }
  }

  private checkCombat(): void {
    const activeBullets = this.bulletPool.getActive();

    for (const bullet of activeBullets) {
      if (!bullet.fromPlayer) continue;

      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const hitbox = enemy.getHitbox();
        // Используем >= и <= для более надёжной проверки коллизий
        if (bullet.x >= hitbox.x && bullet.x <= hitbox.x + hitbox.width &&
            bullet.y >= hitbox.y && bullet.y <= hitbox.y + hitbox.height) {
          enemy.takeDamage(bullet.damage);
          this.bulletPool.release(bullet);
          if (enemy.isDead) {
            this.player.addGold(enemy.stats.goldDrop);
            this.callbacks.onEnemyKill();
          }
          break;
        }
      }
    }

    for (const bullet of activeBullets) {
      if (bullet.fromPlayer) continue;

      const playerHitbox = this.player.getHitbox();
      if (bullet.x >= playerHitbox.x && bullet.x <= playerHitbox.x + playerHitbox.width &&
          bullet.y >= playerHitbox.y && bullet.y <= playerHitbox.y + playerHitbox.height) {
        this.player.takeDamage(bullet.damage);
        this.bulletPool.release(bullet);
      }
    }

    if (this.player.isAttacking && this.player.currentWeapon === WeaponType.MELEE) {
      const meleeHitbox = this.player.getMeleeHitbox();
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const enemyHitbox = enemy.getHitbox();
        if (this.rectsOverlap(meleeHitbox, enemyHitbox)) {
          const damage = this.player.stats.meleeDamage * (this.player.comboCount === 2 ? 1.5 : 1);
          enemy.takeDamage(damage);
          if (enemy.isDead) {
            this.player.addGold(enemy.stats.goldDrop);
            this.callbacks.onEnemyKill();
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.isDead || enemy.stats.type !== EnemyType.MELEE) continue;
      if (enemy.state === EnemyState.ATTACK) {
        const attackHitbox = enemy.getAttackHitbox();
        const playerHitbox = this.player.getHitbox();
        if (this.rectsOverlap(attackHitbox, playerHitbox)) {
          this.player.takeDamage(enemy.stats.damage);
        }
      }
    }
  }

  private checkExit(): void {
    if (!this.level.exitDoor) return;

    const door = this.level.exitDoor;
    const playerHitbox = this.player.getHitbox();

    if (this.rectsOverlap(playerHitbox, door)) {
      this.callbacks.onLevelComplete();
    }
  }

  private rectsOverlap(a: { x: number; y: number; width: number; height: number },
                       b: { x: number; y: number; width: number; height: number }): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private render(): void {
    this.renderer.updateCamera(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );

    this.renderer.render(
      this.level,
      this.player,
      this.enemies,
      this.bulletPool.getActive()
    );
  }

  getPlayerStats() {
    return this.player.stats;
  }

  getPlayerState(): PlayerState {
    return this.player.fsm.getCurrentState();
  }

  reset(): void {
    this.bulletPool.releaseAll();
    this.level = getLevel(this.currentLevelNumber);
    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y,
      this.bulletPool
    );
    this.player.onHealthChange = this.callbacks.onHealthChange;
    this.player.onAmmoChange = this.callbacks.onAmmoChange;
    this.player.onGoldChange = this.callbacks.onGoldChange;
    this.player.onDeath = this.callbacks.onDeath;
    this.spawnEnemies();
  }

  nextLevel(): void {
    this.currentLevelNumber++;
    this.bulletPool.releaseAll();
    this.level = getLevel(this.currentLevelNumber);
    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y,
      this.bulletPool
    );
    this.player.onHealthChange = this.callbacks.onHealthChange;
    this.player.onAmmoChange = this.callbacks.onAmmoChange;
    this.player.onGoldChange = this.callbacks.onGoldChange;
    this.player.onDeath = this.callbacks.onDeath;
    this.spawnEnemies();
  }

  getLevelName(): string {
    return this.level.name;
  }

  getCurrentLevelNumber(): number {
    return this.currentLevelNumber;
  }
}

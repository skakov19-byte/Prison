// ============================================
// GAME ENGINE - Главный игровой цикл
// ============================================

import { InputState, PlayerState, WeaponType, EnemyType, EnemyState, ItemType, InventoryItem } from './types';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { ObjectPool } from './ObjectPool';
import { Renderer } from './Renderer';
import { LevelData, getLevel, Door, PickupZone } from './Level';

export interface GameCallbacks {
  onHealthChange: (health: number, maxHealth: number) => void;
  onAmmoChange: (current: number, max: number) => void;
  onGoldChange: (gold: number) => void;
  onWeaponChange: (weapon: WeaponType) => void;
  onStateChange: (state: PlayerState) => void;
  onDeath: () => void;
  onLevelComplete: () => void;
  onEnemyKill: () => void;
  onDoorMessage: (message: string) => void;
  onItemPickup: (item: InventoryItem) => void;
  onInventoryChange: (inventory: InventoryItem[]) => void;
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
    this.renderer.setLevelNumber(this.currentLevelNumber);

    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y,
      this.bulletPool
    );

    // На первых 3 уровнях (тюрьма) нет огнестрельного оружия
    this.player.hasRangedWeapon = this.currentLevelNumber > 3;
    if (!this.player.hasRangedWeapon) {
      this.player.currentWeapon = WeaponType.MELEE;
    }

    this.player.onHealthChange = callbacks.onHealthChange;
    this.player.onAmmoChange = callbacks.onAmmoChange;
    this.player.onGoldChange = callbacks.onGoldChange;
    this.player.onDeath = callbacks.onDeath;
    
    // Подключаем колбэки инвентаря
    this.player.onItemPickup = (item: InventoryItem) => {
      callbacks.onItemPickup(item);
      callbacks.onInventoryChange([...this.player.inventory]);
    };
    this.player.onItemUsed = () => {
      callbacks.onInventoryChange([...this.player.inventory]);
    };

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

  pause(): void {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  resume(): void {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
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
      enemy.update(dt, this.player.x, this.player.y, this.level.platforms, this.level.height, this.level.width);
    }

    this.updateBullets(dt);
    this.checkCombat();
    this.checkExit();
    this.checkPits();
    this.checkDoors();
    this.handleDoorCollisions();
    this.checkPickupZones();

    this.callbacks.onStateChange(this.player.fsm.getCurrentState());
    this.callbacks.onWeaponChange(this.player.currentWeapon);

    if (this.input.reload) {
      this.player.reload();
    }

    this.enemies = this.enemies.filter(e => !e.isDead || e.deathTimer > 0);
  }

  private checkPickupZones(): void {
    if (!this.level.pickupZones || this.level.pickupZones.length === 0) return;

    const playerHitbox = this.player.getHitbox();

    for (const zone of this.level.pickupZones) {
      // Проверяем триггеры
      if (zone.triggerOnAttack) {
        // Для отмычки - игрок должен быть в зоне и атаковать
        const zoneHitbox = { x: zone.x, y: zone.y, width: zone.width, height: zone.height };
        if (this.rectsOverlap(playerHitbox, zoneHitbox) && this.player.isAttacking) {
          this.pickupItem(zone);
        }
      } else if (zone.triggerOnKill && zone.enemyIndex !== undefined) {
        // Для дубинки - проверяем только убийство врага, без проверки позиции игрока
        const enemy = this.enemies[zone.enemyIndex];
        if (enemy && enemy.isDead) {
          this.pickupItem(zone);
        }
      } else if (!zone.triggerOnAttack && !zone.triggerOnKill) {
        // Обычный подбор при касании
        const zoneHitbox = { x: zone.x, y: zone.y, width: zone.width, height: zone.height };
        if (this.rectsOverlap(playerHitbox, zoneHitbox)) {
          this.pickupItem(zone);
        }
      }
    }
  }

  private pickupItem(zone: PickupZone): void {
    const item = {
      type: zone.item.type as ItemType,
      name: zone.item.name,
      icon: zone.item.icon,
      description: zone.item.description,
    };
    
    this.player.addItem(item);
    
    // Удаляем зону чтобы предмет не подбирался повторно
    const index = this.level.pickupZones!.indexOf(zone);
    if (index !== -1) {
      this.level.pickupZones!.splice(index, 1);
    }
  }

  private handleDoorCollisions(): void {
    if (!this.level.doors || this.level.doors.length === 0) return;

    const playerHitbox = this.player.getHitbox();

    for (const door of this.level.doors) {
      // Только закрытые двери блокируют
      if (!door.locked) continue;

      const doorHitbox = { x: door.x, y: door.y, width: door.width, height: door.height };

      if (this.rectsOverlap(playerHitbox, doorHitbox)) {
        // Определяем сторону коллизии
        const overlapLeft = (this.player.x + this.player.width) - door.x;
        const overlapRight = (door.x + door.width) - this.player.x;
        const overlapTop = (this.player.y + this.player.height) - door.y;
        const overlapBottom = (door.y + door.height) - this.player.y;

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft) {
          this.player.x = door.x - this.player.width;
          this.player.vx = 0;
        } else if (minOverlap === overlapRight) {
          this.player.x = door.x + door.width;
          this.player.vx = 0;
        } else if (minOverlap === overlapTop && this.player.vy >= 0) {
          this.player.y = door.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.canDoubleJump = true;
        } else if (minOverlap === overlapBottom && this.player.vy < 0) {
          this.player.y = door.y + door.height;
          this.player.vy = 0;
        }
      }
    }
  }

  private checkDoors(): void {
    if (!this.level.doors || this.level.doors.length === 0) return;

    const playerHitbox = this.player.getHitbox();

    for (const door of this.level.doors) {
      // Расширенная зона взаимодействия вокруг двери (на 30px в каждую сторону)
      const interactZone = { 
        x: door.x - 30, 
        y: door.y - 10, 
        width: door.width + 60, 
        height: door.height + 20 
      };
      
      if (this.rectsOverlap(playerHitbox, interactZone)) {
        // Если дверь заблокирована и игрок нажал E
        if (door.locked && door.requiresLockpick && this.input.interactPressed) {
          // Проверяем наличие отмычки в инвентаре
          if (this.player.hasItem(ItemType.LOCKPICK)) {
            door.locked = false;
            this.player.removeItem(ItemType.LOCKPICK); // Отмычка исчезает
            if (door.message) {
              this.callbacks.onDoorMessage(door.message);
            }
          } else {
            this.callbacks.onDoorMessage('Нужна отмычка!');
          }
        }
      }
    }
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
  
  private checkPits(): void {
    if (!this.level.pits || this.level.pits.length === 0) return;
    
    // Если игрок на лестнице или мёртв - не проверяем ямы
    if (this.player.isOnLadder || this.player.fsm.getCurrentState() === PlayerState.DEAD) return;
    
    const playerHitbox = this.player.getHitbox();
    const playerCenterX = playerHitbox.x + playerHitbox.width / 2;
    const playerBottom = playerHitbox.y + playerHitbox.height;
    
    for (const pit of this.level.pits) {
      // Проверяем, упал ли игрок В яму (не просто стоит рядом)
      // Игрок должен быть:
      // 1. Горизонтально внутри ямы
      // 2. Его нижняя часть ниже верхней границы ямы
      // 3. Он падает (vy > 0) или уже внутри ямы
      // 4. Он НЕ стоит на платформе (isGrounded = false)
      const isOverPit = playerCenterX > pit.x + 5 && playerCenterX < pit.x + pit.width - 5;
      const isFallingIntoPit = playerBottom > pit.y + 10 && this.player.vy > 0;
      const isDeepInPit = playerHitbox.y > pit.y;
      
      if (isOverPit && (isFallingIntoPit || isDeepInPit) && !this.player.isGrounded) {
        this.player.takeDamage(pit.damage);
        // Отбрасываем игрока назад и вверх
        this.player.vy = -400;
        this.player.vx = this.player.x < pit.x + pit.width / 2 ? -250 : 250;
        break;
      }
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
    this.renderer.setLevelNumber(this.currentLevelNumber);
    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y,
      this.bulletPool
    );
    // На первых 3 уровнях (тюрьма) нет огнестрельного оружия
    this.player.hasRangedWeapon = this.currentLevelNumber > 3;
    if (!this.player.hasRangedWeapon) {
      this.player.currentWeapon = WeaponType.MELEE;
    }
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
    this.renderer.setLevelNumber(this.currentLevelNumber);
    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y,
      this.bulletPool
    );
    // На первых 3 уровнях (тюрьма) нет огнестрельного оружия
    this.player.hasRangedWeapon = this.currentLevelNumber > 3;
    if (!this.player.hasRangedWeapon) {
      this.player.currentWeapon = WeaponType.MELEE;
    }
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

  applyUpgrades(upgrades: {
    health?: number;
    meleeDamage?: number;
    rangedDamage?: number;
    maxAmmo?: number;
    moveSpeed?: number;
  }): void {
    if (upgrades.health !== undefined) {
      this.player.stats.maxHealth += upgrades.health;
      this.player.stats.health = this.player.stats.maxHealth;
      if (this.callbacks.onHealthChange) {
        this.callbacks.onHealthChange(this.player.stats.health, this.player.stats.maxHealth);
      }
    }
    if (upgrades.meleeDamage !== undefined) {
      this.player.stats.meleeDamage += upgrades.meleeDamage;
    }
    if (upgrades.rangedDamage !== undefined) {
      this.player.stats.rangedDamage += upgrades.rangedDamage;
    }
    if (upgrades.maxAmmo !== undefined) {
      this.player.stats.maxAmmo += upgrades.maxAmmo;
      this.player.stats.currentAmmo = this.player.stats.maxAmmo;
      if (this.callbacks.onAmmoChange) {
        this.callbacks.onAmmoChange(this.player.stats.currentAmmo, this.player.stats.maxAmmo);
      }
    }
    if (upgrades.moveSpeed !== undefined) {
      this.player.stats.moveSpeed += upgrades.moveSpeed;
    }
  }
}

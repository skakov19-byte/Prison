// ============================================
// PLAYER - Контроллер игрока с FSM
// ============================================

import { PlayerState, WeaponType, InputState, PlayerStats, Vector2, Rect, Particle, Platform } from './types';
import { StateMachine } from './StateMachine';
import { ObjectPool } from './ObjectPool';

const GRAVITY = 980;
const MAX_FALL_SPEED = 600;

export class Player {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  width: number = 28;
  height: number = 44;

  facingRight: boolean = true;
  isGrounded: boolean = false;
  isOnLadder: boolean = false;
  currentLadder: { x: number; y: number; width: number; height: number } | null = null;
  canDoubleJump: boolean = true;
  isDropping: boolean = false;

  currentWeapon: WeaponType = WeaponType.RANGED;
  meleeTimer: number = 0;
  shootTimer: number = 0;
  reloadTimer: number = 0;
  isAttacking: boolean = false;
  attackFrame: number = 0;
  comboCount: number = 0;
  comboTimer: number = 0;
  invincibleTimer: number = 0;

  stats: PlayerStats;
  fsm: StateMachine;
  bulletPool: ObjectPool;
  particles: Particle[] = [];

  onHealthChange: ((health: number, maxHealth: number) => void) | null = null;
  onAmmoChange: ((current: number, max: number) => void) | null = null;
  onGoldChange: ((gold: number) => void) | null = null;
  onDeath: (() => void) | null = null;

  animTimer: number = 0;
  animFrame: number = 0;

  constructor(x: number, y: number, bulletPool: ObjectPool) {
    this.x = x;
    this.y = y;
    this.bulletPool = bulletPool;

    this.stats = {
      maxHealth: 100,
      health: 100,
      meleeDamage: 20,
      rangedDamage: 15,
      moveSpeed: 200,
      jumpForce: 480,
      maxAmmo: 12,
      currentAmmo: 12,
      reloadTime: 1.5,
      meleeCooldown: 0.4,
      shootCooldown: 0.2,
      gold: 0,
    };

    this.fsm = new StateMachine(PlayerState.IDLE);
    this.setupFSM();
  }

  private setupFSM(): void {
    this.fsm.addTransition(PlayerState.IDLE, PlayerState.RUN, () => {
      return Math.abs(this.vx) > 10 && this.isGrounded && !this.isOnLadder;
    });

    this.fsm.addTransition(PlayerState.RUN, PlayerState.IDLE, () => {
      return Math.abs(this.vx) < 10 && this.isGrounded;
    });

    this.fsm.addTransition(PlayerState.IDLE, PlayerState.JUMP, () => {
      return !this.isGrounded && this.vy < 0;
    });
    this.fsm.addTransition(PlayerState.RUN, PlayerState.JUMP, () => {
      return !this.isGrounded && this.vy < 0;
    });

    this.fsm.addTransition(PlayerState.JUMP, PlayerState.FALL, () => {
      return this.vy > 0;
    });

    this.fsm.addTransition(PlayerState.FALL, PlayerState.IDLE, () => {
      return this.isGrounded && Math.abs(this.vx) < 10;
    });
    this.fsm.addTransition(PlayerState.FALL, PlayerState.RUN, () => {
      return this.isGrounded && Math.abs(this.vx) >= 10;
    });
    this.fsm.addTransition(PlayerState.JUMP, PlayerState.IDLE, () => {
      return this.isGrounded && Math.abs(this.vx) < 10;
    });
    this.fsm.addTransition(PlayerState.JUMP, PlayerState.RUN, () => {
      return this.isGrounded && Math.abs(this.vx) >= 10;
    });

    this.fsm.addTransition(PlayerState.IDLE, PlayerState.CLIMB, () => this.isOnLadder);
    this.fsm.addTransition(PlayerState.RUN, PlayerState.CLIMB, () => this.isOnLadder);
    this.fsm.addTransition(PlayerState.JUMP, PlayerState.CLIMB, () => this.isOnLadder);
    this.fsm.addTransition(PlayerState.FALL, PlayerState.CLIMB, () => this.isOnLadder);

    this.fsm.addTransition(PlayerState.CLIMB, PlayerState.FALL, () => {
      return !this.isOnLadder;
    });

    this.fsm.addTransition(PlayerState.IDLE, PlayerState.MELEE_ATTACK, () => this.isAttacking && this.currentWeapon === WeaponType.MELEE);
    this.fsm.addTransition(PlayerState.RUN, PlayerState.MELEE_ATTACK, () => this.isAttacking && this.currentWeapon === WeaponType.MELEE);
    this.fsm.addTransition(PlayerState.JUMP, PlayerState.MELEE_ATTACK, () => this.isAttacking && this.currentWeapon === WeaponType.MELEE);
    this.fsm.addTransition(PlayerState.FALL, PlayerState.MELEE_ATTACK, () => this.isAttacking && this.currentWeapon === WeaponType.MELEE);

    this.fsm.addTransition(PlayerState.IDLE, PlayerState.SHOOT, () => this.isAttacking && this.currentWeapon === WeaponType.RANGED);
    this.fsm.addTransition(PlayerState.RUN, PlayerState.SHOOT, () => this.isAttacking && this.currentWeapon === WeaponType.RANGED);
    this.fsm.addTransition(PlayerState.JUMP, PlayerState.SHOOT, () => this.isAttacking && this.currentWeapon === WeaponType.RANGED);
    this.fsm.addTransition(PlayerState.FALL, PlayerState.SHOOT, () => this.isAttacking && this.currentWeapon === WeaponType.RANGED);

    this.fsm.addTransition(PlayerState.MELEE_ATTACK, PlayerState.IDLE, () => this.meleeTimer <= 0);
    this.fsm.addTransition(PlayerState.SHOOT, PlayerState.IDLE, () => this.shootTimer <= 0);

    this.fsm.addTransition(PlayerState.IDLE, PlayerState.HURT, () => this.invincibleTimer > 0.8);
    this.fsm.addTransition(PlayerState.RUN, PlayerState.HURT, () => this.invincibleTimer > 0.8);
    this.fsm.addTransition(PlayerState.HURT, PlayerState.IDLE, () => this.invincibleTimer <= 0);
  }

  getHitbox(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  getMeleeHitbox(): Rect {
    const attackWidth = 40;
    if (this.facingRight) {
      return { x: this.x + this.width, y: this.y + 5, width: attackWidth, height: this.height - 10 };
    } else {
      return { x: this.x - attackWidth, y: this.y + 5, width: attackWidth, height: this.height - 10 };
    }
  }

  levelWidth: number = 2000;
  levelHeight: number = 740;

  update(dt: number, input: InputState, platforms: Platform[], ladders: { x: number; y: number; width: number; height: number }[], levelWidth?: number, levelHeight?: number): void {
    if (levelWidth) this.levelWidth = levelWidth;
    if (levelHeight) this.levelHeight = levelHeight;
    if (this.meleeTimer > 0) this.meleeTimer -= dt;
    if (this.shootTimer > 0) this.shootTimer -= dt;
    if (this.reloadTimer > 0) this.reloadTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    this.updateParticles(dt);
    this.fsm.update();

    const state = this.fsm.getCurrentState();
    this.handleInput(dt, input, state);

    if (this.isOnLadder) {
      this.handleLadderMovement(dt, input);
    } else {
      this.handleNormalMovement(dt, input, state);
    }

    // Применяем скорость к позиции
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.handleCollisions(platforms, input);
    this.checkLadders(ladders, input);

    if (this.x < 20) this.x = 20;
    if (this.x + this.width > this.levelWidth - 20) this.x = this.levelWidth - 20 - this.width;
    if (this.y > this.levelHeight) {
      this.takeDamage(20);
      this.x = this.levelWidth > 200 ? 50 : 50;
      this.y = this.levelHeight - 100;
      this.vx = 0;
      this.vy = 0;
    }

    this.animTimer += dt;
    if (this.animTimer > 0.15) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  private handleInput(dt: number, input: InputState, state: PlayerState): void {
    if (input.switchWeaponPressed) {
      this.currentWeapon = this.currentWeapon === WeaponType.MELEE ? WeaponType.RANGED : WeaponType.MELEE;
    }

    if (input.reload && this.stats.currentAmmo < this.stats.maxAmmo && this.reloadTimer <= 0) {
      this.reloadTimer = this.stats.reloadTime;
    }

    if (input.attackPressed && this.meleeTimer <= 0 && this.shootTimer <= 0) {
      this.isAttacking = true;
      if (this.currentWeapon === WeaponType.MELEE) {
        this.meleeTimer = this.stats.meleeCooldown;
        this.attackFrame = 0;
        this.comboCount = (this.comboCount + 1) % 3;
        this.comboTimer = 0.8;
        this.spawnMeleeParticles();
      } else if (this.currentWeapon === WeaponType.RANGED) {
        if (this.stats.currentAmmo > 0 && this.reloadTimer <= 0) {
          this.shootTimer = this.stats.shootCooldown;
          this.stats.currentAmmo--;
          this.fireBullet();
          if (this.onAmmoChange) this.onAmmoChange(this.stats.currentAmmo, this.stats.maxAmmo);
        }
      }
      setTimeout(() => { this.isAttacking = false; }, 150);
    }
  }

  private handleNormalMovement(dt: number, input: InputState, state: PlayerState): void {
    let targetVx = 0;
    if (input.left) {
      targetVx = -this.stats.moveSpeed;
      this.facingRight = false;
    }
    if (input.right) {
      targetVx = this.stats.moveSpeed;
      this.facingRight = true;
    }

    const acceleration = this.isGrounded ? 1200 : 600;
    const friction = this.isGrounded ? 800 : 200;

    if (targetVx !== 0) {
      if (this.vx < targetVx) {
        this.vx = Math.min(this.vx + acceleration * dt, targetVx);
      } else if (this.vx > targetVx) {
        this.vx = Math.max(this.vx - acceleration * dt, targetVx);
      }
    } else {
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - friction * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + friction * dt);
      }
    }

    if (input.jumpPressed && this.isGrounded) {
      this.vy = -this.stats.jumpForce;
      this.isGrounded = false;
      this.canDoubleJump = true;
      this.isDropping = false;
    } else if (input.jumpPressed && !this.isGrounded && this.canDoubleJump) {
      this.vy = -this.stats.jumpForce * 0.8;
      this.canDoubleJump = false;
    }

    if (input.down && this.isGrounded) {
      this.isDropping = true;
      this.isGrounded = false;
      this.y += 5;
    }

    if (!this.isGrounded) {
      this.vy += GRAVITY * dt;
      if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;
    }
  }

  private handleLadderMovement(dt: number, input: InputState): void {
    this.vx = 0;
    this.vy = 0;

    if (input.up) this.vy = -150;
    if (input.down) this.vy = 150;
    if (input.left) { this.vx = -100; this.facingRight = false; }
    if (input.right) { this.vx = 100; this.facingRight = true; }

    if (input.jumpPressed) {
      this.isOnLadder = false;
      this.currentLadder = null;
      this.vy = -this.stats.jumpForce * 0.7;
      this.vx = this.facingRight ? 100 : -100;
      return;
    }

    if (this.currentLadder) {
      const ladder = this.currentLadder;
      const playerCenterX = this.x + this.width / 2;
      if (playerCenterX < ladder.x || playerCenterX > ladder.x + ladder.width ||
          this.y + this.height < ladder.y || this.y > ladder.y + ladder.height) {
        this.isOnLadder = false;
        this.currentLadder = null;
      }
    }
  }

  private handleCollisions(platforms: Platform[], input: InputState): void {
    const playerRect: Rect = { x: this.x, y: this.y, width: this.width, height: this.height };

    this.isGrounded = false;

    // Если игрок на лестнице, он проходит сквозь платформы
    if (this.isOnLadder) {
      return;
    }

    for (const platform of platforms) {
      if (platform.isPassThrough && !this.isDropping) {
        if (this.vy >= 0) {
          const prevBottom = this.y + this.height - this.vy * (1 / 60);
          if (prevBottom <= platform.rect.y + 2 &&
              this.y + this.height >= platform.rect.y &&
              this.x + this.width > platform.rect.x &&
              this.x < platform.rect.x + platform.rect.width) {
            this.y = platform.rect.y - this.height;
            this.vy = 0;
            this.isGrounded = true;
            this.canDoubleJump = true;
            this.isDropping = false;
          }
        }
      } else if (!platform.isPassThrough) {
        if (this.rectOverlap(playerRect, platform.rect)) {
          const overlapLeft = (this.x + this.width) - platform.rect.x;
          const overlapRight = (platform.rect.x + platform.rect.width) - this.x;
          const overlapTop = (this.y + this.height) - platform.rect.y;
          const overlapBottom = (platform.rect.y + platform.rect.height) - this.y;

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapTop && this.vy >= 0) {
            this.y = platform.rect.y - this.height;
            this.vy = 0;
            this.isGrounded = true;
            this.canDoubleJump = true;
            this.isDropping = false;
          } else if (minOverlap === overlapBottom && this.vy < 0) {
            this.y = platform.rect.y + platform.rect.height;
            this.vy = 0;
          } else if (minOverlap === overlapLeft) {
            this.x = platform.rect.x - this.width;
            this.vx = 0;
          } else if (minOverlap === overlapRight) {
            this.x = platform.rect.x + platform.rect.width;
            this.vx = 0;
          }
        }
      }
    }

    playerRect.x = this.x;
    playerRect.y = this.y;
  }

  private checkLadders(ladders: { x: number; y: number; width: number; height: number }[], input: InputState): void {
    if (this.isOnLadder) return;

    for (const ladder of ladders) {
      const playerCenterX = this.x + this.width / 2;
      const playerBottom = this.y + this.height;
      const playerTop = this.y;

      if (playerCenterX > ladder.x - 5 && playerCenterX < ladder.x + ladder.width + 5 &&
          playerBottom > ladder.y && playerTop < ladder.y + ladder.height) {
        if (input.up || (input.down && !this.isGrounded)) {
          this.isOnLadder = true;
          this.currentLadder = ladder;
          this.vy = 0;
          this.vx = 0;
          this.x = ladder.x + ladder.width / 2 - this.width / 2;
          return;
        }
      }
    }
  }

  private fireBullet(): void {
    const speed = 500;
    const dir = this.facingRight ? 1 : -1;
    const startX = this.facingRight ? this.x + this.width : this.x;
    const startY = this.y + this.height / 2 - 2;

    this.bulletPool.get(startX, startY, speed * dir, 0, this.stats.rangedDamage, true);
    this.vx -= dir * 30;
  }

  private spawnMeleeParticles(): void {
    const dir = this.facingRight ? 1 : -1;
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.x + this.width / 2 + dir * 20,
        y: this.y + this.height / 2 + (Math.random() - 0.5) * 20,
        vx: dir * (50 + Math.random() * 100),
        vy: (Math.random() - 0.5) * 100,
        life: 0.3,
        maxLife: 0.3,
        color: this.comboCount === 2 ? '#ff4444' : '#ffaa00',
        size: 3 + Math.random() * 3,
      });
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  takeDamage(amount: number): void {
    if (this.invincibleTimer > 0) return;

    this.stats.health -= amount;
    this.invincibleTimer = 1.0;

    if (this.onHealthChange) {
      this.onHealthChange(this.stats.health, this.stats.maxHealth);
    }

    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 0.5,
        maxLife: 0.5,
        color: '#ff0000',
        size: 2 + Math.random() * 3,
      });
    }

    if (this.stats.health <= 0) {
      this.stats.health = 0;
      this.fsm.forceState(PlayerState.DEAD);
      if (this.onDeath) this.onDeath();
    }
  }

  addGold(amount: number): void {
    this.stats.gold += amount;
    if (this.onGoldChange) this.onGoldChange(this.stats.gold);
  }

  reload(): void {
    if (this.reloadTimer <= 0 && this.stats.currentAmmo < this.stats.maxAmmo) {
      this.reloadTimer = this.stats.reloadTime;
      setTimeout(() => {
        this.stats.currentAmmo = this.stats.maxAmmo;
        if (this.onAmmoChange) this.onAmmoChange(this.stats.currentAmmo, this.stats.maxAmmo);
      }, this.stats.reloadTime * 1000);
    }
  }

  private rectOverlap(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
}

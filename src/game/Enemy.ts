// ============================================
// ENEMY - Враги с ИИ
// ============================================

import { EnemyState, EnemyType, EnemyStats, Rect, Particle, Platform } from './types';
import { ObjectPool } from './ObjectPool';

const GRAVITY = 980;

export class Enemy {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  width: number = 30;
  height: number = 40;

  stats: EnemyStats;
  state: EnemyState = EnemyState.PATROL;
  facingRight: boolean = true;
  isGrounded: boolean = false;

  currentPatrolIndex: number = 0;
  patrolWaitTimer: number = 0;
  attackTimer: number = 0;
  hurtTimer: number = 0;
  isDead: boolean = false;
  deathTimer: number = 0;

  particles: Particle[] = [];
  bulletPool: ObjectPool;

  animTimer: number = 0;
  animFrame: number = 0;
  
  flyTimer: number = 0;
  baseY: number = 0;
  levelWidth: number = 2000;

  constructor(stats: EnemyStats, bulletPool: ObjectPool) {
    this.stats = { ...stats };
    this.x = stats.patrolPoints[0]?.x || 0;
    this.y = stats.patrolPoints[0]?.y || 0;
    this.bulletPool = bulletPool;
  }

  getHitbox(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  getAttackHitbox(): Rect {
    if (this.stats.type === EnemyType.MELEE) {
      const range = 35;
      if (this.facingRight) {
        return { x: this.x + this.width, y: this.y + 5, width: range, height: this.height - 10 };
      } else {
        return { x: this.x - range, y: this.y + 5, width: range, height: this.height - 10 };
      }
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  levelHeight: number = 740;

  update(dt: number, playerX: number, playerY: number, platforms: Platform[], levelHeight?: number, levelWidth?: number): void {
    if (levelHeight) this.levelHeight = levelHeight;
    if (levelWidth) this.levelWidth = levelWidth;
    
    // Инициализация базовой высоты для летающих врагов
    if (this.stats.type === EnemyType.FLYING && this.baseY === 0) {
      this.baseY = this.y;
    }

    if (this.isDead) {
      this.deathTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    this.animTimer += dt;
    if (this.animTimer > 0.2) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    this.updateParticles(dt);

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const playerDetected = dist < this.stats.detectionRange;

    // Летающие враги имеют особую логику
    if (this.stats.type === EnemyType.FLYING) {
      this.updateFlying(dt, playerX, playerY, dist, playerDetected);
    } else {
      switch (this.state) {
        case EnemyState.PATROL:
          this.patrol(dt);
          if (playerDetected) {
            this.state = EnemyState.CHASE;
          }
          break;

        case EnemyState.CHASE:
          this.chase(dt, playerX);
          if (dist < this.stats.attackRange && this.attackTimer <= 0) {
            this.state = EnemyState.ATTACK;
          }
          if (!playerDetected && dist > this.stats.detectionRange * 1.5) {
            this.state = EnemyState.PATROL;
          }
          break;

        case EnemyState.ATTACK:
          this.attack(dt, playerX, playerY);
          if (dist > this.stats.attackRange * 1.2) {
            this.state = EnemyState.CHASE;
          }
          break;

        case EnemyState.HURT:
          if (this.hurtTimer <= 0) {
            this.state = playerDetected ? EnemyState.CHASE : EnemyState.PATROL;
          }
          break;
      }

      if (!this.isGrounded) {
        this.vy += GRAVITY * dt;
        if (this.vy > 600) this.vy = 600;
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.handleCollisions(platforms);

      if (this.y > this.levelHeight) {
        this.y = this.levelHeight - 100;
        this.vy = 0;
      }
    }
  }
  
  private updateFlying(dt: number, playerX: number, playerY: number, dist: number, playerDetected: boolean): void {
    this.flyTimer += dt;
    
    switch (this.state) {
      case EnemyState.PATROL: {
        // Летаем по синусоиде между точками патруля
        const patrolTarget = this.stats.patrolPoints[this.currentPatrolIndex];
        const pdx = patrolTarget.x - this.x;
        
        if (Math.abs(pdx) < 10) {
          this.vx = 0;
          this.patrolWaitTimer += dt;
          if (this.patrolWaitTimer > 1.5) {
            this.patrolWaitTimer = 0;
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.stats.patrolPoints.length;
          }
        } else {
          this.vx = Math.sign(pdx) * this.stats.moveSpeed * 0.6;
          this.facingRight = pdx > 0;
        }
        
        // Синусоидальное движение по вертикали
        this.y = this.baseY + Math.sin(this.flyTimer * 2) * 20;
        
        if (playerDetected) {
          this.state = EnemyState.CHASE;
        }
        break;
      }

      case EnemyState.CHASE: {
        // Преследуем игрока, оставаясь на высоте
        const cdx = playerX - this.x;
        this.facingRight = cdx > 0;
        
        // Держим дистанцию
        if (dist < 120) {
          this.vx = -Math.sign(cdx) * this.stats.moveSpeed * 0.5;
        } else if (dist > this.stats.attackRange * 0.7) {
          this.vx = Math.sign(cdx) * this.stats.moveSpeed * 0.8;
        } else {
          this.vx *= 0.9;
        }
        
        // Плавно приближаемся по вертикали к игроку, но выше
        const targetY = playerY - 80;
        const cdy = targetY - this.y;
        this.y += Math.sign(cdy) * Math.min(Math.abs(cdy), 60) * dt;
        
        // Лёгкое покачивание
        this.y += Math.sin(this.flyTimer * 3) * 0.5;
        
        if (dist < this.stats.attackRange && this.attackTimer <= 0) {
          this.state = EnemyState.ATTACK;
        }
        if (!playerDetected && dist > this.stats.detectionRange * 1.5) {
          this.state = EnemyState.PATROL;
          this.baseY = this.y;
        }
        break;
      }

      case EnemyState.ATTACK: {
        // Зависаем и атакуем
        this.vx *= 0.85;
        this.y += Math.sin(this.flyTimer * 4) * 0.3;
        
        if (this.attackTimer <= 0) {
          this.shootAtPlayer(playerX, playerY);
          this.attackTimer = this.stats.attackCooldown;
        }
        
        if (dist > this.stats.attackRange * 1.3) {
          this.state = EnemyState.CHASE;
        }
        break;
      }

      case EnemyState.HURT: {
        // Отлетаем при получении урона
        this.vx = -this.vx * 0.5;
        if (this.hurtTimer <= 0) {
          this.state = playerDetected ? EnemyState.CHASE : EnemyState.PATROL;
        }
        break;
      }
    }
    
    // Применяем горизонтальную скорость
    this.x += this.vx * dt;
    
    // Ограничение по границам уровня
    if (this.x < 30) this.x = 30;
    if (this.x > this.levelWidth - 30) this.x = this.levelWidth - 30;
    if (this.y < 30) this.y = 30;
  }

  private patrol(dt: number): void {
    if (this.stats.patrolPoints.length < 2) return;

    const target = this.stats.patrolPoints[this.currentPatrolIndex];
    const dx = target.x - this.x;

    if (Math.abs(dx) < 5) {
      this.vx = 0;
      this.patrolWaitTimer += dt;
      if (this.patrolWaitTimer > 1.0) {
        this.patrolWaitTimer = 0;
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.stats.patrolPoints.length;
      }
    } else {
      this.vx = Math.sign(dx) * this.stats.moveSpeed * 0.5;
      this.facingRight = dx > 0;
    }
  }

  private chase(dt: number, playerX: number): void {
    const dx = playerX - this.x;
    this.facingRight = dx > 0;

    if (this.stats.type === EnemyType.RANGED) {
      const dist = Math.abs(dx);
      if (dist < 100) {
        this.vx = -Math.sign(dx) * this.stats.moveSpeed * 0.7;
      } else if (dist > this.stats.attackRange * 0.8) {
        this.vx = Math.sign(dx) * this.stats.moveSpeed * 0.6;
      } else {
        this.vx = 0;
      }
    } else {
      this.vx = Math.sign(dx) * this.stats.moveSpeed;
    }
  }

  private attack(dt: number, playerX: number, playerY: number): void {
    this.vx = 0;

    if (this.attackTimer <= 0) {
      if (this.stats.type === EnemyType.RANGED) {
        this.shootAtPlayer(playerX, playerY);
      }
      this.attackTimer = this.stats.attackCooldown;
    }
  }

  private shootAtPlayer(targetX: number, targetY: number): void {
    const dx = targetX - (this.x + this.width / 2);
    const dy = targetY - (this.y + this.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const speed = 300;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    this.bulletPool.get(
      this.x + this.width / 2,
      this.y + this.height / 2,
      vx, vy,
      this.stats.damage,
      false
    );

    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: vx * 0.3 + (Math.random() - 0.5) * 50,
        vy: vy * 0.3 + (Math.random() - 0.5) * 50,
        life: 0.2,
        maxLife: 0.2,
        color: '#ff6600',
        size: 3,
      });
    }
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;

    this.stats.health -= amount;
    this.hurtTimer = 0.3;
    this.state = EnemyState.HURT;

    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 0.4,
        maxLife: 0.4,
        color: '#ff3333',
        size: 2 + Math.random() * 2,
      });
    }

    if (this.stats.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;
    this.deathTimer = 0.5;
    this.vx = 0;
    this.vy = 0;

    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 200,
        life: 0.6,
        maxLife: 0.6,
        color: this.stats.type === EnemyType.MELEE ? '#8800ff' : '#00aaff',
        size: 3 + Math.random() * 4,
      });
    }
  }

  private handleCollisions(platforms: Platform[]): void {
    const enemyRect: Rect = { x: this.x, y: this.y, width: this.width, height: this.height };
    this.isGrounded = false;

    for (const platform of platforms) {
      if (platform.isPassThrough) continue;

      if (this.rectOverlap(enemyRect, platform.rect)) {
        const overlapTop = (this.y + this.height) - platform.rect.y;
        const overlapBottom = (platform.rect.y + platform.rect.height) - this.y;
        const overlapLeft = (this.x + this.width) - platform.rect.x;
        const overlapRight = (platform.rect.x + platform.rect.width) - this.x;

        const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

        if (minOverlap === overlapTop && this.vy >= 0) {
          this.y = platform.rect.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
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

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private rectOverlap(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
}

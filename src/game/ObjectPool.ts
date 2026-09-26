// ============================================
// OBJECT POOL - Пул объектов для пуль и эффектов
// ============================================

import { Bullet } from './types';

export class ObjectPool {
  private pool: Bullet[] = [];
  private nextId = 0;

  constructor(initialSize: number = 50) {
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createBullet());
    }
  }

  private createBullet(): Bullet {
    return {
      id: this.nextId++,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: 8,
      height: 4,
      damage: 0,
      active: false,
      fromPlayer: true,
      lifetime: 0,
    };
  }

  get(x: number, y: number, vx: number, vy: number, damage: number, fromPlayer: boolean): Bullet | null {
    for (const bullet of this.pool) {
      if (!bullet.active) {
        bullet.x = x;
        bullet.y = y;
        bullet.vx = vx;
        bullet.vy = vy;
        bullet.damage = damage;
        bullet.active = true;
        bullet.fromPlayer = fromPlayer;
        bullet.lifetime = 3;
        return bullet;
      }
    }
    const newBullet = this.createBullet();
    newBullet.x = x;
    newBullet.y = y;
    newBullet.vx = vx;
    newBullet.vy = vy;
    newBullet.damage = damage;
    newBullet.active = true;
    newBullet.fromPlayer = fromPlayer;
    newBullet.lifetime = 3;
    this.pool.push(newBullet);
    return newBullet;
  }

  release(bullet: Bullet): void {
    bullet.active = false;
  }

  getActive(): Bullet[] {
    return this.pool.filter(b => b.active);
  }

  releaseAll(): void {
    for (const bullet of this.pool) {
      bullet.active = false;
    }
  }
}

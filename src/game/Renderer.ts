// ============================================
// RENDERER - Отрисовка игрового мира
// ============================================

import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet, Particle, Platform, PlayerState, WeaponType, EnemyType } from './types';
import { LevelData } from './Level';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private canvasWidth: number;
  private canvasHeight: number;
  private levelWidth: number;
  private levelHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, levelWidth: number, levelHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;
  }

  updateCamera(targetX: number, targetY: number): void {
    const targetCamX = targetX - this.canvasWidth / 2;
    const targetCamY = targetY - this.canvasHeight / 2;

    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;

    this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - this.canvasWidth));
    this.cameraY = Math.max(0, Math.min(this.cameraY, this.levelHeight - this.canvasHeight));
  }

  render(level: LevelData, player: Player, enemies: Enemy[], bullets: Bullet[]): void {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = level.bgColor;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.renderBackground();

    ctx.translate(-this.cameraX, -this.cameraY);

    this.renderLadders(level.ladders);
    this.renderPlatforms(level.platforms);

    if (level.exitDoor) {
      this.renderExitDoor(level.exitDoor);
    }

    for (const enemy of enemies) {
      this.renderEnemy(enemy);
    }

    this.renderBullets(bullets);
    this.renderPlayer(player);
    this.renderParticles(player.particles);

    for (const enemy of enemies) {
      this.renderParticles(enemy.particles);
    }

    ctx.restore();
  }

  private renderBackground(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = ((i * 137 + 50) % this.canvasWidth);
      const y = ((i * 97 + 30) % this.canvasHeight);
      const size = (i % 3) + 1;
      ctx.fillRect(x - this.cameraX * 0.1, y - this.cameraY * 0.1, size, size);
    }

    ctx.fillStyle = 'rgba(20, 20, 50, 0.8)';
    for (let i = 0; i < 8; i++) {
      const bx = i * 300 - this.cameraX * 0.3;
      const bh = 100 + (i * 47 % 150);
      ctx.fillRect(bx, this.canvasHeight - bh - 50, 80, bh);
      ctx.fillRect(bx + 100, this.canvasHeight - bh + 20 - 50, 60, bh - 20);
    }
  }

  private renderPlatforms(platforms: Platform[]): void {
    const ctx = this.ctx;

    for (const platform of platforms) {
      const { x, y, width, height } = platform.rect;

      if (platform.isPassThrough) {
        ctx.strokeStyle = '#44aaff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(68, 170, 255, 0.2)';
        ctx.fillRect(x, y, width, height);
      } else {
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#3a3a5c');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = '#5a5a8c';
        ctx.fillRect(x, y, width, 3);

        ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
        ctx.lineWidth = 1;
        for (let tx = x + 20; tx < x + width; tx += 40) {
          ctx.beginPath();
          ctx.moveTo(tx, y + 3);
          ctx.lineTo(tx, y + height);
          ctx.stroke();
        }
      }
    }
  }

  private renderLadders(ladders: { x: number; y: number; width: number; height: number }[]): void {
    const ctx = this.ctx;

    for (const ladder of ladders) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(ladder.x, ladder.y, 4, ladder.height);
      ctx.fillRect(ladder.x + ladder.width - 4, ladder.y, 4, ladder.height);

      ctx.fillStyle = '#A0522D';
      for (let ly = ladder.y + 15; ly < ladder.y + ladder.height; ly += 25) {
        ctx.fillRect(ladder.x + 4, ly, ladder.width - 8, 4);
      }

      ctx.fillStyle = 'rgba(255, 200, 100, 0.05)';
      ctx.fillRect(ladder.x - 5, ladder.y, ladder.width + 10, ladder.height);
    }
  }

  private renderExitDoor(door: { x: number; y: number; width: number; height: number }): void {
    const ctx = this.ctx;

    const gradient = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y + door.height);
    gradient.addColorStop(0, '#4a0088');
    gradient.addColorStop(1, '#220044');
    ctx.fillStyle = gradient;
    ctx.fillRect(door.x, door.y, door.width, door.height);

    ctx.strokeStyle = '#aa44ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x, door.y, door.width, door.height);

    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(170, 68, 255, ${pulse * 0.3})`;
    ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('▶', door.x + door.width / 2, door.y + door.height / 2 + 5);
  }

  private renderPlayer(player: Player): void {
    const ctx = this.ctx;
    const { x, y, width, height, facingRight } = player;

    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
    bodyGradient.addColorStop(0, '#00cc88');
    bodyGradient.addColorStop(1, '#006644');
    ctx.fillStyle = bodyGradient;

    ctx.fillRect(x + 4, y + 8, width - 8, height - 12);

    ctx.fillStyle = '#00ddaa';
    ctx.fillRect(x + 6, y, width - 12, 12);

    ctx.fillStyle = '#ffffff';
    const eyeX = facingRight ? x + width - 12 : x + 6;
    ctx.fillRect(eyeX, y + 3, 5, 4);
    ctx.fillStyle = '#000000';
    const pupilX = facingRight ? eyeX + 2 : eyeX;
    ctx.fillRect(pupilX, y + 4, 2, 2);

    ctx.fillStyle = '#005533';
    if (player.fsm.getCurrentState() === PlayerState.RUN) {
      const legOffset = Math.sin(player.animFrame * Math.PI / 2) * 4;
      ctx.fillRect(x + 6, y + height - 8, 6, 8 + legOffset);
      ctx.fillRect(x + width - 12, y + height - 8, 6, 8 - legOffset);
    } else {
      ctx.fillRect(x + 6, y + height - 8, 6, 8);
      ctx.fillRect(x + width - 12, y + height - 8, 6, 8);
    }

    if (player.currentWeapon === WeaponType.MELEE) {
      ctx.fillStyle = '#cccccc';
      const swordX = facingRight ? x + width : x - 20;
      if (player.isAttacking) {
        const swingAngle = player.comboCount === 2 ? 0.3 : 0;
        ctx.save();
        ctx.translate(swordX + 10, y + height / 2);
        ctx.rotate((facingRight ? 0.5 : -0.5) + swingAngle);
        ctx.fillRect(0, -2, 25, 4);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(facingRight ? 20 : -25, -3, 5, 6);
        ctx.restore();
      } else {
        ctx.fillRect(swordX, y + height / 2 - 2, 20, 4);
      }
    } else {
      ctx.fillStyle = '#666666';
      const gunX = facingRight ? x + width - 2 : x - 10;
      ctx.fillRect(gunX, y + height / 2 - 3, 14, 6);
      ctx.fillStyle = '#444444';
      ctx.fillRect(gunX + (facingRight ? 10 : 0), y + height / 2 + 1, 4, 6);
    }

    ctx.globalAlpha = 1.0;
  }

  private renderEnemy(enemy: Enemy): void {
    const ctx = this.ctx;
    const { x, y, width, height, facingRight, stats, state } = enemy;

    if (enemy.isDead) {
      ctx.globalAlpha = Math.max(0, enemy.deathTimer / 0.5);
    }

    if (enemy.hurtTimer > 0 && Math.floor(enemy.hurtTimer * 15) % 2 === 0) {
      ctx.globalAlpha = 0.6;
    }

    const isMelee = stats.type === EnemyType.MELEE;
    const mainColor = isMelee ? '#cc3333' : '#3366cc';
    const darkColor = isMelee ? '#881111' : '#112288';

    const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
    bodyGradient.addColorStop(0, mainColor);
    bodyGradient.addColorStop(1, darkColor);
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(x + 3, y + 6, width - 6, height - 10);

    ctx.fillStyle = mainColor;
    ctx.fillRect(x + 5, y, width - 10, 10);

    ctx.fillStyle = state === 'CHASE' || state === 'ATTACK' ? '#ff0000' : '#ffaa00';
    const eyeX = facingRight ? x + width - 12 : x + 5;
    ctx.fillRect(eyeX, y + 3, 4, 3);

    ctx.fillStyle = darkColor;
    if (state === 'CHASE' || state === 'PATROL') {
      const legOffset = Math.sin(enemy.animFrame * Math.PI / 2) * 3;
      ctx.fillRect(x + 5, y + height - 6, 5, 6 + legOffset);
      ctx.fillRect(x + width - 10, y + height - 6, 5, 6 - legOffset);
    } else {
      ctx.fillRect(x + 5, y + height - 6, 5, 6);
      ctx.fillRect(x + width - 10, y + height - 6, 5, 6);
    }

    if (isMelee) {
      ctx.fillStyle = '#aa6600';
      const weaponX = facingRight ? x + width : x - 15;
      ctx.fillRect(weaponX, y + height / 2 - 2, 15, 4);
    } else {
      ctx.fillStyle = '#555555';
      const gunX = facingRight ? x + width : x - 12;
      ctx.fillRect(gunX, y + height / 2 - 2, 12, 5);
    }

    if (stats.health < stats.maxHealth) {
      const barWidth = width;
      const barHeight = 4;
      const barX = x;
      const barY = y - 8;
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(barX, barY, barWidth * (stats.health / stats.maxHealth), barHeight);
    }

    ctx.globalAlpha = 1.0;
  }

  private renderBullets(bullets: Bullet[]): void {
    const ctx = this.ctx;

    for (const bullet of bullets) {
      if (!bullet.active) continue;

      if (bullet.fromPlayer) {
        ctx.fillStyle = '#ffdd00';
        ctx.shadowColor = '#ffdd00';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 5;
      }

      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      ctx.globalAlpha = 0.4;
      ctx.fillRect(bullet.x - bullet.vx * 0.02, bullet.y, bullet.width * 0.7, bullet.height);
      ctx.globalAlpha = 1.0;
    }

    ctx.shadowBlur = 0;
  }

  private renderParticles(particles: Particle[]): void {
    const ctx = this.ctx;

    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    ctx.globalAlpha = 1.0;
  }
}

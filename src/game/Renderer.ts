// ============================================
// RENDERER - Улучшенная графика с объёмом и деталями
// ============================================

import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet, Particle, Platform, PlayerState, WeaponType, EnemyType } from './types';
import { LevelData, Pit, Door, PickupZone, Decoration } from './Level';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private canvasWidth: number;
  private canvasHeight: number;
  private levelWidth: number;
  private levelHeight: number;
  private levelNumber: number = 1;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, levelWidth: number, levelHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;
  }
  
  setLevelNumber(levelNumber: number): void {
    this.levelNumber = levelNumber;
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
    this.renderBackground(level.bgColor);
    ctx.translate(-this.cameraX, -this.cameraY);
    this.renderLadders(level.ladders);
    this.renderPlatforms(level.platforms);
    if (level.pits) this.renderPits(level.pits);
    if (level.doors) this.renderDoors(level.doors);
    if (level.pickupZones) this.renderPickupZones(level.pickupZones, enemies);
    if (level.decorations) this.renderDecorations(level.decorations);
    if (level.exitDirection) this.renderExitIndicator(level.exitDirection, level.width, level.height);
    for (const enemy of enemies) this.renderEnemy(enemy);
    this.renderBullets(bullets);
    this.renderPlayer(player);
    this.renderParticles(player.particles);
    for (const enemy of enemies) this.renderParticles(enemy.particles);
    ctx.restore();
  }

  private renderBackground(bgColor: string): void {
    const ctx = this.ctx;
    const isPrison = this.levelNumber <= 3;
    const time = Date.now() * 0.001;

    if (isPrison) {
      // Детализированная тюремная стена
      const wallGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      wallGradient.addColorStop(0, '#1a1a1a');
      wallGradient.addColorStop(0.3, '#2a2a2a');
      wallGradient.addColorStop(0.7, '#252525');
      wallGradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Кирпичная текстура с объёмом
      for (let y = 0; y < this.canvasHeight; y += 30) {
        for (let x = 0; x < this.canvasWidth; x += 60) {
          const offset = (Math.floor(y / 30) % 2) * 30;
          const brickX = x + offset - (this.cameraX * 0.1) % 60;
          
          // Тень кирпича
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(brickX + 2, y + 2, 56, 26);
          
          // Кирпич с градиентом
          const brickGradient = ctx.createLinearGradient(brickX, y, brickX, y + 28);
          brickGradient.addColorStop(0, '#3a3a3a');
          brickGradient.addColorStop(0.5, '#2a2a2a');
          brickGradient.addColorStop(1, '#1a1a1a');
          ctx.fillStyle = brickGradient;
          ctx.fillRect(brickX, y, 56, 26);
          
          // Блик
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(brickX, y, 56, 3);
        }
      }

      // Трубы на фоне
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 8;
      for (let i = 0; i < 3; i++) {
        const pipeX = 100 + i * 250 - (this.cameraX * 0.15) % 300;
        ctx.beginPath();
        ctx.moveTo(pipeX, 0);
        ctx.lineTo(pipeX, this.canvasHeight);
        ctx.stroke();
        
        // Блик на трубе
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pipeX - 2, 0);
        ctx.lineTo(pipeX - 2, this.canvasHeight);
        ctx.stroke();
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 8;
      }

      // Тусклая лампа
      const lampX = this.canvasWidth / 2 - (this.cameraX * 0.05) % 200;
      const lampGradient = ctx.createRadialGradient(lampX, 50, 0, lampX, 50, 150);
      lampGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
      lampGradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.1)');
      lampGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      ctx.fillStyle = lampGradient;
      ctx.fillRect(lampX - 150, 0, 300, 300);
      
      // Пыль в воздухе
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 20; i++) {
        const dustX = (i * 137 + time * 10) % this.canvasWidth;
        const dustY = (i * 97 + Math.sin(time + i) * 20) % this.canvasHeight;
        ctx.beginPath();
        ctx.arc(dustX, dustY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Небо с градиентом
      const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      skyGradient.addColorStop(0, '#0a0a2a');
      skyGradient.addColorStop(0.5, '#1a1a3a');
      skyGradient.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Мерцающие звёзды
      for (let i = 0; i < 100; i++) {
        const starX = (i * 137) % this.canvasWidth;
        const starY = (i * 97) % (this.canvasHeight * 0.6);
        const size = (i % 3) + 1;
        const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(starX, starY, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        if (size > 2) {
          ctx.fillStyle = `rgba(200, 200, 255, ${twinkle * 0.3})`;
          ctx.beginPath();
          ctx.arc(starX, starY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Дальние здания (параллакс слой 1)
      for (let i = 0; i < 15; i++) {
        const bx = i * 150 - (this.cameraX * 0.2) % 200;
        const bh = 100 + (i * 47 % 150);
        const bw = 80 + (i * 23 % 40);
        
        const buildingGradient = ctx.createLinearGradient(bx, this.canvasHeight - bh, bx, this.canvasHeight);
        buildingGradient.addColorStop(0, 'rgba(20, 20, 40, 0.9)');
        buildingGradient.addColorStop(1, 'rgba(10, 10, 20, 0.9)');
        ctx.fillStyle = buildingGradient;
        ctx.fillRect(bx, this.canvasHeight - bh - 30, bw, bh);
        
        // Окна
        ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
        for (let wy = this.canvasHeight - bh - 20; wy < this.canvasHeight - 40; wy += 20) {
          for (let wx = bx + 10; wx < bx + bw - 10; wx += 15) {
            if (Math.random() > 0.3) ctx.fillRect(wx, wy, 6, 8);
          }
        }
      }

      // Средние здания (параллакс слой 2)
      for (let i = 0; i < 10; i++) {
        const bx = i * 250 - (this.cameraX * 0.4) % 300;
        const bh = 150 + (i * 47 % 200);
        const bw = 100 + (i * 31 % 60);
        
        const buildingGradient = ctx.createLinearGradient(bx, this.canvasHeight - bh, bx, this.canvasHeight);
        buildingGradient.addColorStop(0, 'rgba(30, 30, 60, 0.95)');
        buildingGradient.addColorStop(1, 'rgba(10, 10, 30, 0.95)');
        ctx.fillStyle = buildingGradient;
        ctx.fillRect(bx, this.canvasHeight - bh - 20, bw, bh);
        
        // Крыша
        ctx.fillStyle = 'rgba(40, 40, 70, 0.95)';
        ctx.fillRect(bx - 5, this.canvasHeight - bh - 25, bw + 10, 8);
        
        // Окна с мерцанием
        for (let wy = this.canvasHeight - bh - 10; wy < this.canvasHeight - 30; wy += 25) {
          for (let wx = bx + 12; wx < bx + bw - 12; wx += 20) {
            const lit = Math.sin(time * 0.5 + i + wx * 0.01) > 0;
            if (lit) {
              ctx.fillStyle = 'rgba(255, 220, 150, 0.7)';
              ctx.fillRect(wx, wy, 8, 12);
              ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
              ctx.fillRect(wx - 2, wy - 2, 12, 16);
            } else {
              ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
              ctx.fillRect(wx, wy, 8, 12);
            }
          }
        }
      }

      // Туман у земли
      const fogGradient = ctx.createLinearGradient(0, this.canvasHeight - 100, 0, this.canvasHeight);
      fogGradient.addColorStop(0, 'rgba(50, 50, 80, 0)');
      fogGradient.addColorStop(1, 'rgba(50, 50, 80, 0.4)');
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    }
  }

  private renderPlatforms(platforms: Platform[]): void {
    const ctx = this.ctx;

    for (const platform of platforms) {
      const { x, y, width, height } = platform.rect;

      if (platform.isPassThrough) {
        // Проходная платформа с эффектом свечения
        const glowGradient = ctx.createLinearGradient(x, y, x, y + height);
        glowGradient.addColorStop(0, 'rgba(68, 170, 255, 0.5)');
        glowGradient.addColorStop(1, 'rgba(68, 170, 255, 0.1)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = '#66ccff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        // Точки по углам
        ctx.fillStyle = '#88ddff';
        ctx.fillRect(x, y, 3, 3);
        ctx.fillRect(x + width - 3, y, 3, 3);
      } else {
        // Объёмная платформа с 3D-эффектом
        
        // Тень под платформой
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + 5, y + height, width, 8);
        
        // Основной градиент
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#5a5a7c');
        gradient.addColorStop(0.3, '#4a4a6c');
        gradient.addColorStop(0.7, '#3a3a5c');
        gradient.addColorStop(1, '#2a2a4c');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Верхняя грань (3D эффект)
        const topGradient = ctx.createLinearGradient(x, y, x, y + 8);
        topGradient.addColorStop(0, '#8a8aac');
        topGradient.addColorStop(1, '#6a6a8c');
        ctx.fillStyle = topGradient;
        ctx.fillRect(x, y, width, 8);
        
        // Текстура камней
        ctx.strokeStyle = 'rgba(80, 80, 120, 0.4)';
        ctx.lineWidth = 1;
        for (let ty = y + 15; ty < y + height; ty += 15) {
          ctx.beginPath();
          ctx.moveTo(x, ty);
          ctx.lineTo(x + width, ty);
          ctx.stroke();
        }
        
        let row = 0;
        for (let ty = y + 15; ty < y + height; ty += 15) {
          const offset = (row % 2) * 25;
          for (let tx = x + offset; tx < x + width; tx += 50) {
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx, ty + 15);
            ctx.stroke();
          }
          row++;
        }
        
        // Блики на верхней грани
        ctx.fillStyle = 'rgba(200, 200, 255, 0.4)';
        for (let tx = x + 10; tx < x + width - 10; tx += 40) {
          ctx.fillRect(tx, y + 2, 20, 2);
        }
        
        // Тени по бокам
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x, y + 8, 3, height - 8);
        ctx.fillRect(x + width - 3, y + 8, 3, height - 8);
        
        // Нижняя тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y + height - 4, width, 4);
      }
    }
  }

  private renderLadders(ladders: { x: number; y: number; width: number; height: number }[]): void {
    const ctx = this.ctx;

    for (const ladder of ladders) {
      // Свечение вокруг лестницы
      const glowGradient = ctx.createRadialGradient(
        ladder.x + ladder.width / 2, ladder.y + ladder.height / 2, 0,
        ladder.x + ladder.width / 2, ladder.y + ladder.height / 2, ladder.height / 2
      );
      glowGradient.addColorStop(0, 'rgba(255, 200, 100, 0.15)');
      glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(ladder.x - 15, ladder.y, ladder.width + 30, ladder.height);

      // Боковые перекладины с объёмом
      const sideGradient = ctx.createLinearGradient(ladder.x, ladder.y, ladder.x + 6, ladder.y);
      sideGradient.addColorStop(0, '#5B2410');
      sideGradient.addColorStop(0.3, '#A0522D');
      sideGradient.addColorStop(0.7, '#8B4513');
      sideGradient.addColorStop(1, '#6B3410');
      ctx.fillStyle = sideGradient;
      ctx.fillRect(ladder.x, ladder.y, 6, ladder.height);
      
      const sideGradient2 = ctx.createLinearGradient(ladder.x + ladder.width - 6, ladder.y, ladder.x + ladder.width, ladder.y);
      sideGradient2.addColorStop(0, '#6B3410');
      sideGradient2.addColorStop(0.3, '#8B4513');
      sideGradient2.addColorStop(0.7, '#A0522D');
      sideGradient2.addColorStop(1, '#5B2410');
      ctx.fillStyle = sideGradient2;
      ctx.fillRect(ladder.x + ladder.width - 6, ladder.y, 6, ladder.height);

      // Текстура дерева
      ctx.strokeStyle = 'rgba(60, 30, 10, 0.5)';
      ctx.lineWidth = 1;
      for (let ly = ladder.y; ly < ladder.y + ladder.height; ly += 10) {
        ctx.beginPath();
        ctx.moveTo(ladder.x + 1, ly);
        ctx.lineTo(ladder.x + 5, ly + 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ladder.x + ladder.width - 5, ly);
        ctx.lineTo(ladder.x + ladder.width - 1, ly + 3);
        ctx.stroke();
      }

      // Ступеньки с объёмом
      for (let ly = ladder.y + 20; ly < ladder.y + ladder.height; ly += 30) {
        // Тень под ступенькой
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(ladder.x + 6, ly + 6, ladder.width - 12, 3);
        
        // Основная ступенька
        const stepGradient = ctx.createLinearGradient(ladder.x, ly, ladder.x, ly + 6);
        stepGradient.addColorStop(0, '#C8835D');
        stepGradient.addColorStop(0.5, '#A0522D');
        stepGradient.addColorStop(1, '#7B421D');
        ctx.fillStyle = stepGradient;
        ctx.fillRect(ladder.x + 6, ly, ladder.width - 12, 6);
        
        // Блик на ступеньке
        ctx.fillStyle = 'rgba(255, 220, 180, 0.5)';
        ctx.fillRect(ladder.x + 7, ly, ladder.width - 14, 2);
        
        // Гвозди
        ctx.fillStyle = '#444444';
        ctx.beginPath();
        ctx.arc(ladder.x + 8, ly + 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ladder.x + ladder.width - 8, ly + 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderPits(pits: Pit[]): void {
    const ctx = this.ctx;
    const time = Date.now() * 0.005;

    for (const pit of pits) {
      // Тёмная бездна с градиентом
      const pitGradient = ctx.createLinearGradient(pit.x, pit.y, pit.x, pit.y + pit.height);
      pitGradient.addColorStop(0, '#000000');
      pitGradient.addColorStop(0.5, '#1a0000');
      pitGradient.addColorStop(1, '#000000');
      ctx.fillStyle = pitGradient;
      ctx.fillRect(pit.x, pit.y, pit.width, pit.height);

      // Красное свечение (лава)
      const glowGradient = ctx.createRadialGradient(
        pit.x + pit.width / 2, pit.y + pit.height, 0,
        pit.x + pit.width / 2, pit.y + pit.height, pit.width / 2
      );
      glowGradient.addColorStop(0, 'rgba(255, 50, 0, 0.7)');
      glowGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.4)');
      glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(pit.x - 30, pit.y, pit.width + 60, pit.height + 40);

      // Анимированные языки пламени
      for (let i = 0; i < 7; i++) {
        const flameX = pit.x + (pit.width / 7) * i + 10;
        const flameHeight = 20 + Math.sin(time + i * 0.5) * 10;
        
        const flameGradient = ctx.createLinearGradient(flameX, pit.y + pit.height, flameX, pit.y + pit.height - flameHeight);
        flameGradient.addColorStop(0, 'rgba(255, 100, 0, 0.9)');
        flameGradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.7)');
        flameGradient.addColorStop(0.7, 'rgba(255, 255, 100, 0.4)');
        flameGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = flameGradient;
        
        ctx.beginPath();
        ctx.moveTo(flameX, pit.y + pit.height);
        ctx.quadraticCurveTo(flameX + 5, pit.y + pit.height - flameHeight / 2, flameX + 3, pit.y + pit.height - flameHeight);
        ctx.quadraticCurveTo(flameX + 8, pit.y + pit.height - flameHeight / 2, flameX + 12, pit.y + pit.height);
        ctx.closePath();
        ctx.fill();
      }

      // Шипы по краям
      ctx.fillStyle = '#222222';
      for (let sx = pit.x; sx < pit.x + pit.width; sx += 15) {
        ctx.beginPath();
        ctx.moveTo(sx, pit.y);
        ctx.lineTo(sx + 7, pit.y - 10);
        ctx.lineTo(sx + 14, pit.y);
        ctx.closePath();
        ctx.fill();
        
        // Блик на шипе
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(sx + 5, pit.y - 2);
        ctx.lineTo(sx + 7, pit.y - 8);
        ctx.lineTo(sx + 9, pit.y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#222222';
      }

      // Предупреждающий знак
      ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠', pit.x + pit.width / 2, pit.y - 15);
    }
  }

  private renderDoors(doors: Door[]): void {
    const ctx = this.ctx;

    for (const door of doors) {
      if (door.locked) {
        // Рама двери с объёмом
        ctx.fillStyle = '#3a2718';
        ctx.fillRect(door.x - 5, door.y - 5, door.width + 10, door.height + 10);
        
        // Тень рамы
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(door.x - 5, door.y + door.height, door.width + 10, 5);

        // Закрытая дверь
        const doorGradient = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y);
        doorGradient.addColorStop(0, '#2a1f18');
        doorGradient.addColorStop(0.3, '#3d2e22');
        doorGradient.addColorStop(0.7, '#3d2e22');
        doorGradient.addColorStop(1, '#2a1f18');
        ctx.fillStyle = doorGradient;
        ctx.fillRect(door.x, door.y, door.width, door.height);

        // Решётка
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 3;
        for (let i = 1; i < 4; i++) {
          const barX = door.x + (door.width / 4) * i;
          ctx.beginPath();
          ctx.moveTo(barX, door.y);
          ctx.lineTo(barX, door.y + door.height);
          ctx.stroke();
        }
        const horizontalBars = Math.max(2, Math.floor(door.height / 15));
        for (let i = 1; i <= horizontalBars; i++) {
          const barY = door.y + (door.height / (horizontalBars + 1)) * i;
          ctx.beginPath();
          ctx.moveTo(door.x, barY);
          ctx.lineTo(door.x + door.width, barY);
          ctx.stroke();
        }

        // Замок с деталями
        const lockSize = Math.min(door.width, door.height) * 0.25;
        const lockGradient = ctx.createLinearGradient(
          door.x + door.width / 2 - lockSize / 2, door.y + door.height / 2,
          door.x + door.width / 2 + lockSize / 2, door.y + door.height / 2
        );
        lockGradient.addColorStop(0, '#666666');
        lockGradient.addColorStop(0.5, '#aaaaaa');
        lockGradient.addColorStop(1, '#666666');
        ctx.fillStyle = lockGradient;
        ctx.fillRect(door.x + door.width / 2 - lockSize / 2, door.y + door.height / 2 - lockSize, lockSize, lockSize * 1.5);
        
        // Замочная скважина
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(door.x + door.width / 2, door.y + door.height / 2 - lockSize / 2, lockSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(door.x + door.width / 2 - 2, door.y + door.height / 2 - lockSize / 2, 4, lockSize * 0.5);

        // Подсказка
        ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('[E]', door.x + door.width / 2, door.y - 10);
      }
    }
  }

  private renderPickupZones(zones: PickupZone[], enemies: Enemy[]): void {
    const ctx = this.ctx;
    const time = Date.now() * 0.003;

    for (const zone of zones) {
      if (zone.triggerOnKill && zone.enemyIndex !== undefined) {
        const enemy = enemies[zone.enemyIndex];
        if (!enemy || !enemy.isDead) continue;
      }

      const alpha = (Math.sin(time) * 0.3 + 0.5);
      let glowColor = '255, 215, 0';
      if (zone.item.type === 'KEY') glowColor = '192, 192, 192';
      else if (zone.item.type === 'LOCKPICK') glowColor = '100, 200, 255';

      // Свечение
      const glowGradient = ctx.createRadialGradient(
        zone.x + zone.width / 2, zone.y + zone.height / 2, 0,
        zone.x + zone.width / 2, zone.y + zone.height / 2, zone.width
      );
      glowGradient.addColorStop(0, `rgba(${glowColor}, ${alpha * 0.5})`);
      glowGradient.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.fillRect(zone.x - 15, zone.y - 15, zone.width + 30, zone.height + 30);

      // Иконка
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.item.icon, zone.x + zone.width / 2, zone.y + zone.height / 2 + 6);

      // Подсказка
      if (zone.triggerOnAttack) {
        ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.font = 'bold 10px Arial';
        ctx.fillText('[J] Ударить', zone.x + zone.width / 2, zone.y - 8);
      } else if (zone.item.type === 'KEY') {
        ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
        ctx.font = 'bold 10px Arial';
        ctx.fillText('Ключ', zone.x + zone.width / 2, zone.y - 8);
      }
    }
  }

  private renderDecorations(decorations: Decoration[]): void {
    const ctx = this.ctx;

    for (const decoration of decorations) {
      if (decoration.type === 'burning_car') {
        const carX = decoration.x;
        const carY = decoration.y;

        // Тень машины
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(carX + 60, carY + 50, 80, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Кузов машины (поврежденный)
        const carGradient = ctx.createLinearGradient(carX, carY, carX, carY + 40);
        carGradient.addColorStop(0, '#2a2a4e');
        carGradient.addColorStop(0.5, '#1a1a2e');
        carGradient.addColorStop(1, '#0a0a1e');
        ctx.fillStyle = carGradient;
        ctx.save();
        ctx.translate(carX + 60, carY + 20);
        ctx.rotate(0.3);
        ctx.fillRect(-60, -20, 120, 40);
        ctx.restore();

        // Вмятины
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(carX + 40, carY + 20, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(carX + 90, carY + 10, 15, 0, Math.PI * 2);
        ctx.fill();

        // Разбитые окна
        ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
        ctx.fillRect(carX + 25, carY - 15, 30, 12);
        ctx.fillRect(carX + 65, carY - 15, 30, 12);

        // Трещины
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(carX + 30, carY - 10);
        ctx.lineTo(carX + 50, carY - 15);
        ctx.moveTo(carX + 35, carY - 12);
        ctx.lineTo(carX + 45, carY - 5);
        ctx.stroke();

        // Колёса
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(carX + 25, carY + 40, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(carX + 95, carY + 40, 14, 0, Math.PI * 2);
        ctx.fill();

        // Диски
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(carX + 25, carY + 40, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(carX + 95, carY + 40, 7, 0, Math.PI * 2);
        ctx.fill();

        // Интенсивный огонь
        for (let i = 0; i < 30; i++) {
          const flameX = carX + Math.random() * 150;
          const flameY = carY - Math.random() * 120;
          const flameSize = 20 + Math.random() * 40;

          const flameGradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
          flameGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
          flameGradient.addColorStop(0.2, 'rgba(255, 200, 0, 0.8)');
          flameGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
          flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
          ctx.fillStyle = flameGradient;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Густой дым
        for (let i = 0; i < 20; i++) {
          const smokeX = carX + Math.random() * 200;
          const smokeY = carY - 150 - Math.random() * 200;
          const smokeSize = 40 + Math.random() * 70;

          const smokeGradient = ctx.createRadialGradient(smokeX, smokeY, 0, smokeX, smokeY, smokeSize);
          smokeGradient.addColorStop(0, 'rgba(50, 50, 50, 0.7)');
          smokeGradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
          ctx.fillStyle = smokeGradient;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Осколки
        ctx.fillStyle = 'rgba(150, 200, 255, 0.8)';
        for (let i = 0; i < 12; i++) {
          const shardX = carX + Math.random() * 120;
          const shardY = carY + 30 + Math.random() * 20;
          ctx.fillRect(shardX, shardY, 4, 4);
        }
      }
    }
  }

  private renderExitIndicator(direction: 'left' | 'right', levelWidth: number, levelHeight: number): void {
    const ctx = this.ctx;
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    
    // Позиция индикатора
    const indicatorX = direction === 'right' ? levelWidth - 30 : 30;
    const indicatorY = levelHeight - 150;
    
    // Свечение
    const glowGradient = ctx.createRadialGradient(
      indicatorX, indicatorY, 0,
      indicatorX, indicatorY, 50
    );
    glowGradient.addColorStop(0, `rgba(0, 255, 100, ${pulse * 0.5})`);
    glowGradient.addColorStop(0.5, `rgba(0, 255, 100, ${pulse * 0.3})`);
    glowGradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(indicatorX - 50, indicatorY - 50, 100, 100);
    
    // Стрелка
    ctx.fillStyle = `rgba(0, 255, 100, ${pulse})`;
    ctx.beginPath();
    if (direction === 'right') {
      ctx.moveTo(indicatorX - 10, indicatorY - 15);
      ctx.lineTo(indicatorX + 10, indicatorY);
      ctx.lineTo(indicatorX - 10, indicatorY + 15);
    } else {
      ctx.moveTo(indicatorX + 10, indicatorY - 15);
      ctx.lineTo(indicatorX - 10, indicatorY);
      ctx.lineTo(indicatorX + 10, indicatorY + 15);
    }
    ctx.closePath();
    ctx.fill();
    
    // Текст "EXIT"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', indicatorX, indicatorY - 25);
  }

  private renderPlayer(player: Player): void {
    const ctx = this.ctx;
    const { x, y, width, height, facingRight } = player;

    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Если есть спрайт-лист, используем его
    if (player.animationController && player.spriteSheet) {
      // Тень под персонажем
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height + 3, width / 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Рисуем спрайт
      ctx.save();
      
      // Если персонаж повёрнут влево, зеркалим спрайт
      if (!facingRight) {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        player.animationController.draw(ctx, 0, 0);
      } else {
        player.animationController.draw(ctx, x, y);
      }
      
      ctx.restore();
    } else {
      // Fallback: процедурная отрисовка (старый код)
      // Тень под персонажем
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height + 3, width / 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Тело с детализацией
      const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
      bodyGradient.addColorStop(0, '#ff9933');
      bodyGradient.addColorStop(0.3, '#ff7700');
      bodyGradient.addColorStop(0.7, '#cc5500');
      bodyGradient.addColorStop(1, '#aa4400');
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 10, width - 8, height - 14, 4);
      ctx.fill();

      // Складки на робе
      ctx.strokeStyle = 'rgba(150, 60, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 20);
      ctx.lineTo(x + 10, y + 35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + width - 8, y + 20);
      ctx.lineTo(x + width - 10, y + 35);
      ctx.stroke();

      // Полосы на робе
      ctx.fillStyle = '#aa4400';
      ctx.fillRect(x + 6, y + 15, width - 12, 3);
      ctx.fillRect(x + 6, y + 30, width - 12, 3);

      // Номер
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('#247', x + width / 2, y + 24);

      // Голова с объёмом
      const headGradient = ctx.createRadialGradient(x + width / 2 - 3, y + 3, 2, x + width / 2, y + 5, 10);
      headGradient.addColorStop(0, '#ffcc99');
      headGradient.addColorStop(0.7, '#f4a460');
      headGradient.addColorStop(1, '#cc8844');
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + 5, 10, 0, Math.PI * 2);
      ctx.fill();

      // Волосы
      ctx.fillStyle = '#332211';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + 2, 10, Math.PI, 0);
      ctx.fill();

      // Глаза с деталями
      const eyeX = facingRight ? x + width - 10 : x + 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 2, y + 5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX + (facingRight ? 3 : 1), y + 5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Ноги с анимацией
      const legGradient = ctx.createLinearGradient(x, y + height - 12, x, y + height);
      legGradient.addColorStop(0, '#554433');
      legGradient.addColorStop(1, '#332211');
      ctx.fillStyle = legGradient;

      if (player.fsm.getCurrentState() === PlayerState.RUN) {
        const legOffset = Math.sin(player.animFrame * Math.PI / 2) * 6;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + height - 12, 8, 12 + legOffset, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + width - 13, y + height - 12, 8, 12 - legOffset, 3);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(x + 5, y + height - 12, 8, 12, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + width - 13, y + height - 12, 8, 12, 3);
        ctx.fill();
      }

      // Оружие
      if (player.currentWeapon === WeaponType.MELEE) {
        const weaponX = facingRight ? x + width : x - 25;

        if (player.hasBaton) {
          if (player.isAttacking) {
            const swingAngle = player.comboCount === 2 ? 0.6 : 0.4;
            ctx.save();
            ctx.translate(weaponX + 10, y + height / 2);
            ctx.rotate((facingRight ? 0.8 : -0.8) + swingAngle);

            // Дубинка с градиентом
            const batonGradient = ctx.createLinearGradient(0, -4, 0, 4);
            batonGradient.addColorStop(0, '#6b5240');
            batonGradient.addColorStop(0.5, '#4a3728');
            batonGradient.addColorStop(1, '#3a2718');
            ctx.fillStyle = batonGradient;
            ctx.beginPath();
            ctx.roundRect(0, -4, 25, 8, 3);
            ctx.fill();

            // Рукоять
            ctx.fillStyle = '#2a1f18';
            ctx.fillRect(-8, -5, 8, 10);

            // Эффект удара
            if (player.comboCount === 2) {
              ctx.strokeStyle = 'rgba(255, 150, 0, 0.7)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(12, 0, 15, 0, Math.PI);
              ctx.stroke();
            }

            ctx.restore();
          } else {
            ctx.fillStyle = '#5a4a38';
            ctx.fillRect(weaponX, y + height / 2 - 3, 22, 6);
            ctx.fillStyle = '#3a2a18';
            ctx.fillRect(weaponX - 6, y + height / 2 - 4, 6, 8);
          }
        } else {
          if (player.isAttacking) {
            const punchOffset = player.comboCount === 2 ? 10 : 6;
            ctx.fillStyle = '#ffcc99';
            const fistX = facingRight ? x + width + punchOffset : x - punchOffset - 10;
            ctx.beginPath();
            ctx.roundRect(fistX, y + height / 2 - 6, 10, 12, 4);
            ctx.fill();

            if (player.comboCount === 2) {
              ctx.strokeStyle = 'rgba(255, 200, 0, 0.7)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(fistX + 5, y + height / 2, 10, 0, Math.PI);
              ctx.stroke();
            }
          }
        }
      } else {
        if (player.aimingUp) {
          const gunCenterX = x + width / 2;
          const gunBaseY = y + 5;

          ctx.save();
          ctx.translate(gunCenterX, gunBaseY);

          const gunGradient = ctx.createLinearGradient(-5, 0, 5, 0);
          gunGradient.addColorStop(0, '#666666');
          gunGradient.addColorStop(0.5, '#888888');
          gunGradient.addColorStop(1, '#555555');
          ctx.fillStyle = gunGradient;
          ctx.beginPath();
          ctx.roundRect(-5, -15, 10, 20, 3);
          ctx.fill();

          ctx.fillStyle = '#444444';
          ctx.fillRect(-3, -22, 6, 7);

          ctx.fillStyle = '#2a2a2a';
          ctx.beginPath();
          ctx.roundRect(-4, 3, 8, 6, 2);
          ctx.fill();

          ctx.restore();
        } else {
          const gunX = facingRight ? x + width - 2 : x - 16;

          const gunGradient = ctx.createLinearGradient(gunX, y + height / 2 - 5, gunX, y + height / 2 + 5);
          gunGradient.addColorStop(0, '#777777');
          gunGradient.addColorStop(0.5, '#555555');
          gunGradient.addColorStop(1, '#333333');
          ctx.fillStyle = gunGradient;
          ctx.beginPath();
          ctx.roundRect(gunX, y + height / 2 - 5, 18, 10, 3);
          ctx.fill();

          ctx.fillStyle = '#444444';
          ctx.fillRect(gunX + (facingRight ? 14 : -6), y + height / 2 - 3, 8, 6);

          ctx.fillStyle = '#2a2a2a';
          ctx.beginPath();
          ctx.roundRect(gunX + (facingRight ? 12 : 2), y + height / 2 + 3, 6, 8, 2);
          ctx.fill();
        }
      }
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

    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height + 3, width / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const isMelee = stats.type === EnemyType.MELEE;
    const isFlying = stats.type === EnemyType.FLYING;
    const mainColor = isMelee ? '#dd4444' : isFlying ? '#dd44dd' : '#4477dd';
    const darkColor = isMelee ? '#991111' : isFlying ? '#991199' : '#112299';
    const accentColor = isMelee ? '#ff6666' : isFlying ? '#ff66ff' : '#6699ff';

    // Тело с объёмом
    const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
    bodyGradient.addColorStop(0, accentColor);
    bodyGradient.addColorStop(0.3, mainColor);
    bodyGradient.addColorStop(0.7, mainColor);
    bodyGradient.addColorStop(1, darkColor);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 8, width - 6, height - 12, 4);
    ctx.fill();

    // Детали брони
    ctx.fillStyle = darkColor;
    ctx.fillRect(x + 5, y + 12, width - 10, 3);
    ctx.fillRect(x + 5, y + 22, width - 10, 3);

    // Нагрудник
    ctx.fillStyle = isMelee ? '#661111' : '#111166';
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 14, width - 12, 12, 3);
    ctx.fill();

    // Голова с объёмом
    const headGradient = ctx.createRadialGradient(x + width / 2 - 3, y + 2, 2, x + width / 2, y + 5, 10);
    headGradient.addColorStop(0, accentColor);
    headGradient.addColorStop(0.7, mainColor);
    headGradient.addColorStop(1, darkColor);
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Шлем
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 2, 10, Math.PI, 0);
    ctx.fill();

    // Светящиеся глаза
    const eyeColor = state === 'CHASE' || state === 'ATTACK' ? '#ff0000' : '#ffaa00';
    const eyeX = facingRight ? x + width - 10 : x + 6;
    
    const eyeGlow = ctx.createRadialGradient(eyeX + 2, y + 5, 0, eyeX + 2, y + 5, 6);
    eyeGlow.addColorStop(0, '#ffffff');
    eyeGlow.addColorStop(0.4, eyeColor);
    eyeGlow.addColorStop(1, `rgba(${isMelee ? '255, 0, 0' : '255, 170, 0'}, 0)`);
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(eyeX + 2, y + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Зрачок
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX + (facingRight ? 3 : 1), y + 5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ноги с анимацией
    const legGradient = ctx.createLinearGradient(x, y + height - 10, x, y + height);
    legGradient.addColorStop(0, darkColor);
    legGradient.addColorStop(1, '#000000');
    ctx.fillStyle = legGradient;

    if (state === 'CHASE' || state === 'PATROL') {
      const legOffset = Math.sin(enemy.animFrame * Math.PI / 2) * 5;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + height - 10, 7, 10 + legOffset, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width - 11, y + height - 10, 7, 10 - legOffset, 3);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(x + 4, y + height - 10, 7, 10, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width - 11, y + height - 10, 7, 10, 3);
      ctx.fill();
    }

    // Крылья для летающих врагов
    if (isFlying) {
      const wingFlap = Math.sin(enemy.animTimer * 10) * 0.4;
      ctx.save();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 10);
      ctx.quadraticCurveTo(x - 15, y + 5 + wingFlap * 15, x - 8, y + 25);
      ctx.quadraticCurveTo(x, y + 18, x + 5, y + 15);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + width - 5, y + 10);
      ctx.quadraticCurveTo(x + width + 15, y + 5 + wingFlap * 15, x + width + 8, y + 25);
      ctx.quadraticCurveTo(x + width, y + 18, x + width - 5, y + 15);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Оружие
    if (isMelee) {
      const weaponX = facingRight ? x + width : x - 20;

      if (state === 'ATTACK') {
        ctx.save();
        ctx.translate(weaponX + 10, y + height / 2);
        ctx.rotate(facingRight ? 0.4 : -0.4);

        const bladeGradient = ctx.createLinearGradient(0, -5, 0, 5);
        bladeGradient.addColorStop(0, '#aaaaaa');
        bladeGradient.addColorStop(0.5, '#cccccc');
        bladeGradient.addColorStop(1, '#888888');
        ctx.fillStyle = bladeGradient;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(18, -3);
        ctx.lineTo(22, 0);
        ctx.lineTo(18, 3);
        ctx.lineTo(0, 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, -4, 8, 8);

        ctx.restore();
      } else {
        ctx.fillStyle = '#777777';
        ctx.fillRect(weaponX, y + height / 2 - 3, 18, 6);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(weaponX - 5, y + height / 2 - 4, 5, 8);
      }
    } else if (!isFlying) {
      const gunX = facingRight ? x + width : x - 18;

      const gunGradient = ctx.createLinearGradient(gunX, y + height / 2 - 4, gunX, y + height / 2 + 4);
      gunGradient.addColorStop(0, '#666666');
      gunGradient.addColorStop(0.5, '#444444');
      gunGradient.addColorStop(1, '#222222');
      ctx.fillStyle = gunGradient;
      ctx.beginPath();
      ctx.roundRect(gunX, y + height / 2 - 4, 20, 8, 3);
      ctx.fill();

      ctx.fillStyle = '#333333';
      ctx.fillRect(gunX + (facingRight ? 16 : -6), y + height / 2 - 2, 8, 4);

      ctx.fillStyle = '#5a3a1a';
      ctx.beginPath();
      ctx.roundRect(gunX + (facingRight ? 14 : 2), y + height / 2 + 3, 6, 8, 2);
      ctx.fill();
    }

    // Полоска здоровья
    if (stats.health < stats.maxHealth) {
      const barWidth = width + 6;
      const barHeight = 6;
      const barX = x - 3;
      const barY = y - 12;

      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 3);
      ctx.fill();

      const healthPercent = stats.health / stats.maxHealth;
      const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
      healthGradient.addColorStop(0, '#ff4444');
      healthGradient.addColorStop(1, '#ff8888');
      ctx.fillStyle = healthGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * healthPercent, barHeight, 3);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 3);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }

  private renderBullets(bullets: Bullet[]): void {
    const ctx = this.ctx;

    for (const bullet of bullets) {
      if (!bullet.active) continue;

      const isPlayerBullet = bullet.fromPlayer;
      const baseColor = isPlayerBullet ? '#ffdd00' : '#ff4444';
      const glowColor = isPlayerBullet ? '#ffff88' : '#ff8888';
      const trailColor = isPlayerBullet ? 'rgba(255, 221, 0, 0.4)' : 'rgba(255, 68, 68, 0.4)';

      // След пули
      const trailLength = 25;
      const trailGradient = ctx.createLinearGradient(
        bullet.x - (bullet.vx > 0 ? trailLength : 0),
        bullet.y,
        bullet.x + (bullet.vx > 0 ? 0 : trailLength),
        bullet.y
      );
      trailGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      trailGradient.addColorStop(1, trailColor);
      ctx.fillStyle = trailGradient;

      if (Math.abs(bullet.vx) > Math.abs(bullet.vy)) {
        const startX = bullet.vx > 0 ? bullet.x - trailLength : bullet.x + bullet.width;
        ctx.fillRect(startX, bullet.y - 2, trailLength, bullet.height + 4);
      } else {
        const startY = bullet.vy > 0 ? bullet.y - trailLength : bullet.y + bullet.height;
        ctx.fillRect(bullet.x - 2, startY, bullet.width + 4, trailLength);
      }

      // Свечение
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 10;

      // Пуля с градиентом
      const bulletGradient = ctx.createRadialGradient(
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 0,
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width
      );
      bulletGradient.addColorStop(0, '#ffffff');
      bulletGradient.addColorStop(0.3, glowColor);
      bulletGradient.addColorStop(1, baseColor);
      ctx.fillStyle = bulletGradient;

      ctx.beginPath();
      ctx.roundRect(bullet.x, bullet.y, bullet.width, bullet.height, 3);
      ctx.fill();

      // Яркое ядро
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  private renderParticles(particles: Particle[]): void {
    const ctx = this.ctx;

    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      const size = p.size * (0.5 + alpha * 0.5);

      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;

      const particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      particleGradient.addColorStop(0, '#ffffff');
      particleGradient.addColorStop(0.3, p.color);
      particleGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = alpha;
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  }
}

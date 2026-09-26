// ============================================
// RENDERER - Отрисовка игрового мира
// ============================================

import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet, Particle, Platform, PlayerState, WeaponType, EnemyType } from './types';
import { LevelData, Pit, Door, PickupZone } from './Level';

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

    this.renderBackground(this.levelNumber);

    ctx.translate(-this.cameraX, -this.cameraY);

    this.renderLadders(level.ladders);
    this.renderPlatforms(level.platforms);
    
    if (level.pits) {
      this.renderPits(level.pits);
    }

    if (level.doors) {
      this.renderDoors(level.doors);
    }

    if (level.pickupZones) {
      this.renderPickupZones(level.pickupZones, enemies);
    }

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

  private renderBackground(levelNumber: number): void {
    const ctx = this.ctx;
    
    // Тюремный фон для первых 3 уровней
    if (levelNumber <= 3) {
      // Тёмно-серый тюремный фон
      const prisonGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      prisonGradient.addColorStop(0, '#1a1a1a');
      prisonGradient.addColorStop(0.5, '#2a2a2a');
      prisonGradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = prisonGradient;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Кирпичная текстура на фоне
      ctx.fillStyle = 'rgba(40, 40, 40, 0.5)';
      for (let y = 0; y < this.canvasHeight; y += 30) {
        for (let x = 0; x < this.canvasWidth; x += 60) {
          const offset = (Math.floor(y / 30) % 2) * 30;
          ctx.fillRect(x + offset, y, 58, 28);
        }
      }
      
      // Решётки на фоне (параллакс)
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.lineWidth = 3;
      for (let x = 100; x < this.canvasWidth; x += 200) {
        const parallaxX = x - this.cameraX * 0.1;
        ctx.beginPath();
        ctx.moveTo(parallaxX, 0);
        ctx.lineTo(parallaxX, this.canvasHeight);
        ctx.stroke();
      }
      
      // Тусклый свет сверху
      const lightGradient = ctx.createRadialGradient(
        this.canvasWidth / 2, 0, 0,
        this.canvasWidth / 2, 0, this.canvasHeight
      );
      lightGradient.addColorStop(0, 'rgba(100, 100, 80, 0.15)');
      lightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      return;
    }
    
    // Градиентный фон неба (для уровней 4-5)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(0.5, '#1a1a3a');
    skyGradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Звёзды (мерцающие)
    const time = Date.now() * 0.001;
    for (let i = 0; i < 80; i++) {
      const baseX = ((i * 137 + 50) % this.canvasWidth);
      const baseY = ((i * 97 + 30) % (this.canvasHeight * 0.6));
      const x = baseX - this.cameraX * 0.05;
      const y = baseY - this.cameraY * 0.05;
      const size = (i % 3) + 1;
      const twinkle = Math.sin(time + i) * 0.3 + 0.7;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Свечение для крупных звёзд
      if (size > 2) {
        ctx.fillStyle = `rgba(200, 200, 255, ${twinkle * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Дальние здания (параллакс слой 1 - самый дальний)
    ctx.fillStyle = 'rgba(15, 15, 40, 0.9)';
    for (let i = 0; i < 12; i++) {
      const bx = i * 200 - (this.cameraX * 0.2) % 200;
      const bh = 80 + (i * 37 % 120);
      const bw = 60 + (i * 23 % 40);
      
      // Основное здание
      ctx.fillRect(bx, this.canvasHeight - bh - 30, bw, bh);
      
      // Окна (светящиеся)
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      for (let wy = this.canvasHeight - bh - 20; wy < this.canvasHeight - 40; wy += 20) {
        for (let wx = bx + 10; wx < bx + bw - 10; wx += 15) {
          if (Math.random() > 0.3) { // Некоторые окна тёмные
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
      }
      ctx.fillStyle = 'rgba(15, 15, 40, 0.9)';
    }

    // Средние здания (параллакс слой 2)
    ctx.fillStyle = 'rgba(20, 20, 50, 0.95)';
    for (let i = 0; i < 8; i++) {
      const bx = i * 300 - (this.cameraX * 0.4) % 300;
      const bh = 120 + (i * 47 % 150);
      const bw = 80 + (i * 31 % 50);
      
      // Основное здание
      const buildingGradient = ctx.createLinearGradient(bx, this.canvasHeight - bh, bx, this.canvasHeight);
      buildingGradient.addColorStop(0, 'rgba(30, 30, 60, 0.95)');
      buildingGradient.addColorStop(1, 'rgba(10, 10, 30, 0.95)');
      ctx.fillStyle = buildingGradient;
      ctx.fillRect(bx, this.canvasHeight - bh - 20, bw, bh);
      
      // Крыша
      ctx.fillStyle = 'rgba(40, 40, 70, 0.95)';
      ctx.fillRect(bx - 5, this.canvasHeight - bh - 25, bw + 10, 8);
      
      // Окна (более яркие)
      for (let wy = this.canvasHeight - bh - 10; wy < this.canvasHeight - 30; wy += 25) {
        for (let wx = bx + 12; wx < bx + bw - 12; wx += 20) {
          const lit = Math.sin(time * 0.5 + i + wx * 0.01) > 0;
          if (lit) {
            ctx.fillStyle = 'rgba(255, 220, 150, 0.6)';
            ctx.fillRect(wx, wy, 8, 12);
            // Свечение
            ctx.fillStyle = 'rgba(255, 200, 100, 0.2)';
            ctx.fillRect(wx - 2, wy - 2, 12, 16);
          } else {
            ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
    }

    // Туман/дымка у земли
    const fogGradient = ctx.createLinearGradient(0, this.canvasHeight - 100, 0, this.canvasHeight);
    fogGradient.addColorStop(0, 'rgba(50, 50, 80, 0)');
    fogGradient.addColorStop(1, 'rgba(50, 50, 80, 0.3)');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);
  }

  private renderPlatforms(platforms: Platform[]): void {
    const ctx = this.ctx;

    for (const platform of platforms) {
      const { x, y, width, height } = platform.rect;

      if (platform.isPassThrough) {
        // Проходная платформа с эффектом свечения
        const glowGradient = ctx.createLinearGradient(x, y, x, y + height);
        glowGradient.addColorStop(0, 'rgba(68, 170, 255, 0.4)');
        glowGradient.addColorStop(1, 'rgba(68, 170, 255, 0.1)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x, y, width, height);
        
        // Пунктирная линия
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
        // Основная платформа с детализацией
        
        // Основной градиент
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#4a4a6c');
        gradient.addColorStop(0.3, '#3a3a5c');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Верхняя грань (более светлая)
        const topGradient = ctx.createLinearGradient(x, y, x, y + 5);
        topGradient.addColorStop(0, '#7a7aac');
        topGradient.addColorStop(1, '#5a5a8c');
        ctx.fillStyle = topGradient;
        ctx.fillRect(x, y, width, 4);
        
        // Текстура камней/кирпичей
        ctx.strokeStyle = 'rgba(80, 80, 120, 0.4)';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let ty = y + 10; ty < y + height; ty += 12) {
          ctx.beginPath();
          ctx.moveTo(x, ty);
          ctx.lineTo(x + width, ty);
          ctx.stroke();
        }
        
        // Вертикальные линии (со сдвигом для каждого ряда)
        let row = 0;
        for (let ty = y + 10; ty < y + height; ty += 12) {
          const offset = (row % 2) * 20;
          for (let tx = x + offset; tx < x + width; tx += 40) {
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx, ty + 12);
            ctx.stroke();
          }
          row++;
        }
        
        // Блики на верхней грани
        ctx.fillStyle = 'rgba(150, 150, 200, 0.3)';
        for (let tx = x + 10; tx < x + width - 10; tx += 30) {
          ctx.fillRect(tx, y + 1, 15, 2);
        }
        
        // Тени по бокам
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y + 4, 2, height - 4);
        ctx.fillRect(x + width - 2, y + 4, 2, height - 4);
        
        // Нижняя тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x, y + height - 3, width, 3);
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
      glowGradient.addColorStop(0, 'rgba(255, 200, 100, 0.1)');
      glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(ladder.x - 10, ladder.y, ladder.width + 20, ladder.height);
      
      // Боковые перекладины с градиентом
      const sideGradient = ctx.createLinearGradient(ladder.x, ladder.y, ladder.x + 4, ladder.y);
      sideGradient.addColorStop(0, '#6B3410');
      sideGradient.addColorStop(0.5, '#A0522D');
      sideGradient.addColorStop(1, '#8B4513');
      ctx.fillStyle = sideGradient;
      ctx.fillRect(ladder.x, ladder.y, 5, ladder.height);
      
      const sideGradient2 = ctx.createLinearGradient(ladder.x + ladder.width - 5, ladder.y, ladder.x + ladder.width, ladder.y);
      sideGradient2.addColorStop(0, '#8B4513');
      sideGradient2.addColorStop(0.5, '#A0522D');
      sideGradient2.addColorStop(1, '#6B3410');
      ctx.fillStyle = sideGradient2;
      ctx.fillRect(ladder.x + ladder.width - 5, ladder.y, 5, ladder.height);
      
      // Текстура дерева на боковых перекладинах
      ctx.strokeStyle = 'rgba(90, 50, 20, 0.5)';
      ctx.lineWidth = 1;
      for (let ly = ladder.y; ly < ladder.y + ladder.height; ly += 8) {
        ctx.beginPath();
        ctx.moveTo(ladder.x + 1, ly);
        ctx.lineTo(ladder.x + 4, ly + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ladder.x + ladder.width - 4, ly);
        ctx.lineTo(ladder.x + ladder.width - 1, ly + 2);
        ctx.stroke();
      }

      // Ступеньки с детализацией
      for (let ly = ladder.y + 15; ly < ladder.y + ladder.height; ly += 25) {
        // Основная ступенька
        const stepGradient = ctx.createLinearGradient(ladder.x, ly, ladder.x, ly + 5);
        stepGradient.addColorStop(0, '#B8734D');
        stepGradient.addColorStop(0.5, '#A0522D');
        stepGradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = stepGradient;
        ctx.fillRect(ladder.x + 5, ly, ladder.width - 10, 5);
        
        // Блик на ступеньке
        ctx.fillStyle = 'rgba(255, 220, 180, 0.4)';
        ctx.fillRect(ladder.x + 6, ly, ladder.width - 12, 2);
        
        // Тень под ступенькой
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(ladder.x + 5, ly + 4, ladder.width - 10, 2);
        
        // Гвозди/крепления
        ctx.fillStyle = '#555555';
        ctx.fillRect(ladder.x + 5, ly + 1, 2, 2);
        ctx.fillRect(ladder.x + ladder.width - 7, ly + 1, 2, 2);
      }
    }
  }

  private renderPits(pits: Pit[]): void {
    const ctx = this.ctx;
    
    for (const pit of pits) {
      // Тёмная бездна
      const pitGradient = ctx.createLinearGradient(pit.x, pit.y, pit.x, pit.y + pit.height);
      pitGradient.addColorStop(0, '#000000');
      pitGradient.addColorStop(0.5, '#1a0000');
      pitGradient.addColorStop(1, '#000000');
      ctx.fillStyle = pitGradient;
      ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
      
      // Красное свечение снизу (лава/опасность)
      const glowGradient = ctx.createRadialGradient(
        pit.x + pit.width / 2, pit.y + pit.height, 0,
        pit.x + pit.width / 2, pit.y + pit.height, pit.width / 2
      );
      glowGradient.addColorStop(0, 'rgba(255, 50, 0, 0.6)');
      glowGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(pit.x - 20, pit.y, pit.width + 40, pit.height + 30);
      
      // Пульсирующие языки пламени
      const time = Date.now() * 0.005;
      for (let i = 0; i < 5; i++) {
        const flameX = pit.x + (pit.width / 5) * i + 10;
        const flameHeight = 15 + Math.sin(time + i) * 8;
        
        const flameGradient = ctx.createLinearGradient(flameX, pit.y + pit.height, flameX, pit.y + pit.height - flameHeight);
        flameGradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        flameGradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.6)');
        flameGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        ctx.fillStyle = flameGradient;
        
        ctx.beginPath();
        ctx.moveTo(flameX, pit.y + pit.height);
        ctx.quadraticCurveTo(flameX + 5, pit.y + pit.height - flameHeight / 2, flameX + 3, pit.y + pit.height - flameHeight);
        ctx.quadraticCurveTo(flameX + 8, pit.y + pit.height - flameHeight / 2, flameX + 10, pit.y + pit.height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Опасные шипы по краям
      ctx.fillStyle = '#333333';
      for (let sx = pit.x; sx < pit.x + pit.width; sx += 15) {
        ctx.beginPath();
        ctx.moveTo(sx, pit.y);
        ctx.lineTo(sx + 7, pit.y - 8);
        ctx.lineTo(sx + 14, pit.y);
        ctx.closePath();
        ctx.fill();
      }
      
      // Предупреждающий знак
      ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠', pit.x + pit.width / 2, pit.y - 12);
    }
  }

  private renderDoors(doors: Door[]): void {
    const ctx = this.ctx;

    for (const door of doors) {
      // Дверь
      if (door.locked) {
        // Рама двери (только для закрытой двери)
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(door.x - 3, door.y - 3, door.width + 6, door.height + 6);
        
        // Закрытая дверь - тёмная
        const doorGradient = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y);
        doorGradient.addColorStop(0, '#2a1f18');
        doorGradient.addColorStop(0.5, '#3d2e22');
        doorGradient.addColorStop(1, '#2a1f18');
        ctx.fillStyle = doorGradient;
        ctx.fillRect(door.x, door.y, door.width, door.height);

        // Решётка на двери (адаптивная под размер)
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        // Вертикальные прутья
        for (let i = 1; i < 4; i++) {
          const barX = door.x + (door.width / 4) * i;
          ctx.beginPath();
          ctx.moveTo(barX, door.y);
          ctx.lineTo(barX, door.y + door.height);
          ctx.stroke();
        }
        // Горизонтальные прутья (адаптивные)
        const horizontalBars = Math.max(2, Math.floor(door.height / 15));
        for (let i = 1; i <= horizontalBars; i++) {
          const barY = door.y + (door.height / (horizontalBars + 1)) * i;
          ctx.beginPath();
          ctx.moveTo(door.x, barY);
          ctx.lineTo(door.x + door.width, barY);
          ctx.stroke();
        }

        // Замок (адаптивный)
        const lockSize = Math.min(door.width, door.height) * 0.2;
        ctx.fillStyle = '#888888';
        ctx.fillRect(door.x + door.width / 2 - lockSize / 2, door.y + door.height / 2 - lockSize, lockSize, lockSize * 1.5);
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(door.x + door.width / 2, door.y + door.height / 2 - lockSize / 2, lockSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Подсказка "Нажмите E"
        ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('[E]', door.x + door.width / 2, door.y - 8);
      }
      // Открытая дверь не рисуется вообще (проход свободен)
    }
  }

  private renderPickupZones(zones: PickupZone[], enemies: Enemy[]): void {
    const ctx = this.ctx;
    const time = Date.now() * 0.003;

    for (const zone of zones) {
      // Проверяем, должна ли зона быть видима
      if (zone.triggerOnKill && zone.enemyIndex !== undefined) {
        // Зона появляется только после убийства врага
        const enemy = enemies[zone.enemyIndex];
        if (!enemy || !enemy.isDead) {
          continue; // Пропускаем эту зону, враг ещё жив
        }
      }
      // Мигающая подсветка
      const alpha = (Math.sin(time) * 0.3 + 0.5);
      
      // Определяем цвет свечения в зависимости от типа предмета
      let glowColor = '255, 215, 0'; // Золотой по умолчанию
      if (zone.item.type === 'KEY') {
        glowColor = '192, 192, 192'; // Серебряный для ключа
      } else if (zone.item.type === 'LOCKPICK') {
        glowColor = '100, 200, 255'; // Голубой для отмычки
      }
      
      // Свечение
      const glowGradient = ctx.createRadialGradient(
        zone.x + zone.width / 2, zone.y + zone.height / 2, 0,
        zone.x + zone.width / 2, zone.y + zone.height / 2, zone.width
      );
      glowGradient.addColorStop(0, `rgba(${glowColor}, ${alpha * 0.4})`);
      glowGradient.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.fillRect(zone.x - 10, zone.y - 10, zone.width + 20, zone.height + 20);

      // Иконка предмета
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.item.icon, zone.x + zone.width / 2, zone.y + zone.height / 2 + 5);

      // Подсказка
      if (zone.triggerOnAttack) {
        ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.font = 'bold 9px Arial';
        ctx.fillText('[J] Ударить', zone.x + zone.width / 2, zone.y - 5);
      } else if (zone.item.type === 'KEY') {
        // Подсказка для ключа
        ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
        ctx.font = 'bold 9px Arial';
        ctx.fillText('Ключ', zone.x + zone.width / 2, zone.y - 5);
      }
    }
  }

  private renderExitDoor(door: { x: number; y: number; width: number; height: number }): void {
    const ctx = this.ctx;
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;

    // Внешнее свечение
    const outerGlow = ctx.createRadialGradient(
      door.x + door.width / 2, door.y + door.height / 2, 0,
      door.x + door.width / 2, door.y + door.height / 2, door.height
    );
    outerGlow.addColorStop(0, `rgba(170, 68, 255, ${pulse * 0.4})`);
    outerGlow.addColorStop(0.5, `rgba(170, 68, 255, ${pulse * 0.2})`);
    outerGlow.addColorStop(1, 'rgba(170, 68, 255, 0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(door.x - door.height / 2, door.y - door.height / 2, door.width + door.height, door.height * 2);

    // Рамка двери
    ctx.fillStyle = '#2a0055';
    ctx.fillRect(door.x - 3, door.y - 3, door.width + 6, door.height + 6);

    // Основная дверь с градиентом
    const gradient = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y + door.height);
    gradient.addColorStop(0, '#6a00cc');
    gradient.addColorStop(0.5, '#4a0088');
    gradient.addColorStop(1, '#220044');
    ctx.fillStyle = gradient;
    ctx.fillRect(door.x, door.y, door.width, door.height);

    // Внутреннее свечение (пульсирующее)
    const innerGlow = ctx.createRadialGradient(
      door.x + door.width / 2, door.y + door.height / 2, 0,
      door.x + door.width / 2, door.y + door.height / 2, door.width
    );
    innerGlow.addColorStop(0, `rgba(200, 100, 255, ${pulse * 0.6})`);
    innerGlow.addColorStop(0.5, `rgba(170, 68, 255, ${pulse * 0.3})`);
    innerGlow.addColorStop(1, 'rgba(100, 0, 200, 0)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(door.x, door.y, door.width, door.height);

    // Декоративные элементы
    ctx.strokeStyle = '#aa44ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x + 2, door.y + 2, door.width - 4, door.height - 4);
    
    // Углы
    ctx.fillStyle = '#cc66ff';
    ctx.fillRect(door.x, door.y, 4, 4);
    ctx.fillRect(door.x + door.width - 4, door.y, 4, 4);
    ctx.fillRect(door.x, door.y + door.height - 4, 4, 4);
    ctx.fillRect(door.x + door.width - 4, door.y + door.height - 4, 4, 4);

    // Символ портала (вращающийся)
    ctx.save();
    ctx.translate(door.x + door.width / 2, door.y + door.height / 2);
    ctx.rotate(Date.now() * 0.002);
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
    
    ctx.restore();

    // Текст "EXIT"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', door.x + door.width / 2, door.y - 8);
  }

  private renderPlayer(player: Player): void {
    const ctx = this.ctx;
    const { x, y, width, height, facingRight } = player;

    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Тень под персонажем
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height + 2, width / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Тело с градиентом и деталями (оранжевая роба заключённого)
    const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
    bodyGradient.addColorStop(0, '#ff9933');
    bodyGradient.addColorStop(0.5, '#ff7700');
    bodyGradient.addColorStop(1, '#cc5500');
    ctx.fillStyle = bodyGradient;
    
    // Основное тело с закруглёнными углами
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 10, width - 8, height - 14, 3);
    ctx.fill();
    
    // Детали робы (полосы)
    ctx.fillStyle = '#cc5500';
    ctx.fillRect(x + 6, y + 15, width - 12, 3);
    ctx.fillRect(x + 6, y + 25, width - 12, 2);
    
    // Номер заключённого на груди
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 6px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('#247', x + width / 2, y + 22);

    // Голова
    const headGradient = ctx.createRadialGradient(x + width / 2, y + 5, 2, x + width / 2, y + 5, 8);
    headGradient.addColorStop(0, '#ffcc99');
    headGradient.addColorStop(1, '#cc9966');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.roundRect(x + 5, y, width - 10, 14, 4);
    ctx.fill();
    
    // Волосы (короткая стрижка)
    ctx.fillStyle = '#332211';
    ctx.fillRect(x + 6, y + 1, width - 12, 4);

    // Глаза (обычные)
    ctx.fillStyle = '#ffffff';
    const eyeX = facingRight ? x + width - 12 : x + 6;
    ctx.fillRect(eyeX, y + 5, 5, 4);
    
    // Зрачки
    ctx.fillStyle = '#000000';
    const pupilX = facingRight ? eyeX + 2 : eyeX;
    ctx.fillRect(pupilX, y + 6, 2, 2);

    // Ноги с анимацией (штаны)
    const legGradient = ctx.createLinearGradient(x, y + height - 10, x, y + height);
    legGradient.addColorStop(0, '#554433');
    legGradient.addColorStop(1, '#332211');
    ctx.fillStyle = legGradient;
    
    if (player.fsm.getCurrentState() === PlayerState.RUN) {
      const legOffset = Math.sin(player.animFrame * Math.PI / 2) * 5;
      // Левая нога
      ctx.beginPath();
      ctx.roundRect(x + 5, y + height - 10, 7, 10 + legOffset, 2);
      ctx.fill();
      // Правая нога
      ctx.beginPath();
      ctx.roundRect(x + width - 12, y + height - 10, 7, 10 - legOffset, 2);
      ctx.fill();
    } else if (player.fsm.getCurrentState() === PlayerState.JUMP) {
      // Ноги согнуты в прыжке
      ctx.beginPath();
      ctx.roundRect(x + 5, y + height - 8, 7, 8, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width - 12, y + height - 8, 7, 8, 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(x + 5, y + height - 10, 7, 10, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width - 12, y + height - 10, 7, 10, 2);
      ctx.fill();
    }

    // Оружие
    if (player.currentWeapon === WeaponType.MELEE) {
      const weaponX = facingRight ? x + width : x - 25;
      
      if (player.hasBaton) {
        // Дубинка
        if (player.isAttacking) {
          const swingAngle = player.comboCount === 2 ? 0.5 : 0.3;
          ctx.save();
          ctx.translate(weaponX + 10, y + height / 2);
          ctx.rotate((facingRight ? 0.7 : -0.7) + swingAngle);
          
          // Дубинка
          const batonGradient = ctx.createLinearGradient(0, 0, 20, 0);
          batonGradient.addColorStop(0, '#4a3728');
          batonGradient.addColorStop(0.5, '#6b5240');
          batonGradient.addColorStop(1, '#4a3728');
          ctx.fillStyle = batonGradient;
          ctx.beginPath();
          ctx.roundRect(0, -3, 20, 6, 2);
          ctx.fill();
          
          // Рукоять
          ctx.fillStyle = '#2a1f18';
          ctx.fillRect(-6, -4, 6, 8);
          
          // Эффект удара
          if (player.comboCount === 2) {
            ctx.strokeStyle = 'rgba(255, 150, 0, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(10, 0, 10, 0, Math.PI);
            ctx.stroke();
          }
          
          ctx.restore();
        } else {
          // Дубинка в покое
          ctx.fillStyle = '#5a4a38';
          ctx.fillRect(weaponX, y + height / 2 - 2, 18, 4);
          ctx.fillStyle = '#3a2a18';
          ctx.fillRect(weaponX - 5, y + height / 2 - 3, 5, 6);
        }
      } else {
        // Кулаки
        if (player.isAttacking) {
          const punchOffset = player.comboCount === 2 ? 8 : 5;
          ctx.fillStyle = '#ffcc99';
          const fistX = facingRight ? x + width + punchOffset : x - punchOffset - 8;
          ctx.beginPath();
          ctx.roundRect(fistX, y + height / 2 - 5, 8, 10, 3);
          ctx.fill();
          
          // Эффект удара
          if (player.comboCount === 2) {
            ctx.strokeStyle = 'rgba(255, 200, 0, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(fistX + 4, y + height / 2, 8, 0, Math.PI);
            ctx.stroke();
          }
        }
      }
    } else {
      // Пистолет с деталями
      if (player.aimingUp) {
        // Прицеливание вверх - рисуем пистолет направленным вверх
        const gunCenterX = x + width / 2;
        const gunBaseY = y + 5;
        
        ctx.save();
        ctx.translate(gunCenterX, gunBaseY);
        
        // Корпус пистолета (вертикально)
        const gunGradient = ctx.createLinearGradient(-4, 0, 4, 0);
        gunGradient.addColorStop(0, '#777777');
        gunGradient.addColorStop(0.5, '#555555');
        gunGradient.addColorStop(1, '#333333');
        ctx.fillStyle = gunGradient;
        ctx.beginPath();
        ctx.roundRect(-4, -12, 8, 16, 2);
        ctx.fill();
        
        // Ствол (направлен вверх)
        ctx.fillStyle = '#444444';
        ctx.fillRect(-2, -18, 4, 6);
        
        // Рукоять
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.roundRect(-3, 2, 6, 5, 1);
        ctx.fill();
        
        ctx.restore();
      } else {
        // Горизонтальное положение пистолета
        const gunX = facingRight ? x + width - 2 : x - 14;
        
        // Корпус пистолета
        const gunGradient = ctx.createLinearGradient(gunX, y + height / 2 - 4, gunX, y + height / 2 + 4);
        gunGradient.addColorStop(0, '#777777');
        gunGradient.addColorStop(0.5, '#555555');
        gunGradient.addColorStop(1, '#333333');
        ctx.fillStyle = gunGradient;
        ctx.beginPath();
        ctx.roundRect(gunX, y + height / 2 - 4, 16, 8, 2);
        ctx.fill();
        
        // Ствол
        ctx.fillStyle = '#444444';
        ctx.fillRect(gunX + (facingRight ? 12 : -4), y + height / 2 - 2, 6, 4);
        
        // Рукоять
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.roundRect(gunX + (facingRight ? 10 : 2), y + height / 2 + 2, 5, 7, 1);
        ctx.fill();
        
        // Детали
        ctx.fillStyle = '#666666';
        ctx.fillRect(gunX + 2, y + height / 2 - 3, 3, 2);
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

    // Тень под врагом
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height + 2, width / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const isMelee = stats.type === EnemyType.MELEE;
    const isFlying = stats.type === EnemyType.FLYING;
    const mainColor = isMelee ? '#dd4444' : isFlying ? '#dd44dd' : '#4477dd';
    const darkColor = isMelee ? '#991111' : isFlying ? '#991199' : '#112299';
    const accentColor = isMelee ? '#ff6666' : isFlying ? '#ff66ff' : '#6699ff';

    // Тело с градиентом
    const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
    bodyGradient.addColorStop(0, accentColor);
    bodyGradient.addColorStop(0.3, mainColor);
    bodyGradient.addColorStop(1, darkColor);
    ctx.fillStyle = bodyGradient;
    
    // Основное тело с закруглёнными углами
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 8, width - 6, height - 12, 3);
    ctx.fill();
    
    // Детали брони/одежды
    ctx.fillStyle = darkColor;
    ctx.fillRect(x + 5, y + 12, width - 10, 2);
    ctx.fillRect(x + 5, y + 20, width - 10, 2);
    
    // Нагрудник
    ctx.fillStyle = isMelee ? '#661111' : '#111166';
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 14, width - 12, 10, 2);
    ctx.fill();

    // Голова
    const headGradient = ctx.createRadialGradient(x + width / 2, y + 4, 2, x + width / 2, y + 4, 8);
    headGradient.addColorStop(0, accentColor);
    headGradient.addColorStop(1, mainColor);
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.roundRect(x + 4, y, width - 8, 12, 3);
    ctx.fill();
    
    // Шлем/капюшон
    ctx.fillStyle = darkColor;
    ctx.fillRect(x + 5, y + 1, width - 10, 4);

    // Глаза (светящиеся, меняют цвет при атаке)
    const eyeColor = state === 'CHASE' || state === 'ATTACK' ? '#ff0000' : '#ffaa00';
    const eyeGlow = ctx.createRadialGradient(
      facingRight ? x + width - 10 : x + 10, y + 5, 0,
      facingRight ? x + width - 10 : x + 10, y + 5, 5
    );
    eyeGlow.addColorStop(0, '#ffffff');
    eyeGlow.addColorStop(0.4, eyeColor);
    eyeGlow.addColorStop(1, `rgba(${isMelee ? '255, 0, 0' : '255, 170, 0'}, 0)`);
    ctx.fillStyle = eyeGlow;
    ctx.fillRect(facingRight ? x + width - 13 : x + 7, y + 3, 6, 4);
    
    // Зрачки
    ctx.fillStyle = '#000000';
    const pupilX = facingRight ? x + width - 11 : x + 9;
    ctx.fillRect(pupilX, y + 4, 2, 2);

    // Ноги с анимацией
    const legGradient = ctx.createLinearGradient(x, y + height - 8, x, y + height);
    legGradient.addColorStop(0, darkColor);
    legGradient.addColorStop(1, '#000000');
    ctx.fillStyle = legGradient;
    
    if (state === 'CHASE' || state === 'PATROL') {
      const legOffset = Math.sin(enemy.animFrame * Math.PI / 2) * 4;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + height - 8, 6, 8 + legOffset, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width - 10, y + height - 8, 6, 8 - legOffset, 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(x + 4, y + height - 8, 6, 8, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width - 10, y + height - 8, 6, 8, 2);
      ctx.fill();
    }

    // Крылья для летающих врагов
    if (isFlying) {
      const wingFlap = Math.sin(enemy.animTimer * 10) * 0.3;
      ctx.save();
      
      // Левое крыло
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 10);
      ctx.quadraticCurveTo(x - 10, y + 5 + wingFlap * 10, x - 5, y + 20);
      ctx.quadraticCurveTo(x, y + 15, x + 5, y + 15);
      ctx.closePath();
      ctx.fill();
      
      // Правое крыло
      ctx.beginPath();
      ctx.moveTo(x + width - 5, y + 10);
      ctx.quadraticCurveTo(x + width + 10, y + 5 + wingFlap * 10, x + width + 5, y + 20);
      ctx.quadraticCurveTo(x + width, y + 15, x + width - 5, y + 15);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }

    // Оружие
    if (isMelee) {
      // Топор/меч
      const weaponX = facingRight ? x + width : x - 18;
      
      if (state === 'ATTACK') {
        // Анимация атаки
        ctx.save();
        ctx.translate(weaponX + 9, y + height / 2);
        ctx.rotate(facingRight ? 0.3 : -0.3);
        
        // Лезвие
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(15, -3);
        ctx.lineTo(18, 0);
        ctx.lineTo(15, 3);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();
        
        // Рукоять
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-6, -3, 6, 6);
        
        ctx.restore();
      } else {
        // Оружие в покое
        ctx.fillStyle = '#777777';
        ctx.fillRect(weaponX, y + height / 2 - 2, 16, 4);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(weaponX - 4, y + height / 2 - 3, 4, 6);
      }
    } else if (!isFlying) {
      // Винтовка/пистолет (только для наземных стрелков)
      const gunX = facingRight ? x + width : x - 16;
      
      // Корпус
      const gunGradient = ctx.createLinearGradient(gunX, y + height / 2 - 3, gunX, y + height / 2 + 3);
      gunGradient.addColorStop(0, '#666666');
      gunGradient.addColorStop(0.5, '#444444');
      gunGradient.addColorStop(1, '#222222');
      ctx.fillStyle = gunGradient;
      ctx.beginPath();
      ctx.roundRect(gunX, y + height / 2 - 3, 18, 6, 2);
      ctx.fill();
      
      // Ствол
      ctx.fillStyle = '#333333';
      ctx.fillRect(gunX + (facingRight ? 14 : -4), y + height / 2 - 1, 6, 3);
      
      // Приклад
      ctx.fillStyle = '#5a3a1a';
      ctx.beginPath();
      ctx.roundRect(gunX + (facingRight ? 12 : 2), y + height / 2 + 2, 5, 6, 1);
      ctx.fill();
      
      // Детали
      ctx.fillStyle = '#555555';
      ctx.fillRect(gunX + 2, y + height / 2 - 2, 2, 2);
    }

    // Полоска здоровья
    if (stats.health < stats.maxHealth) {
      const barWidth = width + 4;
      const barHeight = 5;
      const barX = x - 2;
      const barY = y - 10;
      
      // Фон полоски
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 2);
      ctx.fill();
      
      // Заполнение
      const healthPercent = stats.health / stats.maxHealth;
      const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
      healthGradient.addColorStop(0, '#ff4444');
      healthGradient.addColorStop(1, '#ff8888');
      ctx.fillStyle = healthGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * healthPercent, barHeight, 2);
      ctx.fill();
      
      // Рамка
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 2);
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
      const trailColor = isPlayerBullet ? 'rgba(255, 221, 0, 0.3)' : 'rgba(255, 68, 68, 0.3)';

      // След пули (длинный)
      ctx.save();
      const trailLength = 20;
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
        // Горизонтальная траектория
        const startX = bullet.vx > 0 ? bullet.x - trailLength : bullet.x + bullet.width;
        ctx.fillRect(startX, bullet.y - 1, trailLength, bullet.height + 2);
      } else {
        // Вертикальная траектория
        const startY = bullet.vy > 0 ? bullet.y - trailLength : bullet.y + bullet.height;
        ctx.fillRect(bullet.x - 1, startY, bullet.width + 2, trailLength);
      }
      ctx.restore();

      // Свечение вокруг пули
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 8;
      
      // Основная пуля с градиентом
      const bulletGradient = ctx.createRadialGradient(
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 0,
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width
      );
      bulletGradient.addColorStop(0, '#ffffff');
      bulletGradient.addColorStop(0.3, glowColor);
      bulletGradient.addColorStop(1, baseColor);
      ctx.fillStyle = bulletGradient;
      
      ctx.beginPath();
      ctx.roundRect(bullet.x, bullet.y, bullet.width, bullet.height, 2);
      ctx.fill();
      
      // Яркое ядро
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  private renderParticles(particles: Particle[]): void {
    const ctx = this.ctx;

    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      const size = p.size * (0.5 + alpha * 0.5); // Уменьшаются со временем
      
      // Свечение
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 5;
      
      // Основная частица с градиентом
      const particleGradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, size
      );
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

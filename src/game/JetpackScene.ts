// ============================================
// JETPACK SCENE - Мини-игра полёта на реактивном ранце
// ============================================

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  type: 'flying' | 'diving';
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class JetpackScene {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  
  // Позиция игрока
  private playerX: number;
  private playerY: number;
  private playerVY: number;
  
  // Высота полёта
  private altitude: number = 0;
  private targetAltitude: number = 2000; // Цель - 2000 метров
  
  // Враги
  private enemies: Enemy[] = [];
  private enemySpawnTimer: number = 0;
  
  // Пули игрока
  private bullets: Bullet[] = [];
  private shootTimer: number = 0;
  
  // Состояние игры
  private gameActive: boolean = true;
  private gameOver: boolean = false;
  private victory: boolean = false;
  
  // Время
  private elapsedTime: number = 0;
  
  // Фон (прокрутка)
  private backgroundOffset: number = 0;
  
  // Небоскрёб справа
  private buildingX: number;
  
  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Начальная позиция игрока (внизу по центру)
    this.playerX = canvasWidth / 2 - 100;
    this.playerY = canvasHeight - 150;
    this.playerVY = -2; // Лётит вверх
    
    // Небоскрёб справа
    this.buildingX = canvasWidth - 150;
    
    this.setupInput();
  }

  private setupInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.gameActive) return;
      
      // Движение влево/вправо
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.playerX = Math.max(50, this.playerX - 30);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.playerX = Math.min(this.buildingX - 50, this.playerX + 30);
      }
      
      // Стрельба
      if (e.code === 'Space' || e.code === 'KeyJ' || e.code === 'KeyZ') {
        this.shoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  private shoot(): void {
    if (this.shootTimer > 0) return;
    
    this.shootTimer = 0.2; // Задержка между выстрелами
    
    // Стреляем вверх
    this.bullets.push({
      x: this.playerX + 15,
      y: this.playerY,
      vx: 0,
      vy: -10
    });
  }

  update(dt: number): boolean {
    if (!this.gameActive) return this.gameOver || this.victory;
    
    this.elapsedTime += dt;
    
    // Обновляем таймеры
    this.shootTimer = Math.max(0, this.shootTimer - dt);
    this.enemySpawnTimer -= dt;
    
    // Игрок автоматически летит вверх
    this.playerY += this.playerVY;
    this.altitude += 20 * dt; // Скорость подъёма
    
    // Прокрутка фона
    this.backgroundOffset += 2;
    if (this.backgroundOffset > 100) {
      this.backgroundOffset = 0;
    }
    
    // Спавн врагов
    if (this.enemySpawnTimer <= 0) {
      this.spawnEnemy();
      this.enemySpawnTimer = 1.5 - Math.min(1, this.elapsedTime / 30); // Ускорение со временем
    }
    
    // Обновляем врагов
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.x += enemy.vx * dt * 60;
      enemy.y += enemy.vy * dt * 60;
      
      // Удаляем врагов, которые ушли за экран
      if (enemy.y > this.canvasHeight + 50 || enemy.y < -50 || 
          enemy.x < -50 || enemy.x > this.canvasWidth + 50) {
        this.enemies.splice(i, 1);
        continue;
      }
      
      // Проверяем столкновение с игроком
      if (this.checkCollision(enemy)) {
        this.gameOver = true;
        this.gameActive = false;
        return true;
      }
    }
    
    // Обновляем пули
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // Удаляем пули, которые ушли за экран
      if (bullet.y < -50) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Проверяем попадание во врагов
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (this.checkBulletCollision(bullet, enemy)) {
          enemy.health--;
          this.bullets.splice(i, 1);
          
          if (enemy.health <= 0) {
            this.enemies.splice(j, 1);
          }
          break;
        }
      }
    }
    
    // Проверяем победу (долетели до крыши)
    if (this.altitude >= this.targetAltitude) {
      this.victory = true;
      this.gameActive = false;
      return true;
    }
    
    return false;
  }

  private spawnEnemy(): void {
    const type = Math.random() > 0.5 ? 'flying' : 'diving';
    
    if (type === 'flying') {
      // Летит горизонтально
      const fromLeft = Math.random() > 0.5;
      this.enemies.push({
        x: fromLeft ? -30 : this.canvasWidth + 30,
        y: 100 + Math.random() * (this.canvasHeight - 300),
        vx: fromLeft ? 3 : -3,
        vy: 0,
        health: 2,
        type: 'flying'
      });
    } else {
      // Пикирует сверху
      this.enemies.push({
        x: 100 + Math.random() * (this.buildingX - 200),
        y: -30,
        vx: (Math.random() - 0.5) * 2,
        vy: 3 + Math.random() * 2,
        health: 1,
        type: 'diving'
      });
    }
  }

  private checkCollision(enemy: Enemy): boolean {
    const dx = Math.abs(this.playerX + 15 - enemy.x);
    const dy = Math.abs(this.playerY + 25 - enemy.y);
    return dx < 30 && dy < 30;
  }

  private checkBulletCollision(bullet: Bullet, enemy: Enemy): boolean {
    const dx = Math.abs(bullet.x - enemy.x);
    const dy = Math.abs(bullet.y - enemy.y);
    return dx < 20 && dy < 20;
  }

  render(): void {
    const ctx = this.ctx;
    
    // Фон - ночное небо
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(0.5, '#1a1a3a');
    skyGradient.addColorStop(1, '#2a2a4a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Звёзды (прокручиваются)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 137) % this.canvasWidth;
      const starY = ((i * 97 + this.backgroundOffset * 2) % this.canvasHeight);
      const starSize = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Небоскрёб справа (прокручивается вверх)
    this.renderBuilding();
    
    // Враги
    for (const enemy of this.enemies) {
      this.renderEnemy(enemy);
    }
    
    // Пули
    for (const bullet of this.bullets) {
      this.renderBullet(bullet);
    }
    
    // Игрок
    this.renderPlayer();
    
    // HUD
    this.renderHUD();
    
    // Game Over / Victory экран
    if (this.gameOver) {
      this.renderGameOver();
    } else if (this.victory) {
      this.renderVictory();
    }
  }

  private renderBuilding(): void {
    const ctx = this.ctx;
    const x = this.buildingX;
    
    // Основание здания
    const buildingGradient = ctx.createLinearGradient(x, 0, x + 150, 0);
    buildingGradient.addColorStop(0, '#2a2a3e');
    buildingGradient.addColorStop(0.5, '#3a3a4e');
    buildingGradient.addColorStop(1, '#2a2a3e');
    ctx.fillStyle = buildingGradient;
    ctx.fillRect(x, 0, 150, this.canvasHeight);
    
    // Окна (прокручиваются вверх)
    ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
    for (let y = -this.backgroundOffset; y < this.canvasHeight; y += 40) {
      for (let wx = x + 20; wx < x + 130; wx += 30) {
        ctx.fillRect(wx, y, 15, 20);
      }
    }
    
    // Крыша (появляется когда близко к цели)
    if (this.altitude > this.targetAltitude - 200) {
      const roofY = this.canvasHeight - (this.altitude - (this.targetAltitude - 200)) * 5;
      ctx.fillStyle = '#4a4a5e';
      ctx.fillRect(x - 10, roofY, 170, 20);
      
      // Антенна на крыше
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 75, roofY);
      ctx.lineTo(x + 75, roofY - 50);
      ctx.stroke();
      
      // Мигалка на антенне
      const flashColor = Math.sin(Date.now() * 0.01) > 0 ? '#ff0000' : '#000000';
      ctx.fillStyle = flashColor;
      ctx.beginPath();
      ctx.arc(x + 75, roofY - 50, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPlayer(): void {
    const ctx = this.ctx;
    const x = this.playerX;
    const y = this.playerY;
    
    // Тело героя (оранжевая роба)
    const robeGradient = ctx.createLinearGradient(x, y, x, y + 50);
    robeGradient.addColorStop(0, '#ff9933');
    robeGradient.addColorStop(1, '#cc5500');
    ctx.fillStyle = robeGradient;
    ctx.fillRect(x, y, 30, 50);
    
    // Полосы на робе
    ctx.fillStyle = '#cc5500';
    ctx.fillRect(x, y + 15, 30, 3);
    ctx.fillRect(x, y + 30, 30, 3);
    
    // Номер на робе
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('#247', x + 15, y + 25);
    
    // Голова
    const headGradient = ctx.createRadialGradient(x + 15, y - 10, 2, x + 15, y - 10, 15);
    headGradient.addColorStop(0, '#f4a460');
    headGradient.addColorStop(1, '#d2691e');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Волосы
    ctx.fillStyle = '#332211';
    ctx.beginPath();
    ctx.arc(x + 15, y - 15, 15, Math.PI, 0);
    ctx.fill();
    
    // Реактивный ранец на спине
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x - 10, y + 10, 15, 30);
    ctx.fillRect(x + 25, y + 10, 15, 30);
    
    // Сопла ранца
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 8, y + 40, 11, 10);
    ctx.fillRect(x + 27, y + 40, 11, 10);
    
    // Огонь из сопел
    const flameIntensity = 0.8 + Math.sin(Date.now() * 0.02) * 0.2;
    for (let i = 0; i < 3; i++) {
      const flameX1 = x - 3 + Math.random() * 5;
      const flameY1 = y + 50 + Math.random() * 20;
      const flameSize = 10 + Math.random() * 15;
      
      const flameGradient = ctx.createRadialGradient(flameX1, flameY1, 0, flameX1, flameY1, flameSize);
      flameGradient.addColorStop(0, `rgba(255, 255, 200, ${flameIntensity})`);
      flameGradient.addColorStop(0.3, `rgba(255, 200, 0, ${flameIntensity * 0.8})`);
      flameGradient.addColorStop(0.7, `rgba(255, 100, 0, ${flameIntensity * 0.5})`);
      flameGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.arc(flameX1, flameY1, flameSize, 0, Math.PI * 2);
      ctx.fill();
      
      const flameX2 = x + 32 + Math.random() * 5;
      const flameY2 = y + 50 + Math.random() * 20;
      
      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.arc(flameX2, flameY2, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderEnemy(enemy: Enemy): void {
    const ctx = this.ctx;
    const x = enemy.x;
    const y = enemy.y;
    
    // Тело врага (фиолетовый летающий)
    const bodyGradient = ctx.createRadialGradient(x, y, 5, x, y, 20);
    bodyGradient.addColorStop(0, '#ff66ff');
    bodyGradient.addColorStop(0.5, '#dd44dd');
    bodyGradient.addColorStop(1, '#991199');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Крылья
    const wingFlap = Math.sin(Date.now() * 0.01) * 0.3;
    ctx.fillStyle = '#ff66ff';
    
    // Левое крыло
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.quadraticCurveTo(x - 35, y - 10 + wingFlap * 20, x - 25, y + 15);
    ctx.quadraticCurveTo(x - 20, y + 10, x - 15, y + 5);
    ctx.closePath();
    ctx.fill();
    
    // Правое крыло
    ctx.beginPath();
    ctx.moveTo(x + 15, y);
    ctx.quadraticCurveTo(x + 35, y - 10 + wingFlap * 20, x + 25, y + 15);
    ctx.quadraticCurveTo(x + 20, y + 10, x + 15, y + 5);
    ctx.closePath();
    ctx.fill();
    
    // Светящиеся глаза
    const eyeColor = enemy.type === 'diving' ? '#ff0000' : '#ffaa00';
    const eyeGlow = ctx.createRadialGradient(x, y - 5, 0, x, y - 5, 8);
    eyeGlow.addColorStop(0, '#ffffff');
    eyeGlow.addColorStop(0.4, eyeColor);
    eyeGlow.addColorStop(1, `rgba(255, 170, 0, 0)`);
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(x, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Зрачки
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderBullet(bullet: Bullet): void {
    const ctx = this.ctx;
    
    // След пули
    const trailGradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + 20);
    trailGradient.addColorStop(0, 'rgba(255, 255, 0, 0.6)');
    trailGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    ctx.fillStyle = trailGradient;
    ctx.fillRect(bullet.x - 2, bullet.y, 4, 20);
    
    // Пуля с градиентом
    const bulletGradient = ctx.createRadialGradient(bullet.x, bullet.y, 1, bullet.x, bullet.y, 5);
    bulletGradient.addColorStop(0, '#ffffff');
    bulletGradient.addColorStop(0.3, '#ffff66');
    bulletGradient.addColorStop(1, '#ffcc00');
    ctx.fillStyle = bulletGradient;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Свечение
    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderHUD(): void {
    const ctx = this.ctx;
    
    // Индикатор высоты (слева)
    const barWidth = 30;
    const barHeight = this.canvasHeight - 100;
    const barX = 20;
    const barY = 50;
    
    // Фон
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6, 5);
    ctx.fill();
    
    // Прогресс высоты
    const altitudePercent = this.altitude / this.targetAltitude;
    const altitudeGradient = ctx.createLinearGradient(barX, barY + barHeight, barX, barY);
    altitudeGradient.addColorStop(0, '#00ff00');
    altitudeGradient.addColorStop(0.5, '#00cc00');
    altitudeGradient.addColorStop(1, '#00aa00');
    ctx.fillStyle = altitudeGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY + barHeight * (1 - altitudePercent), barWidth, barHeight * altitudePercent, 3);
    ctx.fill();
    
    // Рамка
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 3);
    ctx.stroke();
    
    // Текст высоты
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ВЫСОТА', barX + barWidth / 2, barY - 10);
    ctx.fillText(`${Math.floor(this.altitude)}m`, barX + barWidth / 2, barY + barHeight + 20);
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Подсказка управления
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(this.canvasWidth / 2 - 150, this.canvasHeight - 40, 300, 30, 5);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← → движение | SPACE стрельба', this.canvasWidth / 2, this.canvasHeight - 20);
  }

  private renderGameOver(): void {
    const ctx = this.ctx;
    
    // Затемнение
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Текст
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('ПАДЕНИЕ!', this.canvasWidth / 2, this.canvasHeight / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Враги сбили вас...', this.canvasWidth / 2, this.canvasHeight / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText(`Высота: ${Math.floor(this.altitude)}m`, this.canvasWidth / 2, this.canvasHeight / 2 + 50);
    
    ctx.shadowBlur = 0;
  }

  private renderVictory(): void {
    const ctx = this.ctx;
    
    // Затемнение
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Текст
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('ПОБЕДА!', this.canvasWidth / 2, this.canvasHeight / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Вы долетели до крыши!', this.canvasWidth / 2, this.canvasHeight / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText(`Время: ${this.elapsedTime.toFixed(1)}s`, this.canvasWidth / 2, this.canvasHeight / 2 + 50);
    
    ctx.shadowBlur = 0;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  isVictory(): boolean {
    return this.victory;
  }
}

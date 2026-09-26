// ============================================
// CHASE SCENE - Мини-игра погони на машине
// ============================================

export class ChaseScene {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  
  // Состояние игры
  private playerLane: number = 1; // 0, 1, 2 - три полосы
  private playerX: number;
  private playerY: number;
  private carHealth: number = 100;
  private maxCarHealth: number = 100;
  private score: number = 0;
  private speed: number = 5;
  private gameActive: boolean = true;
  private gameOver: boolean = false;
  
  // Объекты
  private obstacles: { lane: number; y: number; type: 'car' | 'truck' }[] = [];
  private policeCars: { lane: number; y: number; shootTimer: number }[] = [];
  private bullets: { x: number; y: number; vy: number }[] = [];
  
  // Таймеры
  private obstacleTimer: number = 0;
  private policeTimer: number = 0;
  private roadOffset: number = 0;
  
  // Время
  private lastTime: number = 0;
  private elapsedTime: number = 0;
  private minSurvivalTime: number = 20; // Минимальное время выживания в секундах

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Начальная позиция игрока
    this.playerX = this.canvasWidth / 2;
    this.playerY = this.canvasHeight - 150;
    
    // Начальные полицейские машины
    this.policeCars = [
      { lane: 0, y: this.canvasHeight - 50, shootTimer: 0 },
      { lane: 2, y: this.canvasHeight - 50, shootTimer: 0 },
    ];
    
    this.setupInput();
  }

  private setupInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.gameActive) return;
      
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (this.playerLane > 0) {
          this.playerLane--;
          this.updatePlayerPosition();
        }
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (this.playerLane < 2) {
          this.playerLane++;
          this.updatePlayerPosition();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  private updatePlayerPosition(): void {
    const laneWidth = this.canvasWidth / 3;
    this.playerX = laneWidth * this.playerLane + laneWidth / 2;
  }

  update(dt: number): boolean {
    if (!this.gameActive) return this.gameOver;
    
    this.lastTime = Date.now();
    this.elapsedTime += dt;
    
    // Увеличиваем скорость со временем
    this.speed = 5 + this.elapsedTime * 0.2;
    
    // Обновляем смещение дороги
    this.roadOffset = (this.roadOffset + this.speed) % 40;
    
    // Спавн препятствий
    this.obstacleTimer += dt;
    if (this.obstacleTimer > 1.5) {
      this.obstacleTimer = 0;
      const lane = Math.floor(Math.random() * 3);
      const type = Math.random() > 0.7 ? 'truck' : 'car';
      this.obstacles.push({ lane, y: -100, type });
    }
    
    // Спавн полицейских выстрелов
    this.policeTimer += dt;
    if (this.policeTimer > 2) {
      this.policeTimer = 0;
      for (const police of this.policeCars) {
        police.shootTimer += dt;
        if (police.shootTimer > 1.5) {
          police.shootTimer = 0;
          const laneWidth = this.canvasWidth / 3;
          const bulletX = laneWidth * police.lane + laneWidth / 2;
          this.bullets.push({ x: bulletX, y: police.y, vy: -8 });
        }
      }
    }
    
    // Обновляем препятствия
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].y += this.speed;
      
      // Проверяем столкновение
      if (this.checkCollision(this.obstacles[i])) {
        this.carHealth -= 30;
        this.obstacles.splice(i, 1);
        
        if (this.carHealth <= 0) {
          this.gameOver = true;
          this.gameActive = false;
          return true;
        }
      } else if (this.obstacles[i].y > this.canvasHeight) {
        this.obstacles.splice(i, 1);
        this.score += 10;
      }
    }
    
    // Обновляем пули
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].y += this.bullets[i].vy;
      
      // Проверяем попадание в игрока
      if (this.checkBulletCollision(this.bullets[i])) {
        this.carHealth -= 10;
        this.bullets.splice(i, 1);
        
        if (this.carHealth <= 0) {
          this.gameOver = true;
          this.gameActive = false;
          return true;
        }
      } else if (this.bullets[i].y < -50) {
        this.bullets.splice(i, 1);
      }
    }
    
    // Проверяем завершение мини-игры
    if (this.elapsedTime >= this.minSurvivalTime) {
      this.gameOver = true;
      this.gameActive = false;
      return true;
    }
    
    return false;
  }

  private checkCollision(obstacle: { lane: number; y: number; type: string }): boolean {
    const laneWidth = this.canvasWidth / 3;
    const obstacleX = laneWidth * obstacle.lane + laneWidth / 2;
    const obstacleWidth = obstacle.type === 'truck' ? 60 : 50;
    const obstacleHeight = obstacle.type === 'truck' ? 100 : 80;
    
    const dx = Math.abs(this.playerX - obstacleX);
    const dy = Math.abs(this.playerY - obstacle.y);
    
    return dx < (40 + obstacleWidth) / 2 && dy < (60 + obstacleHeight) / 2;
  }

  private checkBulletCollision(bullet: { x: number; y: number }): boolean {
    const dx = Math.abs(this.playerX - bullet.x);
    const dy = Math.abs(this.playerY - bullet.y);
    
    return dx < 30 && dy < 40;
  }

  render(): void {
    const ctx = this.ctx;
    
    // Фон - ночная дорога
    const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Дорога
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Разметка дороги
    const laneWidth = this.canvasWidth / 3;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    
    // Линии между полосами
    ctx.lineDashOffset = -this.roadOffset;
    ctx.beginPath();
    ctx.moveTo(laneWidth, 0);
    ctx.lineTo(laneWidth, this.canvasHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(laneWidth * 2, 0);
    ctx.lineTo(laneWidth * 2, this.canvasHeight);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Обочины
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 20, this.canvasHeight);
    ctx.fillRect(this.canvasWidth - 20, 0, 20, this.canvasHeight);
    
    // Препятствия
    for (const obstacle of this.obstacles) {
      this.renderObstacle(obstacle);
    }
    
    // Полицейские машины
    for (const police of this.policeCars) {
      this.renderPoliceCar(police);
    }
    
    // Пули
    for (const bullet of this.bullets) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Свечение
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Машина игрока
    this.renderPlayerCar();
    
    // HUD
    this.renderHUD();
    
    // Game Over экран
    if (this.gameOver) {
      this.renderGameOver();
    }
  }

  private renderObstacle(obstacle: { lane: number; y: number; type: string }): void {
    const ctx = this.ctx;
    const laneWidth = this.canvasWidth / 3;
    const x = laneWidth * obstacle.lane + laneWidth / 2;
    const y = obstacle.y;
    
    if (obstacle.type === 'truck') {
      // Грузовик
      const truckGradient = ctx.createLinearGradient(x - 30, y - 50, x + 30, y + 50);
      truckGradient.addColorStop(0, '#4a4a4a');
      truckGradient.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = truckGradient;
      ctx.fillRect(x - 30, y - 50, 60, 100);
      
      // Кабина
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x - 25, y - 50, 50, 30);
      
      // Окна
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(x - 20, y - 45, 40, 20);
    } else {
      // Легковая машина
      const carGradient = ctx.createLinearGradient(x - 25, y - 40, x + 25, y + 40);
      carGradient.addColorStop(0, '#5a5a5a');
      carGradient.addColorStop(1, '#3a3a3a');
      ctx.fillStyle = carGradient;
      ctx.fillRect(x - 25, y - 40, 50, 80);
      
      // Крыша
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(x - 20, y - 30, 40, 30);
      
      // Окна
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(x - 15, y - 25, 30, 20);
    }
    
    // Фары (задние)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x - 20, y + 35, 10, 5);
    ctx.fillRect(x + 10, y + 35, 10, 5);
  }

  private renderPoliceCar(police: { lane: number; y: number; shootTimer: number }): void {
    const ctx = this.ctx;
    const laneWidth = this.canvasWidth / 3;
    const x = laneWidth * police.lane + laneWidth / 2;
    const y = police.y;
    
    // Кузов
    const carGradient = ctx.createLinearGradient(x - 25, y - 40, x + 25, y + 40);
    carGradient.addColorStop(0, '#1a1a2e');
    carGradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = carGradient;
    ctx.fillRect(x - 25, y - 40, 50, 80);
    
    // Крыша
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(x - 20, y - 30, 40, 30);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x - 15, y - 25, 30, 20);
    
    // Мигалки
    const flashColor = Math.sin(Date.now() * 0.01) > 0 ? '#ff0000' : '#0000ff';
    ctx.fillStyle = flashColor;
    ctx.fillRect(x - 15, y - 35, 10, 8);
    ctx.fillRect(x + 5, y - 35, 10, 8);
    
    // Свечение мигалок
    ctx.fillStyle = flashColor === '#ff0000' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x - 10, y - 31, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, y - 31, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderPlayerCar(): void {
    const ctx = this.ctx;
    const x = this.playerX;
    const y = this.playerY;
    
    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 45, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Кузов
    const carGradient = ctx.createLinearGradient(x - 25, y - 40, x + 25, y + 40);
    carGradient.addColorStop(0, '#2a2a4e');
    carGradient.addColorStop(0.5, '#1a1a2e');
    carGradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = carGradient;
    ctx.fillRect(x - 25, y - 40, 50, 80);
    
    // Крыша
    ctx.fillStyle = '#3a3a5e';
    ctx.fillRect(x - 20, y - 30, 40, 30);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x - 15, y - 25, 30, 20);
    
    // Фары (передние)
    ctx.fillStyle = '#ffff99';
    ctx.fillRect(x - 20, y - 40, 10, 5);
    ctx.fillRect(x + 10, y - 40, 10, 5);
    
    // Свечение фар
    ctx.fillStyle = 'rgba(255, 255, 150, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 40);
    ctx.lineTo(x - 25, y - 80);
    ctx.lineTo(x - 5, y - 80);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 40);
    ctx.lineTo(x + 25, y - 80);
    ctx.lineTo(x + 5, y - 80);
    ctx.closePath();
    ctx.fill();
  }

  private renderHUD(): void {
    const ctx = this.ctx;
    
    // Полоска здоровья машины
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;
    const barY = 20;
    
    // Фон
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Полоска
    const healthPercent = this.carHealth / this.maxCarHealth;
    const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    
    if (healthPercent > 0.5) {
      healthGradient.addColorStop(0, '#00ff00');
      healthGradient.addColorStop(1, '#00aa00');
    } else if (healthPercent > 0.25) {
      healthGradient.addColorStop(0, '#ffff00');
      healthGradient.addColorStop(1, '#ffaa00');
    } else {
      healthGradient.addColorStop(0, '#ff0000');
      healthGradient.addColorStop(1, '#aa0000');
    }
    
    ctx.fillStyle = healthGradient;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Рамка
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Текст
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Машина: ${Math.ceil(this.carHealth)}%`, barX, barY + barHeight + 20);
    
    // Счёт
    ctx.fillText(`Очки: ${this.score}`, barX, barY + barHeight + 40);
    
    // Время
    const timeLeft = Math.max(0, this.minSurvivalTime - this.elapsedTime);
    ctx.fillText(`Время: ${timeLeft.toFixed(1)}s`, barX, barY + barHeight + 60);
    
    // Подсказка управления
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← → или A/D для перестроения', this.canvasWidth / 2, this.canvasHeight - 20);
  }

  private renderGameOver(): void {
    const ctx = this.ctx;
    
    // Затемнение
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Текст
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    if (this.elapsedTime >= this.minSurvivalTime) {
      ctx.fillText('ПОБЕГ!', this.canvasWidth / 2, this.canvasHeight / 2 - 50);
      ctx.font = '24px Arial';
      ctx.fillText('Машина взорвалась...', this.canvasWidth / 2, this.canvasHeight / 2);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('АВАРИЯ!', this.canvasWidth / 2, this.canvasHeight / 2 - 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText('Машина уничтожена', this.canvasWidth / 2, this.canvasHeight / 2);
    }
    
    ctx.font = '18px Arial';
    ctx.fillText(`Очки: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2 + 50);
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  isVictory(): boolean {
    return this.elapsedTime >= this.minSurvivalTime;
  }
}

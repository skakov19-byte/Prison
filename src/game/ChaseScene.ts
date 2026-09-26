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
    
    // Спавн препятствий (каждую секунду, только на полосах 0, 1, 2)
    this.obstacleTimer += dt;
    if (this.obstacleTimer > 1.0) {
      this.obstacleTimer = 0;
      // Спавним 1-2 машины на разных полосах
      const numObstacles = Math.random() > 0.5 ? 2 : 1;
      const usedLanes: number[] = [];
      
      for (let i = 0; i < numObstacles; i++) {
        let lane: number;
        do {
          lane = Math.floor(Math.random() * 3);
        } while (usedLanes.includes(lane));
        usedLanes.push(lane);
        
        const type = Math.random() > 0.7 ? 'truck' : 'car';
        this.obstacles.push({ lane, y: -100 - i * 150, type });
      }
    }
    
    // Спавн полицейских выстрелов (каждые 1.5 секунды)
    this.policeTimer += dt;
    if (this.policeTimer > 1.5) {
      this.policeTimer = 0;
      for (const police of this.policeCars) {
        const laneWidth = this.canvasWidth / 3;
        const bulletX = laneWidth * police.lane + laneWidth / 2;
        // Стреляют 3 пулями веером
        this.bullets.push({ x: bulletX, y: police.y - 50, vy: -10 });
        this.bullets.push({ x: bulletX - 15, y: police.y - 50, vy: -10 });
        this.bullets.push({ x: bulletX + 15, y: police.y - 50, vy: -10 });
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
    const time = Date.now() * 0.001;
    
    // Фон - ночная дорога
    const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(0.5, '#151535');
    bgGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Звёзды
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 137) % this.canvasWidth;
      const starY = (i * 97) % (this.canvasHeight * 0.3);
      const starSize = (i % 3) + 1;
      const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Дорога с градиентом
    const roadGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    roadGradient.addColorStop(0, '#2a2a2a');
    roadGradient.addColorStop(0.5, '#333333');
    roadGradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = roadGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Текстура дороги
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 20; i++) {
      const spotX = (i * 137 + time * 100) % this.canvasWidth;
      const spotY = (i * 97 + time * 200) % this.canvasHeight;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
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
    
    // Обочины с градиентом
    const shoulderGradient = ctx.createLinearGradient(0, 0, 20, 0);
    shoulderGradient.addColorStop(0, '#3a3a3a');
    shoulderGradient.addColorStop(1, '#4a4a4a');
    ctx.fillStyle = shoulderGradient;
    ctx.fillRect(0, 0, 20, this.canvasHeight);
    
    const shoulderGradient2 = ctx.createLinearGradient(this.canvasWidth - 20, 0, this.canvasWidth, 0);
    shoulderGradient2.addColorStop(0, '#4a4a4a');
    shoulderGradient2.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = shoulderGradient2;
    ctx.fillRect(this.canvasWidth - 20, 0, 20, this.canvasHeight);
    
    // Пыль от машин
    ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    for (let i = 0; i < 15; i++) {
      const dustX = (i * 137 + time * 50) % this.canvasWidth;
      const dustY = this.canvasHeight - 50 + Math.sin(time + i) * 20;
      ctx.beginPath();
      ctx.arc(dustX, dustY, 3 + Math.sin(time + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Препятствия
    for (const obstacle of this.obstacles) {
      this.renderObstacle(obstacle);
    }
    
    // Полицейские машины
    for (const police of this.policeCars) {
      this.renderPoliceCar(police);
    }
    
    // Пули с деталями
    for (const bullet of this.bullets) {
      // След пули
      const trailGradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + 20);
      trailGradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
      trailGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = trailGradient;
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 20);
      
      // Пуля с градиентом
      const bulletGradient = ctx.createRadialGradient(bullet.x, bullet.y, 1, bullet.x, bullet.y, 5);
      bulletGradient.addColorStop(0, '#ffffff');
      bulletGradient.addColorStop(0.3, '#ff6666');
      bulletGradient.addColorStop(1, '#ff0000');
      ctx.fillStyle = bulletGradient;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Свечение
      ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Машина игрока
    this.renderPlayerCar();
    
    // HUD
    this.renderHUD();
    
    // Виньетка
    const vignetteGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.3,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.7
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
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
    
    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + (obstacle.type === 'truck' ? 55 : 45), 
                obstacle.type === 'truck' ? 35 : 30, 
                obstacle.type === 'truck' ? 12 : 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    if (obstacle.type === 'truck') {
      // Грузовик с деталями
      const truckGradient = ctx.createLinearGradient(x - 30, y - 50, x + 30, y + 50);
      truckGradient.addColorStop(0, '#5a5a5a');
      truckGradient.addColorStop(0.5, '#4a4a4a');
      truckGradient.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = truckGradient;
      ctx.beginPath();
      ctx.roundRect(x - 30, y - 50, 60, 100, 4);
      ctx.fill();
      
      // Блик на кузове
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x - 28, y - 48, 8, 96);
      
      // Кабина с градиентом
      const cabGradient = ctx.createLinearGradient(x - 25, y - 50, x + 25, y - 50);
      cabGradient.addColorStop(0, '#3a3a3a');
      cabGradient.addColorStop(0.5, '#4a4a4a');
      cabGradient.addColorStop(1, '#3a3a3a');
      ctx.fillStyle = cabGradient;
      ctx.beginPath();
      ctx.roundRect(x - 25, y - 50, 50, 30, 3);
      ctx.fill();
      
      // Окна с градиентом
      const windowGradient = ctx.createLinearGradient(x - 20, y - 45, x - 20, y - 25);
      windowGradient.addColorStop(0, '#a0d8ef');
      windowGradient.addColorStop(1, '#6ba5d7');
      ctx.fillStyle = windowGradient;
      ctx.beginPath();
      ctx.roundRect(x - 20, y - 45, 40, 20, 2);
      ctx.fill();
      
      // Блик на окне
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x - 18, y - 43, 10, 16);
    } else {
      // Легковая машина с деталями
      const carGradient = ctx.createLinearGradient(x - 25, y - 40, x + 25, y + 40);
      carGradient.addColorStop(0, '#6a6a6a');
      carGradient.addColorStop(0.5, '#5a5a5a');
      carGradient.addColorStop(1, '#3a3a3a');
      ctx.fillStyle = carGradient;
      ctx.beginPath();
      ctx.roundRect(x - 25, y - 40, 50, 80, 5);
      ctx.fill();
      
      // Блик на кузове
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x - 23, y - 38, 8, 76);
      
      // Крыша с градиентом
      const roofGradient = ctx.createLinearGradient(x - 20, y - 30, x + 20, y - 30);
      roofGradient.addColorStop(0, '#4a4a4a');
      roofGradient.addColorStop(0.5, '#5a5a5a');
      roofGradient.addColorStop(1, '#4a4a4a');
      ctx.fillStyle = roofGradient;
      ctx.beginPath();
      ctx.roundRect(x - 20, y - 30, 40, 30, 3);
      ctx.fill();
      
      // Окна с градиентом
      const windowGradient = ctx.createLinearGradient(x - 15, y - 25, x - 15, y - 5);
      windowGradient.addColorStop(0, '#a0d8ef');
      windowGradient.addColorStop(1, '#6ba5d7');
      ctx.fillStyle = windowGradient;
      ctx.beginPath();
      ctx.roundRect(x - 15, y - 25, 30, 20, 2);
      ctx.fill();
      
      // Блик на окне
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x - 13, y - 23, 8, 16);
    }
    
    // Задние фонари с деталями
    const taillightGradient = ctx.createRadialGradient(x - 15, y + 37, 1, x - 15, y + 37, 5);
    taillightGradient.addColorStop(0, '#ff6666');
    taillightGradient.addColorStop(0.5, '#ff0000');
    taillightGradient.addColorStop(1, '#cc0000');
    ctx.fillStyle = taillightGradient;
    ctx.beginPath();
    ctx.arc(x - 15, y + 37, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = taillightGradient;
    ctx.beginPath();
    ctx.arc(x + 15, y + 37, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Свечение задних фонарей
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x - 15, y + 37, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 15, y + 37, 10, 0, Math.PI * 2);
    ctx.fill();
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
    
    // Тень с размытием
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x, y + 48, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Кузов с градиентом и объёмом
    const carGradient = ctx.createLinearGradient(x - 25, y - 40, x + 25, y + 40);
    carGradient.addColorStop(0, '#3a3a5e');
    carGradient.addColorStop(0.3, '#2a2a4e');
    carGradient.addColorStop(0.7, '#1a1a2e');
    carGradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = carGradient;
    
    // Кузов с закруглёнными углами
    ctx.beginPath();
    ctx.roundRect(x - 25, y - 40, 50, 80, 5);
    ctx.fill();
    
    // Блик на кузове
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x - 23, y - 38, 10, 76);
    
    // Крыша с градиентом
    const roofGradient = ctx.createLinearGradient(x - 20, y - 30, x + 20, y - 30);
    roofGradient.addColorStop(0, '#2a2a4e');
    roofGradient.addColorStop(0.5, '#4a4a6e');
    roofGradient.addColorStop(1, '#2a2a4e');
    ctx.fillStyle = roofGradient;
    ctx.beginPath();
    ctx.roundRect(x - 20, y - 30, 40, 30, 3);
    ctx.fill();
    
    // Окна с градиентом
    const windowGradient = ctx.createLinearGradient(x - 15, y - 25, x - 15, y - 5);
    windowGradient.addColorStop(0, '#a0d8ef');
    windowGradient.addColorStop(0.5, '#87ceeb');
    windowGradient.addColorStop(1, '#6ba5d7');
    ctx.fillStyle = windowGradient;
    ctx.beginPath();
    ctx.roundRect(x - 15, y - 25, 30, 20, 2);
    ctx.fill();
    
    // Блик на окне
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 23);
    ctx.lineTo(x - 5, y - 23);
    ctx.lineTo(x - 8, y - 15);
    ctx.lineTo(x - 12, y - 15);
    ctx.closePath();
    ctx.fill();
    
    // Фары (передние) с деталями
    const headlightGradient = ctx.createRadialGradient(x - 15, y - 38, 2, x - 15, y - 38, 6);
    headlightGradient.addColorStop(0, '#ffffff');
    headlightGradient.addColorStop(0.5, '#ffff99');
    headlightGradient.addColorStop(1, '#ffcc00');
    ctx.fillStyle = headlightGradient;
    ctx.beginPath();
    ctx.arc(x - 15, y - 38, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = headlightGradient;
    ctx.beginPath();
    ctx.arc(x + 15, y - 38, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Свечение фар с конусами
    const beamGradient = ctx.createLinearGradient(x - 15, y - 40, x - 15, y - 100);
    beamGradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    beamGradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
    ctx.fillStyle = beamGradient;
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 40);
    ctx.lineTo(x - 35, y - 100);
    ctx.lineTo(x + 5, y - 100);
    ctx.lineTo(x - 10, y - 40);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = beamGradient;
    ctx.beginPath();
    ctx.moveTo(x + 20, y - 40);
    ctx.lineTo(x + 35, y - 100);
    ctx.lineTo(x - 5, y - 100);
    ctx.lineTo(x + 10, y - 40);
    ctx.closePath();
    ctx.fill();
    
    // Задние фонари
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x - 18, y + 38, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 18, y + 38, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Свечение задних фонарей
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x - 18, y + 38, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 18, y + 38, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderHUD(): void {
    const ctx = this.ctx;
    
    // Полоска здоровья машины (верхний левый угол)
    const barWidth = 200;
    const barHeight = 25;
    const barX = 20;
    const barY = 20;
    
    // Фон с градиентом
    const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    bgGradient.addColorStop(1, 'rgba(20, 20, 20, 0.8)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6, 5);
    ctx.fill();
    
    // Полоска с градиентом
    const healthPercent = this.carHealth / this.maxCarHealth;
    const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
    
    if (healthPercent > 0.5) {
      healthGradient.addColorStop(0, '#00ff00');
      healthGradient.addColorStop(0.5, '#00cc00');
      healthGradient.addColorStop(1, '#00aa00');
    } else if (healthPercent > 0.25) {
      healthGradient.addColorStop(0, '#ffff00');
      healthGradient.addColorStop(0.5, '#ffcc00');
      healthGradient.addColorStop(1, '#ffaa00');
    } else {
      healthGradient.addColorStop(0, '#ff0000');
      healthGradient.addColorStop(0.5, '#cc0000');
      healthGradient.addColorStop(1, '#aa0000');
    }
    
    ctx.fillStyle = healthGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * healthPercent, barHeight, 3);
    ctx.fill();
    
    // Блик на полоске
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 3);
    
    // Рамка с тенью
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 3);
    ctx.stroke();
    
    // Текст с тенью
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🚗 Машина: ${Math.ceil(this.carHealth)}%`, barX, barY + barHeight + 25);
    
    // Счёт
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`⭐ Очки: ${this.score}`, barX, barY + barHeight + 50);
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Большой таймер в верхнем правом углу
    const timeLeft = Math.max(0, this.minSurvivalTime - this.elapsedTime);
    const timerX = this.canvasWidth - 150;
    const timerY = 20;
    
    // Фон таймера
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(timerX - 10, timerY - 10, 140, 80, 10);
    ctx.fill();
    
    // Рамка таймера
    ctx.strokeStyle = timeLeft < 5 ? '#ff0000' : '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(timerX - 10, timerY - 10, 140, 80, 10);
    ctx.stroke();
    
    // Текст таймера
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ВРЕМЯ', timerX + 60, timerY + 15);
    
    ctx.fillStyle = timeLeft < 5 ? '#ff0000' : '#00ffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`${timeLeft.toFixed(1)}`, timerX + 60, timerY + 55);
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Подсказка управления с фоном
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(this.canvasWidth / 2 - 120, this.canvasHeight - 40, 240, 30, 5);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px Arial';
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

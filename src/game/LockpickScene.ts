// ============================================
// LOCKPICK SCENE - Мини-игра с отмычкой
// ============================================

export class LockpickScene {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  
  // Состояние игры
  private markerPosition: number = 0; // Позиция риски (0-1)
  private markerDirection: number = 1; // Направление движения (1 или -1)
  private markerSpeed: number = 0.8; // Скорость движения риски
  private successCount: number = 0; // Количество успешных попаданий
  private requiredSuccesses: number = 3; // Требуется попаданий
  
  // Зелёная зона
  private greenZoneStart: number = 0.3; // Начало зелёной зоны (0-1)
  private greenZoneWidth: number = 0.2; // Ширина зелёной зоны (0-1)
  
  // Визуальные эффекты
  private flashTimer: number = 0;
  private flashColor: string = '';
  private shakeTimer: number = 0;
  
  // Состояние
  private gameActive: boolean = true;
  private gameOver: boolean = false;
  private victory: boolean = false;
  
  // Время
  private elapsedTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    this.setupInput();
  }

  private setupInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.gameActive) return;
      
      if (e.code === 'KeyP') {
        this.checkHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  private checkHit(): void {
    // Проверяем, находится ли риска в зелёной зоне
    const markerX = this.markerPosition;
    const inZone = markerX >= this.greenZoneStart && markerX <= this.greenZoneStart + this.greenZoneWidth;
    
    if (inZone) {
      // Успех!
      this.successCount++;
      this.flashTimer = 0.3;
      this.flashColor = '#00ff00';
      
      if (this.successCount >= this.requiredSuccesses) {
        // Победа!
        this.victory = true;
        this.gameActive = false;
      } else {
        // Перемещаем зелёную зону
        this.randomizeGreenZone();
        // Увеличиваем скорость
        this.markerSpeed += 0.15;
      }
    } else {
      // Провал!
      this.flashTimer = 0.3;
      this.flashColor = '#ff0000';
      this.shakeTimer = 0.2;
      // Сбрасываем прогресс
      this.successCount = 0;
      // Перемещаем зелёную зону
      this.randomizeGreenZone();
    }
  }

  private randomizeGreenZone(): void {
    // Случайная позиция зелёной зоны (от 0.1 до 0.7)
    this.greenZoneStart = 0.1 + Math.random() * 0.6;
    // Случайная ширина (от 0.15 до 0.25)
    this.greenZoneWidth = 0.15 + Math.random() * 0.1;
  }

  update(dt: number): boolean {
    if (!this.gameActive) return this.victory;
    
    this.elapsedTime += dt;
    
    // Обновляем таймеры эффектов
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }
    
    // Двигаем риску
    this.markerPosition += this.markerDirection * this.markerSpeed * dt;
    
    // Отскок от границ
    if (this.markerPosition >= 1) {
      this.markerPosition = 1;
      this.markerDirection = -1;
    } else if (this.markerPosition <= 0) {
      this.markerPosition = 0;
      this.markerDirection = 1;
    }
    
    return false;
  }

  render(): void {
    const ctx = this.ctx;
    
    // Фон
    const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Эффект тряски
    let offsetX = 0;
    if (this.shakeTimer > 0) {
      offsetX = Math.sin(this.shakeTimer * 50) * 5;
    }
    
    ctx.save();
    ctx.translate(offsetX, 0);
    
    // Заголовок
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('ВЗЛОМ ЗАМКА', this.canvasWidth / 2, 80);
    ctx.shadowBlur = 0;
    
    // Подзаголовок
    ctx.font = '18px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Нажмите P когда риска в зелёной зоне', this.canvasWidth / 2, 120);
    
    // Полоса-шкала
    const barX = 100;
    const barY = 250;
    const barWidth = this.canvasWidth - 200;
    const barHeight = 60;
    
    // Фон шкалы
    const barGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    barGradient.addColorStop(0, '#2a2a3e');
    barGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = barGradient;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Рамка шкалы
    ctx.strokeStyle = '#4a4a5e';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Зелёная зона
    const greenX = barX + this.greenZoneStart * barWidth;
    const greenWidth = this.greenZoneWidth * barWidth;
    
    const greenGradient = ctx.createLinearGradient(greenX, barY, greenX, barY + barHeight);
    greenGradient.addColorStop(0, 'rgba(0, 255, 0, 0.4)');
    greenGradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.6)');
    greenGradient.addColorStop(1, 'rgba(0, 255, 0, 0.4)');
    ctx.fillStyle = greenGradient;
    ctx.fillRect(greenX, barY, greenWidth, barHeight);
    
    // Рамка зелёной зоны
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(greenX, barY, greenWidth, barHeight);
    
    // Риска
    const markerX = barX + this.markerPosition * barWidth;
    const markerWidth = 8;
    
    const markerGradient = ctx.createLinearGradient(markerX - markerWidth / 2, barY, markerX + markerWidth / 2, barY);
    markerGradient.addColorStop(0, '#ff0000');
    markerGradient.addColorStop(0.5, '#ff6666');
    markerGradient.addColorStop(1, '#ff0000');
    ctx.fillStyle = markerGradient;
    ctx.fillRect(markerX - markerWidth / 2, barY - 10, markerWidth, barHeight + 20);
    
    // Свечение риски
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.fillRect(markerX - markerWidth / 2, barY - 10, markerWidth, barHeight + 20);
    ctx.shadowBlur = 0;
    
    // Индикатор прогресса
    const progressY = 350;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Успехи: ${this.successCount} / ${this.requiredSuccesses}`, this.canvasWidth / 2, progressY);
    
    // Кружки прогресса
    const circleY = progressY + 40;
    const circleSpacing = 60;
    const startX = this.canvasWidth / 2 - ((this.requiredSuccesses - 1) * circleSpacing) / 2;
    
    for (let i = 0; i < this.requiredSuccesses; i++) {
      const circleX = startX + i * circleSpacing;
      
      if (i < this.successCount) {
        // Заполненный кружок
        const filledGradient = ctx.createRadialGradient(circleX, circleY, 5, circleX, circleY, 20);
        filledGradient.addColorStop(0, '#00ff00');
        filledGradient.addColorStop(1, '#00aa00');
        ctx.fillStyle = filledGradient;
      } else {
        // Пустой кружок
        ctx.fillStyle = '#3a3a4e';
      }
      
      ctx.beginPath();
      ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Рамка
      ctx.strokeStyle = i < this.successCount ? '#00ff00' : '#5a5a6e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Подсказка управления
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(this.canvasWidth / 2 - 150, this.canvasHeight - 80, 300, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('P - остановить риску', this.canvasWidth / 2, this.canvasHeight - 55);
    
    // Эффект вспышки
    if (this.flashTimer > 0) {
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashTimer / 0.3 * 0.3;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
    
    // Экран победы
    if (this.victory) {
      this.renderVictory();
    }
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
    ctx.fillText('ЗАМОК ВЗЛОМАН!', this.canvasWidth / 2, this.canvasHeight / 2 - 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Дверь открыта', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
    
    ctx.shadowBlur = 0;
  }

  isVictory(): boolean {
    return this.victory;
  }
}

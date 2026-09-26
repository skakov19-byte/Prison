// ============================================
// INTRO SCENE - Вступительный ролик
// ============================================

export type IntroScene = 'capitol' | 'apartment' | 'prison' | 'none';

export interface IntroState {
  currentScene: IntroScene;
  sceneTimer: number;
  textAlpha: number;
  animationProgress: number;
}

export class IntroRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private state: IntroState;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.state = {
      currentScene: 'capitol',
      sceneTimer: 0,
      textAlpha: 0,
      animationProgress: 0,
    };
  }

  start(): void {
    this.state.currentScene = 'capitol';
    this.state.sceneTimer = 0;
    this.state.textAlpha = 0;
    this.state.animationProgress = 0;
  }

  update(dt: number): boolean {
    this.state.sceneTimer += dt;
    this.state.animationProgress += dt;

    // Анимация текста (появление и исчезновение)
    if (this.state.sceneTimer < 1) {
      this.state.textAlpha = this.state.sceneTimer;
    } else if (this.state.sceneTimer > 7) {
      this.state.textAlpha = Math.max(0, 8 - this.state.sceneTimer);
    } else {
      this.state.textAlpha = 1;
    }

    // Переход между сценами
    if (this.state.sceneTimer > 8) {
      if (this.state.currentScene === 'capitol') {
        this.state.currentScene = 'apartment';
        this.state.sceneTimer = 0;
        return false;
      } else if (this.state.currentScene === 'apartment') {
        this.state.currentScene = 'prison';
        this.state.sceneTimer = 0;
        return false;
      } else if (this.state.currentScene === 'prison') {
        if (this.state.sceneTimer > 8) {
          return true; // Интро завершено
        }
      }
    }

    return false;
  }

  render(): void {
    const ctx = this.ctx;
    ctx.save();

    // Очистка
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    switch (this.state.currentScene) {
      case 'capitol':
        this.renderCapitolScene();
        break;
      case 'apartment':
        this.renderApartmentScene();
        break;
      case 'prison':
        this.renderPrisonScene();
        break;
    }

    ctx.restore();
  }

  private renderCapitolScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Небо (закат)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#ff6b35');
    skyGradient.addColorStop(0.5, '#f7931e');
    skyGradient.addColorStop(1, '#ffd700');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight * 0.6);

    // Капитолий на заднем плане
    ctx.fillStyle = '#e8e8e8';
    // Купол
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, 250, 80, Math.PI, 0);
    ctx.fill();
    // Здание
    ctx.fillRect(this.canvasWidth / 2 - 150, 250, 300, 150);
    // Колонны
    ctx.fillStyle = '#d0d0d0';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(this.canvasWidth / 2 - 140 + i * 40, 280, 15, 120);
    }

    // Трибуны
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(100, 400, 200, 100);
    ctx.fillRect(this.canvasWidth - 300, 400, 200, 100);

    // Мэр на трибуне
    const mayorX = this.canvasWidth / 2;
    const mayorY = 380;
    
    // Тело мэра
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(mayorX - 15, mayorY, 30, 50);
    
    // Голова мэра
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(mayorX, mayorY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Анимация выстрела (после 4 секунд)
    if (time > 4 && time < 5) {
      // Вспышка выстрела
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(mayorX + 20, mayorY + 20, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Мэр падает
      ctx.save();
      ctx.translate(mayorX, mayorY + 25);
      ctx.rotate((time - 4) * 0.5);
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-15, 0, 30, 50);
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(0, -10, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (time >= 5) {
      // Мэр лежит
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(mayorX - 25, mayorY + 40, 50, 30);
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(mayorX - 25, mayorY + 55, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Толпа (силуэты)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let i = 0; i < 20; i++) {
      const x = 50 + i * 30;
      const y = 500 + Math.sin(i) * 10;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 10, y, 20, 30);
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    if (time < 4) {
      ctx.fillText('Вашингтон, Капитолий', this.canvasWidth / 2, 100);
      ctx.font = '18px Arial';
      ctx.fillText('Мэр выступает с речью...', this.canvasWidth / 2, 140);
    } else if (time < 6) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('ВЫСТРЕЛ!', this.canvasWidth / 2, 100);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('Мэр убит...', this.canvasWidth / 2, 100);
    }
    
    ctx.globalAlpha = 1;
  }

  private renderApartmentScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Комната (вид изнутри)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Стены
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, this.canvasWidth, 100); // Потолок
    ctx.fillRect(0, 0, 100, this.canvasHeight); // Левая стена
    ctx.fillRect(this.canvasWidth - 100, 0, 100, this.canvasHeight); // Правая стена

    // Пол
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, this.canvasHeight - 150, this.canvasWidth, 150);

    // Окно
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(150, 150, 200, 150);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(150, 150, 200, 150);
    ctx.beginPath();
    ctx.moveTo(250, 150);
    ctx.lineTo(250, 300);
    ctx.moveTo(150, 225);
    ctx.lineTo(350, 225);
    ctx.stroke();

    // Мебель
    ctx.fillStyle = '#654321';
    ctx.fillRect(450, 350, 150, 100); // Стол
    ctx.fillRect(450, 450, 20, 50); // Ножка стола
    ctx.fillRect(580, 450, 20, 50); // Ножка стола

    // Главный герой (сначала стоит)
    const heroX = 400;
    const heroY = 400;
    
    ctx.fillStyle = '#ff7700'; // Оранжевая роба
    ctx.fillRect(heroX - 15, heroY, 30, 50);
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Полицейские (появляются после 2 секунд)
    if (time > 2) {
      const copAlpha = Math.min(1, (time - 2) / 1);
      ctx.globalAlpha = copAlpha;
      
      // Полицейский 1
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(600, 380, 35, 60);
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(617, 370, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(602, 355, 30, 10); // Кепка
      
      // Полицейский 2
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(650, 380, 35, 60);
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(667, 370, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(652, 355, 30, 10); // Кепка
      
      ctx.globalAlpha = 1;
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    
    if (time < 3) {
      ctx.fillText('Квартира главного героя', this.canvasWidth / 2, 80);
    } else if (time < 6) {
      ctx.fillText('Полиция: "Вы обвиняетесь в убийстве мэра!"', this.canvasWidth / 2, 80);
      ctx.font = '16px Arial';
      ctx.fillText('Вас задерживают и увозят...', this.canvasWidth / 2, 120);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('Арестован...', this.canvasWidth / 2, 80);
    }
    
    ctx.globalAlpha = 1;
  }

  private renderPrisonScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Тюремная камера
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Стены
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, this.canvasWidth, 80); // Потолок
    ctx.fillRect(0, 0, 80, this.canvasHeight); // Левая стена
    ctx.fillRect(this.canvasWidth - 80, 0, 80, this.canvasHeight); // Правая стена

    // Пол
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);

    // Решётка на двери (справа)
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 8;
    const doorX = this.canvasWidth - 150;
    const doorY = 200;
    
    // Вертикальные прутья
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(doorX + i * 20, doorY);
      ctx.lineTo(doorX + i * 20, doorY + 300);
      ctx.stroke();
    }
    
    // Горизонтальные прутья
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(doorX, doorY + i * 50);
      ctx.lineTo(doorX + 80, doorY + i * 50);
      ctx.stroke();
    }

    // Главный герой (входит после 1 секунды)
    let heroX = 200;
    const heroY = 450;
    
    if (time > 1 && time < 3) {
      heroX = 200 + (time - 1) * 100; // Движение к центру
    } else if (time >= 3) {
      heroX = 400; // Остановился
    }

    // Тело героя
    ctx.fillStyle = '#ff7700'; // Оранжевая роба
    ctx.fillRect(heroX - 15, heroY, 30, 50);
    
    // Голова
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Анимация закрытия двери (после 4 секунд)
    if (time > 4) {
      const doorCloseProgress = Math.min(1, (time - 4) / 2);
      ctx.fillStyle = `rgba(42, 42, 42, ${doorCloseProgress})`;
      ctx.fillRect(doorX, doorY, 80, 300);
      
      // Звук захлопывания (визуальный эффект)
      if (time > 4 && time < 4.5) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(doorX + 40, doorY + 150, 30 + (time - 4) * 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    if (time < 3) {
      ctx.fillText('Тюрьма строгого режима', this.canvasWidth / 2, 60);
      ctx.font = '18px Arial';
      ctx.fillText('Вас приводят в камеру...', this.canvasWidth / 2, 100);
    } else if (time < 5) {
      ctx.fillText('Дверь захлопывается...', this.canvasWidth / 2, 60);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('ПОБЕГ НАЧИНАЕТСЯ', this.canvasWidth / 2, 60);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Найдите способ выбраться...', this.canvasWidth / 2, 100);
    }
    
    ctx.globalAlpha = 1;
  }
}

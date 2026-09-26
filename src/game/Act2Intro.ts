// ============================================
// ACT 2 INTRO - Ролик начала второго акта
// ============================================

export type Act2Scene = 'escape' | 'chase' | 'crash' | 'none';

export interface Act2IntroState {
  currentScene: Act2Scene;
  sceneTimer: number;
  textAlpha: number;
  animationProgress: number;
}

export class Act2IntroRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private state: Act2IntroState;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.state = {
      currentScene: 'escape',
      sceneTimer: 0,
      textAlpha: 0,
      animationProgress: 0,
    };
  }

  start(): void {
    this.state.currentScene = 'escape';
    this.state.sceneTimer = 0;
    this.state.textAlpha = 0;
    this.state.animationProgress = 0;
  }

  update(dt: number): boolean {
    this.state.sceneTimer += dt;
    this.state.animationProgress += dt;

    // Анимация текста
    if (this.state.sceneTimer < 1) {
      this.state.textAlpha = this.state.sceneTimer;
    } else if (this.state.sceneTimer > 7) {
      this.state.textAlpha = Math.max(0, 8 - this.state.sceneTimer);
    } else {
      this.state.textAlpha = 1;
    }

    // Переход между сценами
    if (this.state.sceneTimer > 8) {
      if (this.state.currentScene === 'escape') {
        this.state.currentScene = 'chase';
        this.state.sceneTimer = 0;
        return false;
      } else if (this.state.currentScene === 'chase') {
        this.state.currentScene = 'crash';
        this.state.sceneTimer = 0;
        return false;
      } else if (this.state.currentScene === 'crash') {
        if (this.state.sceneTimer > 8) {
          return true; // Ролик завершён
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
      case 'escape':
        this.renderEscapeScene();
        break;
      case 'chase':
        this.renderChaseScene();
        break;
      case 'crash':
        this.renderCrashScene();
        break;
    }

    ctx.restore();
  }

  private renderEscapeScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Ночное небо
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Тюрьма на заднем плане
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(50, 200, 300, 400);
    
    // Окна тюрьмы
    ctx.fillStyle = '#ffaa00';
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 8; j++) {
        ctx.fillRect(70 + i * 50, 220 + j * 45, 20, 25);
      }
    }

    // Дверь тюрьмы
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(150, 450, 100, 150);

    // Дорога
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 600, this.canvasWidth, 100);
    
    // Разметка дороги
    ctx.fillStyle = '#ffff00';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(i * 100, 645, 50, 5);
    }

    // Полицейская машина
    const carX = 400 + time * 50;
    const carY = 580;
    
    // Кузов машины
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(carX, carY, 120, 40);
    
    // Крыша
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(carX + 20, carY - 20, 80, 20);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(carX + 25, carY - 15, 30, 15);
    ctx.fillRect(carX + 65, carY - 15, 30, 15);
    
    // Колёса
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(carX + 25, carY + 40, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carX + 95, carY + 40, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Мигалки
    const flashColor = Math.sin(time * 10) > 0 ? '#ff0000' : '#0000ff';
    ctx.fillStyle = flashColor;
    ctx.fillRect(carX + 40, carY - 25, 15, 8);
    ctx.fillRect(carX + 65, carY - 25, 15, 8);

    // Герой в машине (силуэт)
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(carX + 35, carY - 10, 20, 15);

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    if (time < 4) {
      ctx.fillText('Побег из тюрьмы', this.canvasWidth / 2, 100);
      ctx.font = '18px Arial';
      ctx.fillText('Герой садится в полицейскую машину...', this.canvasWidth / 2, 140);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('ПОГОНЯ НАЧИНАЕТСЯ!', this.canvasWidth / 2, 100);
    }
    
    ctx.globalAlpha = 1;
  }

  private renderChaseScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Вид сверху - дорога
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Разметка дороги (движется)
    ctx.fillStyle = '#ffff00';
    const offset = (time * 200) % 100;
    for (let i = -1; i < 10; i++) {
      ctx.fillRect(this.canvasWidth / 2 - 25, i * 100 - offset, 50, 50);
    }

    // Обочины
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, 100, this.canvasHeight);
    ctx.fillRect(this.canvasWidth - 100, 0, 100, this.canvasHeight);

    // Наша машина (в центре)
    const ourCarX = this.canvasWidth / 2 - 40;
    const ourCarY = this.canvasHeight / 2;
    
    // Кузов
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(ourCarX, ourCarY, 80, 120);
    
    // Крыша
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(ourCarX + 10, ourCarY + 20, 60, 80);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(ourCarX + 15, ourCarY + 25, 50, 30);
    ctx.fillRect(ourCarX + 15, ourCarY + 65, 50, 30);
    
    // Мигалки
    const flashColor = Math.sin(time * 10) > 0 ? '#ff0000' : '#0000ff';
    ctx.fillStyle = flashColor;
    ctx.fillRect(ourCarX + 20, ourCarY + 5, 15, 10);
    ctx.fillRect(ourCarX + 45, ourCarY + 5, 15, 10);

    // Преследующие машины (сзади)
    for (let i = 0; i < 2; i++) {
      const chaseCarX = this.canvasWidth / 2 - 40 + (i - 0.5) * 150;
      const chaseCarY = ourCarY + 200 + i * 50;
      
      // Кузов
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(chaseCarX, chaseCarY, 80, 120);
      
      // Крыша
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(chaseCarX + 10, chaseCarY + 20, 60, 80);
      
      // Окна
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(chaseCarX + 15, chaseCarY + 25, 50, 30);
      ctx.fillRect(chaseCarX + 15, chaseCarY + 65, 50, 30);
      
      // Мигалки
      ctx.fillStyle = flashColor;
      ctx.fillRect(chaseCarX + 20, chaseCarY + 5, 15, 10);
      ctx.fillRect(chaseCarX + 45, chaseCarY + 5, 15, 10);
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ПОГОНЯ!', this.canvasWidth / 2, 100);
    ctx.font = '18px Arial';
    ctx.fillText('Полицейские машины преследуют героя...', this.canvasWidth / 2, 140);
    ctx.globalAlpha = 1;
  }

  private renderCrashScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Ночной пейзаж
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Дорога
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 500, this.canvasWidth, 200);

    if (time < 3) {
      // Машина едет и начинает гореть
      const carX = 200 + time * 100;
      const carY = 480;
      
      // Кузов
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(carX, carY, 120, 40);
      
      // Крыша
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(carX + 20, carY - 20, 80, 20);
      
      // Огонь
      const fireIntensity = Math.min(1, time / 2);
      for (let i = 0; i < 10; i++) {
        const flameX = carX + Math.random() * 120;
        const flameY = carY - Math.random() * 50;
        const flameSize = 10 + Math.random() * 20;
        
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${fireIntensity})`;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (time < 5) {
      // Машина врезается
      const crashProgress = (time - 3) / 2;
      const carX = 500 + crashProgress * 100;
      const carY = 480;
      
      // Разбитая машина
      ctx.fillStyle = '#1a1a2e';
      ctx.save();
      ctx.translate(carX + 60, carY + 20);
      ctx.rotate(crashProgress * 0.5);
      ctx.fillRect(-60, -20, 120, 40);
      ctx.restore();
      
      // Большой огонь
      for (let i = 0; i < 20; i++) {
        const flameX = carX + Math.random() * 150;
        const flameY = carY - Math.random() * 80;
        const flameSize = 15 + Math.random() * 30;
        
        ctx.fillStyle = `rgba(255, ${50 + Math.random() * 100}, 0, 0.8)`;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Дым
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      for (let i = 0; i < 10; i++) {
        const smokeX = carX + Math.random() * 200;
        const smokeY = carY - 100 - Math.random() * 100;
        const smokeSize = 30 + Math.random() * 50;
        
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Герой выходит из машины
      const carX = 600;
      const carY = 480;
      
      // Разбитая горящая машина
      ctx.fillStyle = '#1a1a2e';
      ctx.save();
      ctx.translate(carX + 60, carY + 20);
      ctx.rotate(0.5);
      ctx.fillRect(-60, -20, 120, 40);
      ctx.restore();
      
      // Огонь
      for (let i = 0; i < 15; i++) {
        const flameX = carX + Math.random() * 150;
        const flameY = carY - Math.random() * 80;
        const flameSize = 15 + Math.random() * 25;
        
        ctx.fillStyle = `rgba(255, ${50 + Math.random() * 100}, 0, 0.7)`;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Герой выходит
      const heroX = carX - 50 - (time - 5) * 30;
      const heroY = 450;
      
      // Тело (оранжевая роба)
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(heroX, heroY, 30, 50);
      
      // Голова
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(heroX + 15, heroY - 10, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    
    if (time < 4) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('АВАРИЯ!', this.canvasWidth / 2, 100);
    } else {
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('АКТ 2', this.canvasWidth / 2, 100);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('ПО ПУТИ ВОЗМЕЗДИЯ', this.canvasWidth / 2, 140);
    }
    
    ctx.globalAlpha = 1;
  }
}

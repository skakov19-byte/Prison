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

    // Ночной пейзаж с детализацией
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(0.5, '#151535');
    skyGradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Звёзды
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 137) % this.canvasWidth;
      const starY = (i * 97) % (this.canvasHeight * 0.4);
      const starSize = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Дорога (детализированная)
    const roadGradient = ctx.createLinearGradient(0, 500, 0, 700);
    roadGradient.addColorStop(0, '#2a2a2a');
    roadGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = roadGradient;
    ctx.fillRect(0, 500, this.canvasWidth, 200);
    
    // Разметка дороги
    ctx.fillStyle = '#ffff00';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(i * 100 + 20, 595, 60, 5);
    }
    
    // Обочина
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 490, this.canvasWidth, 10);
    ctx.fillRect(0, 690, this.canvasWidth, 10);

    if (time < 3) {
      // Машина едет и начинает гореть (детализированная)
      const carX = 200 + time * 100;
      const carY = 480;
      
      // Тень машины
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(carX + 60, carY + 45, 70, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Кузов машины (с градиентом)
      const carGradient = ctx.createLinearGradient(carX, carY, carX, carY + 40);
      carGradient.addColorStop(0, '#2a2a4e');
      carGradient.addColorStop(0.5, '#1a1a2e');
      carGradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = carGradient;
      ctx.fillRect(carX, carY, 120, 40);
      
      // Крыша
      const roofGradient = ctx.createLinearGradient(carX + 20, carY - 20, carX + 20, carY);
      roofGradient.addColorStop(0, '#3a3a5e');
      roofGradient.addColorStop(1, '#2a2a3e');
      ctx.fillStyle = roofGradient;
      ctx.fillRect(carX + 20, carY - 20, 80, 20);
      
      // Окна
      ctx.fillStyle = '#4a90d9';
      ctx.fillRect(carX + 25, carY - 15, 30, 12);
      ctx.fillRect(carX + 65, carY - 15, 30, 12);
      
      // Колёса
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(carX + 25, carY + 40, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(carX + 95, carY + 40, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Диски
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(carX + 25, carY + 40, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(carX + 95, carY + 40, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Огонь на машине (детализированный)
      const fireIntensity = Math.min(1, time / 2);
      
      // Огонь на крыше
      for (let i = 0; i < 8; i++) {
        const flameX = carX + 30 + Math.random() * 60;
        const flameY = carY - 20 - Math.random() * 30;
        const flameSize = 8 + Math.random() * 15;
        
        const flameGradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
        flameGradient.addColorStop(0, `rgba(255, 255, 200, ${fireIntensity})`);
        flameGradient.addColorStop(0.3, `rgba(255, 200, 0, ${fireIntensity * 0.8})`);
        flameGradient.addColorStop(0.7, `rgba(255, 100, 0, ${fireIntensity * 0.5})`);
        flameGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Огонь на кузове
      for (let i = 0; i < 6; i++) {
        const flameX = carX + 10 + Math.random() * 100;
        const flameY = carY + Math.random() * 30;
        const flameSize = 6 + Math.random() * 12;
        
        const flameGradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
        flameGradient.addColorStop(0, `rgba(255, 200, 0, ${fireIntensity * 0.7})`);
        flameGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Дым
      ctx.fillStyle = `rgba(80, 80, 80, ${fireIntensity * 0.4})`;
      for (let i = 0; i < 5; i++) {
        const smokeX = carX + 20 + Math.random() * 80;
        const smokeY = carY - 50 - Math.random() * 50;
        const smokeSize = 15 + Math.random() * 25;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (time < 5) {
      // Машина врезается (детализированная авария)
      const crashProgress = (time - 3) / 2;
      const carX = 500 + crashProgress * 100;
      const carY = 480;
      
      // Тень разбитой машины
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(carX + 60, carY + 45, 80, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Разбитая машина (повёрнутая)
      ctx.save();
      ctx.translate(carX + 60, carY + 20);
      ctx.rotate(crashProgress * 0.5);
      
      // Кузов (помятый)
      const carGradient = ctx.createLinearGradient(-60, -20, -60, 20);
      carGradient.addColorStop(0, '#2a2a4e');
      carGradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = carGradient;
      ctx.fillRect(-60, -20, 120, 40);
      
      // Вмятины
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(-20, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(30, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Разбитые окна
      ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
      ctx.fillRect(-35, -15, 25, 10);
      ctx.fillRect(5, -15, 25, 10);
      
      // Трещины на окнах
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-30, -10);
      ctx.lineTo(-15, -15);
      ctx.moveTo(-25, -12);
      ctx.lineTo(-20, -5);
      ctx.stroke();
      
      ctx.restore();
      
      // Большой огонь (детализированный)
      for (let i = 0; i < 25; i++) {
        const flameX = carX + Math.random() * 150;
        const flameY = carY - Math.random() * 100;
        const flameSize = 15 + Math.random() * 35;
        
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
      
      // Дым (густой)
      for (let i = 0; i < 15; i++) {
        const smokeX = carX + Math.random() * 200;
        const smokeY = carY - 100 - Math.random() * 150;
        const smokeSize = 30 + Math.random() * 60;
        
        const smokeGradient = ctx.createRadialGradient(smokeX, smokeY, 0, smokeX, smokeY, smokeSize);
        smokeGradient.addColorStop(0, 'rgba(60, 60, 60, 0.6)');
        smokeGradient.addColorStop(1, 'rgba(40, 40, 40, 0)');
        ctx.fillStyle = smokeGradient;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Осколки
      ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
      for (let i = 0; i < 10; i++) {
        const shardX = carX + Math.random() * 120;
        const shardY = carY + 30 + Math.random() * 20;
        ctx.fillRect(shardX, shardY, 3, 3);
      }
    } else {
      // Герой выходит из горящей машины (детализированная сцена)
      const carX = 600;
      const carY = 480;
      
      // Тень машины
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(carX + 60, carY + 45, 80, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Разбитая горящая машина (повёрнутая)
      ctx.save();
      ctx.translate(carX + 60, carY + 20);
      ctx.rotate(0.5);
      
      // Кузов
      const carGradient = ctx.createLinearGradient(-60, -20, -60, 20);
      carGradient.addColorStop(0, '#2a2a4e');
      carGradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = carGradient;
      ctx.fillRect(-60, -20, 120, 40);
      
      // Вмятины и повреждения
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(-20, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(30, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Разбитые окна
      ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
      ctx.fillRect(-35, -15, 25, 10);
      ctx.fillRect(5, -15, 25, 10);
      
      ctx.restore();
      
      // Огонь на машине (интенсивный)
      for (let i = 0; i < 30; i++) {
        const flameX = carX + Math.random() * 150;
        const flameY = carY - Math.random() * 120;
        const flameSize = 20 + Math.random() * 40;
        
        const flameGradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
        flameGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        flameGradient.addColorStop(0.2, 'rgba(255, 200, 0, 0.7)');
        flameGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
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
      
      // Герой выходит из машины (детализированный)
      const heroX = carX - 50 - (time - 5) * 30;
      const heroY = 450;
      
      // Тень героя
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(heroX + 15, heroY + 55, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Тело (оранжевая роба с градиентом)
      const robeGradient = ctx.createLinearGradient(heroX, heroY, heroX, heroY + 50);
      robeGradient.addColorStop(0, '#ff9933');
      robeGradient.addColorStop(1, '#cc5500');
      ctx.fillStyle = robeGradient;
      ctx.fillRect(heroX, heroY, 30, 50);
      
      // Полосы на робе
      ctx.fillStyle = '#cc5500';
      ctx.fillRect(heroX, heroY + 15, 30, 3);
      ctx.fillRect(heroX, heroY + 30, 30, 3);
      
      // Номер на робе
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('#247', heroX + 15, heroY + 25);
      
      // Голова
      const headGradient = ctx.createRadialGradient(heroX + 15, heroY - 10, 2, heroX + 15, heroY - 10, 15);
      headGradient.addColorStop(0, '#f4a460');
      headGradient.addColorStop(1, '#d2691e');
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(heroX + 15, heroY - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Волосы
      ctx.fillStyle = '#332211';
      ctx.beginPath();
      ctx.arc(heroX + 15, heroY - 15, 15, Math.PI, 0);
      ctx.fill();
      
      // Руки (герой держится за голову)
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(heroX + 5, heroY - 5, 8, 15);
      ctx.fillRect(heroX + 17, heroY - 5, 8, 15);
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    
    if (time < 4) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('АВАРИЯ!', this.canvasWidth / 2, 100);
    } else {
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('АКТ 2', this.canvasWidth / 2, 100);
      ctx.font = 'bold 28px Arial';
      ctx.fillText('ПО ПУТИ ВОЗМЕЗДИЯ', this.canvasWidth / 2, 150);
    }
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

// ============================================
// ACT 3 INTRO - Ролик начала третьего акта (реактивный ранец)
// ============================================

export type Act3Scene = 'jetpack' | 'takeoff' | 'flying' | 'none';

export interface Act3IntroState {
  currentScene: Act3Scene;
  sceneTimer: number;
  textAlpha: number;
  animationProgress: number;
}

export class Act3IntroRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private state: Act3IntroState;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.state = {
      currentScene: 'jetpack',
      sceneTimer: 0,
      textAlpha: 0,
      animationProgress: 0,
    };
  }

  start(): void {
    this.state.currentScene = 'jetpack';
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
      if (this.state.currentScene === 'jetpack') {
        this.state.currentScene = 'takeoff';
        this.state.sceneTimer = 0;
        return false;
      } else if (this.state.currentScene === 'takeoff') {
        this.state.currentScene = 'flying';
        this.state.sceneTimer = 0;
        return false;
      } else if (this.state.currentScene === 'flying') {
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
      case 'jetpack':
        this.renderJetpackScene();
        break;
      case 'takeoff':
        this.renderTakeoffScene();
        break;
      case 'flying':
        this.renderFlyingScene();
        break;
    }

    ctx.restore();
  }

  private renderJetpackScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Ночной город на заднем плане
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Звёзды
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 137) % this.canvasWidth;
      const starY = (i * 97) % (this.canvasHeight * 0.5);
      const starSize = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Город на заднем плане
    ctx.fillStyle = '#1a1a2e';
    for (let i = 0; i < 10; i++) {
      const buildingX = i * 100;
      const buildingHeight = 200 + (i * 37 % 150);
      ctx.fillRect(buildingX, this.canvasHeight - buildingHeight, 80, buildingHeight);
      
      // Окна
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      for (let y = this.canvasHeight - buildingHeight + 20; y < this.canvasHeight - 20; y += 30) {
        for (let x = buildingX + 10; x < buildingX + 70; x += 20) {
          ctx.fillRect(x, y, 10, 15);
        }
      }
      ctx.fillStyle = '#1a1a2e';
    }

    // Герой стоит на земле
    const heroX = this.canvasWidth / 2;
    const heroY = this.canvasHeight - 100;

    // Тело героя (оранжевая роба)
    const robeGradient = ctx.createLinearGradient(heroX - 15, heroY, heroX - 15, heroY + 50);
    robeGradient.addColorStop(0, '#ff9933');
    robeGradient.addColorStop(1, '#cc5500');
    ctx.fillStyle = robeGradient;
    ctx.fillRect(heroX - 15, heroY, 30, 50);

    // Голова
    const headGradient = ctx.createRadialGradient(heroX, heroY - 10, 2, heroX, heroY - 10, 15);
    headGradient.addColorStop(0, '#f4a460');
    headGradient.addColorStop(1, '#d2691e');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Реактивный ранец на спине
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(heroX - 25, heroY + 5, 15, 30);
    ctx.fillRect(heroX + 10, heroY + 5, 15, 30);

    // Сопла ранца
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(heroX - 23, heroY + 35, 11, 10);
    ctx.fillRect(heroX + 12, heroY + 35, 11, 10);

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;

    if (time < 4) {
      ctx.fillText('Герой находит реактивный ранец', this.canvasWidth / 2, 100);
    } else {
      ctx.fillStyle = '#00ffff';
      ctx.fillText('Время взлетать!', this.canvasWidth / 2, 100);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  private renderTakeoffScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Ночное небо
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Звёзды
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 137) % this.canvasWidth;
      const starY = (i * 97) % (this.canvasHeight * 0.5);
      const starSize = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Город уменьшается снизу
    const cityScale = Math.max(0.3, 1 - time * 0.1);
    ctx.save();
    ctx.translate(0, this.canvasHeight * (1 - cityScale));
    ctx.scale(1, cityScale);

    ctx.fillStyle = '#1a1a2e';
    for (let i = 0; i < 10; i++) {
      const buildingX = i * 100;
      const buildingHeight = 200 + (i * 37 % 150);
      ctx.fillRect(buildingX, this.canvasHeight - buildingHeight, 80, buildingHeight);

      // Окна
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      for (let y = this.canvasHeight - buildingHeight + 20; y < this.canvasHeight - 20; y += 30) {
        for (let x = buildingX + 10; x < buildingX + 70; x += 20) {
          ctx.fillRect(x, y, 10, 15);
        }
      }
      ctx.fillStyle = '#1a1a2e';
    }
    ctx.restore();

    // Герой взлетает
    const heroY = this.canvasHeight - 100 - time * 50;
    const heroX = this.canvasWidth / 2;

    // Тело героя
    const robeGradient = ctx.createLinearGradient(heroX - 15, heroY, heroX - 15, heroY + 50);
    robeGradient.addColorStop(0, '#ff9933');
    robeGradient.addColorStop(1, '#cc5500');
    ctx.fillStyle = robeGradient;
    ctx.fillRect(heroX - 15, heroY, 30, 50);

    // Голова
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Реактивный ранец
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(heroX - 25, heroY + 5, 15, 30);
    ctx.fillRect(heroX + 10, heroY + 5, 15, 30);

    // Огонь из сопел
    const flameIntensity = Math.min(1, time / 2);
    for (let i = 0; i < 5; i++) {
      const flameX1 = heroX - 17 + Math.random() * 5;
      const flameY1 = heroY + 45 + Math.random() * 20;
      const flameSize = 10 + Math.random() * 15;

      const flameGradient = ctx.createRadialGradient(flameX1, flameY1, 0, flameX1, flameY1, flameSize);
      flameGradient.addColorStop(0, `rgba(255, 255, 200, ${flameIntensity})`);
      flameGradient.addColorStop(0.5, `rgba(255, 100, 0, ${flameIntensity * 0.7})`);
      flameGradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.arc(flameX1, flameY1, flameSize, 0, Math.PI * 2);
      ctx.fill();

      const flameX2 = heroX + 17 + Math.random() * 5;
      const flameY2 = heroY + 45 + Math.random() * 20;

      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.arc(flameX2, flameY2, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('ВЗЛЁТ!', this.canvasWidth / 2, 100);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  private renderFlyingScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Ночное небо
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Звёзды
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 137) % this.canvasWidth;
      const starY = (i * 97) % (this.canvasHeight * 0.5);
      const starSize = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Небоскрёб справа (огромное здание)
    const buildingX = this.canvasWidth - 200;
    const buildingGradient = ctx.createLinearGradient(buildingX, 0, buildingX + 200, 0);
    buildingGradient.addColorStop(0, '#2a2a3e');
    buildingGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = buildingGradient;
    ctx.fillRect(buildingX, 0, 200, this.canvasHeight);

    // Окна небоскрёба
    ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
    for (let y = 50; y < this.canvasHeight; y += 40) {
      for (let x = buildingX + 20; x < buildingX + 180; x += 30) {
        ctx.fillRect(x, y, 15, 20);
      }
    }

    // Герой летит слева направо
    const heroX = 100 + time * 50;
    const heroY = this.canvasHeight / 2 + Math.sin(time * 2) * 20;

    // Тело героя
    const robeGradient = ctx.createLinearGradient(heroX - 15, heroY, heroX - 15, heroY + 50);
    robeGradient.addColorStop(0, '#ff9933');
    robeGradient.addColorStop(1, '#cc5500');
    ctx.fillStyle = robeGradient;
    ctx.fillRect(heroX - 15, heroY, 30, 50);

    // Голова
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Реактивный ранец
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(heroX - 25, heroY + 5, 15, 30);
    ctx.fillRect(heroX + 10, heroY + 5, 15, 30);

    // Огонь из сопел
    for (let i = 0; i < 3; i++) {
      const flameX1 = heroX - 17 + Math.random() * 5;
      const flameY1 = heroY + 45 + Math.random() * 15;
      const flameSize = 8 + Math.random() * 12;

      const flameGradient = ctx.createRadialGradient(flameX1, flameY1, 0, flameX1, flameY1, flameSize);
      flameGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
      flameGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
      flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.arc(flameX1, flameY1, flameSize, 0, Math.PI * 2);
      ctx.fill();

      const flameX2 = heroX + 17 + Math.random() * 5;
      const flameY2 = heroY + 45 + Math.random() * 15;

      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.arc(flameX2, flameY2, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;

    if (time < 4) {
      ctx.fillText('АКТ 3', this.canvasWidth / 2, 100);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('ПОЛЁТ НА НЕБОСКРЁБ', this.canvasWidth / 2, 140);
    } else {
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Враги атакуют!', this.canvasWidth / 2, 100);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

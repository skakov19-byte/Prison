// ============================================
// INTRO SCENE - Вступительный ролик (улучшенная версия)
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

    // Небо (закат с градиентом)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight * 0.6);
    skyGradient.addColorStop(0, '#ff4500');
    skyGradient.addColorStop(0.2, '#ff6b35');
    skyGradient.addColorStop(0.4, '#f7931e');
    skyGradient.addColorStop(0.6, '#ffa500');
    skyGradient.addColorStop(0.8, '#ffd700');
    skyGradient.addColorStop(1, '#ffed4e');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight * 0.6);

    // Солнце
    const sunGradient = ctx.createRadialGradient(
      this.canvasWidth * 0.7, 120, 0,
      this.canvasWidth * 0.7, 120, 60
    );
    sunGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    sunGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
    sunGradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.4)');
    sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(this.canvasWidth * 0.7, 120, 60, 0, Math.PI * 2);
    ctx.fill();

    // Облака с деталями
    for (let i = 0; i < 7; i++) {
      const cloudX = 50 + i * 120;
      const cloudY = 60 + Math.sin(i * 0.8) * 25;
      const cloudSize = 25 + (i % 3) * 10;
      
      // Тень облака
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(cloudX + 3, cloudY + 3, cloudSize, 0, Math.PI * 2);
      ctx.arc(cloudX + 28, cloudY + 3, cloudSize + 5, 0, Math.PI * 2);
      ctx.arc(cloudX + 53, cloudY + 3, cloudSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Облако
      const cloudGradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
      cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      ctx.arc(cloudX + 25, cloudY, cloudSize + 5, 0, Math.PI * 2);
      ctx.arc(cloudX + 50, cloudY, cloudSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Капитолий на заднем плане (детализированный)
    const capitolX = this.canvasWidth / 2;
    
    // Тень здания
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(capitolX - 195, 255, 400, 150);
    
    // Основание здания
    const buildingGradient = ctx.createLinearGradient(capitolX - 200, 250, capitolX - 200, 400);
    buildingGradient.addColorStop(0, '#ffffff');
    buildingGradient.addColorStop(0.3, '#f5f5f5');
    buildingGradient.addColorStop(0.7, '#e0e0e0');
    buildingGradient.addColorStop(1, '#c0c0c0');
    ctx.fillStyle = buildingGradient;
    ctx.fillRect(capitolX - 200, 250, 400, 150);
    
    // Детали здания - окна
    ctx.fillStyle = 'rgba(100, 100, 150, 0.5)';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(capitolX - 180 + i * 45, 280 + j * 40, 20, 25);
      }
    }
    
    // Купол (детализированный)
    const domeGradient = ctx.createRadialGradient(capitolX - 20, 180, 10, capitolX, 200, 110);
    domeGradient.addColorStop(0, '#ffffff');
    domeGradient.addColorStop(0.3, '#f0f0f0');
    domeGradient.addColorStop(0.6, '#e0e0e0');
    domeGradient.addColorStop(1, '#b0b0b0');
    ctx.fillStyle = domeGradient;
    ctx.beginPath();
    ctx.arc(capitolX, 250, 100, Math.PI, 0);
    ctx.fill();
    
    // Детали купола - ребра
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI + (i / 8) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(capitolX, 250);
      ctx.lineTo(capitolX + Math.cos(angle) * 95, 250 + Math.sin(angle) * 95);
      ctx.stroke();
    }
    
    // Шпиль на куполе (детализированный)
    const spireGradient = ctx.createLinearGradient(capitolX, 150, capitolX, 200);
    spireGradient.addColorStop(0, '#ffd700');
    spireGradient.addColorStop(0.5, '#ffed4e');
    spireGradient.addColorStop(1, '#daa520');
    ctx.fillStyle = spireGradient;
    ctx.fillRect(capitolX - 4, 150, 8, 50);
    
    // Шар на шпиле
    const ballGradient = ctx.createRadialGradient(capitolX - 2, 148, 1, capitolX, 150, 10);
    ballGradient.addColorStop(0, '#ffff99');
    ballGradient.addColorStop(0.5, '#ffd700');
    ballGradient.addColorStop(1, '#daa520');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(capitolX, 150, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Колонны (детализированные)
    for (let i = 0; i < 10; i++) {
      const colX = capitolX - 180 + i * 40;
      
      // Тень колонны
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(colX + 3, 282, 18, 120);
      
      // Колонна с градиентом
      const colGradient = ctx.createLinearGradient(colX, 280, colX + 18, 280);
      colGradient.addColorStop(0, '#c0c0c0');
      colGradient.addColorStop(0.3, '#f0f0f0');
      colGradient.addColorStop(0.7, '#e0e0e0');
      colGradient.addColorStop(1, '#b0b0b0');
      ctx.fillStyle = colGradient;
      ctx.fillRect(colX, 280, 18, 120);
      
      // Капитель (верх)
      const capGradient = ctx.createLinearGradient(colX - 3, 275, colX + 21, 275);
      capGradient.addColorStop(0, '#a0a0a0');
      capGradient.addColorStop(0.5, '#d0d0d0');
      capGradient.addColorStop(1, '#a0a0a0');
      ctx.fillStyle = capGradient;
      ctx.fillRect(colX - 3, 275, 24, 8);
      
      // База (низ)
      ctx.fillStyle = capGradient;
      ctx.fillRect(colX - 3, 395, 24, 8);
      
      // Детали колонны - каннелюры
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.moveTo(colX + 4 + j * 5, 283);
        ctx.lineTo(colX + 4 + j * 5, 397);
        ctx.stroke();
      }
    }

    // Трибуны (детализированные)
    const podiumGradient = ctx.createLinearGradient(100, 400, 100, 500);
    podiumGradient.addColorStop(0, '#8b4513');
    podiumGradient.addColorStop(1, '#654321');
    ctx.fillStyle = podiumGradient;
    ctx.fillRect(100, 400, 200, 100);
    ctx.fillRect(this.canvasWidth - 300, 400, 200, 100);
    
    // Декор на трибунах
    ctx.fillStyle = '#654321';
    ctx.fillRect(100, 400, 200, 10);
    ctx.fillRect(this.canvasWidth - 300, 400, 200, 10);

    // Мэр на трибуне
    const mayorX = this.canvasWidth / 2;
    const mayorY = 380;
    
    // Мэр стоит только до выстрела
    if (time < 4) {
      // Тело мэра (костюм)
      const suitGradient = ctx.createLinearGradient(mayorX - 15, mayorY, mayorX - 15, mayorY + 50);
      suitGradient.addColorStop(0, '#2c3e50');
      suitGradient.addColorStop(1, '#1a252f');
      ctx.fillStyle = suitGradient;
      ctx.fillRect(mayorX - 15, mayorY, 30, 50);
      
      // Галстук
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(mayorX, mayorY + 5);
      ctx.lineTo(mayorX - 5, mayorY + 25);
      ctx.lineTo(mayorX + 5, mayorY + 25);
      ctx.closePath();
      ctx.fill();
      
      // Голова мэра
      const headGradient = ctx.createRadialGradient(mayorX, mayorY - 10, 2, mayorX, mayorY - 10, 15);
      headGradient.addColorStop(0, '#f4a460');
      headGradient.addColorStop(1, '#d2691e');
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(mayorX, mayorY - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Волосы
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(mayorX, mayorY - 15, 15, Math.PI, 0);
      ctx.fill();
      
      // Руки (жестикулирует)
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(mayorX - 25, mayorY + 10, 10, 20);
      ctx.fillRect(mayorX + 15, mayorY + 10, 10, 20);
      
      // Микрофон
      ctx.fillStyle = '#333333';
      ctx.fillRect(mayorX - 2, mayorY - 30, 4, 20);
      ctx.beginPath();
      ctx.arc(mayorX, mayorY - 32, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Анимация выстрела (после 4 секунд)
    if (time > 4 && time < 5) {
      // Вспышка выстрела
      const flashGradient = ctx.createRadialGradient(mayorX + 20, mayorY + 20, 0, mayorX + 20, mayorY + 20, 15);
      flashGradient.addColorStop(0, '#ffffff');
      flashGradient.addColorStop(0.5, '#ff0000');
      flashGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = flashGradient;
      ctx.beginPath();
      ctx.arc(mayorX + 20, mayorY + 20, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Мэр падает
      ctx.save();
      ctx.translate(mayorX, mayorY + 25);
      ctx.rotate((time - 4) * 0.5);
      
      // Тело (костюм)
      const suitGradient = ctx.createLinearGradient(-15, 0, -15, 50);
      suitGradient.addColorStop(0, '#2c3e50');
      suitGradient.addColorStop(1, '#1a252f');
      ctx.fillStyle = suitGradient;
      ctx.fillRect(-15, 0, 30, 50);
      
      // Галстук
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(-5, 25);
      ctx.lineTo(5, 25);
      ctx.closePath();
      ctx.fill();
      
      // Голова
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(0, -10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Волосы
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(0, -15, 15, Math.PI, 0);
      ctx.fill();
      
      ctx.restore();
    } else if (time >= 5) {
      // Мэр лежит на земле (горизонтально)
      ctx.save();
      ctx.translate(mayorX - 30, mayorY + 60);
      ctx.rotate(Math.PI / 2);
      
      // Тело
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-15, -25, 30, 50);
      
      // Галстук
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.closePath();
      ctx.fill();
      
      // Голова
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(0, -35, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Волосы
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(0, -40, 15, Math.PI, 0);
      ctx.fill();
      
      // Руки распластаны
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(-25, -15, 10, 20);
      ctx.fillRect(15, -15, 10, 20);
      
      ctx.restore();
      
      // Лужа крови (детализированная)
      const bloodGradient = ctx.createRadialGradient(mayorX, mayorY + 70, 0, mayorX, mayorY + 70, 50);
      bloodGradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)');
      bloodGradient.addColorStop(0.5, 'rgba(139, 0, 0, 0.5)');
      bloodGradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
      ctx.fillStyle = bloodGradient;
      ctx.beginPath();
      ctx.ellipse(mayorX, mayorY + 70, 50, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Толпа (детализированные силуэты)
    for (let i = 0; i < 30; i++) {
      const x = 20 + i * 27;
      const y = 500 + Math.sin(i * 0.5) * 10;
      const shade = 0.4 + (i % 3) * 0.1;
      
      // Тень
      ctx.fillStyle = `rgba(0, 0, 0, ${shade * 0.5})`;
      ctx.fillRect(x - 9, y + 2, 20, 35);
      
      // Тело с градиентом
      const bodyGradient = ctx.createLinearGradient(x - 10, y, x - 10, y + 35);
      bodyGradient.addColorStop(0, `rgba(20, 20, 30, ${shade})`);
      bodyGradient.addColorStop(1, `rgba(10, 10, 20, ${shade})`);
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(x - 10, y, 20, 35);
      
      // Голова
      const headGradient = ctx.createRadialGradient(x, y - 5, 2, x, y - 5, 12);
      headGradient.addColorStop(0, `rgba(30, 30, 40, ${shade})`);
      headGradient.addColorStop(1, `rgba(10, 10, 20, ${shade})`);
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(x, y - 5, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Руки
      ctx.fillStyle = `rgba(15, 15, 25, ${shade})`;
      ctx.fillRect(x - 15, y + 5, 5, 20);
      ctx.fillRect(x + 10, y + 5, 5, 20);
      
      // Некоторые люди с поднятыми руками (реакция на выстрел)
      if (time > 5 && i % 4 === 0) {
        ctx.fillRect(x - 15, y - 10, 5, 15);
        ctx.fillRect(x + 10, y - 10, 5, 15);
      }
    }

    // Атмосферные эффекты - пыль в воздухе
    ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
    for (let i = 0; i < 30; i++) {
      const dustX = (i * 137 + time * 20) % this.canvasWidth;
      const dustY = (i * 97 + Math.sin(time + i) * 30) % (this.canvasHeight * 0.6);
      ctx.beginPath();
      ctx.arc(dustX, dustY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Световые лучи от солнца
    ctx.globalAlpha = 0.15;
    const rayGradient = ctx.createLinearGradient(
      this.canvasWidth * 0.7, 120,
      this.canvasWidth * 0.5, this.canvasHeight
    );
    rayGradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    rayGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(this.canvasWidth * 0.7, 120);
    ctx.lineTo(this.canvasWidth * 0.3, this.canvasHeight);
    ctx.lineTo(this.canvasWidth * 0.8, this.canvasHeight);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Виньетка
    const vignetteGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.3,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.7
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    if (time < 4) {
      ctx.fillText('Вашингтон, Капитолий', this.canvasWidth / 2, 100);
      ctx.font = '20px Arial';
      ctx.fillText('Мэр выступает с речью...', this.canvasWidth / 2, 140);
    } else if (time < 6) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 42px Arial';
      ctx.fillText('ВЫСТРЕЛ!', this.canvasWidth / 2, 100);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('Мэр убит...', this.canvasWidth / 2, 100);
    }
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 1;
  }

  private renderApartmentScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Комната (вид изнутри) с детализированными стенами
    const wallGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    wallGradient.addColorStop(0, '#5a5a5a');
    wallGradient.addColorStop(0.5, '#4a4a4a');
    wallGradient.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Текстура стен (обои с узором)
    ctx.strokeStyle = 'rgba(70, 70, 70, 0.4)';
    ctx.lineWidth = 1;
    for (let y = 0; y < this.canvasHeight; y += 30) {
      for (let x = 0; x < this.canvasWidth; x += 40) {
        ctx.strokeRect(x, y, 40, 30);
        // Узор на обоях
        ctx.fillStyle = 'rgba(80, 80, 80, 0.2)';
        ctx.beginPath();
        ctx.arc(x + 20, y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Потолок с градиентом
    const ceilingGradient = ctx.createLinearGradient(0, 0, 0, 100);
    ceilingGradient.addColorStop(0, '#6a6a6a');
    ceilingGradient.addColorStop(1, '#5a5a5a');
    ctx.fillStyle = ceilingGradient;
    ctx.fillRect(0, 0, this.canvasWidth, 100);
    
    // Люстра с деталями
    // Цепь
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.canvasWidth / 2, 0);
    ctx.lineTo(this.canvasWidth / 2, 30);
    ctx.stroke();
    
    // Основание люстры
    const chandelierGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, 50, 5,
      this.canvasWidth / 2, 50, 25
    );
    chandelierGradient.addColorStop(0, '#ffff99');
    chandelierGradient.addColorStop(0.5, '#ffd700');
    chandelierGradient.addColorStop(1, '#daa520');
    ctx.fillStyle = chandelierGradient;
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, 50, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Свет от люстры
    const lightGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, 50, 10,
      this.canvasWidth / 2, 50, 150
    );
    lightGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    lightGradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.1)');
    lightGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = lightGradient;
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, 50, 150, 0, Math.PI * 2);
    ctx.fill();

    // Пол (паркет)
    const floorGradient = ctx.createLinearGradient(0, this.canvasHeight - 150, 0, this.canvasHeight);
    floorGradient.addColorStop(0, '#3a2a1a');
    floorGradient.addColorStop(1, '#2a1a0a');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, this.canvasHeight - 150, this.canvasWidth, 150);
    
    // Текстура паркета
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let y = this.canvasHeight - 150; y < this.canvasHeight; y += 20) {
      for (let x = 0; x < this.canvasWidth; x += 60) {
        ctx.strokeRect(x, y, 60, 20);
      }
    }

    // Окно (детализированное)
    const windowGradient = ctx.createLinearGradient(150, 150, 150, 300);
    windowGradient.addColorStop(0, '#87ceeb');
    windowGradient.addColorStop(0.5, '#6ba5d7');
    windowGradient.addColorStop(1, '#4a90d9');
    ctx.fillStyle = windowGradient;
    ctx.fillRect(150, 150, 200, 150);
    
    // Рама окна с тенью
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(147, 153, 206, 156);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(150, 150, 200, 150);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(250, 150);
    ctx.lineTo(250, 300);
    ctx.moveTo(150, 225);
    ctx.lineTo(350, 225);
    ctx.stroke();
    
    // Вид из окна (город с деталями)
    // Небо
    const skyGradient = ctx.createLinearGradient(160, 160, 160, 300);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#b0d4e8');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(160, 160, 180, 130);
    
    // Здания
    ctx.fillStyle = 'rgba(80, 80, 120, 0.7)';
    ctx.fillRect(165, 220, 35, 70);
    ctx.fillRect(210, 200, 45, 90);
    ctx.fillRect(265, 230, 40, 60);
    
    // Окна зданий
    ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.fillRect(170 + i * 15, 225 + j * 15, 8, 10);
      }
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        ctx.fillRect(215 + i * 15, 205 + j * 15, 8, 10);
      }
    }
    
    // Блик на окне
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(160, 160);
    ctx.lineTo(200, 160);
    ctx.lineTo(180, 200);
    ctx.lineTo(160, 200);
    ctx.closePath();
    ctx.fill();

    // Мебель (детализированная)
    // Стол с тенью
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(453, 353, 150, 100);
    
    // Стол
    const tableGradient = ctx.createLinearGradient(450, 350, 450, 450);
    tableGradient.addColorStop(0, '#a0522d');
    tableGradient.addColorStop(0.5, '#8b4513');
    tableGradient.addColorStop(1, '#654321');
    ctx.fillStyle = tableGradient;
    ctx.fillRect(450, 350, 150, 100);
    
    // Текстура дерева на столе
    ctx.strokeStyle = 'rgba(60, 30, 10, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(450, 360 + i * 20);
      ctx.lineTo(600, 360 + i * 20);
      ctx.stroke();
    }
    
    // Блик на столе
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(450, 350, 150, 10);
    
    // Ножки стола с градиентом
    const legGradient = ctx.createLinearGradient(460, 450, 475, 450);
    legGradient.addColorStop(0, '#654321');
    legGradient.addColorStop(0.5, '#8b4513');
    legGradient.addColorStop(1, '#654321');
    ctx.fillStyle = legGradient;
    ctx.fillRect(460, 450, 15, 50);
    ctx.fillRect(575, 450, 15, 50);
    
    // Стул с деталями
    const chairGradient = ctx.createLinearGradient(620, 380, 680, 380);
    chairGradient.addColorStop(0, '#5a3a1a');
    chairGradient.addColorStop(0.5, '#6a4a2a');
    chairGradient.addColorStop(1, '#5a3a1a');
    ctx.fillStyle = chairGradient;
    ctx.fillRect(620, 380, 60, 80);
    ctx.fillRect(620, 460, 60, 40);
    
    // Спинка стула
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(625, 385, 50, 70);

    // Главный герой (в обычной одежде - до ареста)
    const heroX = 400;
    const heroY = 400;
    
    // Тело (обычная одежда - футболка и джинсы)
    const shirtGradient = ctx.createLinearGradient(heroX - 15, heroY, heroX - 15, heroY + 25);
    shirtGradient.addColorStop(0, '#4a90d9');
    shirtGradient.addColorStop(1, '#2c5f8d');
    ctx.fillStyle = shirtGradient;
    ctx.fillRect(heroX - 15, heroY, 30, 25);
    
    // Джинсы
    const pantsGradient = ctx.createLinearGradient(heroX - 15, heroY + 25, heroX - 15, heroY + 50);
    pantsGradient.addColorStop(0, '#2c3e50');
    pantsGradient.addColorStop(1, '#1a252f');
    ctx.fillStyle = pantsGradient;
    ctx.fillRect(heroX - 15, heroY + 25, 30, 25);
    
    // Голова
    const headGradient = ctx.createRadialGradient(heroX, heroY - 10, 2, heroX, heroY - 10, 15);
    headGradient.addColorStop(0, '#f4a460');
    headGradient.addColorStop(1, '#d2691e');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Волосы
    ctx.fillStyle = '#332211';
    ctx.beginPath();
    ctx.arc(heroX, heroY - 15, 15, Math.PI, 0);
    ctx.fill();

    // Полицейские (появляются после 2 секунд, детализированные)
    if (time > 2) {
      const copAlpha = Math.min(1, (time - 2) / 1);
      ctx.globalAlpha = copAlpha;
      
      // Полицейский 1
      const cop1X = 600;
      const cop1Y = 380;
      
      // Тело (форма)
      const uniformGradient = ctx.createLinearGradient(cop1X - 15, cop1Y, cop1X - 15, cop1Y + 60);
      uniformGradient.addColorStop(0, '#1a1a2e');
      uniformGradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = uniformGradient;
      ctx.fillRect(cop1X - 15, cop1Y, 30, 60);
      
      // Ремень
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(cop1X - 15, cop1Y + 35, 30, 5);
      
      // Значок
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cop1X - 5, cop1Y + 15, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Голова
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(cop1X, cop1Y - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Кепка
      ctx.fillStyle = '#0a0a1e';
      ctx.fillRect(cop1X - 18, cop1Y - 25, 36, 12);
      ctx.fillRect(cop1X - 15, cop1Y - 20, 30, 5);
      
      // Козырёк
      ctx.fillStyle = '#000000';
      ctx.fillRect(cop1X - 20, cop1Y - 15, 40, 3);
      
      // Рука с наручниками
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(cop1X - 25, cop1Y + 10, 10, 25);
      ctx.fillStyle = '#888888';
      ctx.fillRect(cop1X - 28, cop1Y + 30, 16, 8);
      
      // Полицейский 2
      const cop2X = 650;
      const cop2Y = 380;
      
      // Тело
      ctx.fillStyle = uniformGradient;
      ctx.fillRect(cop2X - 15, cop2Y, 30, 60);
      
      // Ремень
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(cop2X - 15, cop2Y + 35, 30, 5);
      
      // Значок
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cop2X - 5, cop2Y + 15, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Голова
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(cop2X, cop2Y - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Кепка
      ctx.fillStyle = '#0a0a1e';
      ctx.fillRect(cop2X - 18, cop2Y - 25, 36, 12);
      ctx.fillRect(cop2X - 15, cop2Y - 20, 30, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cop2X - 20, cop2Y - 15, 40, 3);
      
      // Рука
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(cop2X + 15, cop2Y + 10, 10, 25);
      
      ctx.globalAlpha = 1;
    }

    // Атмосферные эффекты - пыль в воздухе
    ctx.fillStyle = 'rgba(255, 255, 200, 0.05)';
    for (let i = 0; i < 20; i++) {
      const dustX = (i * 137 + time * 10) % this.canvasWidth;
      const dustY = (i * 97 + Math.sin(time + i) * 20) % this.canvasHeight;
      ctx.beginPath();
      ctx.arc(dustX, dustY, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Виньетка
    const vignetteGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.3,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.7
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    if (time < 3) {
      ctx.fillText('Квартира главного героя', this.canvasWidth / 2, 80);
    } else if (time < 6) {
      ctx.fillText('Полиция: "Вы обвиняетесь в убийстве мэра!"', this.canvasWidth / 2, 80);
      ctx.font = '20px Arial';
      ctx.fillText('Вас задерживают и увозят...', this.canvasWidth / 2, 120);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('Арестован...', this.canvasWidth / 2, 80);
    }
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 1;
  }

  private renderPrisonScene(): void {
    const ctx = this.ctx;
    const time = this.state.sceneTimer;

    // Тюремная камера (детализированная)
    const wallGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    wallGradient.addColorStop(0, '#2a2a2a');
    wallGradient.addColorStop(0.5, '#252525');
    wallGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Текстура кирпичной стены с объёмом
    for (let y = 0; y < this.canvasHeight; y += 30) {
      for (let x = 0; x < this.canvasWidth; x += 60) {
        const offset = (Math.floor(y / 30) % 2) * 30;
        const brickX = x + offset;
        
        // Тень кирпича
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(brickX + 2, y + 2, 56, 26);
        
        // Кирпич с градиентом
        const brickGradient = ctx.createLinearGradient(brickX, y, brickX, y + 28);
        brickGradient.addColorStop(0, '#3a3a3a');
        brickGradient.addColorStop(0.5, '#2a2a2a');
        brickGradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = brickGradient;
        ctx.fillRect(brickX, y, 56, 26);
        
        // Блик на кирпиче
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(brickX, y, 56, 3);
        
        // Трещины на некоторых кирпичах
        if ((x + y) % 180 === 0) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(brickX + 10, y + 5);
          ctx.lineTo(brickX + 30, y + 20);
          ctx.stroke();
        }
      }
    }

    // Потолок с градиентом
    const ceilingGradient = ctx.createLinearGradient(0, 0, 0, 80);
    ceilingGradient.addColorStop(0, '#1a1a1a');
    ceilingGradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = ceilingGradient;
    ctx.fillRect(0, 0, this.canvasWidth, 80);
    
    // Лампа на потолке с деталями
    // Цепь
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.canvasWidth / 2, 0);
    ctx.lineTo(this.canvasWidth / 2, 45);
    ctx.stroke();
    
    // Абажур
    const lampGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, 60, 5,
      this.canvasWidth / 2, 60, 20
    );
    lampGradient.addColorStop(0, '#ffff99');
    lampGradient.addColorStop(0.5, '#ffff66');
    lampGradient.addColorStop(1, '#cccc00');
    ctx.fillStyle = lampGradient;
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, 60, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Свет от лампы
    const lightGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, 60, 10,
      this.canvasWidth / 2, 60, 200
    );
    lightGradient.addColorStop(0, 'rgba(255, 255, 150, 0.4)');
    lightGradient.addColorStop(0.5, 'rgba(255, 255, 100, 0.2)');
    lightGradient.addColorStop(1, 'rgba(255, 255, 50, 0)');
    ctx.fillStyle = lightGradient;
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, 60, 200, 0, Math.PI * 2);
    ctx.fill();

    // Пол (бетон)
    const floorGradient = ctx.createLinearGradient(0, this.canvasHeight - 100, 0, this.canvasHeight);
    floorGradient.addColorStop(0, '#1a1a1a');
    floorGradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    
    // Трещины на полу
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, this.canvasHeight - 80);
    ctx.lineTo(250, this.canvasHeight - 50);
    ctx.lineTo(300, this.canvasHeight - 70);
    ctx.stroke();

    // Решётка на двери (детализированная)
    const doorX = this.canvasWidth - 150;
    const doorY = 200;
    
    // Рама двери
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(doorX - 10, doorY - 10, 100, 320);
    
    // Прутья (с градиентом)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 10;
    for (let i = 0; i < 5; i++) {
      const barX = doorX + i * 20;
      const barGradient = ctx.createLinearGradient(barX, doorY, barX + 10, doorY);
      barGradient.addColorStop(0, '#555555');
      barGradient.addColorStop(0.5, '#777777');
      barGradient.addColorStop(1, '#555555');
      ctx.strokeStyle = barGradient;
      ctx.beginPath();
      ctx.moveTo(barX, doorY);
      ctx.lineTo(barX, doorY + 300);
      ctx.stroke();
    }
    
    // Горизонтальные прутья
    for (let i = 0; i < 6; i++) {
      const barY = doorY + i * 50;
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(doorX, barY);
      ctx.lineTo(doorX + 80, barY);
      ctx.stroke();
    }

    // Два полицейских заводят героя (исчезают после 3 секунд)
    if (time < 3) {
      const cop1X = this.canvasWidth - 180;
      const cop2X = this.canvasWidth - 270;
      const copY = 450;
      
      // Полицейский 1 (справа от героя)
      const uniformGradient = ctx.createLinearGradient(cop1X - 15, copY, cop1X - 15, copY + 60);
      uniformGradient.addColorStop(0, '#1a1a2e');
      uniformGradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = uniformGradient;
      ctx.fillRect(cop1X - 15, copY, 30, 60);
      
      // Ремень
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(cop1X - 15, copY + 35, 30, 5);
      
      // Голова
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(cop1X, copY - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Кепка
      ctx.fillStyle = '#0a0a1e';
      ctx.fillRect(cop1X - 18, copY - 25, 36, 12);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cop1X - 20, copY - 15, 40, 3);
      
      // Рука держит героя
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(cop1X - 25, copY + 10, 10, 20);
      
      // Полицейский 2 (слева от героя)
      ctx.fillStyle = uniformGradient;
      ctx.fillRect(cop2X - 15, copY, 30, 60);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(cop2X - 15, copY + 35, 30, 5);
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.arc(cop2X, copY - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0a1e';
      ctx.fillRect(cop2X - 18, copY - 25, 36, 12);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cop2X - 20, copY - 15, 40, 3);
      ctx.fillStyle = '#f4a460';
      ctx.fillRect(cop2X + 15, copY + 10, 10, 20);
    }

    // Главный герой (между полицейскими)
    const heroX = this.canvasWidth - 225;
    const heroY = 450;

    // Тело героя (оранжевая роба)
    const robeGradient = ctx.createLinearGradient(heroX - 15, heroY, heroX - 15, heroY + 50);
    robeGradient.addColorStop(0, '#ff9933');
    robeGradient.addColorStop(1, '#cc5500');
    ctx.fillStyle = robeGradient;
    ctx.fillRect(heroX - 15, heroY, 30, 50);
    
    // Полосы на робе
    ctx.fillStyle = '#cc5500';
    ctx.fillRect(heroX - 15, heroY + 15, 30, 3);
    ctx.fillRect(heroX - 15, heroY + 30, 30, 3);
    
    // Номер на робе
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('#247', heroX, heroY + 25);
    
    // Голова
    const headGradient = ctx.createRadialGradient(heroX, heroY - 10, 2, heroX, heroY - 10, 15);
    headGradient.addColorStop(0, '#f4a460');
    headGradient.addColorStop(1, '#d2691e');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(heroX, heroY - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Волосы
    ctx.fillStyle = '#332211';
    ctx.beginPath();
    ctx.arc(heroX, heroY - 15, 15, Math.PI, 0);
    ctx.fill();
    
    // Руки за спиной (связаны)
    ctx.fillStyle = '#f4a460';
    ctx.fillRect(heroX - 5, heroY + 20, 10, 15);
    
    // Наручники
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(heroX - 3, heroY + 25, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(heroX + 3, heroY + 25, 5, 0, Math.PI * 2);
    ctx.stroke();

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

    // Атмосферные эффекты - пыль в воздухе
    ctx.fillStyle = 'rgba(255, 255, 200, 0.08)';
    for (let i = 0; i < 25; i++) {
      const dustX = (i * 137 + time * 15) % this.canvasWidth;
      const dustY = (i * 97 + Math.sin(time + i) * 25) % this.canvasHeight;
      ctx.beginPath();
      ctx.arc(dustX, dustY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Виньетка
    const vignetteGradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.25,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.7
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Текст
    ctx.globalAlpha = this.state.textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    if (time < 3) {
      ctx.fillText('Тюрьма строгого режима', this.canvasWidth / 2, 60);
      ctx.font = '20px Arial';
      ctx.fillText('Вас приводят в камеру...', this.canvasWidth / 2, 100);
    } else if (time < 5) {
      ctx.fillText('Дверь захлопывается...', this.canvasWidth / 2, 60);
    } else {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('ПОБЕГ НАЧИНАЕТСЯ', this.canvasWidth / 2, 60);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Найдите способ выбраться...', this.canvasWidth / 2, 100);
    }
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 1;
  }
}

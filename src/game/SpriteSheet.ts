// ============================================
// SPRITE SHEET - Система загрузки и управления спрайт-листами
// ============================================

export interface SpriteAnimation {
  name: string;
  frames: number[]; // Номера кадров в спрайт-листе
  frameRate: number; // Кадров в секунду
  loop: boolean;
}

export class SpriteSheet {
  private image: HTMLImageElement;
  private frameWidth: number;
  private frameHeight: number;
  private columns: number;
  private rows: number;
  private animations: Map<string, SpriteAnimation> = new Map();
  private loaded: boolean = false;

  constructor(
    imagePath: string,
    frameWidth: number,
    frameHeight: number,
    columns: number,
    rows: number
  ) {
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.columns = columns;
    this.rows = rows;

    // Загружаем изображение
    this.image.onload = () => {
      this.loaded = true;
      console.log(`Sprite sheet loaded: ${imagePath}`);
    };
    this.image.onerror = () => {
      console.error(`Failed to load sprite sheet: ${imagePath}`);
    };
    this.image.src = imagePath;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  // Добавляем анимацию
  addAnimation(
    name: string,
    startFrame: number,
    endFrame: number,
    frameRate: number,
    loop: boolean = true
  ): void {
    const frames: number[] = [];
    for (let i = startFrame; i <= endFrame; i++) {
      frames.push(i);
    }
    this.animations.set(name, { name, frames, frameRate, loop });
  }

  // Получаем кадр из спрайт-листа
  drawFrame(
    ctx: CanvasRenderingContext2D,
    frameNumber: number,
    x: number,
    y: number,
    scaleX: number = 1,
    scaleY: number = 1
  ): void {
    if (!this.loaded) return;

    // Вычисляем позицию кадра в спрайт-листе
    const col = frameNumber % this.columns;
    const row = Math.floor(frameNumber / this.columns);

    const sourceX = col * this.frameWidth;
    const sourceY = row * this.frameHeight;

    // Рисуем кадр с масштабированием
    ctx.drawImage(
      this.image,
      sourceX,
      sourceY,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      this.frameWidth * scaleX,
      this.frameHeight * scaleY
    );
  }

  // Получаем информацию об анимации
  getAnimation(name: string): SpriteAnimation | undefined {
    return this.animations.get(name);
  }
}

// ============================================
// ANIMATION CONTROLLER - Контроллер анимаций
// ============================================

export class AnimationController {
  private spriteSheet: SpriteSheet;
  private currentAnimation: string | null = null;
  private currentFrameIndex: number = 0;
  private frameTimer: number = 0;
  private scaleX: number = 1;
  private scaleY: number = 1;

  constructor(spriteSheet: SpriteSheet) {
    this.spriteSheet = spriteSheet;
  }

  // Устанавливаем текущую анимацию
  setAnimation(name: string): void {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrameIndex = 0;
      this.frameTimer = 0;
    }
  }

  // Устанавливаем масштаб
  setScale(scaleX: number, scaleY: number): void {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  // Обновляем анимацию
  update(dt: number): void {
    if (!this.currentAnimation) return;

    const animation = this.spriteSheet.getAnimation(this.currentAnimation);
    if (!animation) return;

    this.frameTimer += dt;
    const frameDuration = 1 / animation.frameRate;

    if (this.frameTimer >= frameDuration) {
      this.frameTimer = 0;
      this.currentFrameIndex++;

      if (this.currentFrameIndex >= animation.frames.length) {
        if (animation.loop) {
          this.currentFrameIndex = 0;
        } else {
          this.currentFrameIndex = animation.frames.length - 1;
        }
      }
    }
  }

  // Рисуем текущий кадр
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.currentAnimation) return;

    const animation = this.spriteSheet.getAnimation(this.currentAnimation);
    if (!animation) return;

    const frameNumber = animation.frames[this.currentFrameIndex];
    this.spriteSheet.drawFrame(ctx, frameNumber, x, y, this.scaleX, this.scaleY);
  }

  // Получаем текущую анимацию
  getCurrentAnimation(): string | null {
    return this.currentAnimation;
  }
}

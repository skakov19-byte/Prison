// ============================================
// LEVEL - Определение уровней и платформ
// ============================================

import { Platform, EnemyStats, EnemyType, Vector2 } from './types';

export interface Pit {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
}

export interface LevelData {
  platforms: Platform[];
  ladders: { x: number; y: number; width: number; height: number }[];
  enemies: EnemyStats[];
  playerSpawn: Vector2;
  exitDoor?: { x: number; y: number; width: number; height: number };
  pits: Pit[];
  width: number;
  height: number;
  bgColor: string;
  name: string;
}

// Уровень 1: Побег из камеры (движение вправо)
export function createLevel1(): LevelData {
  const platforms: Platform[] = [
    // Пол тюрьмы
    { rect: { x: 0, y: 700, width: 2400, height: 40 } },
    
    // Тюремная камера (старт)
    { rect: { x: 0, y: 0, width: 20, height: 740 } }, // Левая стена
    { rect: { x: 150, y: 400, width: 20, height: 300 } }, // Правая стена камеры (с проёмом сверху)
    { rect: { x: 0, y: 400, width: 150, height: 20 } }, // Потолок камеры
    
    // Коридор после камеры
    { rect: { x: 300, y: 600, width: 100, height: 20 } }, // Подъём 45° (ступеньки)
    { rect: { x: 350, y: 550, width: 100, height: 20 } },
    { rect: { x: 400, y: 500, width: 100, height: 20 } },
    
    // Стена-препятствие (нужно обходить через верх)
    { rect: { x: 600, y: 300, width: 20, height: 400 } },
    
    // Платформы для обхода стены
    { rect: { x: 500, y: 400, width: 80, height: 20 } },
    { rect: { x: 650, y: 350, width: 80, height: 20 } },
    { rect: { x: 750, y: 400, width: 80, height: 20 } },
    
    // Продолжение коридора
    { rect: { x: 850, y: 700, width: 200, height: 40 } },
    { rect: { x: 900, y: 600, width: 100, height: 20 } },
    
    // Лестница вверх
    { rect: { x: 1100, y: 500, width: 100, height: 20 } },
    { rect: { x: 1250, y: 400, width: 100, height: 20 } },
    { rect: { x: 1400, y: 300, width: 100, height: 20 } },
    
    // Верхний уровень
    { rect: { x: 1550, y: 250, width: 300, height: 20 } },
    
    // Стены
    { rect: { x: 2380, y: 0, width: 20, height: 740 } }, // Правая стена
    { rect: { x: 0, y: 0, width: 2400, height: 20 } }, // Потолок
    
    // Проходные платформы
    { rect: { x: 200, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1050, y: 650, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Лестница в камере (чтобы выбраться)
    { x: 80, y: 420, width: 30, height: 280 },
    // Лестница к верхнему уровню
    { x: 1600, y: 250, width: 30, height: 450 },
  ];

  const enemies: EnemyStats[] = [
    // Охранник в коридоре
    {
      maxHealth: 35,
      health: 35,
      damage: 12,
      moveSpeed: 70,
      detectionRange: 220,
      attackRange: 45,
      attackCooldown: 1.0,
      patrolPoints: [{ x: 350, y: 656 }, { x: 550, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 10,
    },
    // Охранник за стеной
    {
      maxHealth: 35,
      health: 35,
      damage: 12,
      moveSpeed: 80,
      detectionRange: 200,
      attackRange: 45,
      attackCooldown: 0.9,
      patrolPoints: [{ x: 700, y: 656 }, { x: 850, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 12,
    },
    // Охранник наверху
    {
      maxHealth: 40,
      health: 40,
      damage: 14,
      moveSpeed: 85,
      detectionRange: 250,
      attackRange: 50,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 1600, y: 206 }, { x: 1800, y: 206 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
  ];

  const pits: Pit[] = [
    { x: 500, y: 700, width: 80, height: 40, damage: 40 },
    { x: 1050, y: 700, width: 100, height: 40, damage: 40 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 50, y: 650 }, // В камере
    exitDoor: { x: 1800, y: 190, width: 40, height: 60 },
    pits,
    width: 2400,
    height: 740,
    bgColor: '#1a1a1a', // Тёмно-серый (тюремные стены)
    name: 'Тюремная Камера',
  };
}

// Уровень 2: Тюремные коридоры (движение влево)
export function createLevel2(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 700, width: 2400, height: 40 } },
    
    // Старт справа
    { rect: { x: 2380, y: 0, width: 20, height: 740 } }, // Правая стена
    
    // Коридоры с препятствиями
    // Стена 1 (нужно обходить через верх)
    { rect: { x: 2100, y: 300, width: 20, height: 400 } },
    { rect: { x: 2000, y: 400, width: 80, height: 20 } },
    { rect: { x: 2150, y: 350, width: 80, height: 20 } },
    
    // Подъём 45° (ступеньки)
    { rect: { x: 1800, y: 650, width: 80, height: 20 } },
    { rect: { x: 1750, y: 600, width: 80, height: 20 } },
    { rect: { x: 1700, y: 550, width: 80, height: 20 } },
    { rect: { x: 1650, y: 500, width: 80, height: 20 } },
    
    // Стена 2
    { rect: { x: 1500, y: 200, width: 20, height: 500 } },
    { rect: { x: 1350, y: 300, width: 100, height: 20 } },
    { rect: { x: 1550, y: 250, width: 100, height: 20 } },
    
    // Средний коридор
    { rect: { x: 1100, y: 600, width: 200, height: 20 } },
    { rect: { x: 1200, y: 500, width: 100, height: 20 } },
    
    // Стена 3
    { rect: { x: 900, y: 350, width: 20, height: 350 } },
    { rect: { x: 800, y: 450, width: 80, height: 20 } },
    { rect: { x: 950, y: 400, width: 80, height: 20 } },
    
    // Нижний коридор
    { rect: { x: 500, y: 650, width: 300, height: 20 } },
    { rect: { x: 600, y: 550, width: 100, height: 20 } },
    
    // Стена 4 (последняя)
    { rect: { x: 350, y: 250, width: 20, height: 450 } },
    { rect: { x: 250, y: 350, width: 80, height: 20 } },
    { rect: { x: 400, y: 300, width: 80, height: 20 } },
    
    // Финальная секция (выход слева)
    { rect: { x: 50, y: 600, width: 200, height: 20 } },
    { rect: { x: 100, y: 500, width: 100, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 740 } }, // Левая стена
    { rect: { x: 0, y: 0, width: 2400, height: 20 } }, // Потолок
    
    // Проходные платформы
    { rect: { x: 2250, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1000, y: 650, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Лестницы для обхода стен
    { x: 2050, y: 350, width: 30, height: 350 },
    { x: 1400, y: 250, width: 30, height: 450 },
    { x: 850, y: 400, width: 30, height: 300 },
    { x: 300, y: 300, width: 30, height: 400 },
  ];

  const enemies: EnemyStats[] = [
    // Охранники в каждом коридоре
    {
      maxHealth: 40,
      health: 40,
      damage: 14,
      moveSpeed: 85,
      detectionRange: 230,
      attackRange: 48,
      attackCooldown: 0.9,
      patrolPoints: [{ x: 2200, y: 656 }, { x: 2350, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
    {
      maxHealth: 40,
      health: 40,
      damage: 14,
      moveSpeed: 90,
      detectionRange: 240,
      attackRange: 50,
      attackCooldown: 0.85,
      patrolPoints: [{ x: 1600, y: 456 }, { x: 1750, y: 456 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
    {
      maxHealth: 45,
      health: 45,
      damage: 16,
      moveSpeed: 95,
      detectionRange: 250,
      attackRange: 52,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 1150, y: 556 }, { x: 1300, y: 556 }],
      type: EnemyType.MELEE,
      goldDrop: 18,
    },
    {
      maxHealth: 45,
      health: 45,
      damage: 16,
      moveSpeed: 100,
      detectionRange: 260,
      attackRange: 55,
      attackCooldown: 0.75,
      patrolPoints: [{ x: 600, y: 606 }, { x: 750, y: 606 }],
      type: EnemyType.MELEE,
      goldDrop: 20,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 18,
      moveSpeed: 105,
      detectionRange: 270,
      attackRange: 58,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 100, y: 556 }, { x: 200, y: 556 }],
      type: EnemyType.MELEE,
      goldDrop: 25,
    },
  ];

  const pits: Pit[] = [
    { x: 1900, y: 700, width: 80, height: 40, damage: 50 },
    { x: 1050, y: 700, width: 100, height: 40, damage: 50 },
    { x: 450, y: 700, width: 80, height: 40, damage: 50 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 2300, y: 650 }, // Справа
    exitDoor: { x: 50, y: 440, width: 40, height: 60 }, // Выход слева
    pits,
    width: 2400,
    height: 740,
    bgColor: '#1a1a1a',
    name: 'Тюремные Коридоры',
  };
}

// Уровень 3: Тюремный лабиринт (смешанное направление)
export function createLevel3(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 800, width: 2800, height: 40 } },
    
    // Старт в центре
    // Стена 1 (разделяет уровень)
    { rect: { x: 1200, y: 200, width: 20, height: 600 } },
    
    // Левая часть (движение влево-вверх)
    { rect: { x: 100, y: 700, width: 200, height: 20 } },
    { rect: { x: 350, y: 600, width: 150, height: 20 } },
    { rect: { x: 150, y: 500, width: 150, height: 20 } },
    { rect: { x: 400, y: 400, width: 150, height: 20 } },
    { rect: { x: 200, y: 300, width: 150, height: 20 } },
    { rect: { x: 450, y: 200, width: 200, height: 20 } },
    
    // Стена 2 (блокирует прямой путь)
    { rect: { x: 700, y: 300, width: 20, height: 500 } },
    { rect: { x: 600, y: 400, width: 80, height: 20 } },
    { rect: { x: 750, y: 350, width: 80, height: 20 } },
    
    // Правая часть (движение вправо-вверх)
    { rect: { x: 1400, y: 700, width: 200, height: 20 } },
    { rect: { x: 1650, y: 600, width: 150, height: 20 } },
    { rect: { x: 1450, y: 500, width: 150, height: 20 } },
    { rect: { x: 1700, y: 400, width: 150, height: 20 } },
    { rect: { x: 1500, y: 300, width: 150, height: 20 } },
    { rect: { x: 1750, y: 200, width: 200, height: 20 } },
    
    // Стена 3
    { rect: { x: 2100, y: 250, width: 20, height: 550 } },
    { rect: { x: 2000, y: 350, width: 80, height: 20 } },
    { rect: { x: 2150, y: 300, width: 80, height: 20 } },
    
    // Финальная секция
    { rect: { x: 2300, y: 600, width: 200, height: 20 } },
    { rect: { x: 2450, y: 500, width: 150, height: 20 } },
    { rect: { x: 2600, y: 400, width: 150, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 840 } },
    { rect: { x: 2780, y: 0, width: 20, height: 840 } },
    { rect: { x: 0, y: 0, width: 2800, height: 20 } },
    
    // Проходные платформы
    { rect: { x: 550, y: 750, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1300, y: 750, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 2200, y: 750, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Левая часть
    { x: 250, y: 300, width: 30, height: 500 },
    { x: 500, y: 200, width: 30, height: 600 },
    
    // Правая часть
    { x: 1550, y: 300, width: 30, height: 500 },
    { x: 1800, y: 200, width: 30, height: 600 },
    
    // Финальная секция
    { x: 2350, y: 400, width: 30, height: 400 },
    { x: 2500, y: 300, width: 30, height: 500 },
  ];

  const enemies: EnemyStats[] = [
    // Левая часть
    {
      maxHealth: 45,
      health: 45,
      damage: 16,
      moveSpeed: 105,
      detectionRange: 250,
      attackRange: 52,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 150, y: 656 }, { x: 300, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 18,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 18,
      moveSpeed: 110,
      detectionRange: 260,
      attackRange: 55,
      attackCooldown: 0.75,
      patrolPoints: [{ x: 400, y: 356 }, { x: 550, y: 356 }],
      type: EnemyType.MELEE,
      goldDrop: 22,
    },
    // Правая часть
    {
      maxHealth: 50,
      health: 50,
      damage: 18,
      moveSpeed: 115,
      detectionRange: 270,
      attackRange: 58,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 1450, y: 656 }, { x: 1600, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 25,
    },
    {
      maxHealth: 55,
      health: 55,
      damage: 20,
      moveSpeed: 120,
      detectionRange: 280,
      attackRange: 60,
      attackCooldown: 0.65,
      patrolPoints: [{ x: 1700, y: 356 }, { x: 1850, y: 356 }],
      type: EnemyType.MELEE,
      goldDrop: 30,
    },
    // Финальная секция
    {
      maxHealth: 60,
      health: 60,
      damage: 22,
      moveSpeed: 125,
      detectionRange: 290,
      attackRange: 65,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 2500, y: 356 }, { x: 2700, y: 356 }],
      type: EnemyType.MELEE,
      goldDrop: 40,
    },
  ];

  const pits: Pit[] = [
    { x: 800, y: 800, width: 100, height: 40, damage: 60 },
    { x: 1900, y: 800, width: 100, height: 40, damage: 60 },
    { x: 2650, y: 800, width: 100, height: 40, damage: 60 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 1100, y: 750 }, // В центре
    exitDoor: { x: 2650, y: 340, width: 40, height: 60 }, // Выход справа-сверху
    pits,
    width: 2800,
    height: 840,
    bgColor: '#1a1a1a',
    name: 'Тюремный Лабиринт',
  };
}

// Уровень 4: Небесная крепость с летающими врагами
export function createLevel4(): LevelData {
  const platforms: Platform[] = [
    // Пол с пропастями
    { rect: { x: 0, y: 700, width: 400, height: 40 } },
    { rect: { x: 550, y: 700, width: 300, height: 40 } },
    { rect: { x: 1000, y: 700, width: 400, height: 40 } },
    { rect: { x: 1550, y: 700, width: 450, height: 40 } },
    
    // Парящие платформы
    { rect: { x: 150, y: 550, width: 120, height: 20 } },
    { rect: { x: 350, y: 450, width: 120, height: 20 } },
    { rect: { x: 550, y: 350, width: 120, height: 20 } },
    { rect: { x: 750, y: 250, width: 150, height: 20 } },
    { rect: { x: 1000, y: 350, width: 120, height: 20 } },
    { rect: { x: 1200, y: 450, width: 120, height: 20 } },
    { rect: { x: 1400, y: 550, width: 120, height: 20 } },
    { rect: { x: 1650, y: 450, width: 150, height: 20 } },
    { rect: { x: 1850, y: 300, width: 150, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 740 } },
    { rect: { x: 1980, y: 0, width: 20, height: 740 } },
    
    // Проходные платформы
    { rect: { x: 450, y: 600, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 900, y: 550, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    { x: 200, y: 450, width: 30, height: 250 },
    { x: 1100, y: 350, width: 30, height: 350 },
    { x: 1700, y: 300, width: 30, height: 400 },
  ];

  const enemies: EnemyStats[] = [
    // Летающие враги
    {
      maxHealth: 25,
      health: 25,
      damage: 12,
      moveSpeed: 100,
      detectionRange: 350,
      attackRange: 280,
      attackCooldown: 1.0,
      patrolPoints: [{ x: 300, y: 250 }, { x: 600, y: 250 }],
      type: EnemyType.FLYING,
      goldDrop: 20,
    },
    {
      maxHealth: 25,
      health: 25,
      damage: 12,
      moveSpeed: 100,
      detectionRange: 350,
      attackRange: 280,
      attackCooldown: 1.0,
      patrolPoints: [{ x: 900, y: 200 }, { x: 1200, y: 200 }],
      type: EnemyType.FLYING,
      goldDrop: 20,
    },
    {
      maxHealth: 30,
      health: 30,
      damage: 15,
      moveSpeed: 120,
      detectionRange: 400,
      attackRange: 300,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 1500, y: 180 }, { x: 1800, y: 180 }],
      type: EnemyType.FLYING,
      goldDrop: 25,
    },
    // Наземные враги
    {
      maxHealth: 35,
      health: 35,
      damage: 14,
      moveSpeed: 90,
      detectionRange: 220,
      attackRange: 45,
      attackCooldown: 0.9,
      patrolPoints: [{ x: 100, y: 656 }, { x: 350, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
    {
      maxHealth: 30,
      health: 30,
      damage: 12,
      moveSpeed: 70,
      detectionRange: 320,
      attackRange: 280,
      attackCooldown: 1.2,
      patrolPoints: [{ x: 1050, y: 656 }, { x: 1350, y: 656 }],
      type: EnemyType.RANGED,
      goldDrop: 20,
    },
  ];

  const pits: Pit[] = [
    { x: 400, y: 700, width: 150, height: 40, damage: 100 },
    { x: 850, y: 700, width: 150, height: 40, damage: 100 },
    { x: 1400, y: 700, width: 150, height: 40, damage: 100 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 50, y: 650 },
    exitDoor: { x: 1900, y: 240, width: 40, height: 60 },
    pits,
    width: 2000,
    height: 740,
    bgColor: '#0a1a2a',
    name: 'Небесная Крепость',
  };
}

// Уровень 5: Адская Бездна - финальный уровень
export function createLevel5(): LevelData {
  const platforms: Platform[] = [
    // Пол с множеством пропастей
    { rect: { x: 0, y: 800, width: 300, height: 40 } },
    { rect: { x: 450, y: 800, width: 200, height: 40 } },
    { rect: { x: 800, y: 800, width: 250, height: 40 } },
    { rect: { x: 1200, y: 800, width: 200, height: 40 } },
    { rect: { x: 1550, y: 800, width: 250, height: 40 } },
    { rect: { x: 1950, y: 800, width: 350, height: 40 } },
    
    // Множество платформ разной высоты
    { rect: { x: 100, y: 650, width: 150, height: 20 } },
    { rect: { x: 300, y: 550, width: 120, height: 20 } },
    { rect: { x: 500, y: 450, width: 120, height: 20 } },
    { rect: { x: 700, y: 350, width: 150, height: 20 } },
    { rect: { x: 950, y: 450, width: 120, height: 20 } },
    { rect: { x: 1150, y: 550, width: 120, height: 20 } },
    { rect: { x: 1350, y: 650, width: 150, height: 20 } },
    { rect: { x: 1550, y: 550, width: 120, height: 20 } },
    { rect: { x: 1750, y: 450, width: 150, height: 20 } },
    { rect: { x: 1950, y: 350, width: 150, height: 20 } },
    { rect: { x: 2100, y: 250, width: 200, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 840 } },
    { rect: { x: 2280, y: 0, width: 20, height: 840 } },
    
    // Проходные платформы
    { rect: { x: 200, y: 750, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 650, y: 700, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1050, y: 750, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1450, y: 750, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    { x: 150, y: 550, width: 30, height: 250 },
    { x: 550, y: 350, width: 30, height: 450 },
    { x: 1000, y: 350, width: 30, height: 450 },
    { x: 1600, y: 450, width: 30, height: 350 },
    { x: 2000, y: 250, width: 30, height: 550 },
  ];

  const enemies: EnemyStats[] = [
    // Летающие враги
    {
      maxHealth: 35,
      health: 35,
      damage: 16,
      moveSpeed: 130,
      detectionRange: 400,
      attackRange: 320,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 400, y: 200 }, { x: 800, y: 200 }],
      type: EnemyType.FLYING,
      goldDrop: 30,
    },
    {
      maxHealth: 40,
      health: 40,
      damage: 18,
      moveSpeed: 140,
      detectionRange: 450,
      attackRange: 350,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 1200, y: 180 }, { x: 1700, y: 180 }],
      type: EnemyType.FLYING,
      goldDrop: 35,
    },
    // Наземные враги
    {
      maxHealth: 45,
      health: 45,
      damage: 18,
      moveSpeed: 110,
      detectionRange: 250,
      attackRange: 55,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 50, y: 756 }, { x: 250, y: 756 }],
      type: EnemyType.MELEE,
      goldDrop: 25,
    },
    {
      maxHealth: 40,
      health: 40,
      damage: 16,
      moveSpeed: 80,
      detectionRange: 350,
      attackRange: 300,
      attackCooldown: 1.0,
      patrolPoints: [{ x: 850, y: 756 }, { x: 1000, y: 756 }],
      type: EnemyType.RANGED,
      goldDrop: 30,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 20,
      moveSpeed: 120,
      detectionRange: 280,
      attackRange: 60,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 1250, y: 756 }, { x: 1400, y: 756 }],
      type: EnemyType.MELEE,
      goldDrop: 35,
    },
    {
      maxHealth: 45,
      health: 45,
      damage: 18,
      moveSpeed: 90,
      detectionRange: 380,
      attackRange: 320,
      attackCooldown: 0.9,
      patrolPoints: [{ x: 1600, y: 756 }, { x: 1750, y: 756 }],
      type: EnemyType.RANGED,
      goldDrop: 30,
    },
    // Босс - летающий
    {
      maxHealth: 80,
      health: 80,
      damage: 25,
      moveSpeed: 150,
      detectionRange: 500,
      attackRange: 400,
      attackCooldown: 0.5,
      patrolPoints: [{ x: 1900, y: 150 }, { x: 2200, y: 150 }],
      type: EnemyType.FLYING,
      goldDrop: 100,
    },
  ];

  const pits: Pit[] = [
    { x: 300, y: 800, width: 150, height: 40, damage: 100 },
    { x: 650, y: 800, width: 150, height: 40, damage: 100 },
    { x: 1050, y: 800, width: 150, height: 40, damage: 100 },
    { x: 1400, y: 800, width: 150, height: 40, damage: 100 },
    { x: 1800, y: 800, width: 150, height: 40, damage: 100 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 50, y: 750 },
    exitDoor: { x: 2150, y: 190, width: 40, height: 60 },
    pits,
    width: 2300,
    height: 840,
    bgColor: '#2a0a0a',
    name: 'Адская Бездна',
  };
}

// Функция для получения уровня по номеру
export function getLevel(levelNumber: number): LevelData {
  switch (levelNumber) {
    case 1:
      return createLevel1();
    case 2:
      return createLevel2();
    case 3:
      return createLevel3();
    case 4:
      return createLevel4();
    case 5:
      return createLevel5();
    default:
      return createLevel1();
  }
}

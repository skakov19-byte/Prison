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

// Уровень 1: Обучение с вертикальными секциями
export function createLevel1(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 700, width: 2000, height: 40 } },
    
    // Левая секция - низкая платформа
    { rect: { x: 100, y: 550, width: 150, height: 20 } },
    
    // Средняя секция - несколько уровней
    { rect: { x: 400, y: 600, width: 120, height: 20 } },
    { rect: { x: 550, y: 480, width: 120, height: 20 } },
    { rect: { x: 400, y: 360, width: 120, height: 20 } },
    
    // Правая секция - высокие платформы
    { rect: { x: 800, y: 550, width: 150, height: 20 } },
    { rect: { x: 1000, y: 420, width: 150, height: 20 } },
    { rect: { x: 1200, y: 300, width: 150, height: 20 } },
    { rect: { x: 1400, y: 200, width: 200, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 740 } },
    { rect: { x: 1980, y: 0, width: 20, height: 740 } },
    
    // Проходные платформы
    { rect: { x: 250, y: 650, width: 100, height: 15 }, isPassThrough: true },
    { rect: { x: 700, y: 650, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Лестница к средней секции
    { x: 500, y: 360, width: 30, height: 340 },
    // Лестница к правой секции
    { x: 1050, y: 200, width: 30, height: 500 },
  ];

  const enemies: EnemyStats[] = [
    {
      maxHealth: 30,
      health: 30,
      damage: 10,
      moveSpeed: 80,
      detectionRange: 200,
      attackRange: 40,
      attackCooldown: 1.0,
      patrolPoints: [{ x: 150, y: 656 }, { x: 350, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 10,
    },
    {
      maxHealth: 20,
      health: 20,
      damage: 8,
      moveSpeed: 50,
      detectionRange: 300,
      attackRange: 250,
      attackCooldown: 1.5,
      patrolPoints: [{ x: 850, y: 506 }, { x: 950, y: 506 }],
      type: EnemyType.RANGED,
      goldDrop: 15,
    },
    {
      maxHealth: 30,
      health: 30,
      damage: 10,
      moveSpeed: 90,
      detectionRange: 200,
      attackRange: 40,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 1250, y: 256 }, { x: 1350, y: 256 }],
      type: EnemyType.MELEE,
      goldDrop: 10,
    },
  ];

  const pits: Pit[] = [
    { x: 700, y: 700, width: 80, height: 40, damage: 30 },
    { x: 1300, y: 700, width: 100, height: 40, damage: 30 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 50, y: 650 },
    exitDoor: { x: 1500, y: 140, width: 40, height: 60 },
    pits,
    width: 2000,
    height: 740,
    bgColor: '#0a0a1a',
    name: 'Подземелье Теней',
  };
}

// Уровень 2: Башня с множеством этажей
export function createLevel2(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 800, width: 1600, height: 40 } },
    
    // Первый этаж
    { rect: { x: 100, y: 650, width: 200, height: 20 } },
    { rect: { x: 400, y: 650, width: 200, height: 20 } },
    { rect: { x: 700, y: 650, width: 200, height: 20 } },
    
    // Второй этаж
    { rect: { x: 200, y: 500, width: 180, height: 20 } },
    { rect: { x: 500, y: 500, width: 180, height: 20 } },
    { rect: { x: 800, y: 500, width: 180, height: 20 } },
    
    // Третий этаж
    { rect: { x: 100, y: 350, width: 150, height: 20 } },
    { rect: { x: 350, y: 350, width: 150, height: 20 } },
    { rect: { x: 600, y: 350, width: 150, height: 20 } },
    { rect: { x: 850, y: 350, width: 150, height: 20 } },
    
    // Четвёртый этаж - вершина
    { rect: { x: 300, y: 200, width: 200, height: 20 } },
    { rect: { x: 600, y: 200, width: 200, height: 20 } },
    
    // Финальная платформа
    { rect: { x: 450, y: 80, width: 200, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 840 } },
    { rect: { x: 1580, y: 0, width: 20, height: 840 } },
  ];

  const ladders = [
    // Лестницы между этажами
    { x: 300, y: 500, width: 30, height: 300 },
    { x: 700, y: 500, width: 30, height: 300 },
    { x: 200, y: 200, width: 30, height: 300 },
    { x: 800, y: 200, width: 30, height: 300 },
    { x: 500, y: 80, width: 30, height: 120 },
  ];

  const enemies: EnemyStats[] = [
    {
      maxHealth: 35,
      health: 35,
      damage: 12,
      moveSpeed: 90,
      detectionRange: 220,
      attackRange: 45,
      attackCooldown: 0.9,
      patrolPoints: [{ x: 150, y: 606 }, { x: 300, y: 606 }],
      type: EnemyType.MELEE,
      goldDrop: 12,
    },
    {
      maxHealth: 25,
      health: 25,
      damage: 10,
      moveSpeed: 60,
      detectionRange: 320,
      attackRange: 280,
      attackCooldown: 1.3,
      patrolPoints: [{ x: 550, y: 456 }, { x: 680, y: 456 }],
      type: EnemyType.RANGED,
      goldDrop: 18,
    },
    {
      maxHealth: 35,
      health: 35,
      damage: 12,
      moveSpeed: 95,
      detectionRange: 220,
      attackRange: 45,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 350, y: 306 }, { x: 500, y: 306 }],
      type: EnemyType.MELEE,
      goldDrop: 12,
    },
    {
      maxHealth: 30,
      health: 30,
      damage: 14,
      moveSpeed: 70,
      detectionRange: 300,
      attackRange: 260,
      attackCooldown: 1.1,
      patrolPoints: [{ x: 650, y: 306 }, { x: 750, y: 306 }],
      type: EnemyType.RANGED,
      goldDrop: 20,
    },
    {
      maxHealth: 40,
      health: 40,
      damage: 15,
      moveSpeed: 100,
      detectionRange: 250,
      attackRange: 50,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 350, y: 156 }, { x: 500, y: 156 }],
      type: EnemyType.MELEE,
      goldDrop: 25,
    },
  ];

  const pits: Pit[] = [
    { x: 300, y: 800, width: 80, height: 40, damage: 40 },
    { x: 900, y: 800, width: 80, height: 40, damage: 40 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 50, y: 750 },
    exitDoor: { x: 530, y: 20, width: 40, height: 60 },
    pits,
    width: 1600,
    height: 840,
    bgColor: '#0a1a0a',
    name: 'Башня Проклятых',
  };
}

// Уровень 3: Лабиринт с множеством путей
export function createLevel3(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 900, width: 2400, height: 40 } },
    
    // Нижняя секция
    { rect: { x: 100, y: 750, width: 150, height: 20 } },
    { rect: { x: 350, y: 750, width: 150, height: 20 } },
    { rect: { x: 600, y: 750, width: 150, height: 20 } },
    { rect: { x: 850, y: 750, width: 150, height: 20 } },
    
    // Средняя секция - левая часть
    { rect: { x: 150, y: 600, width: 120, height: 20 } },
    { rect: { x: 350, y: 500, width: 120, height: 20 } },
    { rect: { x: 150, y: 400, width: 120, height: 20 } },
    
    // Средняя секция - правая часть
    { rect: { x: 1000, y: 650, width: 150, height: 20 } },
    { rect: { x: 1200, y: 550, width: 150, height: 20 } },
    { rect: { x: 1400, y: 450, width: 150, height: 20 } },
    { rect: { x: 1600, y: 350, width: 150, height: 20 } },
    
    // Верхняя секция
    { rect: { x: 300, y: 250, width: 200, height: 20 } },
    { rect: { x: 600, y: 200, width: 200, height: 20 } },
    { rect: { x: 900, y: 150, width: 200, height: 20 } },
    { rect: { x: 1200, y: 200, width: 200, height: 20 } },
    { rect: { x: 1500, y: 250, width: 200, height: 20 } },
    
    // Финальная платформа
    { rect: { x: 1800, y: 150, width: 250, height: 20 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 940 } },
    { rect: { x: 2380, y: 0, width: 20, height: 940 } },
    
    // Проходные платформы
    { rect: { x: 500, y: 850, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1100, y: 850, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Левая вертикальная секция
    { x: 200, y: 400, width: 30, height: 350 },
    { x: 400, y: 250, width: 30, height: 500 },
    
    // Правая вертикальная секция
    { x: 1100, y: 350, width: 30, height: 550 },
    { x: 1500, y: 250, width: 30, height: 650 },
    
    // Верхние соединения
    { x: 700, y: 150, width: 30, height: 50 },
    { x: 1000, y: 150, width: 30, height: 50 },
  ];

  const enemies: EnemyStats[] = [
    {
      maxHealth: 40,
      health: 40,
      damage: 14,
      moveSpeed: 100,
      detectionRange: 240,
      attackRange: 50,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 150, y: 706 }, { x: 300, y: 706 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
    {
      maxHealth: 30,
      health: 30,
      damage: 12,
      moveSpeed: 70,
      detectionRange: 340,
      attackRange: 300,
      attackCooldown: 1.2,
      patrolPoints: [{ x: 650, y: 706 }, { x: 800, y: 706 }],
      type: EnemyType.RANGED,
      goldDrop: 20,
    },
    {
      maxHealth: 35,
      health: 35,
      damage: 13,
      moveSpeed: 95,
      detectionRange: 230,
      attackRange: 48,
      attackCooldown: 0.85,
      patrolPoints: [{ x: 200, y: 356 }, { x: 270, y: 356 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
    {
      maxHealth: 30,
      health: 30,
      damage: 15,
      moveSpeed: 75,
      detectionRange: 320,
      attackRange: 280,
      attackCooldown: 1.1,
      patrolPoints: [{ x: 1250, y: 506 }, { x: 1350, y: 506 }],
      type: EnemyType.RANGED,
      goldDrop: 22,
    },
    {
      maxHealth: 45,
      health: 45,
      damage: 16,
      moveSpeed: 110,
      detectionRange: 260,
      attackRange: 55,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 1650, y: 306 }, { x: 1750, y: 306 }],
      type: EnemyType.MELEE,
      goldDrop: 30,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 18,
      moveSpeed: 120,
      detectionRange: 280,
      attackRange: 60,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 1850, y: 106 }, { x: 2050, y: 106 }],
      type: EnemyType.MELEE,
      goldDrop: 40,
    },
  ];

  const pits: Pit[] = [
    { x: 500, y: 900, width: 80, height: 40, damage: 50 },
    { x: 1100, y: 900, width: 80, height: 40, damage: 50 },
    { x: 1700, y: 900, width: 80, height: 40, damage: 50 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 50, y: 850 },
    exitDoor: { x: 1950, y: 90, width: 40, height: 60 },
    pits,
    width: 2400,
    height: 940,
    bgColor: '#1a0a0a',
    name: 'Кровавый Лабиринт',
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

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

export interface Door {
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  requiresLockpick: boolean;
  message?: string;
}

export interface PickupZone {
  x: number;
  y: number;
  width: number;
  height: number;
  item: {
    type: 'LOCKPICK' | 'BATON' | 'KEY';
    name: string;
    icon: string;
    description: string;
  };
  triggerOnAttack?: boolean; // Активируется при ударе
  triggerOnKill?: boolean; // Активируется при убийстве врага
  enemyIndex?: number; // Индекс врага для triggerOnKill
}

export interface LevelData {
  platforms: Platform[];
  ladders: { x: number; y: number; width: number; height: number }[];
  enemies: EnemyStats[];
  playerSpawn: Vector2;
  exitDoor?: { x: number; y: number; width: number; height: number };
  doors?: Door[];
  pickupZones?: PickupZone[];
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
    
    // Тюремная камера (старт) - органичные стены
    { rect: { x: 0, y: 0, width: 40, height: 740 } }, // Толстая левая стена
    { rect: { x: 150, y: 0, width: 40, height: 648 } }, // Правая стена камеры (до двери)
    { rect: { x: 150, y: 700, width: 40, height: 40 } }, // Правая стена камеры (после двери)
    
    // Коридор после камеры - подъём 45° (убраны нижние 2 платформы)
    { rect: { x: 370, y: 550, width: 60, height: 20 } },
    { rect: { x: 430, y: 500, width: 60, height: 20 } },
    
    // Стена-препятствие (органичная, с деталями)
    { rect: { x: 600, y: 250, width: 50, height: 450 } },
    { rect: { x: 580, y: 250, width: 90, height: 30 } }, // Верхушка стены
    
    // Платформы для обхода стены
    { rect: { x: 480, y: 400, width: 100, height: 25 } },
    { rect: { x: 680, y: 350, width: 100, height: 25 } },
    { rect: { x: 780, y: 400, width: 100, height: 25 } },
    
    // Продолжение коридора
    { rect: { x: 900, y: 700, width: 300, height: 40 } },
    { rect: { x: 950, y: 600, width: 120, height: 25 } },
    
    // Лестница вверх - платформы
    { rect: { x: 1150, y: 500, width: 120, height: 25 } },
    { rect: { x: 1300, y: 400, width: 120, height: 25 } },
    { rect: { x: 1450, y: 300, width: 120, height: 25 } },
    
    // Верхний уровень
    { rect: { x: 1600, y: 250, width: 350, height: 25 } },
    
    // Стены
    { rect: { x: 2360, y: 0, width: 40, height: 740 } }, // Толстая правая стена
    { rect: { x: 0, y: 0, width: 2400, height: 30 } }, // Потолок
    
    // Проходные платформы
    { rect: { x: 200, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1100, y: 650, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Лестница к верхнему уровню
    { x: 1650, y: 250, width: 30, height: 450 },
  ];

  const doors: Door[] = [
    // Дверь камеры (требует отмычку) - по росту человека
    {
      x: 150,
      y: 648,
      width: 40,
      height: 52,
      locked: true,
      requiresLockpick: true,
      message: 'Открыто отмычкой',
    },
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
      patrolPoints: [{ x: 1650, y: 206 }, { x: 1850, y: 206 }],
      type: EnemyType.MELEE,
      goldDrop: 15,
    },
  ];

  const pits: Pit[] = [
    { x: 500, y: 700, width: 80, height: 40, damage: 40 },
    { x: 1100, y: 700, width: 100, height: 40, damage: 40 },
  ];

  const pickupZones: PickupZone[] = [
    {
      x: 10,
      y: 620,
      width: 50,
      height: 80,
      item: {
        type: 'LOCKPICK',
        name: 'Отмычка',
        icon: '🔑',
        description: 'Может открыть замок',
      },
      triggerOnAttack: true, // Активируется при ударе по стене
    },
    {
      x: 350,
      y: 656,
      width: 40,
      height: 40,
      item: {
        type: 'BATON',
        name: 'Дубинка',
        icon: '🏏',
        description: 'Улучшает ближний бой',
      },
      triggerOnKill: true, // Активируется при убийстве врага
      enemyIndex: 0, // Первый охранник
    },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 60, y: 650 }, // В камере
    exitDoor: { x: 1850, y: 190, width: 40, height: 60 },
    doors,
    pickupZones,
    pits,
    width: 2400,
    height: 740,
    bgColor: '#1a1a1a', // Тюремный фон
    name: 'Тюремная Камера',
  };
}

// Уровень 2: Тюремные коридоры (движение влево)
export function createLevel2(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 700, width: 2400, height: 40 } },
    
    // Старт справа - органичная стена
    { rect: { x: 2360, y: 0, width: 40, height: 740 } },
    
    // === СТАРТОВАЯ ОБЛАСТЬ (справа) ===
    // Платформы для подъёма от пола
    { rect: { x: 2250, y: 600, width: 100, height: 25 } },
    { rect: { x: 2200, y: 500, width: 100, height: 25 } },
    { rect: { x: 2250, y: 400, width: 100, height: 25 } },
    
    // Стена 1 - органичная с деталями
    { rect: { x: 2100, y: 350, width: 50, height: 350 } },
    { rect: { x: 2080, y: 350, width: 90, height: 30 } }, // Верхушка
    
    // Платформы для обхода стены 1
    { rect: { x: 2180, y: 550, width: 80, height: 25 } }, // Справа от стены (нижняя)
    { rect: { x: 2180, y: 400, width: 80, height: 25 } }, // Справа от стены (верхняя)
    { rect: { x: 1980, y: 400, width: 80, height: 25 } }, // Слева от стены (верхняя)
    { rect: { x: 1980, y: 550, width: 80, height: 25 } }, // Слева от стены (нижняя)
    
    // Подъём 45° (ступеньки)
    { rect: { x: 1800, y: 650, width: 70, height: 20 } },
    { rect: { x: 1740, y: 600, width: 70, height: 20 } },
    { rect: { x: 1680, y: 550, width: 70, height: 20 } },
    { rect: { x: 1620, y: 500, width: 70, height: 20 } },
    
    // Стена 2 - органичная
    { rect: { x: 1500, y: 300, width: 50, height: 400 } },
    { rect: { x: 1480, y: 300, width: 90, height: 30 } }, // Верхушка
    
    // Платформы для обхода стены 2
    { rect: { x: 1580, y: 500, width: 80, height: 25 } }, // Справа от стены (нижняя)
    { rect: { x: 1580, y: 350, width: 80, height: 25 } }, // Справа от стены (верхняя)
    { rect: { x: 1380, y: 350, width: 80, height: 25 } }, // Слева от стены (верхняя)
    { rect: { x: 1380, y: 500, width: 80, height: 25 } }, // Слева от стены (нижняя)
    
    // Средний коридор
    { rect: { x: 1100, y: 600, width: 250, height: 25 } },
    { rect: { x: 1200, y: 500, width: 120, height: 25 } },
    
    // Стена 3 - органичная
    { rect: { x: 900, y: 350, width: 50, height: 350 } },
    { rect: { x: 880, y: 350, width: 90, height: 30 } }, // Верхушка
    
    // Платформы для обхода стены 3
    { rect: { x: 980, y: 500, width: 80, height: 25 } }, // Справа от стены (нижняя)
    { rect: { x: 980, y: 400, width: 80, height: 25 } }, // Справа от стены (верхняя)
    { rect: { x: 780, y: 400, width: 80, height: 25 } }, // Слева от стены (верхняя)
    { rect: { x: 780, y: 500, width: 80, height: 25 } }, // Слева от стены (нижняя)
    
    // Нижний коридор
    { rect: { x: 500, y: 650, width: 350, height: 25 } },
    { rect: { x: 600, y: 550, width: 120, height: 25 } },
    
    // Стена 4 - органичная (последняя)
    { rect: { x: 350, y: 350, width: 50, height: 350 } },
    { rect: { x: 330, y: 350, width: 90, height: 30 } }, // Верхушка
    
    // Платформы для обхода стены 4
    { rect: { x: 430, y: 500, width: 80, height: 25 } }, // Справа от стены (нижняя)
    { rect: { x: 430, y: 400, width: 80, height: 25 } }, // Справа от стены (верхняя)
    { rect: { x: 230, y: 400, width: 80, height: 25 } }, // Слева от стены (верхняя)
    { rect: { x: 230, y: 500, width: 80, height: 25 } }, // Слева от стены (нижняя)
    
    // Финальная секция (выход слева)
    { rect: { x: 50, y: 600, width: 250, height: 25 } },
    { rect: { x: 100, y: 500, width: 120, height: 25 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 40, height: 740 } }, // Толстая левая стена
    { rect: { x: 0, y: 0, width: 2400, height: 30 } }, // Потолок
    
    // Проходные платформы
    { rect: { x: 2250, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1000, y: 650, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Лестница в стартовой области (справа) для подъёма
    { x: 2280, y: 400, width: 30, height: 300 },
    
    // Лестницы для обхода стены 1
    { x: 2200, y: 400, width: 30, height: 150 }, // Справа от стены 1
    { x: 2000, y: 400, width: 30, height: 150 }, // Слева от стены 1
    
    // Лестницы для обхода стены 2
    { x: 1600, y: 350, width: 30, height: 150 }, // Справа от стены 2
    { x: 1400, y: 350, width: 30, height: 150 }, // Слева от стены 2
    
    // Лестницы для обхода стены 3
    { x: 1000, y: 400, width: 30, height: 100 }, // Справа от стены 3
    { x: 800, y: 400, width: 30, height: 100 }, // Слева от стены 3
    
    // Лестницы для обхода стены 4
    { x: 450, y: 400, width: 30, height: 100 }, // Справа от стены 4
    { x: 250, y: 400, width: 30, height: 100 }, // Слева от стены 4
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
      patrolPoints: [{ x: 1600, y: 656 }, { x: 1750, y: 656 }],
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
    
    // Старт в центре - центральная стена (уменьшена)
    { rect: { x: 1200, y: 400, width: 60, height: 400 } },
    { rect: { x: 1180, y: 400, width: 100, height: 30 } }, // Верхушка
    
    // Платформы для обхода центральной стены
    { rect: { x: 1280, y: 600, width: 80, height: 25 } }, // Справа (нижняя)
    { rect: { x: 1280, y: 450, width: 80, height: 25 } }, // Справа (верхняя)
    { rect: { x: 1100, y: 450, width: 80, height: 25 } }, // Слева (верхняя)
    { rect: { x: 1100, y: 600, width: 80, height: 25 } }, // Слева (нижняя)
    
    // Левая часть (движение влево-вверх)
    { rect: { x: 100, y: 700, width: 250, height: 25 } },
    { rect: { x: 350, y: 600, width: 180, height: 25 } },
    { rect: { x: 150, y: 500, width: 180, height: 25 } },
    { rect: { x: 400, y: 400, width: 180, height: 25 } },
    { rect: { x: 200, y: 300, width: 180, height: 25 } },
    { rect: { x: 450, y: 200, width: 250, height: 25 } },
    
    // Стена 2 - органичная (уменьшена)
    { rect: { x: 700, y: 400, width: 50, height: 400 } },
    { rect: { x: 680, y: 400, width: 90, height: 30 } }, // Верхушка
    
    // Платформы для обхода стены 2
    { rect: { x: 780, y: 600, width: 80, height: 25 } }, // Справа (нижняя)
    { rect: { x: 780, y: 450, width: 80, height: 25 } }, // Справа (верхняя)
    { rect: { x: 600, y: 450, width: 80, height: 25 } }, // Слева (верхняя)
    { rect: { x: 600, y: 600, width: 80, height: 25 } }, // Слева (нижняя)
    
    // Правая часть (движение вправо-вверх)
    { rect: { x: 1400, y: 700, width: 250, height: 25 } },
    { rect: { x: 1650, y: 600, width: 180, height: 25 } },
    { rect: { x: 1450, y: 500, width: 180, height: 25 } },
    { rect: { x: 1700, y: 400, width: 180, height: 25 } },
    { rect: { x: 1500, y: 300, width: 180, height: 25 } },
    { rect: { x: 1750, y: 200, width: 250, height: 25 } },
    
    // Стена 3 - органичная (уменьшена)
    { rect: { x: 2100, y: 400, width: 50, height: 400 } },
    { rect: { x: 2080, y: 400, width: 90, height: 30 } }, // Верхушка
    
    // Платформы для обхода стены 3
    { rect: { x: 2180, y: 600, width: 80, height: 25 } }, // Справа (нижняя)
    { rect: { x: 2180, y: 450, width: 80, height: 25 } }, // Справа (верхняя)
    { rect: { x: 2000, y: 450, width: 80, height: 25 } }, // Слева (верхняя)
    { rect: { x: 2000, y: 600, width: 80, height: 25 } }, // Слева (нижняя)
    
    // Финальная секция
    { rect: { x: 2300, y: 600, width: 250, height: 25 } },
    { rect: { x: 2450, y: 500, width: 180, height: 25 } },
    { rect: { x: 2600, y: 400, width: 180, height: 25 } },
    
    // Стены
    { rect: { x: 0, y: 0, width: 40, height: 840 } },
    { rect: { x: 2760, y: 0, width: 40, height: 840 } },
    { rect: { x: 0, y: 0, width: 2800, height: 30 } },
    
    // Проходные платформы
    { rect: { x: 550, y: 750, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1300, y: 750, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 2200, y: 750, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    // Лестницы для обхода центральной стены
    { x: 1300, y: 450, width: 30, height: 150 }, // Справа
    { x: 1120, y: 450, width: 30, height: 150 }, // Слева
    
    // Левая часть
    { x: 250, y: 300, width: 30, height: 400 },
    { x: 500, y: 200, width: 30, height: 500 },
    
    // Лестницы для обхода стены 2
    { x: 800, y: 450, width: 30, height: 150 }, // Справа
    { x: 620, y: 450, width: 30, height: 150 }, // Слева
    
    // Правая часть
    { x: 1550, y: 300, width: 30, height: 400 },
    { x: 1800, y: 200, width: 30, height: 500 },
    
    // Лестницы для обхода стены 3
    { x: 2200, y: 450, width: 30, height: 150 }, // Справа
    { x: 2020, y: 450, width: 30, height: 150 }, // Слева
    
    // Финальная секция
    { x: 2350, y: 400, width: 30, height: 200 },
    { x: 2500, y: 300, width: 30, height: 300 },
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

  const pickupZones: PickupZone[] = [
    {
      x: 150,
      y: 650,
      width: 40,
      height: 40,
      item: {
        type: 'KEY',
        name: 'Ключ от выхода',
        icon: '🗝️',
        description: 'Открывает выход из тюрьмы',
      },
      triggerOnAttack: false,
      triggerOnKill: false,
    },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 1100, y: 750 }, // В центре
    exitDoor: { x: 2650, y: 340, width: 40, height: 60 }, // Выход справа-сверху
    pickupZones,
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

// Уровень 6: Финальная битва - Крыша небоскрёба
export function createLevel6(): LevelData {
  const platforms: Platform[] = [
    // Основная платформа крыши
    { rect: { x: 0, y: 700, width: 3000, height: 40 } },
    
    // Стены по краям
    { rect: { x: 0, y: 0, width: 40, height: 740 } },
    { rect: { x: 2960, y: 0, width: 40, height: 740 } },
    { rect: { x: 0, y: 0, width: 3000, height: 30 } },
    
    // Препятствия на крыше
    { rect: { x: 400, y: 600, width: 150, height: 100 } },
    { rect: { x: 800, y: 550, width: 200, height: 150 } },
    { rect: { x: 1200, y: 600, width: 150, height: 100 } },
    { rect: { x: 1600, y: 500, width: 200, height: 200 } },
    { rect: { x: 2000, y: 600, width: 150, height: 100 } },
    { rect: { x: 2400, y: 550, width: 200, height: 150 } },
    
    // Платформы для маневрирования
    { rect: { x: 600, y: 500, width: 100, height: 20 } },
    { rect: { x: 1050, y: 450, width: 100, height: 20 } },
    { rect: { x: 1450, y: 400, width: 100, height: 20 } },
    { rect: { x: 1850, y: 450, width: 100, height: 20 } },
    { rect: { x: 2250, y: 400, width: 100, height: 20 } },
    
    // Проходные платформы
    { rect: { x: 500, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1100, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 1700, y: 650, width: 80, height: 15 }, isPassThrough: true },
    { rect: { x: 2300, y: 650, width: 80, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    { x: 700, y: 500, width: 30, height: 200 },
    { x: 1150, y: 450, width: 30, height: 250 },
    { x: 1550, y: 400, width: 30, height: 300 },
    { x: 1950, y: 450, width: 30, height: 250 },
    { x: 2350, y: 400, width: 30, height: 300 },
  ];

  const enemies: EnemyStats[] = [
    // Финальные летающие враги
    {
      maxHealth: 50,
      health: 50,
      damage: 20,
      moveSpeed: 150,
      detectionRange: 500,
      attackRange: 400,
      attackCooldown: 0.5,
      patrolPoints: [{ x: 300, y: 150 }, { x: 700, y: 150 }],
      type: EnemyType.FLYING,
      goldDrop: 40,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 20,
      moveSpeed: 150,
      detectionRange: 500,
      attackRange: 400,
      attackCooldown: 0.5,
      patrolPoints: [{ x: 900, y: 150 }, { x: 1300, y: 150 }],
      type: EnemyType.FLYING,
      goldDrop: 40,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 20,
      moveSpeed: 150,
      detectionRange: 500,
      attackRange: 400,
      attackCooldown: 0.5,
      patrolPoints: [{ x: 1500, y: 150 }, { x: 1900, y: 150 }],
      type: EnemyType.FLYING,
      goldDrop: 40,
    },
    {
      maxHealth: 50,
      health: 50,
      damage: 20,
      moveSpeed: 150,
      detectionRange: 500,
      attackRange: 400,
      attackCooldown: 0.5,
      patrolPoints: [{ x: 2100, y: 150 }, { x: 2500, y: 150 }],
      type: EnemyType.FLYING,
      goldDrop: 40,
    },
    // Наземные враги
    {
      maxHealth: 60,
      health: 60,
      damage: 22,
      moveSpeed: 130,
      detectionRange: 300,
      attackRange: 60,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 100, y: 656 }, { x: 350, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 35,
    },
    {
      maxHealth: 60,
      health: 60,
      damage: 22,
      moveSpeed: 130,
      detectionRange: 300,
      attackRange: 60,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 850, y: 656 }, { x: 1100, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 35,
    },
    {
      maxHealth: 60,
      health: 60,
      damage: 22,
      moveSpeed: 130,
      detectionRange: 300,
      attackRange: 60,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 1650, y: 656 }, { x: 1900, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 35,
    },
    {
      maxHealth: 60,
      health: 60,
      damage: 22,
      moveSpeed: 130,
      detectionRange: 300,
      attackRange: 60,
      attackCooldown: 0.6,
      patrolPoints: [{ x: 2450, y: 656 }, { x: 2700, y: 656 }],
      type: EnemyType.MELEE,
      goldDrop: 35,
    },
    // Стрелки
    {
      maxHealth: 55,
      health: 55,
      damage: 20,
      moveSpeed: 100,
      detectionRange: 400,
      attackRange: 350,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 500, y: 656 }, { x: 700, y: 656 }],
      type: EnemyType.RANGED,
      goldDrop: 40,
    },
    {
      maxHealth: 55,
      health: 55,
      damage: 20,
      moveSpeed: 100,
      detectionRange: 400,
      attackRange: 350,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 1300, y: 656 }, { x: 1500, y: 656 }],
      type: EnemyType.RANGED,
      goldDrop: 40,
    },
    {
      maxHealth: 55,
      health: 55,
      damage: 20,
      moveSpeed: 100,
      detectionRange: 400,
      attackRange: 350,
      attackCooldown: 0.8,
      patrolPoints: [{ x: 2100, y: 656 }, { x: 2300, y: 656 }],
      type: EnemyType.RANGED,
      goldDrop: 40,
    },
    // Финальный босс
    {
      maxHealth: 150,
      health: 150,
      damage: 30,
      moveSpeed: 160,
      detectionRange: 600,
      attackRange: 500,
      attackCooldown: 0.4,
      patrolPoints: [{ x: 2700, y: 100 }, { x: 2900, y: 100 }],
      type: EnemyType.FLYING,
      goldDrop: 200,
    },
  ];

  const pits: Pit[] = [
    { x: 700, y: 700, width: 100, height: 40, damage: 100 },
    { x: 1400, y: 700, width: 100, height: 40, damage: 100 },
    { x: 2100, y: 700, width: 100, height: 40, damage: 100 },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 100, y: 650 },
    exitDoor: { x: 2850, y: 640, width: 40, height: 60 },
    pits,
    width: 3000,
    height: 740,
    bgColor: '#0a0a2a',
    name: 'Крыша Небоскрёба',
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
    case 6:
      return createLevel6();
    default:
      return createLevel1();
  }
}

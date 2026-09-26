// ============================================
// LEVEL - Определение уровня и платформ
// ============================================

import { Platform, EnemyStats, EnemyType, Vector2 } from './types';

export interface LevelData {
  platforms: Platform[];
  ladders: { x: number; y: number; width: number; height: number }[];
  enemies: EnemyStats[];
  playerSpawn: Vector2;
  exitDoor?: { x: number; y: number; width: number; height: number };
  width: number;
  height: number;
  bgColor: string;
}

export function createLevel1(): LevelData {
  const platforms: Platform[] = [
    // Пол
    { rect: { x: 0, y: 560, width: 2400, height: 40 } },
    // Платформы
    { rect: { x: 200, y: 450, width: 150, height: 20 } },
    { rect: { x: 450, y: 380, width: 120, height: 20 } },
    { rect: { x: 650, y: 320, width: 150, height: 20 } },
    { rect: { x: 900, y: 400, width: 180, height: 20 } },
    { rect: { x: 1150, y: 350, width: 120, height: 20 } },
    { rect: { x: 1350, y: 280, width: 150, height: 20 } },
    { rect: { x: 1550, y: 420, width: 200, height: 20 } },
    { rect: { x: 1800, y: 350, width: 150, height: 20 } },
    { rect: { x: 2050, y: 300, width: 120, height: 20 } },
    // Стены
    { rect: { x: 0, y: 0, width: 20, height: 600 } },
    { rect: { x: 2380, y: 0, width: 20, height: 600 } },
    // Проходные платформы
    { rect: { x: 300, y: 500, width: 100, height: 15 }, isPassThrough: true },
    { rect: { x: 800, y: 480, width: 100, height: 15 }, isPassThrough: true },
    { rect: { x: 1400, y: 460, width: 100, height: 15 }, isPassThrough: true },
  ];

  const ladders = [
    { x: 580, y: 320, width: 30, height: 240 },
    { x: 1100, y: 350, width: 30, height: 210 },
    { x: 1750, y: 350, width: 30, height: 210 },
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
      patrolPoints: [{ x: 300, y: 516 }, { x: 500, y: 516 }],
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
      patrolPoints: [{ x: 900, y: 516 }, { x: 1050, y: 516 }],
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
      patrolPoints: [{ x: 1300, y: 516 }, { x: 1500, y: 516 }],
      type: EnemyType.MELEE,
      goldDrop: 10,
    },
    {
      maxHealth: 25,
      health: 25,
      damage: 12,
      moveSpeed: 60,
      detectionRange: 280,
      attackRange: 220,
      attackCooldown: 1.2,
      patrolPoints: [{ x: 1700, y: 516 }, { x: 1900, y: 516 }],
      type: EnemyType.RANGED,
      goldDrop: 20,
    },
    {
      maxHealth: 40,
      health: 40,
      damage: 15,
      moveSpeed: 100,
      detectionRange: 250,
      attackRange: 45,
      attackCooldown: 0.7,
      patrolPoints: [{ x: 2050, y: 516 }, { x: 2250, y: 516 }],
      type: EnemyType.MELEE,
      goldDrop: 25,
    },
  ];

  return {
    platforms,
    ladders,
    enemies,
    playerSpawn: { x: 60, y: 500 },
    exitDoor: { x: 2340, y: 500, width: 40, height: 60 },
    width: 2400,
    height: 600,
    bgColor: '#0a0a1a',
  };
}

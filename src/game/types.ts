// ============================================
// ТИПЫ И ИНТЕРФЕЙСЫ ДЛЯ 2D ПЛАТФОРМЕРА
// ============================================

export enum PlayerState {
  IDLE = 'IDLE',
  RUN = 'RUN',
  JUMP = 'JUMP',
  FALL = 'FALL',
  CLIMB = 'CLIMB',
  MELEE_ATTACK = 'MELEE_ATTACK',
  SHOOT = 'SHOOT',
  RELOAD = 'RELOAD',
  HURT = 'HURT',
  DEAD = 'DEAD',
}

export enum EnemyState {
  PATROL = 'PATROL',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  HURT = 'HURT',
  DEAD = 'DEAD',
}

export enum EnemyType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
}

export enum WeaponType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform {
  rect: Rect;
  isPassThrough?: boolean;
  isLadder?: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  active: boolean;
  fromPlayer: boolean;
  lifetime: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface PlayerStats {
  maxHealth: number;
  health: number;
  meleeDamage: number;
  rangedDamage: number;
  moveSpeed: number;
  jumpForce: number;
  maxAmmo: number;
  currentAmmo: number;
  reloadTime: number;
  meleeCooldown: number;
  shootCooldown: number;
  gold: number;
}

export interface EnemyStats {
  maxHealth: number;
  health: number;
  damage: number;
  moveSpeed: number;
  detectionRange: number;
  attackRange: number;
  attackCooldown: number;
  patrolPoints: Vector2[];
  type: EnemyType;
  goldDrop: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  shoot: boolean;
  shootPressed: boolean;
  reload: boolean;
  switchWeapon: boolean;
  switchWeaponPressed: boolean;
  interact: boolean;
  interactPressed: boolean;
}

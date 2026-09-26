import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { PlayerState, WeaponType } from './game/types';

type GameScreen = 'menu' | 'playing' | 'dead' | 'victory' | 'shop';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  maxLevel: number;
  currentLevel: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<GameScreen>('menu');
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [ammo, setAmmo] = useState(12);
  const [maxAmmo, setMaxAmmo] = useState(12);
  const [gold, setGold] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.MELEE);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);
  const [kills, setKills] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelName, setLevelName] = useState('');

  const [shopItems, setShopItems] = useState<ShopItem[]>([
    { id: 'health', name: 'Макс. здоровье', description: '+25 к максимальному здоровью', cost: 30, icon: '❤️', maxLevel: 5, currentLevel: 0 },
    { id: 'melee', name: 'Урон ближнего боя', description: '+5 к урону мечом', cost: 25, icon: '⚔️', maxLevel: 5, currentLevel: 0 },
    { id: 'ranged', name: 'Урон дальнего боя', description: '+3 к урону от пуль', cost: 25, icon: '🔫', maxLevel: 5, currentLevel: 0 },
    { id: 'ammo', name: 'Ёмкость обоймы', description: '+3 патрона к обойме', cost: 40, icon: '📦', maxLevel: 4, currentLevel: 0 },
    { id: 'speed', name: 'Скорость', description: '+20 к скорости передвижения', cost: 35, icon: '💨', maxLevel: 3, currentLevel: 0 },
  ]);

  const startGame = useCallback(() => {
    setHealth(100);
    setMaxHealth(100);
    setAmmo(12);
    setMaxAmmo(12);
    setGold(0);
    setKills(0);
    setCurrentLevel(1);
    setScreen('playing');
  }, []);

  // Запуск игрового движка когда экран = playing
  useEffect(() => {
    if (screen !== 'playing') return;

    // Небольшая задержка чтобы canvas успел отрисоваться
    const timer = setTimeout(() => {
      if (!canvasRef.current) {
        console.error('Canvas ref is null');
        return;
      }

      try {
        const canvas = canvasRef.current;
        const engine = new GameEngine(canvas, {
          onHealthChange: (h: number, mh: number) => { setHealth(h); setMaxHealth(mh); },
          onAmmoChange: (a: number, ma: number) => { setAmmo(a); setMaxAmmo(ma); },
          onGoldChange: (g: number) => setGold(g),
          onWeaponChange: (w: WeaponType) => setCurrentWeapon(w),
          onStateChange: (s: PlayerState) => setPlayerState(s),
          onDeath: () => setScreen('dead'),
          onLevelComplete: () => setScreen('victory'),
          onEnemyKill: () => setKills(k => k + 1),
        }, currentLevel);

        engineRef.current = engine;
        setLevelName(engine.getLevelName());
        engine.start();
        console.log('Game engine started successfully');
      } catch (error) {
        console.error('Failed to start game engine:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [screen, currentLevel]);

  const openShop = () => setScreen('shop');
  const closeShop = () => setScreen('playing');
  
  const goToNextLevel = () => {
    if (engineRef.current) {
      engineRef.current.nextLevel();
      setCurrentLevel(engineRef.current.getCurrentLevelNumber());
      setLevelName(engineRef.current.getLevelName());
      setScreen('playing');
    }
  };

  const buyItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.currentLevel >= item.maxLevel || gold < item.cost) return;

    setGold(g => g - item.cost);
    setShopItems(items => items.map(i =>
      i.id === itemId ? { ...i, currentLevel: i.currentLevel + 1 } : i
    ));
  };

  const getStateText = (state: PlayerState): string => {
    const map: Record<PlayerState, string> = {
      [PlayerState.IDLE]: 'Стою',
      [PlayerState.RUN]: 'Бегу',
      [PlayerState.JUMP]: 'Прыжок',
      [PlayerState.FALL]: 'Падение',
      [PlayerState.CLIMB]: 'Лестница',
      [PlayerState.MELEE_ATTACK]: 'Удар!',
      [PlayerState.SHOOT]: 'Выстрел!',
      [PlayerState.RELOAD]: 'Перезарядка',
      [PlayerState.HURT]: 'Больно!',
      [PlayerState.DEAD]: 'Мёртв',
    };
    return map[state] || '';
  };

  // ====== ГЛАВНОЕ МЕНЮ ======
  if (screen === 'menu') {
    return (
      <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-emerald-400 mb-4 tracking-wider"
              style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>
            ⚔️ DARK DUNGEON ⚔️
          </h1>
          <p className="text-gray-400 mb-2 text-lg">2D Action-Platformer / Metroidvania</p>
          <p className="text-gray-500 mb-8 text-sm">Мрачное киберпанк-подземелье</p>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/50"
          >
            ▶ НАЧАТЬ ИГРУ
          </button>

          <div className="mt-8 text-gray-500 text-sm space-y-1">
            <p><span className="text-gray-300">WASD / Стрелки</span> — Движение</p>
            <p><span className="text-gray-300">Space</span> — Прыжок (двойной)</p>
            <p><span className="text-gray-300">J / Z</span> — Атака</p>
            <p><span className="text-gray-300">Q / Tab</span> — Смена оружия</p>
            <p><span className="text-gray-300">R</span> — Перезарядка</p>
            <p><span className="text-gray-300">S</span> — Падение сквозь платформу</p>
            <p className="mt-4 text-emerald-400">🎮 3 уникальных уровня с вертикальным дизайном!</p>
            <p className="text-xs text-gray-600">Используйте лестницы чтобы добраться до вершины</p>
          </div>
        </div>
      </div>
    );
  }

  // ====== МАГАЗИН ======
  if (screen === 'shop') {
    return (
      <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">🛒 МАГАЗИН УЛУЧШЕНИЙ</h2>
              <span className="text-yellow-300 font-mono text-lg">💰 {gold}</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {shopItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    item.currentLevel >= item.maxLevel
                      ? 'border-gray-700 bg-gray-900/50 opacity-50'
                      : gold >= item.cost
                      ? 'border-emerald-700 bg-gray-900/80'
                      : 'border-gray-700 bg-gray-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.description}</p>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: item.maxLevel }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${
                              i < item.currentLevel ? 'bg-emerald-500' : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {item.currentLevel < item.maxLevel ? (
                    <button
                      onClick={() => buyItem(item.id)}
                      disabled={gold < item.cost}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        gold >= item.cost
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      💰 {item.cost}
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold text-sm">MAX ✓</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={closeShop}
              className="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all cursor-pointer"
            >
              ← Вернуться в игру
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== ИГРОВОЙ ЭКРАН (playing / dead / victory) ======
  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
      <div className="relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-gray-700 rounded-lg shadow-2xl block"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* HUD - Верхняя панель */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-none">
          {/* Здоровье и название уровня */}
          <div className="bg-black/70 rounded-lg p-2">
            <p className="text-emerald-400 text-xs font-bold mb-1">Уровень {currentLevel}: {levelName}</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-400 text-sm">❤️</span>
              <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-red-300 text-xs font-mono">{health}/{maxHealth}</span>
            </div>
            {/* Патроны */}
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-sm">🔫</span>
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-200"
                  style={{ width: `${(ammo / maxAmmo) * 100}%` }}
                />
              </div>
              <span className="text-yellow-300 text-xs font-mono">{ammo}/{maxAmmo}</span>
            </div>
          </div>

          {/* Золото и убийства */}
          <div className="bg-black/70 rounded-lg p-2 text-right">
            <p className="text-yellow-400 text-sm font-mono">💰 {gold}</p>
            <p className="text-purple-400 text-xs font-mono">💀 {kills}</p>
          </div>
        </div>

        {/* HUD - Нижняя панель */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end pointer-events-none">
          {/* Текущее оружие */}
          <div className="bg-black/70 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {currentWeapon === WeaponType.MELEE ? '⚔️' : '🔫'}
              </span>
              <span className="text-white text-xs font-bold">
                {currentWeapon === WeaponType.MELEE ? 'МЕЧ' : 'ПИСТОЛЕТ'}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">{getStateText(playerState)}</p>
          </div>

          {/* Подсказки */}
          <div className="bg-black/70 rounded-lg p-2">
            <p className="text-gray-400 text-xs">[Q] Сменить оружие</p>
            <p className="text-gray-400 text-xs">[R] Перезарядка</p>
          </div>
        </div>

        {/* Экран смерти */}
        {screen === 'dead' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl font-bold text-red-500 mb-4">ВЫ ПОГИБЛИ</h2>
            <p className="text-gray-400 mb-2">Убийств: {kills} | Золото: {gold}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => { engineRef.current?.reset(); setScreen('playing'); }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                🔄 Заново
              </button>
              <button
                onClick={openShop}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                🛒 Магазин
              </button>
            </div>
          </div>
        )}

        {/* Экран победы */}
        {screen === 'victory' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl font-bold text-emerald-400 mb-4">🎉 УРОВЕНЬ ПРОЙДЕН!</h2>
            <p className="text-gray-300 mb-1">Уровень {currentLevel}: {levelName}</p>
            <p className="text-gray-400 mb-2">Убийств: {kills} | Золото: {gold}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={openShop}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                🛒 Магазин
              </button>
              {currentLevel < 3 ? (
                <button
                  onClick={goToNextLevel}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  ▶ Следующий уровень
                </button>
              ) : (
                <button
                  onClick={() => { setCurrentLevel(1); engineRef.current?.reset(); setScreen('playing'); }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  🏆 Начать заново
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

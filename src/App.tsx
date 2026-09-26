import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { PlayerState, WeaponType, InventoryItem, ItemType } from './game/types';
import { IntroRenderer } from './game/IntroScene';
import { Act2IntroRenderer } from './game/Act2Intro';
import { Act3IntroRenderer } from './game/Act3Intro';
import { ChaseScene } from './game/ChaseScene';
import { JetpackScene } from './game/JetpackScene';

type GameScreen = 'menu' | 'intro' | 'playing' | 'dead' | 'victory' | 'shop' | 'act2_intro' | 'act3_intro' | 'chase_scene' | 'jetpack_scene';

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
  const introRendererRef = useRef<IntroRenderer | null>(null);
  const act2IntroRendererRef = useRef<Act2IntroRenderer | null>(null);
  const act3IntroRendererRef = useRef<Act3IntroRenderer | null>(null);
  const chaseSceneRef = useRef<ChaseScene | null>(null);
  const jetpackSceneRef = useRef<JetpackScene | null>(null);
  const isTransitioningRef = useRef(false);

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
  const [isPaused, setIsPaused] = useState(false);
  const [previousScreen, setPreviousScreen] = useState<GameScreen>('playing');
  const [doorMessage, setDoorMessage] = useState<string | null>(null);
  const doorMessageTimerRef = useRef<number | null>(null);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [itemNotification, setItemNotification] = useState<string | null>(null);
  const itemNotificationTimerRef = useRef<number | null>(null);
  const [hasCompletedChase, setHasCompletedChase] = useState(false);
  const [startFromCrash, setStartFromCrash] = useState(false);

  const [shopItems, setShopItems] = useState<ShopItem[]>([
    { id: 'health', name: 'Макс. здоровье', description: '+25 к максимальному здоровью', cost: 30, icon: '❤️', maxLevel: 5, currentLevel: 0 },
    { id: 'melee', name: 'Урон ближнего боя', description: '+5 к урону мечом', cost: 25, icon: '⚔️', maxLevel: 5, currentLevel: 0 },
    { id: 'ranged', name: 'Урон дальнего боя', description: '+3 к урону от пуль', cost: 25, icon: '🔫', maxLevel: 5, currentLevel: 0 },
    { id: 'ammo', name: 'Ёмкость обоймы', description: '+3 патрона к обойме', cost: 40, icon: '📦', maxLevel: 4, currentLevel: 0 },
    { id: 'speed', name: 'Скорость', description: '+20 к скорости передвижения', cost: 35, icon: '💨', maxLevel: 3, currentLevel: 0 },
  ]);

  // Функция для получения текущих улучшений
  const getUpgrades = () => {
    const upgrades: any = {};
    shopItems.forEach(item => {
      switch (item.id) {
        case 'health':
          if (item.currentLevel > 0) upgrades.health = item.currentLevel * 25;
          break;
        case 'melee':
          if (item.currentLevel > 0) upgrades.meleeDamage = item.currentLevel * 5;
          break;
        case 'ranged':
          if (item.currentLevel > 0) upgrades.rangedDamage = item.currentLevel * 3;
          break;
        case 'ammo':
          if (item.currentLevel > 0) upgrades.maxAmmo = item.currentLevel * 3;
          break;
        case 'speed':
          if (item.currentLevel > 0) upgrades.moveSpeed = item.currentLevel * 20;
          break;
      }
    });
    return upgrades;
  };

  const startGame = useCallback(() => {
    setHealth(100);
    setMaxHealth(100);
    setAmmo(12);
    setMaxAmmo(12);
    setGold(0);
    setKills(0);
    setCurrentLevel(1);
    setInventory([]);
    setScreen('intro');
  }, []);

  const startIntro = useCallback(() => {
    setScreen('intro');
  }, []);

  const showDoorMessage = (message: string) => {
    setDoorMessage(message);
    
    // Очищаем предыдущий таймер если есть
    if (doorMessageTimerRef.current) {
      clearTimeout(doorMessageTimerRef.current);
    }
    
    // Скрываем сообщение через 3 секунды
    doorMessageTimerRef.current = window.setTimeout(() => {
      setDoorMessage(null);
      doorMessageTimerRef.current = null;
    }, 3000);
  };

  const showItemNotification = (message: string) => {
    setItemNotification(message);
    
    if (itemNotificationTimerRef.current) {
      clearTimeout(itemNotificationTimerRef.current);
    }
    
    itemNotificationTimerRef.current = window.setTimeout(() => {
      setItemNotification(null);
      itemNotificationTimerRef.current = null;
    }, 3000);
  };

  const handleItemPickup = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
    showItemNotification(`Найдено: ${item.name}`);
  };

  const handleInventoryChange = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
  };

  // Запуск игрового движка когда экран = playing
  useEffect(() => {
    if (screen !== 'playing') return;
    
    // Если мы в процессе перехода между уровнями, не создаём новый движок
    if (isTransitioningRef.current) return;

    // Небольшая задержка чтобы canvas успел отрисоваться
    const timer = setTimeout(() => {
      if (!canvasRef.current) {
        console.error('Canvas ref is null');
        return;
      }
      
      // Проверяем ещё раз перед созданием
      if (isTransitioningRef.current) return;

      try {
        const canvas = canvasRef.current;
        const engine = new GameEngine(canvas, {
          onHealthChange: (h: number, mh: number) => { setHealth(h); setMaxHealth(mh); },
          onAmmoChange: (a: number, ma: number) => { setAmmo(a); setMaxAmmo(ma); },
          onGoldChange: (g: number) => setGold(g),
          onWeaponChange: (w: WeaponType) => setCurrentWeapon(w),
          onStateChange: (s: PlayerState) => setPlayerState(s),
          onDeath: () => {
            if (engineRef.current) {
              engineRef.current.pause();
            }
            setInventory([]);
            setScreen('dead');
          },
          onLevelComplete: () => {
            if (engineRef.current) {
              engineRef.current.pause();
            }
            // После 3 уровня запускаем ролик Акта 2
            if (currentLevel === 3) {
              setScreen('act2_intro');
            } else if (currentLevel === 6) {
              setScreen('act3_intro');
            } else {
              setScreen('victory');
            }
          },
          onEnemyKill: () => setKills(k => k + 1),
          onDoorMessage: (msg: string) => showDoorMessage(msg),
          onItemPickup: (item: InventoryItem) => handleItemPickup(item),
          onInventoryChange: (inv: InventoryItem[]) => handleInventoryChange(inv),
        }, currentLevel, inventory, gold);

        // Применяем улучшения из магазина
        const upgrades = getUpgrades();
        if (Object.keys(upgrades).length > 0) {
          engine.applyUpgrades(upgrades);
        }

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
      // Не останавливаем движок если мы в процессе перехода между уровнями
      if (engineRef.current && !isTransitioningRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [screen]); // Убираем currentLevel из зависимостей

  // Рендеринг интро сцены
  useEffect(() => {
    if (screen !== 'intro') return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const introRenderer = new IntroRenderer(ctx, canvas.width, canvas.height);
      introRenderer.start();
      introRendererRef.current = introRenderer;

      let lastTime = performance.now();
      let animFrameId: number;

      const renderLoop = (timestamp: number) => {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const isFinished = introRenderer.update(dt);
        introRenderer.render();

        if (isFinished) {
          // Интро завершено, переходим к игре
          setScreen('playing');
          return;
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      animFrameId = requestAnimationFrame(renderLoop);

      // Возможность пропустить интро по клику
      const skipIntro = () => {
        cancelAnimationFrame(animFrameId);
        setScreen('playing');
      };

      canvas.addEventListener('click', skipIntro);

      return () => {
        cancelAnimationFrame(animFrameId);
        canvas.removeEventListener('click', skipIntro);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [screen]);

  // Рендеринг ролика Акта 2
  useEffect(() => {
    if (screen !== 'act2_intro') return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const act2Renderer = new Act2IntroRenderer(ctx, canvas.width, canvas.height);
      if (startFromCrash) {
        // Начинаем сразу со сцены аварии
        act2Renderer.startCrashScene();
        setStartFromCrash(false);
      } else {
        act2Renderer.start();
      }
      act2IntroRendererRef.current = act2Renderer;

      let lastTime = performance.now();
      let animFrameId: number;

      const renderLoop = (timestamp: number) => {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const result = act2Renderer.update(dt);
        act2Renderer.render();

        if (result === 'start_chase') {
          // Переходим к мини-игре погони
          cancelAnimationFrame(animFrameId);
          setScreen('chase_scene');
          return;
        } else if (result === 'finish') {
          // Ролик завершён, переходим к 4 уровню
          const savedInventory = inventory;
          setCurrentLevel(4);
          setInventory(savedInventory);
          setScreen('playing');
          return;
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      animFrameId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(animFrameId);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [screen]);

  // Рендеринг мини-игры погони
  useEffect(() => {
    if (screen !== 'chase_scene') return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const chaseScene = new ChaseScene(ctx, canvas.width, canvas.height);
      chaseSceneRef.current = chaseScene;

      let lastTime = performance.now();
      let animFrameId: number;

      const renderLoop = (timestamp: number) => {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const isFinished = chaseScene.update(dt);
        chaseScene.render();

        if (isFinished) {
          // Мини-игра завершена, показываем сцену аварии и переходим к 4 уровню
          cancelAnimationFrame(animFrameId);
          
          // Устанавливаем флаг, что погоня завершена
          setHasCompletedChase(true);
          // Устанавливаем флаг, что нужно начать со сцены аварии
          setStartFromCrash(true);
          // Переходим к сцене аварии
          setScreen('act2_intro');
          return;
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      animFrameId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(animFrameId);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [screen]);

  // Рендеринг ролика Акта 3 (реактивный ранец)
  useEffect(() => {
    if (screen !== 'act3_intro') return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const act3Renderer = new Act3IntroRenderer(ctx, canvas.width, canvas.height);
      act3Renderer.start();
      act3IntroRendererRef.current = act3Renderer;

      let lastTime = performance.now();
      let animFrameId: number;

      const renderLoop = (timestamp: number) => {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const isFinished = act3Renderer.update(dt);
        act3Renderer.render();

        if (isFinished) {
          // Ролик завершён, запускаем мини-игру с реактивным ранцем
          cancelAnimationFrame(animFrameId);
          setScreen('jetpack_scene');
          return;
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      animFrameId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(animFrameId);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [screen]);

  // Рендеринг мини-игры с реактивным ранцем
  useEffect(() => {
    if (screen !== 'jetpack_scene') return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const jetpackScene = new JetpackScene(ctx, canvas.width, canvas.height);
      jetpackSceneRef.current = jetpackScene;

      let lastTime = performance.now();
      let animFrameId: number;

      const renderLoop = (timestamp: number) => {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const isFinished = jetpackScene.update(dt);
        jetpackScene.render();

        if (isFinished) {
          // Мини-игра завершена
          cancelAnimationFrame(animFrameId);
          
          // Переходим к 7 уровню
          const savedInventory = inventory;
          const savedGold = gold;
          setCurrentLevel(7);
          setInventory(savedInventory);
          setGold(savedGold);
          setScreen('playing');
          return;
        }

        animFrameId = requestAnimationFrame(renderLoop);
      };

      animFrameId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(animFrameId);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [screen]);

  // Обработка Escape для паузы и пропуска интро
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (screen === 'playing' || isPaused) {
          togglePause();
        } else if (screen === 'shop') {
          closeShop();
        }
      }
      // Пропуск интро по Space или Enter
      if (screen === 'intro' && (e.code === 'Space' || e.code === 'Enter')) {
        setScreen('playing');
      }
      // Ролики и мини-игры нельзя пропустить
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused]);

  const openShop = () => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setPreviousScreen(screen);
    setScreen('shop');
  };
  
  const closeShop = () => {
    // Если предыдущий экран был playing, возобновляем движок
    if (previousScreen === 'playing' && engineRef.current) {
      engineRef.current.resume();
    }
    setScreen(previousScreen);
  };
  
  const togglePause = () => {
    if (screen !== 'playing') return;
    
    if (isPaused) {
      if (engineRef.current) {
        engineRef.current.resume();
      }
      setIsPaused(false);
    } else {
      if (engineRef.current) {
        engineRef.current.pause();
      }
      setIsPaused(true);
    }
  };
  
  const goToNextLevel = () => {
    // Устанавливаем флаг перехода
    isTransitioningRef.current = true;
    
    // Сохраняем текущий инвентарь и золото перед переходом
    const savedInventory = [...inventory];
    const savedGold = gold;
    
    // Останавливаем текущий движок
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    
    // Увеличиваем уровень
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    
    // Сбрасываем здоровье и патроны, но сохраняем инвентарь и золото
    setHealth(100);
    setMaxHealth(100);
    setAmmo(12);
    setMaxAmmo(12);
    setKills(0);
    // Инвентарь и золото НЕ сбрасываем - они сохраняются между уровнями
    
    // Меняем screen чтобы меню victory пропало
    setScreen('playing');
    
    // Создаем новый движок с новым уровнем и сохранённым инвентарём/золотом
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      try {
        const canvas = canvasRef.current;
        const engine = new GameEngine(canvas, {
          onHealthChange: (h: number, mh: number) => { setHealth(h); setMaxHealth(mh); },
          onAmmoChange: (a: number, ma: number) => { setAmmo(a); setMaxAmmo(ma); },
          onGoldChange: (g: number) => setGold(g),
          onWeaponChange: (w: WeaponType) => setCurrentWeapon(w),
          onStateChange: (s: PlayerState) => setPlayerState(s),
          onDeath: () => {
            if (engineRef.current) {
              engineRef.current.pause();
            }
            setInventory([]);
            setScreen('dead');
          },
          onLevelComplete: () => {
            if (engineRef.current) {
              engineRef.current.pause();
            }
            // После 3 уровня запускаем ролик Акта 2
            if (nextLevel === 3) {
              setScreen('act2_intro');
            } else if (nextLevel === 6) {
              setScreen('act3_intro');
            } else {
              setScreen('victory');
            }
          },
          onEnemyKill: () => setKills(k => k + 1),
          onDoorMessage: (msg: string) => showDoorMessage(msg),
          onItemPickup: (item: InventoryItem) => handleItemPickup(item),
          onInventoryChange: (inv: InventoryItem[]) => handleInventoryChange(inv),
        }, nextLevel, savedInventory, savedGold);

        // Применяем улучшения из магазина
        const upgrades = getUpgrades();
        if (Object.keys(upgrades).length > 0) {
          engine.applyUpgrades(upgrades);
        }

        engineRef.current = engine;
        setLevelName(engine.getLevelName());
        engine.start();
        
        // Сбрасываем флаг после создания нового движка
        isTransitioningRef.current = false;
      } catch (error) {
        console.error('Failed to start next level:', error);
        isTransitioningRef.current = false;
      }
    }, 100);
  };

  const buyItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.currentLevel >= item.maxLevel || gold < item.cost) return;

    setGold(g => g - item.cost);
    setShopItems(items => items.map(i =>
      i.id === itemId ? { ...i, currentLevel: i.currentLevel + 1 } : i
    ));

    // Применяем улучшение к игроку
    if (engineRef.current) {
      switch (itemId) {
        case 'health':
          engineRef.current.applyUpgrades({ health: 25 });
          break;
        case 'melee':
          engineRef.current.applyUpgrades({ meleeDamage: 5 });
          break;
        case 'ranged':
          engineRef.current.applyUpgrades({ rangedDamage: 3 });
          break;
        case 'ammo':
          engineRef.current.applyUpgrades({ maxAmmo: 3 });
          break;
        case 'speed':
          engineRef.current.applyUpgrades({ moveSpeed: 20 });
          break;
      }
    }
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
          <h1 className="text-5xl font-bold text-orange-500 mb-4 tracking-wider"
              style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.5)' }}>
            ⛓️ PRISON BREAK ⛓️
          </h1>
          <p className="text-gray-400 mb-2 text-lg">2D Action-Platformer / Metroidvania</p>
          <p className="text-gray-500 mb-4 text-sm">Побег из тюрьмы</p>
          <div className="text-gray-600 text-xs mb-8 max-w-md mx-auto">
            <p className="italic">"Вы просыпаетесь в тюремной камере. Единственный шанс на свободу - бежать. 
            Сражайтесь с охранниками, преодолевайте препятствия и найдите выход..."</p>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/50"
          >
            ▶ НАЧАТЬ ИГРУ
          </button>

          <div className="mt-8 text-gray-500 text-sm space-y-1">
            <p><span className="text-gray-300">WASD / Стрелки</span> — Движение</p>
            <p><span className="text-gray-300">Space</span> — Прыжок (двойной)</p>
            <p><span className="text-gray-300">J / Z</span> — Атака (кулаки/оружие)</p>
            <p><span className="text-gray-300">E</span> — Взаимодействие (открыть дверь)</p>
            <p><span className="text-gray-300">Q / Tab</span> — Смена оружия (после 3 уровня)</p>
            <p><span className="text-gray-300">R</span> — Перезарядка</p>
            <p><span className="text-gray-300">W</span> — Стрелять вверх (с пистолетом)</p>
            <p><span className="text-gray-300">S</span> — Падение сквозь платформу</p>
            <p><span className="text-gray-300">ESC</span> — Пауза</p>
            <p className="mt-4 text-orange-400">🎮 7 уровней: Побег из тюрьмы → Полёт на небоскрёб!</p>
            <p className="text-xs text-gray-600">Первые 3 уровня - только ближний бой. Огнестрел найдёте позже!</p>
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
              {shopItems
                .filter(item => currentLevel > 3 || item.id !== 'ranged')
                .map(item => (
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

  // ====== ИНТРО СЦЕНА ======
  if (screen === 'intro') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-gray-700 rounded-lg shadow-2xl block cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="text-gray-400 text-sm">Нажмите чтобы пропустить</p>
          </div>
        </div>
      </div>
    );
  }

  // ====== РОЛИК АКТА 2 ======
  if (screen === 'act2_intro') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-gray-700 rounded-lg shadow-2xl block cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="text-gray-400 text-sm">Нажмите чтобы пропустить</p>
          </div>
        </div>
      </div>
    );
  }

  // ====== РОЛИК АКТА 3 ======
  if (screen === 'act3_intro') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-gray-700 rounded-lg shadow-2xl block cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="text-gray-400 text-sm">Нажмите чтобы пропустить</p>
          </div>
        </div>
      </div>
    );
  }

  // ====== МИНИ-ИГРА ПОГОНИ ======
  if (screen === 'chase_scene') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-red-700 rounded-lg shadow-2xl block"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2">
            <p className="text-red-400 text-xs font-bold">🚗 ПОГОНЯ!</p>
            <p className="text-gray-400 text-xs">Уклоняйтесь и выживите!</p>
          </div>
        </div>
      </div>
    );
  }

  // ====== МИНИ-ИГРА РЕАКТИВНОГО РАНЦА ======
  if (screen === 'jetpack_scene') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-cyan-700 rounded-lg shadow-2xl block"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2">
            <p className="text-cyan-400 text-xs font-bold">🚀 ПОЛЁТ!</p>
            <p className="text-gray-400 text-xs">Долетите до крыши!</p>
          </div>
        </div>
      </div>
    );
  }

  // ====== ИГРОВОЙ ЭКРАН (playing / dead / victory / paused) ======
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
            <p className="text-orange-400 text-xs font-bold mb-1">Уровень {currentLevel}: {levelName}</p>
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
            {/* Патроны (только для уровней 4+) */}
            {currentLevel > 3 && (
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
            )}
          </div>

          {/* Золото и убийства */}
          <div className="bg-black/70 rounded-lg p-2 text-right">
            <p className="text-yellow-400 text-sm font-mono">💰 {gold}</p>
            <p className="text-purple-400 text-xs font-mono">💀 {kills}</p>
          </div>
        </div>

        {/* Сообщение двери */}
        {doorMessage && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none animate-fade-in">
            <div className="bg-black/90 border-2 border-yellow-500 rounded-lg px-6 py-3 shadow-lg">
              <p className="text-yellow-400 text-lg font-bold text-center">🔓 {doorMessage}</p>
            </div>
          </div>
        )}

        {/* Уведомление о предмете */}
        {itemNotification && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
            <div className="bg-black/90 border-2 border-emerald-500 rounded-lg px-6 py-3 shadow-lg">
              <p className="text-emerald-400 text-lg font-bold text-center">{itemNotification}</p>
            </div>
          </div>
        )}

        {/* Инвентарь */}
        {inventory.length > 0 && (
          <div className="absolute top-20 left-3 bg-black/70 rounded-lg p-2 pointer-events-none">
            <p className="text-gray-400 text-xs mb-1 font-bold">Инвентарь:</p>
            <div className="flex flex-col gap-1">
              {inventory.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800/50 rounded px-2 py-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HUD - Нижняя панель */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end pointer-events-none">
          {/* Текущее оружие */}
          <div className="bg-black/70 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {currentLevel <= 3 
                  ? (inventory.some(i => i.type === ItemType.BATON) ? '🏏' : '👊')
                  : (currentWeapon === WeaponType.MELEE ? '⚔️' : '🔫')}
              </span>
              <span className="text-white text-xs font-bold">
                {currentLevel <= 3 
                  ? (inventory.some(i => i.type === ItemType.BATON) ? 'ДУБИНКА' : 'КУЛАКИ')
                  : (currentWeapon === WeaponType.MELEE ? 'МЕЧ' : 'ПИСТОЛЕТ')}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">{getStateText(playerState)}</p>
          </div>

          {/* Подсказки */}
          <div className="bg-black/70 rounded-lg p-2">
            {currentLevel > 3 ? (
              <>
                <p className="text-gray-400 text-xs">[Q] Сменить оружие</p>
                <p className="text-gray-400 text-xs">[R] Перезарядка</p>
                <p className="text-gray-400 text-xs">[W] Стрелять вверх</p>
              </>
            ) : (
              <>
                <p className="text-orange-400 text-xs">🔒 Огнестрел недоступен</p>
                <p className="text-gray-400 text-xs">[E] Открыть дверь</p>
              </>
            )}
            <p className="text-gray-400 text-xs">[ESC] Пауза</p>
          </div>
        </div>

        {/* Экран смерти */}
        {screen === 'dead' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl font-bold text-red-500 mb-4">ВЫ ПОГИБЛИ</h2>
            <p className="text-gray-400 mb-2">Убийств: {kills} | Золото: {gold}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => { 
                  // Сбрасываем здоровье и патроны
                  setHealth(100);
                  setMaxHealth(100);
                  setAmmo(12);
                  setMaxAmmo(12);
                  
                  if (engineRef.current) {
                    engineRef.current.reset();
                    const upgrades = getUpgrades();
                    if (Object.keys(upgrades).length > 0) {
                      engineRef.current.applyUpgrades(upgrades);
                    }
                    engineRef.current.resume();
                  }
                  setScreen('playing'); 
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                🔄 Заново
              </button>
              {currentLevel > 3 && (
                <button
                  onClick={openShop}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  🛒 Магазин
                </button>
              )}
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
              {currentLevel > 3 && (
                <button
                  onClick={openShop}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  🛒 Магазин
                </button>
              )}
              {currentLevel < 7 ? (
                <button
                  onClick={goToNextLevel}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  ▶ Следующий уровень
                </button>
              ) : (
                <button
                  onClick={() => { 
                    setCurrentLevel(1);
                    if (engineRef.current) {
                      engineRef.current.reset();
                      const upgrades = getUpgrades();
                      if (Object.keys(upgrades).length > 0) {
                        engineRef.current.applyUpgrades(upgrades);
                      }
                      engineRef.current.resume();
                    }
                    setScreen('playing'); 
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  🏆 Начать заново
                </button>
              )}
            </div>
          </div>
        )}

        {/* Меню паузы */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl font-bold text-blue-400 mb-6">⏸️ ПАУЗА</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={togglePause}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                ▶ Продолжить
              </button>
              {currentLevel > 3 && (
                <button
                  onClick={openShop}
                  className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  🛒 Магазин
                </button>
              )}
              <button
                onClick={() => {
                  if (engineRef.current) {
                    engineRef.current.stop();
                    engineRef.current = null;
                  }
                  setScreen('menu');
                  setIsPaused(false);
                }}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                🏠 В главное меню
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-6">Нажмите ESC чтобы продолжить</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import AuthGuard from "@/components/AuthGuard";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ActionBar from "./components/ActionBar";
import EnemySprite from "./components/EnemySprite";
import GameHUD from "./components/GameHUD";
import GameOverOverlay from "./components/GameOverOverlay";
import PlayerSprite from "./components/PlayerSprite";
import { CARD_DATA } from "./constants";

interface Enemy {
  id: string;
  name: string;
  hp: number;
  dmg: number;
  xp: number;
}

interface CardState {
  lastUsedRound: number;
  lastUsedLayer: number;
  usesLeft: number;
}

export default function GamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  const [layer, setLayer] = useState(1);
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const [playerHp, setPlayerHp] = useState(6);
  const [prevHp, setPrevHp] = useState(6); // For anim
  const [playerState, setPlayerState] = useState<"idle" | "attack" | "hit" | "dead" | "deadAnim">("idle");
  const [playerName, setPlayerName] = useState<string>("Player");
  const [equippedCards, setEquippedCards] = useState<string[]>([]);
  const [cardInfos, setCardInfos] = useState<Record<string, any>>({});

  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [prevEnemyHp, setPrevEnemyHp] = useState(0);
  const [enemyHpStage, setEnemyHpStage] = useState<"idle" | "anim" | "after">("idle");
  const [enemyState, setEnemyState] = useState<"idle" | "attack" | "hit" | "dead">("idle");

  const [showWelcome, setShowWelcome] = useState(false);
  const [bgImage, setBgImage] = useState<string>("");
  const [potionCounter, setPotionCounter] = useState(3);
  const [stage, setStage] = useState<"idle" | "anim" | "after">("idle");
  const [hover, setHover] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (!showCards) {
      setHoveredCard(null);
    }
  }, [showCards]);

  const parseCooldown = (cdString: string) => {
    if (!cdString || cdString.length < 2) return cdString;
    const typeChar = cdString.charAt(0).toLowerCase();
    const value = cdString.substring(1);

    let typeLabel = "";
    switch (typeChar) {
      case 'r': typeLabel = "Rounds"; break;
      case 'l': typeLabel = "Levels"; break;
      case 'u': typeLabel = "Uses"; break;
      default: typeLabel = "";
    }

    return `${value} ${typeLabel}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEquippedCards(userData.equippedCards || []);
          setPlayerName(userData.username || "Player");
        }
        const cardSnap = await getDocs(collection(db, "cards"));
        const infos: Record<string, any> = {};
        cardSnap.forEach(d => {
          const data = d.data();
          infos[data.name] = data;
        });
        setCardInfos(infos);

      } catch (e) {
        console.error("Error fetching user/card data", e);
      }

      try {
        const enemySnap = await getDocs(collection(db, "enemies"));
        const loadedEnemies: Enemy[] = [];
        enemySnap.forEach(d => {
          const data = d.data();
          loadedEnemies.push({
            id: d.id,
            name: data.name,
            hp: data.hp,
            dmg: data.dmg,
            xp: data.xp
          } as Enemy);
        });
        setEnemies(loadedEnemies);
        if (loadedEnemies.length > 0) {
          spawnEnemy(loadedEnemies);
        }
      } catch (e) {
        console.error("Error fetching enemies", e);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const spawnEnemy = (enemyList: Enemy[]) => {
    if (enemyList.length === 0) return;

    const r = Math.floor(Math.random() * enemyList.length);
    const enemy = enemyList[r];
    setCurrentEnemy({ ...enemy });
    setEnemyHp(enemy.hp);
    setPrevEnemyHp(enemy.hp);
    setEnemyHpStage("idle");
    setEnemyState("idle");
    setRound(1);
    setTurn('player');
  };

  const getCardCooldownState = (cardKey: string) => {
    if (!cardInfos[cardKey]) return null;
    const cdString = cardInfos[cardKey].cooldown;
    if (!cdString) return null;

    const type = cdString.charAt(0).toLowerCase();
    let valStr = "";
    let parsedType = "";

    if (type === 'f' && cdString.charAt(1) === 'u') {
      parsedType = 'u';
      valStr = cdString.substring(2);
    } else {
      parsedType = type;
      valStr = cdString.substring(1);
    }

    const val = parseInt(valStr) || 1;

    return { type: parsedType, val };
  };

  const isCardReady = (cardKey: string) => {
    const state = cardStates[cardKey];
    const cd = getCardCooldownState(cardKey);
    if (!cd) return true;

    if (cd.type === 'u') {
      if (state && state.usesLeft <= 0) return false;
      return true;
    }
    if (cd.type === 'r') {
      if (!state) return true;
      return (round - state.lastUsedRound) >= cd.val;
    }
    if (cd.type === 'l') {
      if (!state) return true;
      return (layer - state.lastUsedLayer) >= cd.val;
    }
    return true;
  };

  const recordCardUsage = (cardKey: string) => {
    const cd = getCardCooldownState(cardKey);
    setCardStates(prev => {
      const defaults = {
        lastUsedRound: -999,
        lastUsedLayer: -999,
        usesLeft: cd?.type === 'u' ? cd.val : 999
      };

      const current = prev[cardKey] || defaults;

      return {
        ...prev,
        [cardKey]: {
          lastUsedRound: round,
          lastUsedLayer: layer,
          usesLeft: cd?.type === 'u' ? (current.usesLeft - 1) : current.usesLeft
        }
      };
    });
  };

  const handlePlayerAttack = (cardKey: string) => {
    if (turn !== 'player' || !currentEnemy) return;
    if (!isCardReady(cardKey)) {
      return;
    }
    recordCardUsage(cardKey);
    setShowCards(false);

    const dmg = 2;
    setEnemyHp((prev) => {
      const actualFinalHp = Math.max(0, prev - dmg);
      setEnemyHpStage((currStage) => {
        if (currStage !== "anim") {
          if (dmg > 1 && prev > 1) {
            setPrevEnemyHp(actualFinalHp + 1);
          } else {
            setPrevEnemyHp(prev);
          }
          return "anim";
        }
        return currStage;
      });
      return actualFinalHp;
    });

    setPlayerState("attack");

    const calculatedFinalHp = Math.max(0, enemyHp - dmg);

    if (calculatedFinalHp <= 0) {
      handleEnemyDeath();
    } else {
      setEnemyState("hit");
      setTimeout(() => setEnemyState("idle"), 500);
      setTurn('enemy');
      setTimeout(handleEnemyTurn, 1500);
    }
  };

  const handleSkip = () => {
    if (turn !== 'player') return;
    setShowCards(false);
    setTurn('enemy');
    setTimeout(handleEnemyTurn, 1000);
  };

  const changeHp = (amount: number) => {
    setPlayerHp((prev) => {
      const nextHp = Math.max(0, prev + amount);
      if (stage !== "anim") {
        if (amount < -1 && prev > 1) {
          setPrevHp(nextHp + 1);
        } else {
          setPrevHp(prev);
        }
        setStage("anim");
      }
      return nextHp;
    });
  };

  const handleHeal = () => {
    if (potionCounter > 0 && playerHp < 6) {
      changeHp(1);
      setPotionCounter(p => p - 1);
    }
  };

  const handleEnemyTurn = () => {

    setEnemyState("attack");
    setTimeout(() => {
      setEnemyState("idle");
      performEnemyAttack();
    }, 1200);
  };

  const performEnemyAttack = () => {
    if (!currentEnemy) return;
    const dmg = currentEnemy.dmg;

    changeHp(-dmg);
    setPlayerState("hit");
    setShowCards(false);

    setRound(r => r + 1);
    setTurn('player');
  };

  useEffect(() => {
    if (enemyHpStage === "anim") {
      const timer = setTimeout(() => {
        setEnemyHpStage("after");
        setPrevEnemyHp(() => enemyHp);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [enemyHpStage, enemyHp]);

  const handleEnemyDeath = () => {
    setEnemyState("dead");
    //XP Gain

    setTimeout(() => {
      setLayer(l => l + 1);
      spawnEnemy(enemies);
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3000);
    }, 2000);
  };

  useEffect(() => {
    if (playerHp === 0 && playerState !== "dead" && playerState !== "deadAnim") {
      setPlayerState("deadAnim");
      setGameStatus("lost");
    }
  }, [playerHp, playerState]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const backgrounds = [
        "/assets/background/battle-background/main-hall.png",
        "/assets/background/battle-background/library.jpg"
      ];
      const r = Math.floor(Math.random() * backgrounds.length);
      setBgImage(backgrounds[r]);
    }
  }, []);

  const handleAttackClick = () => {
    if (turn === 'player') {
      setShowCards(!showCards);
    }
  };

  if (loading) return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Loading Battle...</div>;

  return (
    <AuthGuard>
      <section
        className="relative min-h-screen w-screen flex flex-col overflow-hidden"
        style={{ 
          fontFamily: "IsoCore",
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        {hoveredCard && cardInfos[hoveredCard] && (
          <div
            className="fixed pointer-events-none z-[100] w-[250px] sm:w-[300px] bg-black/90 border border-[var(--custom-yellow)] rounded-lg p-3 sm:p-4 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md"
            style={{
              top: Math.min(mousePos.y + 20, window.innerHeight - 320) + 'px',
              left: Math.min(mousePos.x + 20, window.innerWidth - 280) + 'px'
            }}
          >
            <h3 className="text-[var(--custom-yellow)] text-base sm:text-lg lg:text-xl font-bold mb-2">
              {CARD_DATA[hoveredCard]?.name || hoveredCard}
            </h3>
            <div className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 italic">
              {cardInfos[hoveredCard].description}
            </div>

            <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Cooldown:</span>
                <span className="font-bold text-white">{parseCooldown(cardInfos[hoveredCard].cooldown)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unlock XP:</span>
                <span className={`font-bold text-white`}>
                  {cardInfos[hoveredCard].xp_needed} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {showWelcome && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[var(--custom-yellow)] animate-pulse">
              Layer {layer}
            </span>
          </div>
        )}


        <GameHUD
          layer={layer}
          round={round}
          turn={turn}
          currentEnemy={currentEnemy}
          enemyHp={enemyHp}
          prevEnemyHp={prevEnemyHp}
          enemyHpStage={enemyHpStage}
          setEnemyHpStage={setEnemyHpStage}
        />

        <div className="z-0 flex-1 relative">
          <PlayerSprite
            playerState={playerState}
            setPlayerState={setPlayerState}
          />

          <EnemySprite
            currentEnemy={currentEnemy}
            enemyState={enemyState}
          />
        </div>

        {showCards && turn === 'player' && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-2xl overflow-visible border-t-2 border-l-2 border-r-2 border-[var(--custom-yellow)]">
            <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 justify-center items-center overflow-visible">
              {equippedCards.map((cardKey, idx) => {
                const isReady = isCardReady(cardKey);
                const cardData = CARD_DATA[cardKey];
                if (!cardKey || !cardData) return null;

                return (
                  <div
                    key={idx}
                    onClick={() => isReady && handlePlayerAttack(cardKey)}
                    onMouseEnter={() => setHoveredCard(cardKey)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`relative w-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 aspect-[2/3] rounded transition-all duration-200 shrink-0 overflow-hidden z-10
                      ${isReady ? 'cursor-pointer hover:brightness-110 hover:scale-110 hover:z-20' : 'cursor-not-allowed opacity-50 grayscale'}
                    `}
                  >
                    <Image
                      src={`/assets/cards/${cardData.file}`}
                      alt={cardData.name}
                      fill
                      className="object-contain rounded"
                      style={{ objectFit: 'contain' }}
                    />
                    {!isReady && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[8px] sm:text-[10px] text-white font-bold text-center p-1">
                        <span>COOLDOWN</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <ActionBar
          equippedCards={equippedCards}
          isCardReady={isCardReady}
          handlePlayerAttack={handlePlayerAttack}
          turn={turn}
          playerHp={playerHp}
          prevHp={prevHp}
          stage={stage}
          potionCounter={potionCounter}
          playerName={playerName}
          handleHeal={handleHeal}
          handleSkip={handleSkip}
          handleAttackClick={handleAttackClick}
          setHover={setHover}
          hover={hover}
          setStage={setStage}
          setPrevHp={setPrevHp}
          setHoveredCard={setHoveredCard}
        />

        {playerState === "dead" && <GameOverOverlay />}
      </section>
    </AuthGuard>
  );
}

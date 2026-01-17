"use client";

import AuthGuard from "@/components/AuthGuard";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
          setEquippedCards(userDoc.data().equippedCards || []);
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
      document.body.style.backgroundImage = `url(${backgrounds[r]})`;
    }
  }, []);

  if (loading) return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Loading Battle...</div>;

  return (
    <AuthGuard>
      <section
        className="relative min-h-screen w-screen flex flex-col overflow-hidden"
        style={{ fontFamily: "IsoCore" }}
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        {hoveredCard && cardInfos[hoveredCard] && (
          <div
            className="fixed pointer-events-none z-[100] w-[300px] bg-black/90 border border-[var(--custom-yellow)] rounded-lg p-4 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md"
            style={{
              top: Math.min(mousePos.y + 20, window.innerHeight - 320) + 'px',
              left: Math.min(mousePos.x + 20, window.innerWidth - 320) + 'px'
            }}
          >
            <h3 className="text-[var(--custom-yellow)] text-xl font-bold mb-2">
              {CARD_DATA[hoveredCard]?.name || hoveredCard}
            </h3>
            <div className="text-sm text-gray-300 mb-4 italic">
              {cardInfos[hoveredCard].description}
            </div>

            <div className="flex flex-col gap-1 text-xs">
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
            <span className="text-8xl font-bold text-[var(--custom-yellow)] animate-pulse">
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

        <ActionBar
          equippedCards={equippedCards}
          isCardReady={isCardReady}
          handlePlayerAttack={handlePlayerAttack}
          turn={turn}
          playerHp={playerHp}
          prevHp={prevHp}
          stage={stage}
          potionCounter={potionCounter}
          handleHeal={handleHeal}
          handleSkip={handleSkip}
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

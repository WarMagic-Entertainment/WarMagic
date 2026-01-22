"use client";

import AuthGuard from "@/components/AuthGuard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ActionBar from "./components/ActionBar";
import EnemySprite from "./components/EnemySprite";
import GameHUD from "./components/GameHUD";
import GameOverOverlay from "./components/GameOverOverlay";
import PlayerSprite from "./components/PlayerSprite";
import { CARD_DATA } from "./constants";
import { useGameData } from "./hooks/useGameData";
import { useCardLogic } from "./hooks/useCardLogic";
import { useGamePersistence } from "./hooks/useGamePersistence";
import { Enemy, EnemyStatus } from "./types";
import { useCardEffects } from "./hooks/useCardEffects";

export default function GamePage() {
  const router = useRouter();

  const { loading, equippedCards, cardInfos, enemies, playerName } = useGameData();
  const [layer, setLayer] = useState(1);
  const [round, setRound] = useState(1);
  const { isCardReady, recordCardUsage, parseCooldown, setCardStates, getRemainingCooldown, reduceCooldown } = useCardLogic(round, layer, cardInfos);
  const { saveProgress } = useGamePersistence(layer);

  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const [playerHp, setPlayerHp] = useState(6);
  const [prevHp, setPrevHp] = useState(6);
  const [playerState, setPlayerState] = useState<"idle" | "attack" | "hit" | "dead" | "deadAnim">("idle");

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

  const [enemyStatus, setEnemyStatus] = useState<EnemyStatus | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);

  const setEnemyHpInstant = (val: number) => {
    setEnemyHp(val);
    setPrevEnemyHp(val);
    setEnemyHpStage("idle");
  };

  const setPlayerHpInstant = (val: number) => {
    const cappedVal = Math.min(6, Math.max(0, val));
    setPlayerHp(cappedVal);
    setPrevHp(cappedVal);
    setStage("idle");
  };

  const changeHp = (amount: number, animate: boolean = true) => {
    setPlayerHp((prev) => {
      const nextHp = Math.min(6, Math.max(0, prev + amount));
      if (animate && stage !== "anim") {
        if (amount >= -2 && amount <= 1) {
          if (amount < -1 && prev > 1) {
            setPrevHp(nextHp + 1);
          } else {
            setPrevHp(prev);
          }
          setStage("anim");
          return nextHp;
        }
      }
      setPrevHp(nextHp);
      setStage("idle");
      return nextHp;
    });
  };

  const changeEnemyHp = (amount: number, animate: boolean = true) => {
    setEnemyHp((prev) => {
      const nextHp = Math.max(0, prev + amount);
      return nextHp;
      if (animate && enemyHpStage !== "anim") {
        if (amount >= -2 && amount <= 1) {
          if (amount < -1 && prev > 1) {
            setPrevEnemyHp(nextHp + 1);
          } else {
            setPrevEnemyHp(prev);
          }
          setEnemyHpStage("anim");
          return nextHp;
        }
      }
      setPrevEnemyHp(nextHp);
      setEnemyHpStage("idle");
      return nextHp;
    });
  };

  const { handleCardEffect } = useCardEffects({
    enemy: currentEnemy,
    playerHp,
    enemyHp,
    changePlayerHp: (amount) => changeHp(amount, true),
    setEnemyHp: setEnemyHpInstant,
    setEnemyStatus,
    setSelectionMode,
    setTurn,
    setEnemyState,
    setGameStatus
  });

  useEffect(() => {
    if (!showCards) {
      setHoveredCard(null);
    }
  }, [showCards]);

  useEffect(() => {
    if (turn === 'enemy') {
      const timer = setTimeout(() => {
        handleEnemyTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, enemyStatus, round]);

  useEffect(() => {
    if (enemies.length > 0 && !currentEnemy) {
      spawnEnemy(enemies);
    }
  }, [enemies]);

  const spawnEnemy = (enemyList: Enemy[]) => {
    if (enemyList.length === 0) return;

    const r = Math.floor(Math.random() * enemyList.length);
    const enemy = enemyList[r];
    setCurrentEnemy({ ...enemy });
    setEnemyHp(enemy.hp);
    setPrevEnemyHp(enemy.hp);
    setEnemyHpStage("idle");
    setEnemyState("idle");
    setEnemyStatus(null);
    setRound(1);
    setTurn('player');
  };

  const handlePlayerAttack = (cardKey: string) => {
    if (turn !== 'player' || !currentEnemy) return;

    if (selectionMode) {
      const info = cardInfos[cardKey] || (CARD_DATA[cardKey] && cardInfos[CARD_DATA[cardKey].name]);
      const cdStr = (info?.cooldown || "").toLowerCase();

      if (cdStr.startsWith('u') || cdStr.startsWith('fu')) {
        return;
      }

      reduceCooldown(cardKey, 1);
      setSelectionMode(false);
      setShowCards(false);
      setTurn('enemy');
      return;
    }

    if (!isCardReady(cardKey)) {
      return;
    }

    recordCardUsage(cardKey);
    setShowCards(false);

    const effect = handleCardEffect(cardKey);
    const dmg = effect.dmg;

    if (dmg > 0) {
      changeEnemyHp(-dmg, true);
    }

    setPlayerState("attack");

    setTimeout(() => {
      if (effect.preventTurnChange) {
        setEnemyState("hit");
        setTimeout(() => setEnemyState("idle"), 500);
      } else {
        setEnemyState("hit");
        setTimeout(() => setEnemyState("idle"), 500);
        setTurn('enemy');
      }
    }, 100);
  };

  const handleSkip = () => {
    if (turn !== 'player') return;
    setShowCards(false);
    setTurn('enemy');
  };

  const handleHeal = () => {
    if (potionCounter > 0 && playerHp < 6) {
      changeHp(1, true);
      setPotionCounter(p => p - 1);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Enemy Logic                                  */
  /* -------------------------------------------------------------------------- */

  const handleEnemyTurn = () => {
    if (turn !== 'enemy') return;

    //Check Status Effects: Confusion
    if (enemyStatus?.type === 'confusion') {
      const hitSelf = Math.random() < 0.7;

      if (hitSelf) {
        //Self Hit
        const selfDmg = currentEnemy?.dmg || 1;
        changeEnemyHp(-selfDmg, true);

        //Visuals
        setEnemyState("hit");
        setTimeout(() => setEnemyState("idle"), 500);

        //Turn End
        setEnemyStatus(prev => prev && prev.duration > 1 ? ({ ...prev, duration: prev.duration - 1 }) : null);
        setRound(r => r + 1);
        setTurn('player');
        return;
      }
    }

    setEnemyState("attack");
    setTimeout(() => {
      setEnemyState("idle");
      performEnemyAttack();
    }, 1200);
  };

  const performEnemyAttack = () => {
    if (!currentEnemy) return;
    let dmg = currentEnemy.dmg;
    if (enemyStatus?.type === 'moon_blindness') {
      const miss = Math.random() < 0.7;
      if (miss) {
        changeHp(1, true);
      } else {
        dmg = 2;
        changeHp(-dmg, true);
        setPlayerState("hit");
      }

      setEnemyStatus(prev => prev && prev.duration > 1 ? ({ ...prev, duration: prev.duration - 1 }) : null);

    } else {
      changeHp(-dmg, true);
      setPlayerState("hit");
    }

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
    if (gameStatus !== 'won') setGameStatus('won');

    if (currentEnemy) {
      saveProgress(currentEnemy.xp);
    }

    setTimeout(() => {
      setLayer(l => l + 1);
      spawnEnemy(enemies);
      setEnemyStatus(null);

      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 2000);
    }, 2000);
  };

  useEffect(() => {
    if (currentEnemy && enemyHp <= 0 && enemyState !== "dead" && enemyState !== "deadAnim") {
      handleEnemyDeath();
    }
  }, [enemyHp, currentEnemy]);

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
          enemyStatus={enemyStatus}
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
            {selectionMode && (
              <div className="absolute -top-10 left-0 right-0 text-center text-[var(--custom-yellow)] font-bold animate-pulse">
                SELECT A CARD TO RECHARGE
              </div>
            )}
            <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 justify-center items-center overflow-visible">
              {equippedCards.map((cardKey, idx) => {
                const cardData = CARD_DATA[cardKey];
                if (!cardKey || !cardData) return null;

                const isReady = isCardReady(cardKey);
                const info = cardInfos[cardKey] || cardInfos[cardData.name];
                const cdStr = (info?.cooldown || "").toLowerCase();
                const isSingleUse = cdStr.startsWith('u') || cdStr.startsWith('fu');
                const isEmperorRestricted = cardKey === 'emperor' && playerHp !== 1;

                const isSelectable = selectionMode
                  ? (!isReady && !isSingleUse)
                  : (isReady && !isEmperorRestricted);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isSelectable) {
                        handlePlayerAttack(cardKey);
                      }
                    }}
                    onMouseEnter={() => setHoveredCard(cardKey)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`relative w-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 aspect-[2/3] rounded transition-all duration-200 shrink-0 overflow-hidden z-10
                      ${isSelectable ? 'cursor-pointer hover:brightness-110 hover:scale-110 hover:z-20' : 'cursor-not-allowed opacity-50 grayscale'}
                      ${selectionMode && !isReady && !isSingleUse ? 'ring-2 ring-[var(--custom-yellow)]' : ''}
                      ${!selectionMode && isEmperorRestricted ? 'opacity-30 grayscale cursor-not-allowed' : ''}
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
                        <span>{getRemainingCooldown(cardKey) || "COOLDOWN"}</span>
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

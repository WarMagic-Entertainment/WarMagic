"use client";

import Image from 'next/image'
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function GamePage() {
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [roundCounter, setRoundCounter] = useState(1);
  const [layerCounter, setLayerCounter] = useState(1);
  const [bgImage, setBgImage] = useState<string>("");

  const [potionCounter, setPotionCounter] = useState<number>(() => {
    const saved = localStorage.getItem("potionCounter");
    return saved !== null ? Number(saved) : 3;
  });


  useEffect(() => {
    localStorage.setItem("potionCounter", potionCounter.toString());
  }, [potionCounter]);






  const [enemyHp, setEnemyHp] = useState(6);



  // Player hp systrem z animacją

  const [playerHp, setPlayerHp] = useState(6);
  const [prevHp, setPrevHp] = useState(6);
  const [stage, setStage] = useState<"idle" | "anim" | "after">("idle");

  // Funkcja do zmiany HP
  const changeHp = (amount: number) => {
    if (stage === "anim") return;
    setPrevHp(playerHp);
    setPlayerHp((hp) => hp + amount);
    setStage("anim");
  };

  // Obsługa renderowania
  const renderHp = () => {
    if (stage === "idle") {
      return (
        <Image
          src={`/assets/hp-bar/player-hp-bar/${playerHp}hp/player-hb-${playerHp}hp.png`}
          alt="hp-bar"
          fill
          className="object-contain"
        />
      );
    }

    if (stage === "anim") {
      const isHealing = playerHp > prevHp;

      return (
        <video
          src={`/assets/hp-bar/player-hp-bar/${isHealing ? prevHp + 1 : prevHp}hp/player-hb-${isHealing ? prevHp + 1 : prevHp}hp-1hp-${isHealing ? "up" : "down"}.mp4`}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
          onEnded={() => {
            setStage("after");
            setPrevHp(playerHp);
          }}
        />
      );
    }

    if (stage === "after") {
      return (
        <Image
          src={`/assets/hp-bar/player-hp-bar/${playerHp}hp/player-hb-${playerHp}hp.png`}
          alt="hp-bar-after"
          fill
          className="object-contain"
          onLoad={() => setStage("idle")}
        />
      );
    }
  };

  // Zapisywanie i reset potek 

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedHp = localStorage.getItem("playerHp");
    if (savedHp !== null) {
      const hp = Number(savedHp);
      setPlayerHp(hp);
      setPrevHp(hp);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("playerHp", playerHp.toString());
  }, [playerHp]);

  // Koniec systemu HP gracza


  // Sprawdzanie żywotności postaci

  const [playerState, setPlayerState] = useState<"alive" | "deadAnim" | "dead">("alive");

  useEffect(() => {
    if (playerHp === 0 && playerState === "alive") {
      setPlayerState("deadAnim");
    }
  }, [playerHp, playerState]);

  const renderPlayer = () => {
    if (playerState === "alive") {
      return (
        <Image
          src={`/assets/player/player1/player_ready.gif`}
          alt="player"
          width={700}
          height={700}
          className="absolute bottom-50 left-30 object-contain"
        />
      );
    }


    if (playerState === "deadAnim") {
      return (
        <video
          src="/assets/player/player1/gelorbi_dead.mp4"
          autoPlay
          muted
          playsInline
          className="absolute bottom-50 left-30 w-[700px] h-[700px] object-contain"
          onEnded={() => setPlayerState("dead")}
        />
      );
    }


    if (playerState === "dead") {
      return (
        <Image
          src="/assets/player/player1/gelorbi_dead.png"
          alt="player-dead"
          width={700}
          height={700}
          className="absolute bottom-50 left-30 object-contain z-0"
        />
      );
    }
  };

  // Warstwa powitalna


  useEffect(() => {
    const show = localStorage.getItem("showWelcome");

    if (show === "true") {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      localStorage.removeItem("showWelcome");
      return () => clearTimeout(timer);
    }
  }, []);





  useEffect(() => {
    const backgrounds = [
      "/assets/background/battle-background/main-hall.png",
      "/assets/background/battle-background/library.jpg"
    ];

    const shouldRandomize = localStorage.getItem("randomizeBg");

    if (shouldRandomize === "true") {
      const randomIndex = Math.floor(Math.random() * backgrounds.length);
      const newBg = backgrounds[randomIndex];
      localStorage.setItem("pageBg", newBg);
      localStorage.removeItem("randomizeBg");

      setBgImage(newBg);
    } else {
      const savedBg = localStorage.getItem("pageBg");
      if (savedBg) setBgImage(savedBg);
    }

    if (bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
    } else {
      const savedBg = localStorage.getItem("pageBg");
      if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
      }
    }
  }, []);



  return (
    <AuthGuard>
      <section
        className="relative min-h-screen w-screen flex flex-col"
        style={{ fontFamily: "IsoCore" }}
      >

        {visible && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <span className="text-8xl font-bold text-[var(--custom-yellow)]">
              Layer {layerCounter}
            </span>
          </div>
        )}


        <div className="bg-black/50 p-4 rounded-md w-full flex flex-col sm:flex-row m-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-[var(--custom-yellow)] whitespace-nowrap flex-shrink-0 flex items-center w-40 ml-0 sm:ml-40 mb-4 sm:mb-0">Round {roundCounter}</h1>
          <div className="flex flex-col items-center justify-center w-full mr-0 sm:mr-80">
            <h1 className="text-xl sm:text-3xl font-bold text-center mt-2">Nazwa</h1>
            <div className="relative w-full max-w-[700px] h-[108px] mt-1">
              <Image
                src="/assets/hp-bar/enemy-hp-bar/6hp/enemy-hb-6hp.png"
                alt="enemy-hp-bar"
                fill
                className="object-contain text-white"
              />
            </div>
          </div>
        </div>

        {/*--------- Do testowania layerów --------*/}

        <button
          onClick={() => {
            setRoundCounter(roundCounter + 1);
            if (roundCounter === 10) {
              setLayerCounter(layerCounter + 1);
              setRoundCounter(1);
              setVisible(true);
              const timer = setTimeout(() => setVisible(false), 5000);
              localStorage.removeItem("showWelcome");
              return () => clearTimeout(timer);
            }
          }}
        >
          Koniec rundy
        </button>
        <button onClick={() => changeHp(-1)}>
          -1 HP Player
        </button>

        {/* --------------------------------------- */}

        <div className="z-9">
          {renderPlayer()}
          <Image
            src="/assets/enemies/skeleton/skeleton-type1/Skeleton-Idle.gif"
            alt='enemy'
            width={500}
            height={500}
            className="absolute bottom-51 right-100 object-contain"
          />
        </div>

        <div className="bg-black/50 w-full flex items-center justify-center mt-auto p-4 z-10">
          <button className="bg-red-500 cursor-pointer font-bold p-5 px-12 gap-5 text-2xl flex items-center justify-center ml-30 transition-all duration-300 hover:shadow-[1px_0px_29px_0px_rgba(239,68,68,0.7)]">
            <Image
              src="/assets/icons/battle-icons/sword-svgrepo-com.svg"
              alt="sword"
              width={24}
              height={24}
              className="object-contain"
              style={{ filter: 'invert(1)' }}
            />
            <h1 className="whitespace-nowrap mt-2">Attack</h1>
          </button>
          <div className="relative w-full flex items-center justify-center flex-col">
            <h1 className="text-xl sm:text-3xl font-bold text-center mt-4">Nazwa2</h1>
            <div className="relative w-full max-w-[700px] h-[150px] mx-4 flex items-center justify-center">
              <div className="relative w-full max-w-[700px] h-[150px]">
                <div className="relative w-full max-w-[700px] h-[150px] mx-4 flex items-center justify-center">
                  {renderHp()}
                </div>
              </div>
            </div>
          </div>
          <button
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => {
              if (stage === "idle" && potionCounter > 0) {
                changeHp(1);
                setPotionCounter(prev => prev - 1);
              }
            }}
            style={{
              backgroundColor: stage !== "idle" || potionCounter === 0 ? 'gray' : 'rgba(76, 175, 80, 1)',
              cursor: stage !== "idle" || potionCounter === 0 ? 'not-allowed' : 'pointer',
              boxShadow: (hover && stage === "idle" && potionCounter > 0) ? '1px 0px 29px 0px rgba(76, 175, 80, 1)' : 'none',
            }} className="bg-green-500 font-bold p-5 px-13 gap-4 text-2xl flex items-center justify-center mr-30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50">
            <Image
              src="/assets/icons/battle-icons/potion-svgrepo-com (1).svg"
              alt="potion"
              width={24}
              height={24}
              className="object-contain"
              style={{ filter: 'invert(1)' }}
            />
            <h1 className="whitespace-nowrap mt-2">Heal {potionCounter}/3</h1>
          </button>
        </div>

        {playerState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50 mr-3">
            <h1 className="text-8xl font-bold text-[var(--custom-yellow)] pb-50  mt-50">
              GAME OVER
            </h1>
            <a href='../lobby'>
              <button className="bg-red-500 cursor-pointer font-bold p-5 px-12 text-2xl flex items-center justify-center transition-all duration-300 hover:shadow-[1px_0px_29px_0px_rgba(239,68,68,0.7)]">
                Lobby
              </button>
            </a>
          </div>
        )}
      </section>
    </AuthGuard>
  );
}

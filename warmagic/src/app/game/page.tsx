"use client";

import Image from 'next/image'
import { use, useEffect, useState } from "react";

export default function GamePage() {
  const [visible, setVisible] = useState(false);
  const [roundCounter, setRoundCounter] = useState(1);
  const [layerCounter, setLayerCounter] = useState(1);
  const [bgImage, setBgImage] = useState<string>("");
  const [potionCounter, setPotionCounter] = useState(3);

  const [playerHp, setPlayerHp] = useState(6);
  const [enemyHp, setEnemyHp] = useState(6);

  const [src, setSrc] = useState<string>("/assets/hp-bar/player-hp-bar/5hp/player-hb-5hp.png");

  const handleClick = () => {
    // ustawiamy GIF
    setSrc(""); // resetujemy src, żeby React odświeżył komponent
    setTimeout(() => {
    setSrc("/assets/hp-bar/player-hp-bar/6hp/player-hb-6hp-1hp-up.gif");

    // po czasie trwania GIF wracamy do statycznego obrazka
    setTimeout(() => {
      setSrc("/assets/hp-bar/player-hp-bar/6hp/player-hb-6hp.png");
      }, 700); // długość animacji GIF
    }, 1);// <-- tutaj wpisz dokładną długość GIF w ms
  };

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
    <section
      className="relative min-h-screen w-screen flex flex-col"
      style={{ fontFamily: "IsoCore" }}
    >

        {visible && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <span className="text-7xl font-bold text-[var(--custom-yellow)]">
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

  {/* --------------------------------------- */}

        <div className="z-9">
          <Image
          src="/assets/player/player1/player_ready.gif"
          alt='player'
          width={700}
          height={700}
          className="absolute bottom-50 left-30 object-contain"
        />
        <Image
          src="/assets/enemies/skeleton/skeleton-type1/Skeleton-Idle.gif"
          alt='enemy'
          width={500}
          height={500}
          className="absolute bottom-51 right-100 object-contain"
        />
        </div>
        
        <div className="bg-black/50 w-full flex items-center justify-center mt-auto p-4 z-10">
          <button className="bg-red-500 font-bold p-5 px-12 gap-5 text-2xl flex items-center justify-center ml-30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50">
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
              <Image
                src={src}
                key={src} // wymusza rerender Image
                alt="player-hp-bar"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <button onClick={handleClick} className="bg-green-500 font-bold p-5 px-13 gap-4 text-2xl flex items-center justify-center mr-30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50">
            <Image
              src="/assets/icons/battle-icons/potion-svgrepo-com (1).svg"
              alt="potion"
              width={24}
              height={24}
              className="object-contain"
              style={{ filter: 'invert(1)' }}
            />
            <h1 className="whitespace-nowrap mt-2">Heal {potionCounter}</h1>
          </button>
        </div>

    </section>
  );
}

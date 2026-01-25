import Image from 'next/image';

interface PlayerHpBarProps {
    playerHp: number;
    prevHp: number;
    stage: "idle" | "anim" | "after";
    setStage: (s: "idle" | "anim" | "after") => void;
    setPrevHp: (hp: number | ((prev: number) => number)) => void;
}

export default function PlayerHpBar({ playerHp, prevHp, stage, setStage, setPrevHp }: PlayerHpBarProps) {
    if (stage === "idle") {
        return (
            <Image
                key={`player-hp-idle-${playerHp}`}
                src={`/assets/hp-bar/player-hp-bar/${playerHp}hp/player-hb-${playerHp}hp.png`}
                alt="hp-bar"
                fill
                className="object-contain object-bottom"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
        );
    }
    if (stage === "anim") {
        const isHealing = playerHp > prevHp;
        return (
            <video
                key={`player-hp-anim-${playerHp}-${prevHp}`}
                src={`/assets/hp-bar/player-hp-bar/${isHealing ? prevHp + 1 : prevHp}hp/player-hb-${isHealing ? prevHp + 1 : prevHp}hp-1hp-${isHealing ? "up" : "down"}.mp4`}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain object-bottom"
                onEnded={() => {
                    setStage("after");
                    setPrevHp(() => playerHp);
                }}
            />
        );
    }
    if (stage === "after") {
        return (
            <Image
                key={`player-hp-after-${playerHp}`}
                src={`/assets/hp-bar/player-hp-bar/${playerHp}hp/player-hb-${playerHp}hp.png`}
                alt="hp-bar-after"
                fill
                className="object-contain object-bottom"
                onLoad={() => setStage("idle")}
            />
        );
    }

    return null;
}

import Image from 'next/image';

interface EnemyHpBarProps {
    currentEnemy: { name: string, hp: number } | null;
    enemyHp: number;
    prevEnemyHp: number;
    enemyHpStage: "idle" | "anim" | "after";
    setEnemyHpStage: (s: "idle" | "anim" | "after") => void;
}

export default function EnemyHpBar({ currentEnemy, enemyHp, prevEnemyHp, enemyHpStage, setEnemyHpStage }: EnemyHpBarProps) {
    if (!currentEnemy) return null;
    const displayHp = Math.min(6, enemyHp);
    const displayPrev = Math.min(6, prevEnemyHp);

    if (enemyHpStage === "idle") {
        const src = displayHp === 0
            ? "/assets/hp-bar/enemy-hp-bar/0hp/enemy-hb-dead.png"
            : `/assets/hp-bar/enemy-hp-bar/${displayHp}hp/enemy-hb-${displayHp}hp.png`;
        return (
            <Image
                key={`enemy-hp-idle-${enemyHp}`}
                src={src}
                alt="enemy-hp-bar"
                fill
                className="object-contain object-bottom"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
        );
    }
    if (enemyHpStage === "anim") {
        const isHealing = enemyHp > prevEnemyHp;
        const hpFolder = isHealing ? displayHp : displayPrev;
        const hpBase = isHealing ? displayHp : displayPrev;

        let fileName = isHealing ? `enemy-hb-${hpBase}hp-1hp-up.gif` : `enemy-hb-${hpBase}hp-1hp.gif`;
        if (!isHealing && hpBase === 1) fileName = "enemy-hb-1hpw-1hp.gif"; // Typo fix

        return (
            <Image
                key={`enemy-hp-anim-${enemyHp}-${prevEnemyHp}`}
                src={`/assets/hp-bar/enemy-hp-bar/${hpFolder}hp/${fileName}`}
                alt="enemy-hp-anim"
                fill
                className="object-contain object-bottom"
                unoptimized
            />
        );
    }
    if (enemyHpStage === "after") {
        const src = displayHp === 0
            ? "/assets/hp-bar/enemy-hp-bar/0hp/enemy-hb-dead.png"
            : `/assets/hp-bar/enemy-hp-bar/${displayHp}hp/enemy-hb-${displayHp}hp.png`;
        return (
            <Image
                key={`enemy-hp-after-${enemyHp}`}
                src={src}
                alt="enemy-hp-bar-after"
                fill
                className="object-contain object-bottom"
                onLoad={() => setEnemyHpStage("idle")}
            />
        );
    }
    return null;
}

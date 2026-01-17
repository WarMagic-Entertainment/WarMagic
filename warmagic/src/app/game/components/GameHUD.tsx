import EnemyHpBar from './EnemyHpBar';

interface GameHUDProps {
    layer: number;
    round: number;
    turn: 'player' | 'enemy';
    currentEnemy: { name: string, hp: number } | null;
    enemyHp: number;
    prevEnemyHp: number;
    enemyHpStage: "idle" | "anim" | "after";
    setEnemyHpStage: (s: "idle" | "anim" | "after") => void;
}

export default function GameHUD({
    layer,
    round,
    turn,
    currentEnemy,
    enemyHp,
    prevEnemyHp,
    enemyHpStage,
    setEnemyHpStage
}: GameHUDProps) {
    return (
        <div className="bg-black/50 p-4 rounded-md w-full flex flex-col sm:flex-row m-0 z-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--custom-yellow)] whitespace-nowrap flex-shrink-0 flex items-center gap-4 ml-0 sm:ml-40 mb-4 sm:mb-0">
                <span>Layer {layer}</span>
                <span>|</span>
                <span>Round {round}</span>
                <span className={`text-xs ml-2 ${turn === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                    ({turn.toUpperCase()} TURN)
                </span>
            </h1>

            <div className="flex flex-col items-center justify-center w-full mr-0 sm:mr-80">
                <h1 className="text-xl sm:text-3xl font-bold text-center mt-2 capitalize text-white">
                    {currentEnemy ? currentEnemy.name : "..."}
                </h1>
                <div className="relative w-full max-w-[700px] h-[80px] mt-1">
                    <EnemyHpBar
                        currentEnemy={currentEnemy}
                        enemyHp={enemyHp}
                        prevEnemyHp={prevEnemyHp}
                        enemyHpStage={enemyHpStage}
                        setEnemyHpStage={setEnemyHpStage}
                    />
                </div>
            </div>
        </div>
    );
}

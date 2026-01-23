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
    enemyStatus: { type: string; duration: number } | null;
}

export default function GameHUD({
    layer,
    round,
    turn,
    currentEnemy,
    enemyHp,
    prevEnemyHp,
    enemyHpStage,
    setEnemyHpStage,
    enemyStatus
}: GameHUDProps) {
    return (
        <div className="bg-black/50 p-2 sm:p-4 rounded-md w-full flex items-center justify-between m-0 z-10">
            <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--custom-yellow)]">
                    Layer {layer}
                </h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center mx-4 sm:mx-8">
                <div className="flex flex-col items-center">
                    {enemyStatus && (
                        <span className="text-xs sm:text-sm text-[var(--custom-yellow)] font-bold animate-pulse mb-1">
                            {enemyStatus.type === 'moon_blindness' ? 'BLIND' : 'CONFUSED'}
                        </span>
                    )}
                    <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-center capitalize text-white mb-1 sm:mb-2">
                        {currentEnemy ? currentEnemy.name : "..."}
                    </h1>
                </div>
                <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] h-[40px] sm:h-[50px] md:h-[60px] lg:h-[70px] xl:h-[80px]">
                    <EnemyHpBar
                        currentEnemy={currentEnemy}
                        enemyHp={enemyHp}
                        prevEnemyHp={prevEnemyHp}
                        enemyHpStage={enemyHpStage}
                        setEnemyHpStage={setEnemyHpStage}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 text-right">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--custom-yellow)]">
                    Round {round}
                </h1>
                <span className={`text-[10px] sm:text-xs md:text-sm ${turn === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                    ({turn.toUpperCase()} TURN)
                </span>
            </div>
        </div >
    );
}

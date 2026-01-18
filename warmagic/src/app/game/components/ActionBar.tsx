import Image from 'next/image';
import { CARD_DATA } from '../constants';
import PlayerHpBar from './PlayerHpBar';

interface ActionBarProps {
    equippedCards: string[];
    isCardReady: (key: string) => boolean;
    handlePlayerAttack: (key: string) => void;
    turn: 'player' | 'enemy';
    playerHp: number;
    prevHp: number;
    stage: "idle" | "anim" | "after";
    potionCounter: number;
    playerName: string;
    handleHeal: () => void;
    handleSkip: () => void;
    handleAttackClick: () => void;
    setHover: (h: boolean) => void;
    hover: boolean;
    setStage: (s: "idle" | "anim" | "after") => void;
    setPrevHp: (hp: number | ((prev: number) => number)) => void;
    setHoveredCard: (card: string | null) => void;
}

export default function ActionBar({
    equippedCards,
    isCardReady,
    handlePlayerAttack,
    turn,
    playerHp,
    prevHp,
    stage,
    potionCounter,
    playerName,
    handleHeal,
    handleSkip,
    handleAttackClick,
    setHover,
    hover,
    setStage,
    setPrevHp,
    setHoveredCard
}: ActionBarProps) {
    return (
        <div className="bg-black/80 w-full flex items-center justify-between mt-auto p-2 sm:p-4 z-20 min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">

            <div className="flex-shrink-0 flex flex-col items-start justify-center px-4 sm:px-6 md:px-8">
                <h1 className="text-white font-bold -mb-20 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl capitalize">{playerName}</h1>
                <div className="relative w-[350px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]">
                    <PlayerHpBar
                        playerHp={playerHp}
                        prevHp={prevHp}
                        stage={stage}
                        setStage={setStage}
                        setPrevHp={setPrevHp}
                    />
                </div>
            </div>


            <div className="flex-shrink-0 flex gap-2 sm:gap-3 lg:gap-4">
                <button
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={handleHeal}
                    disabled={turn !== 'player' || potionCounter <= 0 || playerHp >= 6}
                    style={{
                        backgroundColor: (turn !== 'player' || potionCounter === 0) ? 'gray' : 'rgba(76, 175, 80, 1)',
                        boxShadow: (hover && turn === 'player' && potionCounter > 0) ? '0px 0px 20px rgba(76, 175, 80, 0.6)' : 'none',
                    }}
                    className="text-white font-bold p-2 sm:p-3 lg:p-4 rounded flex flex-col items-center w-16 sm:w-20 md:w-24 lg:w-28 transition-all text-xs sm:text-sm"
                >
                    <Image
                        src="/assets/icons/battle-icons/potion-svgrepo-com (1).svg"
                        alt="potion"
                        width={20}
                        height={20}
                        className="sm:w-6 sm:h-6"
                        style={{ filter: 'invert(1)' }}
                    />
                    <span className="text-[10px] sm:text-xs">Heal ({potionCounter}/3)</span>
                </button>

                <button
                    onClick={handleAttackClick}
                    disabled={turn !== 'player'}
                    className="bg-red-600 text-white font-bold p-2 sm:p-3 lg:p-4 rounded flex flex-col items-center w-16 sm:w-20 md:w-24 lg:w-28 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
                >
                    <Image
                        src="/assets/icons/battle-icons/sword-svgrepo-com.svg"
                        alt="attack"
                        width={20}
                        height={20}
                        className="sm:w-6 sm:h-6"
                        style={{ filter: 'invert(1)' }}
                    />
                    <span className="text-[10px] sm:text-xs">Attack</span>
                </button>

                <button
                    onClick={handleSkip}
                    disabled={turn !== 'player'}
                    className="bg-yellow-600 text-white font-bold p-2 sm:p-3 lg:p-4 rounded flex flex-col items-center w-16 sm:w-20 md:w-24 lg:w-28 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
                >
                    <span className="text-lg sm:text-xl lg:text-2xl">⏭</span>
                    <span className="text-[10px] sm:text-xs">Skip</span>
                </button>
            </div>
        </div>
    );
}

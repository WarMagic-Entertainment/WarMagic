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
    handleHeal: () => void;
    handleSkip: () => void;
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
    handleHeal,
    handleSkip,
    setHover,
    hover,
    setStage,
    setPrevHp,
    setHoveredCard
}: ActionBarProps) {
    return (
        <div className="bg-black/80 w-full flex items-center justify-center mt-auto p-4 z-20 min-h-[150px] gap-8">
            {/* Cards */}
            <div className="flex gap-2">
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
                            className={`relative w-20 h-32 border rounded transition-all duration-200 group
                            ${isReady && turn === 'player' ? 'cursor-pointer hover:-translate-y-4 hover:border-[var(--custom-yellow)] hover:scale-110' : 'cursor-not-allowed opacity-50 grayscale'}
                          `}
                        >
                            <Image
                                src={`/assets/cards/${cardData.file}`}
                                alt={cardData.name}
                                fill
                                className="object-cover rounded"
                            />
                            {!isReady && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-xs text-white font-bold text-center p-1">
                                    <span>COOLDOWN</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Player HP */}
            <div className="relative w-[300px] flex flex-col items-center">
                <h1 className="text-white font-bold mb-1">Player HP</h1>
                <div className="relative w-full h-[80px]">
                    <PlayerHpBar
                        playerHp={playerHp}
                        prevHp={prevHp}
                        stage={stage}
                        setStage={setStage}
                        setPrevHp={setPrevHp}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={handleHeal}
                    disabled={turn !== 'player' || potionCounter <= 0 || playerHp >= 6}
                    style={{
                        backgroundColor: (turn !== 'player' || potionCounter === 0) ? 'gray' : 'rgba(76, 175, 80, 1)',
                        boxShadow: (hover && turn === 'player' && potionCounter > 0) ? '0px 0px 20px rgba(76, 175, 80, 0.6)' : 'none',
                    }}
                    className="text-white font-bold p-4 rounded flex flex-col items-center w-32 transition-all"
                >
                    <Image
                        src="/assets/icons/battle-icons/potion-svgrepo-com (1).svg"
                        alt="potion"
                        width={24}
                        height={24}
                        style={{ filter: 'invert(1)' }}
                    />
                    <span>Heal ({potionCounter}/3)</span>
                </button>

                <button
                    onClick={handleSkip}
                    disabled={turn !== 'player'}
                    className="bg-yellow-600 text-white font-bold p-4 rounded flex flex-col items-center w-32 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                >
                    <span className="text-2xl">⏭</span>
                    <span>Skip</span>
                </button>
            </div>
        </div>
    );
}

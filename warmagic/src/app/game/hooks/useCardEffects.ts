import { Enemy, EnemyStatus } from "../types";

interface UseCardEffectsProps {
    enemy: Enemy | null;
    playerHp: number;
    enemyHp: number;
    changePlayerHp: (amount: number) => void;
    setEnemyHp: (val: number) => void;
    setEnemyStatus: (status: EnemyStatus | null) => void;
    setSelectionMode: (mode: 'none' | 'reduce_1' | 'reduce_2' | 'reset') => void;
    setTurn: (turn: 'player' | 'enemy') => void;
    setEnemyState: (state: "idle" | "attack" | "hit" | "dead") => void;
    setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
    fleeEncounter: () => void;
    hasDepletedCards: () => boolean;
}

export const useCardEffects = ({
    enemy,
    playerHp,
    enemyHp,
    changePlayerHp,
    setEnemyHp,
    setEnemyStatus,
    setSelectionMode,
    setTurn,
    setEnemyState,
    setGameStatus,
    fleeEncounter,
    hasDepletedCards
}: UseCardEffectsProps) => {

    const handleCardEffect = (cardKey: string): { dmg: number, preventTurnChange?: boolean } => {
        if (!enemy) return { dmg: 0 };

        switch (cardKey) {
            // 1 ✅
            case 'fool':
                changePlayerHp(6);
                setEnemyHp(6);
                setTurn('player');
                if (enemyHp <= 0) {
                    setEnemyState("dead");
                    setGameStatus("won");
                    return { dmg: 0, preventTurnChange: true };
                }
                return {
                    dmg: 0,
                    preventTurnChange: true
                };

            // 2 ✅
            case 'magician':
                setSelectionMode('reduce_1');
                setTurn('player');
                return { dmg: 1, preventTurnChange: true };

            // 3 ✅
            case 'high_priestess':
                setSelectionMode('reset');
                setTurn('player');
                return { dmg: 0, preventTurnChange: true };

            // 4✅
            case 'empress':
                changePlayerHp(1);
                return { dmg: 1 };

            // 5 ✅
            case 'emperor':
                if (playerHp === 1) {
                    changePlayerHp(2);
                    setTurn('player');
                    return { dmg: 0, preventTurnChange: true };
                }
                return { dmg: 0 };

            // 6✅
            case 'hierophant':
                setEnemyStatus({ type: 'confusion', duration: 1 });
                return { dmg: 0 };

            // 7 ✅
            case 'lovers':
                changePlayerHp(1);
                setEnemyHp(enemyHp + 1);
                setTurn('player');
                return { dmg: 0, preventTurnChange: true };

            // 8 ✅
            case 'chariot':
                fleeEncounter();
                return { dmg: 0, preventTurnChange: true };

            // 9 ✅
            case 'moon':
                setEnemyStatus({ type: 'moon_blindness', duration: 1 });
                return { dmg: 0 };

            // 10 ✅    
            case 'wheel_of_fortune':
                const oldPlayerHp = playerHp;
                const oldEnemyHp = enemyHp;
                changePlayerHp(oldEnemyHp - oldPlayerHp);
                setEnemyHp(oldPlayerHp);

                return { dmg: 0 };

            // 11 ✅
            case 'justice':
                const hit1 = 5
                const hit2 = 4
                if (hit1 + 1 === 6) {
                    return { dmg: 1 };
                } else {
                    const oldPlayerHp2 = playerHp;
                    if (oldPlayerHp2 === oldPlayerHp2 - 1) {
                        return { dmg: 1 };
                    }
                }

                if (hit2 + 2 === 6) {
                    return { dmg: 2 };
                } else {
                    const oldPlayerHp2 = playerHp;
                    if (oldPlayerHp2 === oldPlayerHp2 - 2) {
                        return { dmg: 2 };
                    }
                }

            // 12 ✅
            case 'strength':
                return { dmg: 3 };

            // 13 ✅
            case 'hanged_man':
                const isWin = Math.random() < 0.7;
                if (isWin) {
                    setEnemyHp(0);
                    return { dmg: 0, preventTurnChange: true };
                } else {
                    changePlayerHp(-6);
                }
                return { dmg: 0 };

            // 14 ✅
            case 'temperance':
                setEnemyHp(playerHp);
                return { dmg: 0 };

            // 15 ✅
            case 'judgement':
                setSelectionMode('reduce_2');
                return { dmg: 2, preventTurnChange: true };

            // 16 ✅
            case 'world':
                if (enemyHp - 2 === 0) {
                    setEnemyHp(0);
                    changePlayerHp(6);
                    return { dmg: 0 };
                } else {
                    return { dmg: 2 };
                }

            // 17 ✅
            case 'sun':
                changePlayerHp(6);
                return { dmg: 0, preventTurnChange: true };

            // 18 ✅
            case 'death':
                // Less than half of 6 is < 3
                if (enemyHp <= 3) {
                    changePlayerHp(2);
                    return { dmg: 3, preventTurnChange: true };
                }
                else {
                    changePlayerHp(1);
                    return { dmg: 2 };
                }

            // 19 ✅
            case 'star':
                changePlayerHp(1);
                setTurn('player');
                return { dmg: 0, preventTurnChange: true };

            // 20 ✅
            case 'hermit':
                changePlayerHp(2);
                const bonusDmg = hasDepletedCards() ? 1 : 0;
                return { dmg: bonusDmg, preventTurnChange: true };

            // 21 ✅
            case 'devil':
                let dmg = 2
                const addDmg = 6 - playerHp
                dmg = dmg + addDmg
                return { dmg: dmg };

            // 22
            case 'tower':
                const rand = Math.random();
                let selfDmg = 1;

                if (rand < 0.5) {
                    selfDmg = 1;
                } else if (rand < 0.8) {
                    selfDmg = 2;
                } else {
                    selfDmg = 3;
                }
                return { dmg: selfDmg };

            default:
                return { dmg: 2 };
        }
    };

    return { handleCardEffect };
};

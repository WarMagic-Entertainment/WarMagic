import { Enemy, EnemyStatus } from "../types";

interface UseCardEffectsProps {
    enemy: Enemy | null;
    playerHp: number;
    enemyHp: number;
    changePlayerHp: (amount: number) => void;
    setEnemyHp: (val: number) => void;
    setEnemyStatus: (status: EnemyStatus | null) => void;
    setSelectionMode: (mode: boolean) => void;
    setTurn: (turn: 'player' | 'enemy') => void;
    setEnemyState: (state: "idle" | "attack" | "hit" | "dead") => void;
    setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
    fleeEncounter: () => void;
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
    fleeEncounter
}: UseCardEffectsProps) => {

    const handleCardEffect = (cardKey: string): { dmg: number, preventTurnChange?: boolean } => {
        if (!enemy) return { dmg: 0 };

        switch (cardKey) {
            // 1
            case 'fool':
                changePlayerHp(6);
                setEnemyHp(6);
                setTurn('player');
                return {
                    dmg: 0,
                    preventTurnChange: true
                };


            // 2 
            case 'magician':
                setSelectionMode(true);
                setTurn('player');
                return { dmg: 1, preventTurnChange: true };

            // 3
            case 'high_priestess':
                changePlayerHp(3);
                return { dmg: 0 };

            // 4
            case 'empress':
                changePlayerHp(1);
                return { dmg: 1 };

            // 5
            case 'emperor':
                if (playerHp === 1) {
                    changePlayerHp(2);
                    setTurn('player');
                    return { dmg: 0, preventTurnChange: true };
                }
                return { dmg: 0 };

            // 6
            case 'hierophant':
                setEnemyStatus({ type: 'confusion', duration: 1 });
                return { dmg: 0 };

            // 7
            case 'lovers':
                changePlayerHp(playerHp + 1);
                setEnemyHp(enemyHp + 1);
                return { dmg: 0 };

            // 8
            case 'chariot':
                fleeEncounter();
                return { dmg: 0, preventTurnChange: true };

            // 9
            case 'moon':
                setEnemyStatus({ type: 'moon_blindness', duration: 1 });
                return { dmg: 0 };

            // 10
            case 'wheel_of_fortune':
                const oldPlayerHp = playerHp;
                const oldEnemyHp = enemyHp;
                changePlayerHp(oldEnemyHp - oldPlayerHp);
                setEnemyHp(oldPlayerHp);

                return { dmg: 0 };
            
            // 11
            case 'justice':
                const hit1 = 5
                const hit2 = 4
                if (hit1 + 1 === 6) {
                    return { dmg: 1 };
                } else {
                    const oldPlayerHp2 = playerHp;
                    if(oldPlayerHp2 === oldPlayerHp2 - 1) {
                        return { dmg: 1 };
                    }
                }
                
                if (hit2 + 2 === 6) {
                    return { dmg: 2 };
                } else {
                    const oldPlayerHp2 = playerHp;
                    if(oldPlayerHp2 === oldPlayerHp2 - 2) {
                        return { dmg: 2 };
                    }
                }

            // 12
            case 'strength':
                return { dmg: 3 };

            // 13  
            case 'temperance':
                setEnemyHp(playerHp + 1);
                return { dmg: 0 };

            // 14
            case 'judgement':
                setSelectionMode(true);
                return { dmg: 2, preventTurnChange: true };

            // 15
            // 1/2
            case 'world':
                const hit3 = 0
                if (hit3 + 2 === 2) {
                    setEnemyHp(0);
                    changePlayerHp(6);
                    return { dmg: 0 };
                } else {
                    return { dmg: 2 };
                }
            
            // 16
            case 'sun':
                changePlayerHp(6);
                return { dmg: 0, preventTurnChange: true };

            // 17
            case 'death':
                if (enemyHp <= 3) {
                    changePlayerHp(playerHp + 2);
                    return { dmg: 3 };
                }
                else {
                    changePlayerHp(playerHp + 1);
                    return { dmg: 2 };
                }
            
            // 18
            case 'star':
                changePlayerHp(playerHp + 1);
                setTurn('player');
                return { dmg: 0 };

            default:
                return { dmg: 2 };
        }
    };

    return { handleCardEffect };
};

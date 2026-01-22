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
    setGameStatus
}: UseCardEffectsProps) => {

    const handleCardEffect = (cardKey: string): { dmg: number, description: string, preventTurnChange?: boolean } => {
        if (!enemy) return { dmg: 0, description: "No enemy" };

        switch (cardKey) {
            case 'fool':
                changePlayerHp(6);
                setEnemyHp(6);
                return {
                    dmg: 0,
                    description: "Fool's Play! All Healed.",
                    preventTurnChange: true
                };

            case 'magician':
                setSelectionMode(true);
                return { dmg: 1, description: "Magician's Trick! Select a card.", preventTurnChange: true };

            case 'high_priestess':
                changePlayerHp(3);
                return { dmg: 0, description: "Holy Light!" };

            case 'empress':
                changePlayerHp(1);
                return { dmg: 1, description: "Nature's Balance." };

            case 'emperor':
                if (playerHp === 1) {
                    changePlayerHp(2);
                    return { dmg: 0, description: "Imperial Rally!", preventTurnChange: true };
                }
                return { dmg: 0, description: "Must be at 1 HP!" };

            case 'hierophant':
                setEnemyStatus({ type: 'confusion', duration: 1 });
                return { dmg: 0, description: "Confusion cast!" };

            case 'lovers':
                return { dmg: 2, description: "Basic Attack" };

            case 'moon':
                setEnemyStatus({ type: 'moon_blindness', duration: 1 });
                return { dmg: 0, description: "Moonlight Blindness!" };

            case 'wheel_of_fortune':
                const oldPlayerHp = playerHp;
                const oldEnemyHp = enemyHp;
                changePlayerHp(oldEnemyHp - oldPlayerHp);
                setEnemyHp(oldPlayerHp);

                return { dmg: 0, description: "Wheel Spins! HP Swapped." };

            default:
                return { dmg: 2, description: "Attack!" };
        }
    };

    return { handleCardEffect };
};

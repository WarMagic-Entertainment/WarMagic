import { useState } from "react";
import { CardState } from "../types";

export const useCardLogic = (round: number, layer: number, cardInfos: Record<string, any>) => {
    const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
    const [globalRoundOffset, setGlobalRoundOffset] = useState(0);

    const getCardCooldownState = (cardKey: string) => {
        if (!cardInfos[cardKey]) return null;
        const cdString = cardInfos[cardKey].cooldown;
        if (!cdString) return null;

        const type = cdString.charAt(0).toLowerCase();
        let valStr = "";
        let parsedType = "";

        if (type === 'f' && cdString.charAt(1) === 'u') {
            parsedType = 'u';
            valStr = cdString.substring(2);
        } else {
            parsedType = type;
            valStr = cdString.substring(1);
        }

        const val = parseInt(valStr) || 1;

        return { type: parsedType, val };
    };

    const isCardReady = (cardKey: string) => {
        const state = cardStates[cardKey];
        const cd = getCardCooldownState(cardKey);
        if (!cd) return true;

        if (cd.type === 'u') {
            if (state && state.usesLeft <= 0) return false;
            return true;
        }
        if (cd.type === 'r') {
            if (!state) return true;
            const currentAbsRound = round + globalRoundOffset;
            return (currentAbsRound - state.lastUsedRound) >= cd.val;
        }
        if (cd.type === 'l') {
            if (!state) return true;
            return (layer - state.lastUsedLayer) >= cd.val;
        }
        return true;
    };

    const parseCooldown = (cdString: string) => {
        if (!cdString || cdString.length < 2) return cdString;
        const typeChar = cdString.charAt(0).toLowerCase();
        const value = cdString.substring(1);

        let typeLabel = "";
        switch (typeChar) {
            case 'r': typeLabel = "Rounds"; break;
            case 'l': typeLabel = "Levels"; break; //using level instead of layer to make it more intuitive
            case 'u': typeLabel = "Uses"; break;
            default: typeLabel = "";
        }

        return `${value} ${typeLabel}`;
    };

    const recordCardUsage = (cardKey: string) => {
        const cd = getCardCooldownState(cardKey);
        setCardStates(prev => {
            const defaults = {
                lastUsedRound: -999,
                lastUsedLayer: -999,
                usesLeft: cd?.type === 'u' ? cd.val : 999
            };

            const current = prev[cardKey] || defaults;

            return {
                ...prev,
                [cardKey]: {
                    lastUsedRound: round + globalRoundOffset,
                    lastUsedLayer: layer,
                    usesLeft: cd?.type === 'u' ? (current.usesLeft - 1) : current.usesLeft
                }
            };
        });
    };

    const getRemainingCooldown = (cardKey: string): string | null => {
        const cd = getCardCooldownState(cardKey);
        const state = cardStates[cardKey];
        if (!cd || !state) return null;

        if (cd.type === 'r') {
            const currentAbsRound = round + globalRoundOffset;
            const passed = currentAbsRound - state.lastUsedRound;
            if (passed >= cd.val) return null;
            const remaining = cd.val - passed;
            return `${remaining} Round${remaining > 1 ? 's' : ''}`;
        }

        if (cd.type === 'l') {
            const passed = layer - state.lastUsedLayer;
            if (passed >= cd.val) return null;
            const remaining = cd.val - passed;
            return `${remaining} Layer${remaining > 1 ? 's' : ''}`;
        }

        if (cd.type === 'u') {
            if (state.usesLeft > 0) return null;
            return "Depleted";
        }

        return null;
    };

    const reduceCooldown = (cardKey: string, amount: number = 1) => {
        setCardStates(prev => {
            const state = prev[cardKey];
            if (!state) return prev; //Not on cooldown or used yet

            const cd = getCardCooldownState(cardKey);
            if (!cd) return prev;

            let newState = { ...state };

            if (cd.type === 'r') {
                newState.lastUsedRound -= amount;
            } else if (cd.type === 'l') {
                newState.lastUsedLayer -= amount;
            } else if (cd.type === 'u') {
                newState.usesLeft += amount;
                if (newState.usesLeft > cd.val) newState.usesLeft = cd.val;
            }

            return {
                ...prev,
                [cardKey]: newState
            };
        });
    };

    const adjustCooldowns = (finalRound: number) => {
        setCardStates(prev => {
            const nextStates = { ...prev };
            Object.keys(nextStates).forEach(key => {
                const cd = getCardCooldownState(key);
                if (cd?.type === 'r') {

                    nextStates[key] = {
                        ...nextStates[key],
                        lastUsedRound: nextStates[key].lastUsedRound - finalRound
                    };
                }
            });
            return nextStates;
        });
    };

    return {
        cardStates,
        setCardStates,
        isCardReady,
        recordCardUsage,
        parseCooldown,
        getRemainingCooldown,
        reduceCooldown,
        adjustCooldowns
    };
};

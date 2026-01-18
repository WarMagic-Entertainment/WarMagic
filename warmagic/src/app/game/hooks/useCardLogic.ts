import { useState } from "react";
import { CardState } from "../types";

export const useCardLogic = (round: number, layer: number, cardInfos: Record<string, any>) => {
    const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

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
            return (round - state.lastUsedRound) >= cd.val;
        }
        if (cd.type === 'l') {
            if (!state) return true;
            return (layer - state.lastUsedLayer) >= cd.val;
        }
        return true;
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
                    lastUsedRound: round,
                    lastUsedLayer: layer,
                    usesLeft: cd?.type === 'u' ? (current.usesLeft - 1) : current.usesLeft
                }
            };
        });
    };

    const parseCooldown = (cdString: string) => {
        if (!cdString || cdString.length < 2) return cdString;
        const typeChar = cdString.charAt(0).toLowerCase();
        const value = cdString.substring(1);

        let typeLabel = "";
        switch (typeChar) {
            case 'r': typeLabel = "Rounds"; break;
            case 'l': typeLabel = "Levels"; break;
            case 'u': typeLabel = "Uses"; break;
            default: typeLabel = "";
        }

        return `${value} ${typeLabel}`;
    };

    return {
        cardStates,
        setCardStates,
        isCardReady,
        recordCardUsage,
        parseCooldown
    };
};

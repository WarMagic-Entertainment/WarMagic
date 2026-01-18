export interface Enemy {
    id: string;
    name: string;
    hp: number;
    dmg: number;
    xp: number;
}

export interface CardState {
    lastUsedRound: number;
    lastUsedLayer: number;
    usesLeft: number;
}

export interface CardInfo {
    name: string;
    description: string;
    cooldown: string;
    xp_needed: number;
    file: string; //From CARD_DATA
}

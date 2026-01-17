export const ENEMY_ASSETS: Record<string, { basePath: string, filePrefix: string, stateMap: Record<string, string> }> = {
    demon: {
        basePath: "/assets/enemies/demon/demon",
        filePrefix: "demon_",
        stateMap: { idle: "ready.gif", attack: "attack.gif", hit: "hit.gif", dead: "dead.gif" }
    },
    imp: {
        basePath: "/assets/enemies/demon/imp",
        filePrefix: "demon_",
        stateMap: { idle: "ready.gif", attack: "attack.gif", hit: "hit.gif", dead: "dead.gif" }
    },
    skeleton: {
        basePath: "/assets/enemies/skeleton/skeleton-type1",
        filePrefix: "Skeleton-",
        stateMap: { idle: "Idle.gif", attack: "Attack.gif", hit: "Hit.gif", dead: "Dead.gif" }
    },
    undead: {
        basePath: "/assets/enemies/skeleton/skeleton-type2",
        filePrefix: "undead_",
        stateMap: { idle: "idle.gif", attack: "attack.gif", hit: "hurt.gif", dead: "death.gif" }
    }
};

export const getEnemyAsset = (name: string, state: string) => {
    const config = ENEMY_ASSETS[name.toLowerCase()];
    if (!config) return "/assets/enemies/skeleton/skeleton-type1/Skeleton-Idle.gif";
    const suffix = config.stateMap[state];
    if (!suffix) return `${config.basePath}/${config.filePrefix}${config.stateMap['idle']}`;

    return `${config.basePath}/${config.filePrefix}${suffix}`;
};

export const CARD_DATA: Record<string, { id: number, file: string, name: string }> = {
    fool: { id: 0, file: "0.png", name: "The Fool" },
    magician: { id: 1, file: "1.png", name: "The Magician" },
    high_priestess: { id: 2, file: "2.png", name: "The High Priestess" },
    empress: { id: 3, file: "3.png", name: "The Empress" },
    emperor: { id: 4, file: "4.png", name: "The Emperor" },
    hierophant: { id: 5, file: "5.png", name: "The Hierophant" },
    lovers: { id: 6, file: "6.png", name: "The Lovers" },
    chariot: { id: 7, file: "7.png", name: "The Chariot" },
    justice: { id: 8, file: "8.png", name: "Justice" },
    hermit: { id: 9, file: "9.png", name: "The Hermit" },
    wheel_of_fortune: { id: 10, file: "10.png", name: "Wheel of Fortune" },
    strength: { id: 11, file: "11.png", name: "Strength" },
    hanged_man: { id: 12, file: "12.png", name: "The Hanged Man" },
    death: { id: 13, file: "13.png", name: "Death" },
    temperance: { id: 14, file: "14.png", name: "Temperance" },
    devil: { id: 15, file: "15.png", name: "The Devil" },
    tower: { id: 16, file: "16.png", name: "The Tower" },
    star: { id: 17, file: "17.png", name: "The Star" },
    moon: { id: 18, file: "18.png", name: "The Moon" },
    sun: { id: 19, file: "19.png", name: "The Sun" },
    judgement: { id: 20, file: "20.png", name: "Judgement" },
    world: { id: 21, file: "21.png", name: "The World" },
};

export const ALL_CARD_KEYS = [
    "fool", "magician", "high_priestess", "empress", "emperor", "hierophant",
    "lovers", "chariot", "justice", "hermit", "wheel_of_fortune", "strength",
    "hanged_man", "death", "temperance", "devil", "tower", "star", "moon",
    "sun", "judgement", "world"
];

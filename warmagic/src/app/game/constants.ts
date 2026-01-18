export const ENEMY_ASSETS: Record<
  string,
  {
    basePath: string;
    filePrefix: string;
    stateMap: Record<string, string>;
    sizeClass: string;
    idlePositionClass: string;
    animPositionClass: string;
  }
> = {
  demon: {
    basePath: "/assets/enemies/demon/demon",
    filePrefix: "demon_",
    stateMap: {
      idle: "ready.gif",
      attack: "attack.webm",
      hit: "hit.webm",
      dead: "dead.webm",
    },
    sizeClass: "w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[500px] md:h-[500px] lg:w-[800px] lg:h-[800px] xl:w-[1200px] xl:h-[1200px]",
    idlePositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-16 sm:right-20 md:right-32 lg:right-90 xl:right-0",
    animPositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-16 sm:right-20 md:right-32 lg:right-90 xl:right-0",
  },
  imp: {
    basePath: "/assets/enemies/demon/imp",
    filePrefix: "demon_",
    stateMap: {
      idle: "ready.gif",
      attack: "attack.webm",
      hit: "hit.webm",
      dead: "dead.webm",
    },
    sizeClass: "w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[500px] md:h-[500px] lg:w-[800px] lg:h-[800px] xl:w-[800px] xl:h-[800px]",
    idlePositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-8 sm:right-8 md:right-16 lg:right-40 xl:right-60",
    animPositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-8 sm:right-8 md:right-16 lg:right-40 xl:right-60",
  },

  skeleton: {
    basePath: "/assets/enemies/skeleton/skeleton-type1",
    filePrefix: "Skeleton-",
    stateMap: {
      idle: "Idle.gif",
      attack: "Attack.webm",
      hit: "Hit.webm",
      dead: "Dead.webm",
    },
    sizeClass: "w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px]",
    idlePositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-8 md:right-16 lg:right-40 xl:right-60",
    animPositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-8 md:right-16 lg:right-40 xl:right-60",
  },

  undead: {
    basePath: "/assets/enemies/skeleton/skeleton-type2",
    filePrefix: "undead_",
    stateMap: {
      idle: "idle.gif",
      attack: "attack.webm",
      hit: "hurt.webm",
      dead: "death.webm",
    },
    sizeClass: "w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] xl:w-[800px] xl:h-[800px]",
    idlePositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-8 right-4 sm:right-8 md:right-12 lg:right-32 xl:right-52",
    animPositionClass: "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-8 right-4 sm:right-8 md:right-12 lg:right-32 xl:right-52",
  },
};


export const getEnemyPositionClass = (
  name: string,
  isAnimation: boolean
) => {
  const enemy = ENEMY_ASSETS[name.toLowerCase()];
  if (!enemy) return "bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-8 md:right-16 lg:right-40 xl:right-60";

  return isAnimation
    ? enemy.animPositionClass
    : enemy.idlePositionClass; 
};


export const getEnemySizeClass = (name: string) => {
  return ENEMY_ASSETS[name.toLowerCase()]?.sizeClass ?? "w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px]";
};

export const isVideoAsset = (path: string) => {
  return path.endsWith(".webm") || path.endsWith(".mp4");
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

"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthGuard from "@/components/AuthGuard";

const CARD_DATA: Record<string, { id: number, file: string, name: string }> = {
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
const ALL_CARD_KEYS = [
    "fool", "magician", "high_priestess", "empress", "emperor", "hierophant",
    "lovers", "chariot", "justice", "hermit", "wheel_of_fortune", "strength",
    "hanged_man", "death", "temperance", "devil", "tower", "star", "moon",
    "sun", "judgement", "world"
];

interface CardInfo {
    name: string;
    description: string;
    cooldown: string;
    xp_needed: number;
}

export default function EquipmentPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
    const [equippedCards, setEquippedCards] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cardInfos, setCardInfos] = useState<Record<string, CardInfo>>({});
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUnlockedCards(data.unlockedCards || []);
                        const equipped = data.equippedCards || [];
                        const paddedEquipped = [...equipped];
                        while (paddedEquipped.length < 6) paddedEquipped.push("");
                        setEquippedCards(paddedEquipped.slice(0, 6));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                router.push("/login");
            }
            setLoading(false);
        });
        const fetchCardData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "cards"));
                const infoMap: Record<string, CardInfo> = {};
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as any;
                    if (ALL_CARD_KEYS.includes(data.name)) {
                        infoMap[data.name] = {
                            name: data.name,
                            description: data.description,
                            cooldown: data.cooldown,
                            xp_needed: data.xp_needed
                        };
                    }
                });
                setCardInfos(infoMap);
            } catch (error) {
                console.error("Error fetching card metadata:", error);
            }
        };
        fetchCardData();

        return () => unsubscribe();
    }, [router]);

    const handleCardSelect = (cardKey: string) => {
        if (selectedSlot === null) return;
        if (!unlockedCards.includes(cardKey)) {
            return;
        }
        if (equippedCards.includes(cardKey) && equippedCards[selectedSlot] !== cardKey) {
            alert("This card is already equipped!");
            return;
        }

        const newEquipped = [...equippedCards];
        newEquipped[selectedSlot] = cardKey;
        setEquippedCards(newEquipped);
    };

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            const docRef = doc(db, "users", userId);
            await updateDoc(docRef, {
                equippedCards: equippedCards
            });
            alert("Equipment saved!");
        } catch (error) {
            console.error("Error saving equipment:", error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
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

    if (loading) return <div className="h-screen w-screen flex items-center justify-center text-white bg-black">Loading...</div>;

    return (
        <section
            className="relative min-h-screen w-screen overflow-hidden flex flex-col"
            style={{ fontFamily: "IsoCore" }}
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
        >
            {hoveredCard && cardInfos[hoveredCard] && (
                <div
                    className="fixed pointer-events-none z-[100] w-[300px] bg-black/90 border border-[var(--custom-yellow)] rounded-lg p-4 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md"
                    style={{
                        top: Math.min(mousePos.y + 20, window.innerHeight - 320) + 'px',
                        left: Math.min(mousePos.x + 20, window.innerWidth - 320) + 'px'
                    }}
                >
                    <h3 className="text-[var(--custom-yellow)] text-xl font-bold mb-2">
                        {CARD_DATA[hoveredCard]?.name || hoveredCard}
                    </h3>
                    <div className="text-sm text-gray-300 mb-4 italic">
                        {cardInfos[hoveredCard].description}
                    </div>

                    <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Cooldown:</span>
                            <span className="font-bold text-white">{parseCooldown(cardInfos[hoveredCard].cooldown)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Unlock XP:</span>
                            <span className={`font-bold ${unlockedCards.includes(hoveredCard) ? 'text-green-400' : 'text-red-400'}`}>
                                {cardInfos[hoveredCard].xp_needed} XP
                            </span>
                        </div>
                    </div>
                </div>
            )}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75 -z-10"
                style={{
                    backgroundImage: "url('/assets/background/main-pages-background/castle.png')",
                }}
            ></div>
            <div className="absolute top-[35px] left-0 w-full flex justify-between px-[100px] text-white text-[27px] font-bold z-10">
                <div className="flex gap-10">
                    <a href="/lobby" className="hover:text-[var(--custom-yellow)] transition-colors">Back to Lobby</a>
                </div>
                <div className="flex gap-4 items-center">
                    <span>Equipment</span>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-sm bg-[var(--custom-yellow)] text-black px-4 py-2 rounded hover:bg-[#ebbc6c] disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col pt-[100px] pb-6 px-[50px] lg:px-[100px] gap-4 h-[calc(100vh)] justify-end overflow-hidden">
                <div className="flex-1 min-h-0 bg-[#202020]/90 backdrop-blur-md rounded-lg p-4 overflow-hidden flex flex-col relative">
                    <h2 className="text-xl text-[var(--custom-yellow)] font-bold mb-2 shrink-0">Collection</h2>

                    <div className="overflow-y-auto flex flex-wrap justify-center gap-2 content-start p-2 h-full">
                        {ALL_CARD_KEYS.map((cardKey) => {
                            const card = CARD_DATA[cardKey];
                            const isUnlocked = unlockedCards.includes(cardKey);
                            const isEquipped = equippedCards.includes(cardKey);

                            return (
                                <div key={cardKey} className="w-28 aspect-[2/3] flex items-center justify-center p-2">
                                    <div
                                        onClick={() => isUnlocked && handleCardSelect(cardKey)}
                                        onMouseEnter={() => setHoveredCard(cardKey)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className={`
                                    w-full h-full rounded border relative overflow-hidden transition-all duration-200 group
                                    ${isUnlocked ? 'cursor-pointer hover:border-[var(--custom-yellow)] hover:scale-110 hover:z-50 hover:shadow-xl' : 'cursor-not-allowed opacity-50 grayscale'}
                                    ${isEquipped ? 'border-[var(--custom-yellow)]' : 'border-gray-600'}
                                `}
                                    >
                                        {card ? (
                                            <Image
                                                src={`/assets/cards/${card.file}`}
                                                alt={card.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-white break-words text-center">
                                                {cardKey}
                                            </div>
                                        )}

                                        {!isUnlocked && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-gray-400 text-xs font-bold">Locked</span>
                                            </div>
                                        )}

                                        {isEquipped && isUnlocked && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-[var(--custom-yellow)] font-bold border border-[var(--custom-yellow)] px-1 py-0.5 rounded bg-black/60 text-[10px] shadow-lg backdrop-blur-sm">Equipped</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-[280px] shrink-0 bg-[#202020]/90 backdrop-blur-md rounded-lg p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h2 className="text-xl text-[var(--custom-yellow)] font-bold">Your Deck</h2>
                        <div className="text-sm text-gray-400">Select a slot to change card</div>
                    </div>

                    <div className="flex-1 flex justify-center items-center gap-4 h-full">
                        {equippedCards.map((cardKey, index) => {
                            const card = CARD_DATA[cardKey];
                            return (
                                <div
                                    key={`slot-${index}`}
                                    onClick={() => setSelectedSlot(index)}
                                    onMouseEnter={() => cardKey && setHoveredCard(cardKey)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className={`
                                h-full aspect-[2/3] rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden shrink-0
                                ${selectedSlot === index ? 'border-[var(--custom-yellow)] shadow-[0_0_20px_rgba(255,208,128,0.4)] -translate-y-2' : 'border-gray-600 hover:border-gray-400 hover:-translate-y-1'}
                            `}
                                >
                                    {card ? (
                                        <Image
                                            src={`/assets/cards/${card.file}`}
                                            alt={card.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900/50">
                                            Slot {index + 1}
                                        </div>
                                    )}
                                    <div className="absolute top-1 left-1 bg-black/70 px-1.5 rounded text-xs text-white">
                                        {index + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}

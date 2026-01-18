"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthGuard from "@/components/AuthGuard";
import { CARD_DATA, ALL_CARD_KEYS } from "../game/constants";

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
            }
            // AuthGuard handles redirect
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
        <AuthGuard>
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
                <div className="absolute top-4 sm:top-[35px] left-0 w-full flex flex-col sm:flex-row justify-between px-4 sm:px-8 lg:px-[100px] text-white text-lg sm:text-xl lg:text-[27px] font-bold z-10 gap-2 sm:gap-0">
                    <div className="flex gap-4 sm:gap-10">
                        <a href="/lobby" className="hover:text-[var(--custom-yellow)] transition-colors text-sm sm:text-base lg:text-lg">Back to Lobby</a>
                    </div>
                    <div className="flex gap-2 sm:gap-4 items-center">
                        <span className="text-sm sm:text-base lg:text-lg">Equipment</span>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-xs sm:text-sm bg-[var(--custom-yellow)] text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#ebbc6c] disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col pt-20 sm:pt-24 lg:pt-[100px] pb-4 sm:pb-6 px-4 sm:px-6 lg:px-[50px] xl:px-[100px] gap-3 sm:gap-4 h-[calc(100vh)] justify-end overflow-hidden">
                    <div className="flex-1 min-h-0 bg-[#202020]/90 backdrop-blur-md rounded-lg p-3 sm:p-4 overflow-hidden flex flex-col relative">
                        <h2 className="text-base sm:text-lg lg:text-xl text-[var(--custom-yellow)] font-bold mb-2 shrink-0">Collection</h2>

                        <div className="overflow-y-auto flex flex-wrap justify-center gap-1.5 sm:gap-2 content-start p-1 sm:p-2 h-full">
                            {ALL_CARD_KEYS.map((cardKey) => {
                                const card = CARD_DATA[cardKey];
                                const isUnlocked = unlockedCards.includes(cardKey);
                                const isEquipped = equippedCards.includes(cardKey);

                                return (
                                    <div key={cardKey} className="w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2/3] flex items-center justify-center p-1 sm:p-2">
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

                    <div className="h-[200px] sm:h-[240px] lg:h-[280px] shrink-0 bg-[#202020]/90 backdrop-blur-md rounded-lg p-3 sm:p-4 flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 shrink-0 gap-1 sm:gap-0">
                            <h2 className="text-base sm:text-lg lg:text-xl text-[var(--custom-yellow)] font-bold">Your Deck</h2>
                            <div className="text-xs sm:text-sm text-gray-400">Select a slot to change card</div>
                        </div>

                        <div className="flex-1 flex justify-center items-center gap-2 sm:gap-3 lg:gap-4 h-full overflow-x-auto">
                            {equippedCards.map((cardKey, index) => {
                                const card = CARD_DATA[cardKey];
                                return (
                                    <div
                                        key={`slot-${index}`}
                                        onClick={() => setSelectedSlot(index)}
                                        onMouseEnter={() => cardKey && setHoveredCard(cardKey)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className={`
                                h-full min-w-[60px] sm:min-w-[80px] md:min-w-[100px] lg:min-w-[120px] aspect-[2/3] rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden shrink-0
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
                                        <div className="absolute top-1 left-1 bg-black/70 px-1 sm:px-1.5 rounded text-[10px] sm:text-xs text-white">
                                            {index + 1}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </section>
        </AuthGuard>
    );
}

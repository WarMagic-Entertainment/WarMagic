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
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const [userXp, setUserXp] = useState(0);

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
                        setEquippedCards(data.equippedCards || Array(6).fill(""));
                        setUserXp(data.xp || 0);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
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
        const info = cardInfos[cardKey];
        const xpNeeded = info?.xp_needed || 0;
        const isUnlocked = unlockedCards.includes(cardKey) || userXp >= xpNeeded;

        if (!isUnlocked) {
            return;
        }
        if (equippedCards.includes(cardKey) && equippedCards[selectedSlot] !== cardKey) {
            setToastMessage("This card is already equipped!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
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
            setToastMessage("Changes have been saved!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Error saving equipment:", error);
            setToastMessage("Failed to save.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
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
                                <span className={`font-bold ${(unlockedCards.includes(hoveredCard) || userXp >= (cardInfos[hoveredCard]?.xp_needed || 0)) ? 'text-green-400' : 'text-red-400'}`}>
                                    {cardInfos[hoveredCard].xp_needed} XP
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                <div
                    className={`fixed bottom-8 right-8 z-[100] bg-[#202020]/90 border border-[var(--custom-yellow)] rounded-lg p-4 text-white shadow-[0_0_20px_rgba(255,208,128,0.4)] backdrop-blur-md transition-all duration-500 ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'
                        }`}
                    style={{ minWidth: '250px' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="text-[var(--custom-yellow)] text-2xl">✓</div>
                        <div className="text-sm font-medium">{toastMessage}</div>
                    </div>
                </div>
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
                    <div className="h-[360px] shrink-0 bg-[#202020]/90 backdrop-blur-md rounded-lg p-4 flex flex-col">
                        <div className="flex flex-col items-center mb-2 shrink-0 gap-1">
                            <h2 className="text-xl text-[var(--custom-yellow)] font-bold text-center">Your Deck</h2>
                            <div className="text-sm text-gray-400 text-center">Select a slot to change card</div>
                        </div>

                        <div className="flex-1 flex justify-center items-center h-full">
                            <div className="flex items-center" style={{ gap: '50px' }}>
                                {equippedCards.map((cardKey, index) => {
                                    const card = CARD_DATA[cardKey];
                                    return (
                                        <div
                                            key={`slot-${index}`}
                                            onClick={() => setSelectedSlot(index)}
                                            onMouseEnter={() => cardKey && setHoveredCard(cardKey)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className="h-[200px] w-auto aspect-[2/3] shrink-0 flex items-center justify-center "
                                        >
                                            {card ? (
                                                <div className={`
                                                relative rounded transition-all
                                                ${selectedSlot === index ? 'border-2 border-[var(--custom-yellow)] shadow-[0_0_20px_rgba(255,208,128,0.4)] -translate-y-2' : 'hover:-translate-y-1'}
                                            `} style={{ height: '100%', display: 'inline-block' }}>
                                                    <Image
                                                        src={`/assets/cards/${card.file}`}
                                                        alt={card.name}
                                                        width={200}
                                                        height={300}
                                                        className="h-full w-auto object-contain rounded"
                                                        style={{ display: 'block' }}
                                                    />
                                                    <div className="absolute top-1 left-1 bg-black/70 px-1 sm:px-1.5 rounded text-[10px] sm:text-xs text-white z-10">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`
                                                h-full w-auto aspect-[2/3] rounded transition-all relative flex items-center justify-center text-gray-500 bg-gray-900/50 border-2 border-gray-600
                                                ${selectedSlot === index ? 'border-[var(--custom-yellow)] shadow-[0_0_20px_rgba(255,208,128,0.4)] -translate-y-2' : 'hover:-translate-y-1'}
                                            `}>
                                                    Slot {index + 1}
                                                    <div className="absolute top-1 left-1 bg-black/70 px-1 sm:px-1.5 rounded text-[10px] sm:text-xs text-white">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-[#202020]/90 backdrop-blur-md rounded-lg p-4 overflow-hidden flex flex-col relative">
                        <h2 className="text-xl text-[var(--custom-yellow)] font-bold mb-2 shrink-0 text-center ">Collection</h2>

                        <div className="overflow-y-auto flex flex-wrap justify-center content-start h-full " style={{ gap: '50px' }}>
                            {ALL_CARD_KEYS.map((cardKey) => {
                                const card = CARD_DATA[cardKey];
                                const info = cardInfos[cardKey];
                                const xpNeeded = info?.xp_needed || 0;
                                const isUnlocked = unlockedCards.includes(cardKey) || userXp >= xpNeeded;
                                const isEquipped = equippedCards.includes(cardKey);

                                return (
                                    <div key={cardKey} className="w-[140px] aspect-[2/3] shrink-0 flex items-center justify-center mt-[40px] mb-[11px]">
                                        {card ? (
                                            <div
                                                onClick={() => isUnlocked && handleCardSelect(cardKey)}
                                                onMouseEnter={() => setHoveredCard(cardKey)}
                                                onMouseLeave={() => setHoveredCard(null)}
                                                className={`
                                    relative rounded border transition-all duration-200
                                    ${isUnlocked ? 'rounded-4xl cursor-pointer hover:border-[var(--custom-yellow)] hover:scale-110 hover:z-50 hover:shadow-xl' : 'cursor-not-allowed opacity-50 grayscale'}
                                    ${isEquipped ? 'rounded-4xl border-[var(--custom-yellow)]' : 'border-gray-600'}
                                `} style={{ height: '100%', display: 'inline-block' }}>
                                                <Image
                                                    src={`/assets/cards/${card.file}`}
                                                    alt={card.name}
                                                    width={200}
                                                    height={300}
                                                    className="h-full w-auto object-contain rounded"
                                                    style={{ display: 'block' }}
                                                />
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
                                    ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div >
            </section >
        </AuthGuard >
    );
}

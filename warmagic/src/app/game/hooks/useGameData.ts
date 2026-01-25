import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Enemy } from "../types";

export const useGameData = () => {
    const [loading, setLoading] = useState(true);
    const [equippedCards, setEquippedCards] = useState<string[]>([]);
    const [cardInfos, setCardInfos] = useState<Record<string, any>>({});
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [playerName, setPlayerName] = useState<string>("Player");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setEquippedCards(userData.equippedCards || []);
                    setPlayerName(userData.username || "Player");
                }

                const cardSnap = await getDocs(collection(db, "cards"));
                const infos: Record<string, any> = {};
                cardSnap.forEach(d => {
                    const data = d.data();
                    infos[data.name] = data;
                });
                setCardInfos(infos);

            } catch (e) {
                console.error("Error fetching user/card data", e);
            }

            try {
                const enemySnap = await getDocs(collection(db, "enemies"));
                const loadedEnemies: Enemy[] = [];
                enemySnap.forEach(d => {
                    const data = d.data();
                    loadedEnemies.push({
                        id: d.id,
                        name: data.name,
                        hp: data.hp,
                        dmg: data.dmg,
                        xp: data.xp
                    } as Enemy);
                });
                setEnemies(loadedEnemies);
            } catch (e) {
                console.error("Error fetching enemies", e);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { loading, equippedCards, cardInfos, enemies, playerName };
};

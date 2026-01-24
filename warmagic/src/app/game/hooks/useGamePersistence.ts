import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const useGamePersistence = (layer: number) => {
    const saveProgress = async (xpGain: number) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                const currentXp = data.xp || 0;
                const newXp = currentXp + xpGain;
                const newLevel = Math.floor(newXp / 300) + 1;
                const currentLayer = data.layer || 0;
                const newMaxLayer = Math.max(currentLayer, layer);

                await updateDoc(userRef, {
                    xp: newXp,
                    level: newLevel,
                    layer: newMaxLayer
                });
            }
        } catch (e) {
            console.error("Error saving progress:", e);
        }
    };

    return { saveProgress };
};

"use client";

import Image from "next/image";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export async function top50Users() {
  const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getAllUsersSorted() {
  const q = query(collection(db, "users"), orderBy("xp", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function rankingWithCurrentUser(uid: string) {
  const top50 = await top50Users();
  const all = await getAllUsersSorted();

  const index = all.findIndex((u) => u.id === uid);

  const currentUser = index !== -1 ? all[index] : null;

  console.log(
    "ALL USERS:",
    all.map((u) => u.id)
  );
  console.log("AUTH UID:", uid);

  return {
    top50,
    currentUser,
    currentUserPosition: index + 1,
  };
}

export default function LobyPage() {
  const router = useRouter();
  type RankingData = {
    top50: any[];
    currentUser: any | null;
    currentUserPosition: number;
  };
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const ranking = await rankingWithCurrentUser(user.uid);

      setData(ranking);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/landingpage");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthGuard>
      {!data ? (
        <div className="h-screen w-screen flex items-center justify-center text-white bg-black">
          Loading...
        </div>
      ) : (
        <LobbyContent data={data} handleLogout={handleLogout} />
      )}
    </AuthGuard>
  );
}

function LobbyContent({
  data,
  handleLogout,
}: {
  data: any;
  handleLogout: () => void;
}) {
  const { top50, currentUser, currentUserPosition } = data;
  return (
    <section
      className="relative min-h-screen w-screen"
      style={{ fontFamily: "IsoCore" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75"
        style={{
          backgroundImage:
            "url('/assets/background/main-pages-background/castle.png')",
        }}
      ></div>
      <div className="absolute top-4 sm:top-[35px] left-0 w-full flex flex-col sm:flex-row justify-between px-4 sm:px-8 lg:px-[100px] text-white text-lg sm:text-xl lg:text-[27px] font-bold z-10 gap-2 sm:gap-0">
        <Link href="../landingpage">WarMagic</Link>
        <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg">
          <div className="truncate max-w-[150px] sm:max-w-none">
            {currentUser ? currentUser.username : <div>No user found</div>}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-2 sm:px-3 py-1 rounded transition-colors whitespace-nowrap"
          >
            Logout
          </button>
          <a href="../settings">
            <Image
              src="./assets/icons/menu-icons/settings-svgrepo-com.svg"
              alt="Battlegrounds mode image"
              width={40}
              height={40}
              className="sm:w-[50px] sm:h-[50px] animate-spin [animation-duration:2s] [filter:brightness(0)_saturate(100%)_invert(87%)_sepia(26%)_saturate(1003%)_hue-rotate(324deg)_brightness(103%)_contrast(101%)]"
            />
          </a>
        </div>
      </div>
      <div className="py-16 sm:py-20 lg:py-[85px] px-4 sm:px-8 lg:px-[90px] flex flex-col lg:flex-row justify-between gap-6 lg:gap-0">
        <div className="flex flex-col gap-4 sm:gap-5 w-full lg:w-auto">
          <div className="w-full lg:w-[600px] min-h-[180px] sm:h-[220px] bg-[#202020] backdrop-blur-md rounded-lg p-6 sm:p-8 flex flex-col justify-center gap-4">
            {currentUser ? (
              <>
                <div className="flex justify-between items-end">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    Level{" "}
                    <span className="text-[var(--custom-yellow)]">
                      {currentUser.level}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base text-gray-400 font-mono">
                    {currentUser.xp % 300} / 300 XP
                  </div>
                </div>

                <div className="w-full h-4 sm:h-5 bg-black/50 rounded-full overflow-hidden border border-gray-700 relative">
                  <div
                    className="h-full bg-[var(--custom-yellow)] shadow-[0_0_10px_var(--custom-yellow)] transition-all duration-500 ease-out"
                    style={{
                      width: `${((currentUser.xp % 300) / 300) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="text-right text-xs text-gray-500">
                  Total XP: {currentUser.xp}
                </div>
              </>
            ) : (
              <div className="text-gray-500">User data not available</div>
            )}
          </div>
          <div className="w-full lg:w-[600px] h-[500px] bg-[#202020] backdrop-blur-md rounded-lg p-4 sm:p-6 flex flex-col relative overflow-hidden">
            <div className="text-base sm:text-lg lg:text-xl font-bold mb-4 flex justify-between px-2">
              <span>Ranking</span>
              <span className="text-gray-400 text-sm">Top 50</span>
            </div>

            <div className="flex text-xs text-gray-400 px-2 mb-2 font-bold uppercase tracking-wider">
              <div className="w-12 text-center">#</div>
              <div className="flex-1">Player</div>
              <div className="w-16 text-center">Lvl</div>
              <div className="w-20 text-center">XP</div>
              <div className="w-16 text-center">Layer</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar pb-16">
              {top50.map((u: any, i: number) => (
                <div
                  key={u.id}
                  className={`flex items-center px-2 py-2 rounded text-sm sm:text-base ${
                    u.id === currentUser?.id
                      ? "bg-[var(--custom-yellow)] text-black font-bold"
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  <div className="w-12 text-center font-mono opacity-70">
                    {i + 1}
                  </div>
                  <div className="flex-1 truncate">{u.username}</div>
                  <div className="w-16 text-center">{u.level}</div>
                  <div className="w-20 text-center font-mono text-xs sm:text-sm">
                    {u.xp}
                  </div>
                  <div className="w-16 text-center">{u.layer || "-"}</div>
                </div>
              ))}
            </div>

            {currentUser && (
              <div className="absolute bottom-0 left-0 w-full bg-[#303030] border-t border-[var(--custom-yellow)] p-2 shadow-xl">
                <div className="flex items-center px-4 py-2 text-sm sm:text-base text-[var(--custom-yellow)] font-bold">
                  <div className="md:w-12 w-8 text-center">
                    {currentUserPosition}
                  </div>
                  <div className="flex-1 truncate">{currentUser.username}</div>
                  <div className="w-16 text-center">{currentUser.level}</div>
                  <div className="w-20 text-center font-mono text-xs sm:text-sm">
                    {currentUser.xp}
                  </div>
                  <div className="w-16 text-center">
                    {currentUser.layer || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 items-stretch lg:items-end w-full lg:w-auto">
          <div className="flex flex-row px-2 py-2 w-full lg:w-[700px] h-[60px] sm:h-[70px] bg-[#202020] backdrop-blur-md rounded-lg gap-2">
            <div className="flex items-center justify-start px-3 sm:px-5 flex-1 lg:w-[650px] h-[46px] sm:h-[50px] bg-[#EA2603] backdrop-blur-md rounded-lg gap-2">
              <Image
                style={{ filter: "invert(1)" }}
                src="./assets/icons/menu-icons/mode-battlegrounds-svgrepo-com.svg"
                alt="Battlegrounds mode image"
                width={40}
                height={40}
                className="sm:w-[50px] sm:h-[50px]"
              />
              <div className="font-bold text-lg sm:text-xl lg:text-2xl">
                LayerExplore
              </div>
            </div>
            <div className="flex items-center justify-start p-2 w-[46px] sm:w-[50px] h-[46px] sm:h-[50px] bg-[#FFD080] backdrop-blur-md rounded-lg shrink-0">
              <Image
                src="./assets/icons/menu-icons/tower-fall-svgrepo-com.svg"
                alt="tower fall image"
                width={40}
                height={40}
                className="sm:w-[50px] sm:h-[50px]"
                style={{ filter: "invert(1)" }}
              />
            </div>
          </div>
          <div className="w-full lg:w-[700px] min-h-[600px] sm:h-[580px] bg-[#202020] backdrop-blur-md rounded-lg px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
            <div
              className="bg-cover bg-center bg-no-repeat brightness-75 w-full h-[200px] sm:h-[250px] lg:h-[300px] lg:w-[620px] mx-auto"
              style={{
                backgroundImage:
                  "url('/assets/background/battle-background/library.jpg')",
              }}
            ></div>
            <Link
              href="../game"
              className="text-[var(--custom-yellow)] hover:underline"
            >
              <button className="animate-pulse w-full h-12 sm:h-16 lg:h-[70px] mt-6 sm:mt-10 px-4 sm:px-10 py-2 sm:py-4 text-lg sm:text-2xl lg:text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60">
                Play
              </button>
            </Link>
            <Link
              href="../equipment"
              className="text-[var(--custom-yellow)] hover:underline"
            >
              <button className="w-full h-12 sm:h-16 lg:h-[70px] mt-4 sm:mt-10 px-4 sm:px-10 py-2 sm:py-4 text-lg sm:text-2xl lg:text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60">
                Equipment
              </button>
            </Link>
          </div>
        </div>
      </div>
      </section>
  );
}

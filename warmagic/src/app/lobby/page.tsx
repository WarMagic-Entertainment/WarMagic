"use client";

import Image from "next/image";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export async function top3Users() {
  const q = query(
    collection(db, "users"),
    orderBy("xp", "desc"),
    limit(3)
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getAllUsersSorted() {
  const q = query(
    collection(db, "users"),
    orderBy("xp", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function rankingWithCurrentUser(uid: string) {
  const top3 = await top3Users();
  const all = await getAllUsersSorted();

  const index = all.findIndex(u => u.id === uid);

  const currentUser = index !== -1 ? all[index] : null;

  console.log("ALL USERS:", all.map(u => u.id));
  console.log("AUTH UID:", uid);



  return {
    top3,
    currentUser,
    currentUserPosition: index + 1
  }
}

export default function LobyPage() {
  const router = useRouter();
  type RankingData = {
    top3: any[];
    currentUser: any | null;
    currentUserPosition: number;
  }
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
        <div className="h-screen w-screen flex items-center justify-center text-white bg-black">Loading...</div>
      ) : (
        <LobbyContent data={data} handleLogout={handleLogout} />
      )}
    </AuthGuard>
  );
}

function LobbyContent({ data, handleLogout }: { data: any, handleLogout: () => void }) {
  const { top3, currentUser, currentUserPosition } = data;
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
      >
      </div>
      <div className="absolute top-[35px] left-0 w-full flex justify-between px-[100px] text-white text-[27px] font-bold z-10">
        <Link href="../landingpage">WarMagic</Link>
        <div className="flex items-center gap-4">
          <div>{currentUser ? (currentUser.username) : (<div>No user found</div>)}</div>
          <button
            onClick={handleLogout}
            className="text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="py-[85px] px-[90px] flex justify-between">
        <div className="flex flex-col gap-5">
          <div className="w-[600px] h-[220px] bg-[#202020] backdrop-blur-md rounded-lg">
            {currentUser ? (
              <>
                <div>Level: {currentUser.level}</div>
                <div>Xp: {currentUser.xp}</div>
              </>
            ) : (
              <div>User data not available</div>
            )}
          </div>
          <div className="w-[600px] h-[310px] bg-[#202020] backdrop-blur-md rounded-lg">
            <div>Ranking</div>
            <ol>
              {top3.map((u: any, i: number) => (
                <li key={u.id}>
                  {i + 1}. {u.username} - {u.xp} xp
                </li>
              ))}
            </ol>

            Your Result
            {currentUserPosition <= 3 ? (
              <p>You are in top 3</p>
            ) : (
              <p>Your place: {currentUserPosition} <br /> {currentUser.username} - {currentUser.xp}xp</p>

            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 items-end">
          <div className="flex flex-row px-2 py-2 w-[700px] h-[70px] bg-[#202020] backdrop-blur-md rounded-lg gap-2">
            <div className="flex items-center justify-start px-5 w-[650px] h-[50px] bg-[#EA2603] backdrop-blur-md rounded-lg gap-2">
              <Image
                style={{ filter: "invert(1)" }}
                src="./assets/icons/menu-icons/mode-battlegrounds-svgrepo-com.svg"
                alt="Battlegrounds mode image"
                width={50}
                height={50}
              />
              <div className="font-bold text-2xl">Cybergrind</div>
            </div>
            <div className="flex items-center justify-start p-2 w-[50px] h-[50px] bg-[#FFD080] backdrop-blur-md rounded-lg">
              <Image
                src="./assets/icons/menu-icons/tower-fall-svgrepo-com.svg"
                alt="tower fall image"
                width={50}
                height={50}
                style={{ filter: "invert(1)" }}
              />
            </div>
          </div>
          <div className="w-[700px] h-[580px] bg-[#202020] backdrop-blur-md rounded-lg px-10 py-10">
            <div
              className=" bg-cover bg-center bg-no-repeat brightness-75 w-[620px] h-[300px]"
              style={{
                backgroundImage:
                  "url('/assets/background/battle-background/library.jpg')",
              }}
            ></div>
            <Link
              href="../game"
              className="text-[var(--custom-yellow)] hover:underline"
            >
              <button className="w-full h-[70px] mt-10 px-10 py-4 text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60">
                Play
              </button>
            </Link>
            <Link
              href="../equipment"
              className="text-[var(--custom-yellow)] hover:underline"
            >
              <button className="w-full h-[70px] mt-10 px-10 py-4 text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60">
                Equipment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

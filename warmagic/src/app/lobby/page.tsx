"use client";

import Image from "next/image";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export async function top3Users(){
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

export async function getAllUsersSorted(){
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

export async function rankingWithCurrentUser(uid: string){
  const top3 = await top3Users();
  const all = await getAllUsersSorted();

  const index = all.findIndex(u => u.id === uid);

  const currentUser = index !== -1 ? all[index] : null;

  console.log("ALL USERS:", all.map(u => u.id));
console.log("AUTH UID:", uid);



  return {
    top3,
    currentUser,
    currentUserPosition: index +1 
  }
}

export default function LobyPage() {
  type RankingData = {
    top3: any[];
    currentUser: any | null;
    currentUserPosition: number;
  }
  const [data, setData] = useState<RankingData | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      
      const ranking = await rankingWithCurrentUser(user.uid);
  
      setData(ranking);
    });
  
    return () => unsub();
  }, []);
  

  if (!data) return <p>Loading ...</p>;

const { top3, currentUser, currentUserPosition } = data;

console.log("CURRENT USER:", currentUser);
console.log("AUTH USER:", currentUser);


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
        <a href="../page">WarMagic</a>
        <div>{currentUser ? (data.currentUser.username) : (<div>No user found</div>)}</div>
      </div>
      <div className="py-[85px] px-[90px] flex justify-between">
        <div className="flex flex-col gap-5">
          <div className="w-[600px] h-[220px] bg-[#202020] backdrop-blur-md rounded-lg">
            <div>Level: {data.currentUser.level}</div>
            <div>Xp: {data.currentUser.xp}</div>
          </div>
          <div className="w-[600px] h-[310px] bg-[#202020] backdrop-blur-md rounded-lg">
            <div>Ranking</div>
            <ol>
              {top3.map((u, i) => (
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
          <div className="w-[700px] h-[465px] bg-[#202020] backdrop-blur-md rounded-lg px-10 py-10">
            <div
              className=" bg-cover bg-center bg-no-repeat brightness-75 w-[620px] h-[300px]"
              style={{
                backgroundImage:
                  "url('/assets/background/battle-background/library.jpg')",
              }}
            ></div>
            <button className="w-full h-[70px] mt-10 px-10 py-4 text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60">
              Play
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

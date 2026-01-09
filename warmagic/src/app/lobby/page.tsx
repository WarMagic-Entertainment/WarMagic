"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function LobyPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleClick = () => {
    localStorage.setItem("potionCounter", "3");
    localStorage.setItem("playerHp", "6");
    localStorage.setItem("showWelcome", "true");
    localStorage.setItem("randomizeBg", "true");
    window.location.href = "/game";
  }
  return (
    <AuthGuard>
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
        <div className="absolute top-[35px] left-0 w-full flex justify-between px-[100px] text-white text-[27px] font-bold z-10">
          <a href="../page">Warmagic</a>
          <button
            onClick={handleLogout}
            className="hover:text-[var(--custom-yellow)] transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>


        <div className="py-[85px] px-[90px] flex justify-between">
          <div className="flex flex-col gap-5">
            <a href="/equipment" className="w-[600px] h-[220px] bg-[#202020] backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-[#303030] transition-all group cursor-pointer text-decoration-none">
              <span className="text-white text-4xl font-bold group-hover:text-[var(--custom-yellow)]">Equipment</span>
            </a>
            <div className="w-[600px] h-[310px] bg-[#202020] backdrop-blur-md rounded-lg"></div>
          </div>

          <div className="flex flex-col gap-5 items-end">
            <div className="px-2 py-2 w-[700px] h-[70px] bg-[#202020] backdrop-blur-md rounded-lg">
              <div className="flex items-center justify-start px-5 w-[500px] h-[50px] bg-[#EA2603] backdrop-blur-md rounded-lg">
                Cybergrind
              </div>
            </div>
            <div className="w-[700px] h-[410px] bg-[#202020] backdrop-blur-md rounded-lg">
              <button onClick={handleClick}><a href="../game">Play</a></button>
            </div>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}

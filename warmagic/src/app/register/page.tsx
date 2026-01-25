"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        username,
        email,
        unlockedCards: ["fool", "magician", "empress", "moon", "hierophant", "emperor"],
        equippedCards: ["fool", "magician", "empress", "moon", "hierophant", "emperor"],
        unlockedSkins: ["player1"],
        activeSkin: null,
        createdAt: new Date(),
        xp: 0,
        layer: 0,
        level: 1
      });

      setEmail("");
      setUsername("");
      setPassword("");

      console.log("User created:", uid);
      router.push('./lobby');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <section
      className="relative h-screen w-screen"
      style={{ fontFamily: "IsoCore" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75"
        style={{
          backgroundImage: "url('/assets/background/main-pages-background/castle.png')"
        }}
      ></div>
  
      <a href="../landingpage" className="absolute top-4 sm:top-[65px] left-4 sm:left-[100px] text-white text-lg sm:text-2xl lg:text-[27px] font-bold z-10">
        WarMagic
      </a>
  
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[600px] min-h-[600px] sm:h-[750px] bg-[#202020] backdrop-blur-md rounded-lg px-4 sm:px-10 py-6 sm:py-12 text-white">
          <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[115px] font-bold text-center mb-6 sm:mb-10 text-[var(--custom-yellow)]">
            Sign up
          </h1>
  
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
  
            <div>
              <label className="block mb-2 text-sm">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
  
            <div>
              <label className="block mb-2 text-sm">Username</label>
              <input
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>
  
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-12 sm:h-16 lg:h-[83px] mt-6 sm:mt-10 px-4 sm:px-10 py-2 sm:py-4 text-lg sm:text-2xl lg:text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              href="../login"
              className="text-[var(--custom-yellow)] hover:underline"
            >
              Sign in
            </Link>     
        </p>

          {error && (
            <p className="mt-6 text-center text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LogingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter()
  
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const firebaseErrors: Record<string, string> = {
    "auth/invalid-credential": "Wrong email or password",
    "auth/user-not-found": "User do not exists",
    "auth/wrong-password": "Wrong password",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (remember) {
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
    } else {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Zalogowano!");
      router.push("./lobby")
    } catch (err: any) {
      const code = err.code;
      setError(firebaseErrors[code] || "The error is unknown");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Write here email to reset your password");
      return;
    }

    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      setError(null);
      setSuccess("Link has been send to your email");
    } catch (err: any) {
      const code = err.code;
      setError(firebaseErrors[code] || "The error is unknown");
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
          backgroundImage:
            "url('/assets/background/main-pages-background/castle.png')",
        }}
      ></div>

      <a
        href="../landingpage"
        className="absolute top-[65px] left-[100px] text-white text-[27px] font-bold z-10"
      >
        Warmagic
      </a>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[650px] bg-[#202020] backdrop-blur-md rounded-lg px-10 py-12 text-white">
          <h1
            className="text-[115px] font-bold text-center mb-10 "
            style={{ color: "var(--custom-yellow)" }}
          >
            Sign in
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />{" "}
            </div>
            <div>
              <div className="flex justify-between">
                <label className="block mb-2 text-sm">Password</label>
                <button
                  type="button"
                  className="underline"
                  onClick={handleResetPassword}
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                className="hidden peer"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <div className="w-5 h-5 rounded border-2 border-gray-400 peer-checked:bg-[var(--custom-yellow)] peer-checked:animate-pulse transition"></div>
              Remember password
            </label>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-[83px] mt-10 px-10 py-4 text-[30px] text-[#FFFFFF] transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60"
            >
              {loading ? "Loging in ..." : "Log in"}
            </button>
          </div>
          {error && (
            <p className="mt-6 text-center text-sm text-red-400">{error}</p>
          )}
          {success && (
            <p className="mt-6 text-center text-sm text-green-400">{success}</p>
          )}
        </div>
      </div>
    </section>
  );
}

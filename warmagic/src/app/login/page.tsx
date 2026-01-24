"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resetCooldown, setResetCooldown] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  useEffect(() => {
    if (resetCooldown === 0) return;

    const interval = setInterval(() => {
      setResetCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resetCooldown]);

  const firebaseErrors: Record<string, string> = {
    "auth/invalid-credential": "Wrong email or password",
    "auth/user-not-found": "User does not exist",
    "auth/wrong-password": "Wrong password",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
      router.push("./lobby");
    } catch (err: any) {
      const code = err.code;
      setError(firebaseErrors[code] || "The error is unknown");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Provide your email address to reset your password");
      return;
    }

    if (resetCooldown > 0) return;

    try {
      const authInstance = getAuth();
      await sendPasswordResetEmail(authInstance, email);
      setError(null);
      setSuccess("A link has been sent to your email");
      setResetCooldown(30);
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
      />

      <a
        href="../landingpage"
        className="absolute top-4 sm:top-[65px] left-4 sm:left-[100px] text-white text-lg sm:text-2xl lg:text-[27px] font-bold z-10"
      >
        WarMagic
      </a>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[600px] min-h-[500px] sm:min-h-[650px] bg-[#202020] backdrop-blur-md rounded-lg px-4 sm:px-10 py-6 sm:py-12 text-white flex flex-col">
          <h1
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[115px] font-bold text-center mb-6 sm:mb-10"
            style={{ color: "var(--custom-yellow)" }}
          >
            Sign in
          </h1>

          <form onSubmit={handleLogin} className="space-y-6 flex-1">
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="block mb-2 text-sm">Password</label>
                <button
                  type="button"
                  className="underline disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResetPassword}
                  disabled={resetCooldown > 0}
                >
                  {resetCooldown > 0
                    ? `Try again in ${resetCooldown}s`
                    : "Forgot password?"}
                </button>
              </div>

              <input
                type="password"
                className="w-full px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="hidden peer"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <div className="w-5 h-5 rounded border-2 border-gray-400 peer-checked:bg-[var(--custom-yellow)] peer-checked:animate-pulse transition" />
              Remember password
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-16 lg:h-[83px] mt-6 px-4 sm:px-10 py-2 sm:py-4 text-lg sm:text-2xl lg:text-[30px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {error && (
            <p className="mt-6 text-center text-sm text-red-400">{error}</p>
          )}

          {success && (
            <p className="mt-6 text-center text-sm text-green-400">
              {success}
            </p>
          )}

          <p className="mt-8 text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link
              href="../register"
              className="text-[var(--custom-yellow)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

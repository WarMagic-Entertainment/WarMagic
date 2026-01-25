"use client";

import { useState, useEffect } from "react";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";

async function updateUsername(uid: string, value: string) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    username: value,
  });

  return true;
}

export default function LogingPage() {
  const [activateForm, setActivateForm] = useState("username");
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
        href="../lobby"
        className="absolute top-4 sm:top-[65px] left-4 sm:left-[100px] text-white text-lg sm:text-2xl lg:text-[17px] font-bold z-10"
      >
        Back to Lobby
      </a>

      <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 sm:gap-5 p-4">
        <div className="w-full max-w-[850px] min-h-[100px] sm:h-[150px] bg-[#202020] backdrop-blur-md rounded-lg py-4 sm:py-5 text-white">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold text-center"
            style={{ color: "var(--custom-yellow)" }}
          >
            Settings
          </h1>
        </div>
        <div className="w-full max-w-[850px] min-h-[440px] sm:h-[350px] bg-[#202020] backdrop-blur-md rounded-lg py-4 sm:py-5 text-white">
          <h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[60px] font-bold text-center gap-5"
            style={{ color: "var(--custom-yellow)" }}
          >
            Profile
          </h1>
          <div className="flex flex-col sm:flex-row ">
            <h2 className="my-1 mx-3 p-2 text-left text-xl sm:text-3xl md:text-4xl lg:text-[35px] italic text-center gap-5">
              What do you want to change:
            </h2>
            <select
              className="my-1 mx-3 h-[50px] w-[130px] border-4 border-[var(--custom-yellow)] bg-[#202020] text-[var(--custom-yellow)] px-2 rounded-md appearance-none"
              value={activateForm}
              onChange={(e) => setActivateForm(e.target.value)}
            >
              <option
                style={{ color: "var(--custom-yellow)" }}
                value="username"
              >
                Username
              </option>
              <option style={{ color: "var(--custom-yellow)" }} value="email">
                Email
              </option>
              <option
                style={{ color: "var(--custom-yellow)" }}
                value="password"
              >
                Password
              </option>
            </select>
          </div>
          <div>
            {activateForm === "username" && <Username />}
            {activateForm === "email" && <Email />}
            {activateForm === "password" && <Password />}
          </div>
        </div>
      </div>
    </section>
  );
}

function Username() {
  const [name, setName] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  const [success, setSuccess] = useState("");

  const handleSubmitName = async () => {
    if (!user) return alert("You have to be logged");

    await updateUsername(user.uid, name);
    setSuccess("Name has been updated.");
  };
  return (
    <div className="text-xl sm:text-3xl lg:text-[50px] font-bold text-left gap-3 sm:gap-5 px-3 sm:px-5 py-6 sm:py-12">
      <div className="py-2">
        <h1 className="text-lg sm:text-2xl lg:text-3xl mx-2 ">Name</h1>
        <div className="flex flex-row gap-2 sm:gap-5 items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="w-1/2 h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base"
          />
          <div className="w-10 h-10 sm:w-[50px] sm:h-[50px] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce cursor-pointer shrink-0">
            <Image
              src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
              alt="Edit icon"
              width={40}
              height={40}
              className="sm:w-[30px] sm:h-[30px]"
              style={{ filter: "invert(1)" }}
              onClick={handleSubmitName}
            />
          </div>
          {success && (
            <p className="absolute mt-12 sm:mt-16 text-center text-xs sm:text-sm text-green-400">
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Email() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangeEmail = async (e: any) => {
    e.preventDefault();

    if (!user || !user.email) {
      setMessage("You should be logged");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      await verifyBeforeUpdateEmail(user, newEmail);

      setMessage("Link has been send to your new email");
    } catch (error: any) {
      setMessage(error.message);
    }
  };
  return (
    <div className="text-xl sm:text-3xl lg:text-[50px] font-bold text-left gap-3 sm:gap-5 px-3 sm:px-5 py-6 sm:py-12">
      <div className="sm:gap-4 space-y-4">
        <div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-2">New Email</h1>
          <div className="flex flex-row gap-2 sm:gap-5">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              type="email"
              className="w-1/2 h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base"
            />
          </div>
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl mx-2">Password</h1>
          <div className="flex flex-row gap-2 sm:gap-5 items-center">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-1/2 h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base"
            />

            <div className="w-10 h-10 sm:w-[50px] sm:h-[50px] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce cursor-pointer shrink-0">
              <Image
                src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
                alt="Edit icon"
                width={40}
                height={40}
                className="sm:w-[30px] sm:h-[30px]"
                style={{ filter: "invert(1)" }}
                onClick={handleChangeEmail}
              />
            </div>
            {message && (
              <p className="text-xs sm:text-sm text-red-400 mt-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Password() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e: any) => {
    e.preventDefault();

    if (!user || !user.email) {
      setMessage("You should be logged");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setMessage("Password has been changed");
    } catch (error: any) {
      setMessage(error.message);
    }
  };
  return (
    <div className="text-xl sm:text-3xl lg:text-[50px] font-bold text-left gap-3 sm:gap-5 px-3 sm:px-5 py-6 sm:py-12">
      <div className="py-2 space-y-4">
        <div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-2">Old password</h1>
          <div className="flex flex-row gap-2 sm:gap-5">
            <input
              type="password"
              className="w-1/2 h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-2">New password</h1>
          <div className="flex flex-row gap-2 sm:gap-5 items-center">
            <input
              type="password"
              className="w-1/2 h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="w-10 h-10 sm:w-[50px] sm:h-[50px] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce cursor-pointer shrink-0">
              <Image
                src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
                alt="Edit icon"
                width={40}
                height={40}
                className="sm:w-[30px] sm:h-[30px]"
                style={{ filter: "invert(1)" }}
                onClick={handleChangePassword}
              />
            </div>
            {message && (
              <p className="text-xs sm:text-sm text-red-400 mt-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
        href="../landingpage"
        className="absolute top-[65px] left-[100px] text-white text-[27px] font-bold z-10"
      >
        WarMagic
      </a>

      <div className="absolute inset-0 flex items-center justify-center flex-col gap-5">
        <div className="w-[850px] h-[150px] bg-[#202020] backdrop-blur-md rounded-lg py-5 text-white">
          <h1
            className="text-[90px] font-bold text-center "
            style={{ color: "var(--custom-yellow)" }}
          >
            Settings
          </h1>
        </div>
        <div className="w-[850px] h-[350px] bg-[#202020] backdrop-blur-md rounded-lg py-5 text-white">
          <h1
            className="text-[80px] font-bold text-center gap-5"
            style={{ color: "var(--custom-yellow)" }}
          >
            Profile
          </h1>
          <div>
            <h2>What do you want to change:</h2>

            <select
              value={activateForm}
              onChange={(e) => setActivateForm(e.target.value)}
            >
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
            </select>

            <div>
              {activateForm === "username" && <Username />}
              {activateForm === "email" && <Email />}
              {activateForm === "password" && <Password />}
            </div>
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
    <div className="text-[50px] font-bold text-left gap-5 px-5 py-12">
      <div className="py-2">
        <h1>Name</h1>
        <div className="flex flex-row gap-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
          />
          <div className="w-[70] h-[70] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce">
            <Image
              src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
              alt="Edit icon"
              width={60}
              height={60}
              style={{ filter: "invert(1)" }}
              onClick={handleSubmitName}
            />
          </div>
          {success && (
            <p className="mt-6 text-center text-sm text-green-400">{success}</p>
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

      await verifyBeforeUpdateEmail(user, newEmail)

      setMessage("Link has been send to your new email");
    } catch (error: any) {
      setMessage(error.message);
    }
  };
  return (
    <div className="text-[50px] font-bold text-left gap-5 px-5 py-12">
      <div className="gap-1">
        <h1>New Email</h1>
        <div className="flex flex-row gap-5">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
            className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
          />
        </div>
        <div className="gap-1">
          <h1>Password</h1>
          <div className="flex flex-row gap-5">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
            />

            <div className="w-[70] h-[70] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce">
              <Image
                src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
                alt="Edit icon"
                width={60}
                height={60}
                style={{ filter: "invert(1)" }}
                onClick={handleChangeEmail}
              />
            </div>
            {message && <p>{message}</p>}
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
    <div className="text-[50px] font-bold text-left gap-5 px-5 py-12">
      <div className="py-2">
        <h1>Old password</h1>
        <div className="flex flex-row gap-5">
          <input
            type="password"
            className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <h1>New password</h1>
        <div className="flex flex-row gap-5">
          <input
            type="password"
            className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="w-[70] h-[70] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce">
            <Image
              src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
              alt="Edit icon"
              width={60}
              height={60}
              style={{ filter: "invert(1)" }}
              onClick={handleChangePassword}
            />
          </div>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="text-[50px] font-bold text-left gap-5 px-5 py-12">
<div className="gap-1">
  <h1>Email</h1>
  <div className="flex flex-row gap-5">
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      type="email"
      className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
    />
    <div className="w-[70] h-[70] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce">
      <Image
        src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
        alt="Edit icon"
        width={60}
        height={60}
        style={{ filter: "invert(1)" }}
        onClick={handleSubmitEmail}
      />
    </div>
    {success && (
      <p className="mt-6 text-center text-sm text-green-400">
        {success}
      </p>
    )}
  </div>
</div>
<div className="py-2">
  <h1>Name</h1>
  <div className="flex flex-row gap-5">
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      type="text"
      className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
    />
    <div className="w-[70] h-[70] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce">
      <Image
        src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
        alt="Edit icon"
        width={60}
        height={60}
        style={{ filter: "invert(1)" }}
        onClick={handleSubmitName}
      />
    </div>
    {success && (
      <p className="mt-6 text-center text-sm text-green-400">
        {success}
      </p>
    )}
  </div>
</div>
<div className="py-2">
  <h1>Password</h1>
  <div className="flex flex-row gap-5">
    <input
      type="password"
      className="w-[70%] h-[10%] px-4 py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)]"
    />
    <div className="w-[70] h-[70] px-2 py-2 bg-[#272727] rounded outline-none border-3 border-[var(--custom-yellow)] animate-bounce">
      <Image
        src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
        alt="Edit icon"
        width={60}
        height={60}
        style={{ filter: "invert(1)" }}
        // onClick={}
      />
    </div>
  </div>
</div>
</div> */
}

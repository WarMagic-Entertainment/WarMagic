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
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <section
      className="relative h-screen w-screen overflow-hidden"
      style={{ fontFamily: "IsoCore" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75"
        style={{
          backgroundImage:
            "url('/assets/background/main-pages-background/castle.png')",
        }}
      ></div>

      <div className="absolute inset-0 flex flex-col px-4">
        <a
          href="../lobby"
          className="text-white text-lg sm:text-2xl lg:text-[17px] font-bold z-10 py-4 sm:py-6 pl-0 sm:pl-20"
        >
          Back to Lobby
        </a>

        <div className="flex-1 flex flex-col items-center pt-2 sm:pt-6 pb-6 sm:pb-10">
        <div className="w-[90%] min-h-[200px] sm:h-[150px] bg-[#202020] backdrop-blur-md rounded-lg py-4 sm:py-5 text-white flex items-center justify-center mb-4 sm:mb-6">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold text-center"
            style={{ color: "var(--custom-yellow)" }}
          >
            Settings
          </h1>
        </div>

        <div className="w-[90%] flex-1 flex flex-row gap-4 sm:gap-6 max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
          <div className="flex-1 bg-[#202020] backdrop-blur-md rounded-lg py-4 sm:py-6 px-4 sm:px-6 text-white flex flex-col overflow-y-auto">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[60px] font-bold text-left mb-6"
              style={{ color: "var(--custom-yellow)" }}
            >
              Profile
            </h1>
            <div className="flex items-center justify-center flex-1">
              {activateForm === "username" && <Username />}
              {activateForm === "email" && <Email />}
              {activateForm === "password" && <Password />}
            </div>
          </div>
          <div className="w-[300px] sm:w-[350px] bg-[#202020] backdrop-blur-md rounded-lg py-4 sm:py-6 px-4 sm:px-6 text-white flex flex-col">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] italic mb-4 text-white">
              What do you want to change:
            </h2>
            
            <div className="relative">
              <div 
                className="border-2 border-white rounded-lg overflow-hidden cursor-pointer"
                style={{ backgroundColor: "var(--custom-yellow)" }}
              >
                <div
                  className="py-3 px-4 text-lg font-semibold text-[#202020] hover:bg-opacity-90 transition-colors"
                  onClick={() => {
                    setActivateForm("username");
                    setIsOpen(false);
                  }}
                >
                  Username
                </div>
                <div className="h-[2px] bg-white"></div>
                <div
                  className="py-3 px-4 text-lg font-semibold text-[#202020] hover:bg-opacity-90 transition-colors"
                  onClick={() => {
                    setActivateForm("email");
                    setIsOpen(false);
                  }}
                >
                  Email
                </div>
                <div className="h-[2px] bg-white"></div>
                <div
                  className="py-3 px-4 text-lg font-semibold text-[#202020] hover:bg-opacity-90 transition-colors"
                  onClick={() => {
                    setActivateForm("password");
                    setIsOpen(false);
                  }}
                >
                  Password
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-white">
                Currently editing: <span className="font-bold" style={{ color: "var(--custom-yellow)" }}>
                  {activateForm === "username" ? "Username" : activateForm === "email" ? "Email" : "Password"}
                </span>
              </div>
            </div>
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
    <div className="w-full max-w-[600px]">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-lg sm:text-2xl lg:text-3xl text-white">Name</h1>
        <div className="flex flex-row gap-2 sm:gap-5 items-center justify-center w-full">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="w-full max-w-[400px] h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base text-white"
            placeholder="Enter new username"
          />
          <div 
            className="w-10 h-10 sm:w-[50px] sm:h-[50px] p-2 bg-[#272727] rounded outline-none border-2 border-[var(--custom-yellow)] hover:animate-bounce cursor-pointer shrink-0 flex items-center justify-center"
            onClick={handleSubmitName}
          >
            <Image
              src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
              alt="Edit icon"
              width={30}
              height={30}
              style={{ filter: "invert(1)" }}
            />
          </div>
        </div>
        {success && (
          <p className="text-center text-xs sm:text-sm text-green-400 mt-2">
            {success}
          </p>
        )}
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
    <div className="w-full max-w-[600px]">
      <div className="flex flex-col items-center gap-4 space-y-4">
        <div className="w-full">
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-3 text-center text-white">New Email</h1>
          <div className="flex justify-center">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              type="email"
              className="w-full max-w-[400px] h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base text-white"
              placeholder="Enter new email"
            />
          </div>
        </div>
        <div className="w-full">
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-3 text-center text-white">Password</h1>
          <div className="flex flex-row gap-2 sm:gap-5 items-center justify-center">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full max-w-[400px] h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base text-white"
              placeholder="Enter current password"
            />
            <div 
              className="w-10 h-10 sm:w-[50px] sm:h-[50px] p-2 bg-[#272727] rounded outline-none border-2 border-[var(--custom-yellow)] hover:animate-bounce cursor-pointer shrink-0 flex items-center justify-center"
              onClick={handleChangeEmail}
            >
              <Image
                src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
                alt="Edit icon"
                width={30}
                height={30}
                style={{ filter: "invert(1)" }}
              />
            </div>
          </div>
        </div>
        {message && (
          <p className={`text-xs sm:text-sm mt-2 text-center ${message.includes("send") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
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
    <div className="w-full max-w-[600px]">
      <div className="flex flex-col items-center gap-4 space-y-4">
        <div className="w-full">
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-3 text-center text-white">Old password</h1>
          <div className="flex justify-center">
            <input
              type="password"
              className="w-full max-w-[400px] h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base text-white"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter old password"
            />
          </div>
        </div>
        <div className="w-full">
          <h1 className="text-lg sm:text-2xl lg:text-3xl mb-3 text-center text-white">New password</h1>
          <div className="flex flex-row gap-2 sm:gap-5 items-center justify-center">
            <input
              type="password"
              className="w-full max-w-[400px] h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 bg-[#272727] rounded outline-none focus:ring-2 focus:ring-[var(--custom-yellow)] text-sm sm:text-base text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <div 
              className="w-10 h-10 sm:w-[50px] sm:h-[50px] p-2 bg-[#272727] rounded outline-none border-2 border-[var(--custom-yellow)] hover:animate-bounce cursor-pointer shrink-0 flex items-center justify-center"
              onClick={handleChangePassword}
            >
              <Image
                src=".././assets/icons/settings-icons/edit-3-svgrepo-com.svg"
                alt="Edit icon"
                width={30}
                height={30}
                style={{ filter: "invert(1)" }}
              />
            </div>
          </div>
        </div>
        {message && (
          <p className={`text-xs sm:text-sm mt-2 text-center ${message.includes("changed") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
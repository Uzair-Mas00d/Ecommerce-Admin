"use client";
import { auth } from "@/app/firebaseConfig";
import Nav from "@/components/Nav";
import { UserAuth } from "@/context/AuthContext";
import { useState } from "react";
import Logo from "@/components/logo";

const adminEmails = ["uzairmasood050@gmail.com"];

export default function BasicLayout({ children }) {
  const { user, googleSignIn, logOut } = UserAuth();
  const [showNav, setShowNav] = useState(false);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  if (user?.email && !adminEmails.includes(user.email)) {
    logOut(auth);
  }

  if (!user) {
    return (
      <div className="bg-bgGray w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button
            onClick={handleSignIn}
            className="bg-white p-2 px-4 rounded-lg font-semibold"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgGray min-h-screen ">
      <div className="md:hidden flex items-center p-4">
        <button onClick={() => setShowNav(true)} type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>
      <div className="bg-bgGray min-h-screen font-semibold flex">
        <Nav showNav={showNav} />
        <div className="flex-grow p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

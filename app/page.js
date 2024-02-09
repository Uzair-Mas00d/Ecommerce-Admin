"use client";

import BasicLayout from "@/components/BasicLayout";
import { UserAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = UserAuth();
  return (
    <BasicLayout>
      <div className="text-blue-900 flex justify-between">
        <h2>Hello, <b>{user?.displayName}</b></h2>
        <div className="flex bg-gray-300 text-black gap-1 rounded-lg overflow-hidden">
          <img src={user?.photoURL} alt="user" className="w-6 h-6" />
          <span className="px-2">

          {user?.displayName}
          </span>
        </div>
      </div>
    </BasicLayout>
  );
}

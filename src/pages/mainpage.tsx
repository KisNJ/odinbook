import React from "react";
import { signOut, useSession } from "next-auth/react";
import { MdLogout } from "react-icons/md";
const mainpage = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <main>Loading...</main>;
  }
  return (
    <>
      <div>{JSON.stringify(session)}</div>
      <header className="bg-sky-700 text-gray-100 flex justify-between items-center px-20 py-5">
        <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
        <div className="flex gap-10">
          <button className="text-xl">Create Post</button>
          <div className="group relative">
            <button className="text-xl">Profile</button>
            <div className="absolute scale-0 group-focus-within:scale-100 bg-gray-100 text-sky-700 p-5 rounded-lg shadow-md right-[-45px] grid truncate transition-transform mt-3">
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 hover:text-sky-900 transition-colors"
              >
                Log out <MdLogout />
              </button>
              <button className="hover:text-sky-900 transition-colors">
                Check Profile
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default mainpage;

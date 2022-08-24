import { signOut, useSession } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

import Image from "next/image";
import { User } from "@prisma/client";
import Link from "next/link";

function handleSignOut() {
  signOut({ callbackUrl: "/" });
}
function createPostRouteHandler() {
  Router.push("/createpost");
}
function createGoToMainPageHandler() {
  Router.push("/");
}
const UserCard = ({ user }: { user: User }) => {
  function navigate() {
    Router.push(`/user/${user.id}`);
  }
  return (
    <button onClick={navigate}>
      <div className="flex items-center  gap-4 bg-sky-300 text-slate-900 px-5 py-1 shadow-xl rounded-md mx-2 hover:bg-sky-500 ">
        <Image
          src={user.image as string}
          width={45}
          height={45}
          className="rounded-full"
        />
        <div className="font-bold text-2xl">{user.name}</div>
      </div>
    </button>
  );
};
const Header = ({ back_to_main }: { back_to_main?: boolean }) => {
  const { data: session, status } = useSession();
  const [searchUserData, setSearchUserData] = useState("");
  const ctx = trpc.useContext();
  const { data, refetch } = trpc.useQuery(
    [
      "search.searchUsers",
      {
        nameFragemant: searchUserData,
      },
    ],
    { enabled: false },
  );
  useEffect(() => {
    if (searchUserData !== "") {
      refetch();
    }
  }, [searchUserData]);
  return (
    <header className="bg-sky-700 text-gray-100 flex justify-between items-center px-20 py-5 w-full">
      <Link href="/mainpage">
        <button>
          <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
        </button>
      </Link>
      <div className="flex gap-5 items-center relative md:basis-[40rem] lg:basis-[60rem] xl:basis-[70rem]">
        <BiSearch size={22} />
        <input
          type="text"
          placeholder="search username"
          value={searchUserData}
          onChange={(e) => setSearchUserData((old) => e.target.value)}
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 text-slate-900 justify-self-stretch w-full"
        />
        <div className="absolute top-[150%] flex flex-col gap-2 bg-sky-100 py-2 shadow-xl rounded-md">
          {data?.possibleUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
        {/* <div>{JSON.stringify(data?.possibleUsers)}</div> */}
      </div>
      <div className="flex gap-10">
        {back_to_main ? (
          <button className="text-xl" onClick={createGoToMainPageHandler}>
            Go back to main page
          </button>
        ) : (
          <button className="text-xl" onClick={createPostRouteHandler}>
            Create Post
          </button>
        )}
        <div className="group relative">
          <button className="text-xl">Profile</button>
          <div className="absolute scale-0 group-focus-within:scale-100 bg-gray-100 text-sky-700 p-5 rounded-lg shadow-md right-[-45px] flex flex-col gap-2 truncate transition-transform mt-3">
            <button
              onClick={() => handleSignOut()}
              className="flex items-center gap-2 hover:text-rose-800 transition-colors"
            >
              Log out <MdLogout />
            </button>
            <Link href={`/myprofile/${session?.user!.id}`}>
              <button className="hover:text-sky-900 transition-colors">
                Check Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

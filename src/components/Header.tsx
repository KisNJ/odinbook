import { signOut, useSession } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

import Image from "next/image";
import { User } from "@prisma/client";
import Link from "next/link";
import Spinner from "./Spinner";
import Head from "next/head";

function handleSignOut() {
  signOut({ callbackUrl: "/" });
}
function createPostRouteHandler() {
  Router.push("/createpost");
}
function createGoToMainPageHandler() {
  Router.push("/");
}
const UserCard = ({
  user,
}: {
  user: {
    name: string | null;
    id: string;
    image: string | null;
  };
}) => {
  function navigate() {
    Router.push(`/user/${user.id}`);
  }
  return (
    <>
      <Head>
        <title>OdinBook</title>
      </Head>
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
    </>
  );
};
const Header = ({ back_to_main }: { back_to_main?: boolean }) => {
  const { data: session, status } = useSession();
  const [searchUserData, setSearchUserData] = useState("");
  const ctx = trpc.useContext();
  const { data, refetch, isLoading } = trpc.useQuery(
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
    <header className="bg-sky-700 text-gray-100 flex justify-between items-center md:px-20 md:py-5 w-full py-2 px-2">
      <Link href="/mainpage">
        <button>
          <h1 className="md:text-4xl text-xl font-extrabold transition-all hover:text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-orange-600">
            {session?.user?.name}
          </h1>
        </button>
      </Link>
      <div className="flex gap-5 items-center relative lg:basis-[40rem] xl:basis-[70rem]">
        <div className="dropdown min-w-full">
          <label tabIndex={0}>
            <div className="flex gap-3 items-center">
              <div className="hidden md:block">
                <BiSearch size={22} />
              </div>
              <input
                type="text"
                placeholder="search username"
                value={searchUserData}
                onChange={(e) => setSearchUserData((old) => e.target.value)}
                className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 text-slate-900 justify-self-stretch w-full"
              />
            </div>
          </label>
          <div className="absolute top-[150%] flex flex-col gap-2 bg-sky-100 py-2 shadow-xl rounded-md z-50 dropdown-content menu p-2">
            {data?.possibleUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
          {isLoading && <Spinner />}
        </div>
      </div>
      <div className="flex md:gap-10 items-center">
        {back_to_main ? (
          <button
            className="text-xl focus:underline hover:underline underline-offset-3"
            onClick={createGoToMainPageHandler}
          >
            Go back to main page
          </button>
        ) : (
          <button
            className="text-xl focus:underline hover:underline underline-offset-3 ml-2 mr-2 md:ml-0 md:mr-0"
            onClick={createPostRouteHandler}
          >
            Create Post
          </button>
        )}
        <div className="group relative">
          <button className="text-xl focus:underline hover:underline underline-offset-3">
            Profile
          </button>
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

import { signOut, useSession } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import Router from "next/router";
import React from "react";
function handleSignOut() {
  signOut({ callbackUrl: "/" });
}
function createPostRouteHandler() {
  Router.push("/createpost");
}
function createGoToMainPageHandler() {
  Router.push("/");
}
const Header = ({ back_to_main }: { back_to_main?: boolean }) => {
  const { data: session, status } = useSession();
  return (
    <header className="bg-sky-700 text-gray-100 flex justify-between items-center px-20 py-5">
      <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
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
            <button className="hover:text-sky-900 transition-colors">
              Check Profile
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import Header from "../components/Header";

const createpost = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <main>Loading...</main>;
  }
  return (
    <div>
      <Header back_to_main />
      <div className="max-w-5xl flex flex-col gap-2 bg-sky-100 px-5 py-10 shadow-xl rounded-md mt-10 mx-20 xl:mx-auto">
        <div className="flex items-center gap-2">
          <Image
            src={session?.user?.image as string}
            width={50}
            height={50}
            className="rounded-full shadow-sm"
          />
          <div>
            <div>{session?.user?.name}</div>
            <input
              type="text"
              name="location"
              placeholder="Texas, USA"
              className="border-neutral-800 border-2 rounded-md shadow-md p-2"
            />
          </div>
        </div>
        <label htmlFor="title" className="font-bold text-3xl">
          Title
        </label>
        <input
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
          type="text"
          id="title"
        />
        <label htmlFor="content" className="font-bold text-3xl">
          Content
        </label>
        <textarea
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
          id="content"
        />
        <button>Post</button>
      </div>
    </div>
  );
};

export default createpost;

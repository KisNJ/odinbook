import { useSession } from "next-auth/react";
import Image from "next/image";
import Router from "next/router";
import React, { useState } from "react";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import { trpc } from "../utils/trpc";

const Createpost = () => {
  const { data: session, status } = useSession();
  const createPost = trpc.useMutation("post.createPost");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    content: "",
  });
  if (status === "loading" || loading) {
    return <Spinner />;
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    createPost.mutate(formData, {
      onSuccess: () => {
        setLoading(false);
        Router.push("/");
      },
    });
  }
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormData((old) => ({ ...old, [e.target.id]: e.target.value }));
  }
  return (
    <div>
      <Header back_to_main />
      <div className="max-w-5xl flex flex-col gap-2 bg-sky-100 md:px-5 py-10 px-2 shadow-xl rounded-md mt-10 mx-2 md:mx-20 xl:mx-auto">
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
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="border-neutral-800 border-2 rounded-md shadow-md p-2"
            />
          </div>
        </div>
        <label htmlFor="title" className="font-bold text-3xl">
          Title*
        </label>
        <input
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
        />
        <label htmlFor="content" className="font-bold text-3xl">
          Content*
        </label>
        <textarea
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
          id="content"
          required
          value={formData.content}
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Post</button>
      </div>
    </div>
  );
};

export default Createpost;

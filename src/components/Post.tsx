import { Comment, Post, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
const Post = ({
  post,
}: {
  post: Post & {
    author: User;
    comments: Comment[];
    likes: User[];
  };
}) => {
  const { data: session, status } = useSession();
  function handleAddLike() {}
  function handleRemoveLike() {}
  if (status === "loading") return <div>Loading ...</div>;
  return (
    <div className="max-w-5xl flex flex-col gap-2 bg-sky-100 px-5 py-10 shadow-xl rounded-md mt-10 mx-20 xl:mx-auto">
      <div className="flex items-center gap-2">
        <Image
          src={post.author.image as string}
          width={50}
          height={50}
          className="rounded-full shadow-sm"
        />
        <div>
          <div>{post.author.name}</div>
          {post.location && (
            <div className="border-neutral-800 border-2 rounded-md shadow-md p-2">
              {post.location}
            </div>
          )}
        </div>
      </div>
      <label htmlFor="title" className="font-bold text-3xl">
        Title
      </label>
      <div className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch">
        {post.title}
      </div>
      <label htmlFor="content" className="font-bold text-3xl">
        Content
      </label>
      <div className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch">
        {post.content}
      </div>
      <div className="flex gap-2 items-center">
        {post.likes.some((user) => user.id === session?.user?.id) ? (
          <AiFillLike color="blue" size={25} onClick={handleRemoveLike} />
        ) : (
          <AiOutlineLike color="blue" size={25} onClick={handleAddLike} />
        )}
        ({post.likes.length})
      </div>
    </div>
  );
};

export default Post;

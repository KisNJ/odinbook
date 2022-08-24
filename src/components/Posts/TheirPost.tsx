import { Comment, Post, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { BsThreeDots, BsTrash } from "react-icons/bs";
import { TbArrowForwardUp } from "react-icons/tb";
import React, { useState } from "react";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { trpc } from "../../utils/trpc";
import CommentSection from "../CommentSections/CommentSection";
import CommentSectionThem from "../CommentSections/CommentSectionThem";
const TheirPost = ({
  post,
  userId,
}: {
  post: Post & {
    author: User;
    comments: (Comment & {
      author: User;
    })[];
    likes: User[];
  };
  userId: string;
}) => {
  const { data: session, status } = useSession();
  const ctx = trpc.useContext();
  const [formData, setFormData] = useState({
    title: post.title,
    location: post.location,
    content: post.content,
  });
  const [showComments, setShowComments] = useState(false);
  const updatePost = trpc.useMutation("post.updatePost", {
    onMutate: () => {
      ctx.cancelQuery(["main.posts", { type: "THEIRS", userId }]);
      let optimisticUpdate = ctx.getQueryData([
        "main.posts",
        { type: "THEIRS", userId },
      ]);

      let index = optimisticUpdate?.posts?.findIndex(
        (posta) => posta.id === post.id,
      );
      optimisticUpdate!.userData!.posts![index as number] = {
        ...(optimisticUpdate!.userData!.posts![
          index as number
        ] as unknown as Post & {
          comments: (Comment & {
            author: User;
          })[];
          author: User & {
            friendRequests: User[];
          };
          likes: User[];
        }),
        ...formData,
      };
      if (optimisticUpdate) {
        ctx.setQueryData(
          ["main.posts", { type: "THEIRS", userId }],
          optimisticUpdate,
        );
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "THEIRS", userId }]);
    },
  });

  function handleUpdatePost() {
    updatePost.mutate({ ...formData, postId: post.id });
    setShowUpdate(false);
  }
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormData((old) => ({ ...old, [e.target.id]: e.target.value }));
  }
  const [liked, setLiked] = useState(
    post.likes.some((user) => user.id === session?.user?.id),
  );
  const [showUpdate, setShowUpdate] = useState<boolean>(false);
  const addLike = trpc.useMutation("post.addLike", {
    onMutate: () => {
      setLiked(true);
      ctx.cancelQuery(["main.posts", { type: "THEIRS", userId }]);

      let optimisticUpdate = ctx.getQueryData([
        "main.posts",
        { type: "THEIRS", userId },
      ]);

      let index = optimisticUpdate?.userData?.posts?.findIndex(
        (posta) => posta.id === post.id,
      );
      console.log("---");
      console.log(optimisticUpdate);
      optimisticUpdate!.userData!.posts![index as number]!.likes = [
        ...(optimisticUpdate?.userData?.posts![index as number]
          ?.likes as User[]),
        {
          id: session?.user?.id as string,
          name: session?.user?.name as string,
          email: session?.user?.email as string,
          emailVerified: new Date(2022, 10, 11),
          image: session?.user?.image as string,
        },
      ];
      if (optimisticUpdate) {
        ctx.setQueryData(
          ["main.posts", { type: "THEIRS", userId }],
          optimisticUpdate,
        );
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "THEIRS", userId }]);
    },
  });
  const removeLike = trpc.useMutation("post.removeLike", {
    onMutate: () => {
      setLiked(false);
      ctx.cancelQuery(["main.posts", { type: "THEIRS", userId }]);
      let optimisticUpdate = ctx.getQueryData([
        "main.posts",
        { type: "THEIRS", userId },
      ]);
      let index = optimisticUpdate?.userData?.posts?.findIndex(
        (posta) => posta.id === post.id,
      );
      optimisticUpdate!.userData!.posts![index as number]!.likes =
        optimisticUpdate!.userData!.posts![index as number]!.likes.filter(
          (liked) => {
            return liked.id !== session?.user?.id;
          },
        );

      if (optimisticUpdate) {
        ctx.setQueryData(
          ["main.posts", { type: "THEIRS", userId }],
          optimisticUpdate,
        );
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "THEIRS", userId }]);
    },
    // },
  });
  const deletePost = trpc.useMutation("post.deletePost", {
    onMutate: () => {
      ctx.cancelQuery(["main.posts", { type: "THEIRS", userId }]);
      let optimisticUpdate = ctx.getQueryData([
        "main.posts",
        { type: "THEIRS", userId },
      ]);

      optimisticUpdate!.userData!.posts =
        optimisticUpdate!.userData!.posts?.filter((posta) => {
          return post.id !== posta.id;
        });

      if (optimisticUpdate) {
        ctx.setQueryData(
          ["main.posts", { type: "THEIRS", userId }],
          optimisticUpdate,
        );
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "THEIRS", userId }]);
    },
    // },
  });
  function handleAddLike() {
    addLike.mutate({ postId: post.id });
  }
  function handleRemoveLike() {
    removeLike.mutate({ postId: post.id });
  }
  function handleDeletePost() {
    deletePost.mutate({ postId: post.id });
  }
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
          {post.location && !showUpdate && (
            <div className="border-neutral-800 border-2 rounded-md shadow-md p-2">
              {post.location}
            </div>
          )}
          {post.location && showUpdate && (
            <input
              value={formData.location}
              className="border-neutral-800 border-2 rounded-md shadow-md p-2"
              id="location"
              onChange={handleChange}
            />
          )}
        </div>
        {post.author.id === session?.user?.id && (
          <div className="ml-auto mr-5 group relative">
            <button>
              <BsThreeDots />
            </button>
            <div className="scale-0 group-focus-within:scale-100 absolute bg-gray-100 text-sky-700 right-[-43px] flex flex-col gap-2 truncate mt-1 p-5 rounded-lg shadow-md transition-transform">
              <button>
                <div
                  className="flex items-center gap-2 hover:text-rose-800
             transition-colors"
                  onClick={handleDeletePost}
                >
                  Delete <BsTrash />
                </div>
              </button>
              <button>
                <div
                  className="
              flex
              items-center
              gap-2
              hover:text-sky-900
              transition-colors"
                  onClick={() => setShowUpdate((o) => !o)}
                >
                  {showUpdate ? (
                    <>
                      Revert back changes <TbArrowForwardUp />
                    </>
                  ) : (
                    <>
                      Update <TbArrowForwardUp />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      <label htmlFor="title" className="font-bold text-3xl">
        Title
      </label>
      {showUpdate ? (
        <input
          type="text"
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
          value={formData.title}
          id="title"
          onChange={handleChange}
        />
      ) : (
        <div className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch">
          {post.title}
        </div>
      )}
      <label htmlFor="content" className="font-bold text-3xl">
        Content
      </label>
      {showUpdate ? (
        <textarea
          id="content"
          className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
          value={formData.content}
          onChange={handleChange}
        />
      ) : (
        <div className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch">
          {post.content}
        </div>
      )}
      <div className="flex gap-2 items-center">
        {liked ? (
          <button>
            <AiFillLike color="blue" size={25} onClick={handleRemoveLike} />
          </button>
        ) : (
          <button>
            <AiOutlineLike color="blue" size={25} onClick={handleAddLike} />
          </button>
        )}
        ({post.likes.length})
        {showUpdate && (
          <div className="ml-auto mr-5">
            <button onClick={handleUpdatePost}>Save Updates</button>
          </div>
        )}
      </div>
      <h2 className="mb-0 font-bold">
        <button onClick={() => setShowComments((o) => !o)}>
          Comments ({post.comments.length})
        </button>
      </h2>
      <CommentSectionThem
        userId={userId}
        comments={post.comments}
        postId={post.id}
        expandMaxHeight={showComments}
      />
    </div>
  );
};

export default TheirPost;

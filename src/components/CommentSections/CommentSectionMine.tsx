import { Comment, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { BsBoxArrowUpRight, BsThreeDots, BsTrash } from "react-icons/bs";
import { trpc } from "../../utils/trpc";
import cuid from "cuid";
import { TbArrowForwardUp, TbOld } from "react-icons/tb";
import Image from "next/image";
import Spinner from "../Spinner";
import Router from "next/router";
const CommentSectionMine = ({
  comments,
  postId,
  expandMaxHeight,
}: {
  comments: (Comment & {
    author: User;
  })[];
  postId: string;
  expandMaxHeight: boolean;
}) => {
  const { data: session, status } = useSession();
  const [newCommentData, setNewCommentData] = useState({
    content: "",
    idNew: cuid(),
    createdAt: new Date(),
  });
  const ctx = trpc.useContext();
  const addNewComment = trpc.useMutation("post.createComment", {
    onMutate: () => {
      ctx.cancelQuery(["main.posts", { type: "MINE" }]);
      let optimisticUpdate = ctx.getQueryData(["main.posts", { type: "MINE" }]);
      const postIndex = optimisticUpdate!.posts?.findIndex((posta) => {
        return postId === posta.id;
      });
      optimisticUpdate!.posts![postIndex as number]?.comments.push({
        author: {
          id: session?.user?.id as string,
          name: session?.user?.name as string,
          email: session?.user?.email as string,
          emailVerified: new Date(2022, 10, 11),
          image: session?.user?.image as string,
        },
        userId: session?.user?.id as string,
        content: newCommentData.content,
        id: newCommentData.idNew,
        createdAt: newCommentData.createdAt,
        updatedAt: newCommentData.createdAt,
        postId: postId,
      });
      if (optimisticUpdate) {
        ctx.setQueryData(["main.posts", { type: "MINE" }], optimisticUpdate);
      }
      setNewCommentData((old) => ({ ...old, content: "", idNew: cuid() }));
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "MINE" }]);
    },
  });
  function handleAddNewComment() {
    addNewComment.mutate({
      content: newCommentData.content,
      idNew: newCommentData.idNew,
      postId,
    });
  }
  if (status === "loading") return <Spinner />;
  return (
    <>
      <label htmlFor="content" className="font-bold text-xl">
        Your comment*
      </label>
      <textarea
        className="border-neutral-800 border-spacing-1 border-2 rounded-md shadow-md p-2 mx-15 self-stretch"
        id="content"
        placeholder="... type here your comment ..."
        value={newCommentData.content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setNewCommentData((old) => ({ ...old, content: e.target.value }))
        }
      />
      <div>
        <button
          className="flex gap-2 items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddNewComment}
        >
          Post Comment <BsBoxArrowUpRight />
        </button>
      </div>
      <div
        className={`${
          expandMaxHeight ? "max-h-90" : "max-h-40"
        } overflow-y-auto max-w-full overflow-x-hidden`}
      >
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </>
  );
};
const Comment = ({
  comment,
  postId,
}: {
  comment: Comment & {
    author: User;
  };
  postId: string;
}) => {
  const { data: session, status } = useSession();
  const ctx = trpc.useContext();
  const [formData, setFormData] = useState({
    content: comment.content,
  });
  const [showUpdate, setShowUpdate] = useState<boolean>(false);
  const delteComment = trpc.useMutation("post.deleteComment", {
    onMutate: () => {
      ctx.cancelQuery(["main.posts", { type: "MINE" }]);
      let optimisticUpdate = ctx.getQueryData(["main.posts", { type: "MINE" }]);
      let indexPost = optimisticUpdate?.posts?.findIndex(
        (posta) => posta.id === postId,
      );
      optimisticUpdate!.posts![indexPost as number]!.comments =
        optimisticUpdate!.posts![indexPost as number]!.comments.filter((c) => {
          return c.id !== comment.id;
        });
      if (optimisticUpdate) {
        ctx.setQueryData(["main.posts", { type: "MINE" }], optimisticUpdate);
      }
      setShowUpdate(false);
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "MINE" }]);
    },
  });
  function handleDeleteComment() {
    delteComment.mutate({ commentId: comment.id });
  }
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setFormData((o) => ({ ...o, content: e.target.value }));
  }
  const updateComment = trpc.useMutation("post.updateComment", {
    onMutate: () => {
      ctx.cancelQuery(["main.posts", { type: "MINE" }]);
      let optimisticUpdate = ctx.getQueryData(["main.posts", { type: "MINE" }]);
      let indexPost = optimisticUpdate?.posts?.findIndex(
        (posta) => posta.id === postId,
      );
      let indexComment = optimisticUpdate!.posts![
        indexPost as number
      ]?.comments.findIndex((c) => c.id === comment.id);
      optimisticUpdate!.posts![indexPost as number]!.comments[
        indexComment as number
      ] = {
        ...optimisticUpdate!.posts![indexPost as number]!.comments[
          indexComment as number
        ],
        content: formData.content,
      } as unknown as Comment & {
        author: User;
      };
      if (optimisticUpdate) {
        ctx.setQueryData(["main.posts", { type: "MINE" }], optimisticUpdate);
      }
      setShowUpdate(false);
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts", { type: "MINE" }]);
    },
  });
  function handleUpdateComment() {
    updateComment.mutate({ content: formData.content, commentId: comment.id });
  }
  function navigate() {
    Router.push(`/user/${comment.author.id}`);
  }
  if (status === "loading") return <Spinner />;
  return (
    <div className="max-w-5xl flex flex-col gap-2 bg-sky-300 text-slate-900 px-5 py-10 shadow-xl rounded-md mt-10 mx-20 xl:mx-auto">
      <div className="flex items-center gap-2">
        <button onClick={navigate}>
          <Image
            src={comment.author.image as string}
            width={50}
            height={50}
            className="rounded-full shadow-sm"
          />
          <div>
            <div>{comment.author.name}</div>
          </div>
        </button>
        {comment.author.id === session?.user?.id && (
          <div className="ml-auto mr-5 group relative">
            <button>
              <BsThreeDots />
            </button>
            <div className="scale-0 group-focus-within:scale-100 absolute bg-gray-100 text-sky-700 right-[-43px] flex flex-col gap-2 truncate mt-1 p-5 rounded-lg shadow-md transition-transform">
              <button>
                <div
                  className="flex items-center gap-2 hover:text-rose-800
             transition-colors"
                  onClick={handleDeleteComment}
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

      <label htmlFor="content" className="font-bold text-xl">
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
          {comment.content}
        </div>
      )}
      <div className="flex gap-2 items-center">
        {showUpdate && (
          <div className="ml-auto mr-5">
            <button onClick={handleUpdateComment}>Save Updates</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CommentSectionMine;

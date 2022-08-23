import { Comment } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { trpc } from "../utils/trpc";
import cuid from "cuid";
import { TbOld } from "react-icons/tb";

const CommentSection = ({
  comments,
  postId,
  expandMaxHeight,
}: {
  comments: Comment[];
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
      ctx.cancelQuery(["main.posts"]);
      let optimisticUpdate = ctx.getQueryData(["main.posts"]);
      const postIndex = optimisticUpdate!.posts.findIndex((posta) => {
        return postId === posta.id;
      });
      optimisticUpdate!.posts[postIndex]?.comments.push({
        author: {
          id: session?.user?.id as string,
          name: session?.user?.name as string,
          email: session?.user?.email as string,
          emailVerified: new Date(2022, 10, 11),
          image: session?.user?.image as string,
          userFriendId: "",
          userFriendRequestId: "",
        },
        userId: session?.user?.id as string,
        content: newCommentData.content,
        id: newCommentData.idNew,
        createdAt: newCommentData.createdAt,
        updatedAt: newCommentData.createdAt,
        postId: postId,
      });
      if (optimisticUpdate) {
        ctx.setQueryData(["main.posts"], optimisticUpdate);
      }
      setNewCommentData((old) => ({ ...old, content: "" }));
    },
    onSettled: () => {
      ctx.invalidateQueries(["main.posts"]);
    },
  });
  function handleAddNewComment() {
    addNewComment.mutate({
      content: newCommentData.content,
      idNew: newCommentData.idNew,
      postId,
    });
  }
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
          className="flex gap-2 items-center"
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
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  );
};
const Comment = ({ comment }: { comment: Comment }) => {
  return <div>{JSON.stringify(comment)}</div>;
};
export default CommentSection;

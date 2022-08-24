import React from "react";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Header from "../components/Header";
import Post from "../components/Posts/Post";
import Spinner from "../components/Spinner";

const mainpage = () => {
  const posts = trpc.useQuery(["main.posts"]);
  const { data: session, status } = useSession();
  if (status === "loading" || posts.isLoading) {
    return <Spinner />;
  }
  return (
    <>
      <Header />
      {posts.data?.posts?.map((post) => (
        <Post post={post} key={post.id} />
      ))}
    </>
  );
};

export default mainpage;

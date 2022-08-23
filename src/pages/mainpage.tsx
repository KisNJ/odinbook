import React from "react";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Header from "../components/Header";
import Post from "../components/Post";

const mainpage = () => {
  const posts = trpc.useQuery(["main.posts"]);
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <main>Loading...</main>;
  }
  // console.log(posts);
  return (
    <>
      <Header />
      <div>{JSON.stringify(session)}</div>
      {posts.data?.posts.map((post) => (
        <Post post={post} key={post.id} />
      ))}
    </>
  );
};

export default mainpage;

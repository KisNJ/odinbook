import React from "react";
import Router, { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Header from "../../components/Header";
import Image from "next/image";
import ProfileHeader from "../../components/ProfileHeader";
import MyPost from "../../components/Posts/MyPosts";
import { User } from "@prisma/client";
import Spinner from "../../components/Spinner";
const ProfilePage = () => {
  const router = useRouter();
  const ctx = trpc.useContext();
  const { data, isLoading } = trpc.useQuery(["search.myProfile"]);
  const posts = trpc.useQuery(["main.posts", { type: "MINE" }]);

  const UserCard = ({ user }: { user: User }) => {
    function navigate() {
      Router.push(`/user/${user.id}`);
    }
    const acceptRequest = trpc.useMutation("search.acceptRequest", {
      onMutate: () => {
        ctx.cancelQuery(["main.posts", { type: "MINE" }]);

        let optimisticUpdate = ctx.getQueryData([
          "main.posts",
          { type: "MINE" },
        ]);
        optimisticUpdate!.friendRequests![0]!.friendRequests =
          optimisticUpdate!.friendRequests![0]!.friendRequests.filter(
            (u) => u.id !== user.id,
          );

        if (optimisticUpdate) {
          ctx.setQueryData(["main.posts", { type: "MINE" }], optimisticUpdate);
        }
      },
      onSettled: () => {
        ctx.invalidateQueries(["main.posts", { type: "MINE" }]);
      },
    });
    const declineRequest = trpc.useMutation("search.declineRequest", {
      onMutate: () => {
        ctx.cancelQuery(["main.posts", { type: "MINE" }]);

        let optimisticUpdate = ctx.getQueryData([
          "main.posts",
          { type: "MINE" },
        ]);
        optimisticUpdate!.friendRequests![0]!.friendRequests =
          optimisticUpdate!.friendRequests![0]!.friendRequests.filter(
            (u) => u.id !== user.id,
          );

        if (optimisticUpdate) {
          ctx.setQueryData(["main.posts", { type: "MINE" }], optimisticUpdate);
        }
      },
      onSettled: () => {
        ctx.invalidateQueries(["main.posts", { type: "MINE" }]);
      },
    });
    function handleDecline() {
      declineRequest.mutate({ userId: user.id });
    }
    function handleAccept() {
      acceptRequest.mutate({ userId: user.id });
    }
    if (isLoading || posts.isLoading) return <Spinner />;
    return (
      <div className="max-w-5xl flex flex-col gap-2 bg-sky-100 md:px-5 py-10 px-2 shadow-xl rounded-md mt-10 mx-2 md:mx-20 xl:mx-auto">
        <button onClick={navigate}>
          <Image
            src={user.image as string}
            width={45}
            height={45}
            className="rounded-full"
          />
          <div className="font-bold text-2xl">{user.name}</div>
        </button>
        <div className="max-w-5xl flex font-bold flex-col gap-2 bg-sky-100 md:px-5 py-2 px-2 shadow-xl rounded-md mt-10 mx-2 md:mx-20 xl:mx-auto">
          <button
            onClick={handleDecline}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Decline Request
          </button>
          <button
            onClick={handleAccept}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Accept Request
          </button>
        </div>
      </div>
    );
  };
  if (posts.isLoading) return <Spinner />;
  return (
    <>
      <Header />
      <ProfileHeader
        imgURL={data?.profile?.image as string}
        name={data?.profile?.name as string}
      />
      <h2 className="max-w-5xl flex font-bold flex-col gap-2 bg-sky-100 md:px-5 py-2 px-2 shadow-xl rounded-md mt-10 mx-2 md:mx-20 xl:mx-auto">
        Friend Requests
      </h2>
      {posts.data?.friendRequests![0]!.friendRequests.map((user) => (
        <UserCard user={user} key={user.id} />
      ))}
      <h2 className="max-w-5xl flex font-bold flex-col gap-2 bg-sky-100 md:px-5 py-2 px-2 shadow-xl rounded-md mt-10 mx-2 md:mx-20 xl:mx-auto">
        My Posts
      </h2>
      {posts.data?.posts?.map((post) => (
        <MyPost post={post} key={post.id} />
      ))}
    </>
  );
};

export default ProfilePage;

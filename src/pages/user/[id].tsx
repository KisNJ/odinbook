import { useSession } from "next-auth/react";
import Image from "next/image";
import Router, { useRouter } from "next/router";
import React, { useEffect } from "react";
import { BsMenuButton } from "react-icons/bs";
import Header from "../../components/Header";
import ProfileHeader from "../../components/ProfileHeader";
import TheirPost from "../../components/Posts/TheirPost";
import { trpc } from "../../utils/trpc";

const UserPage = () => {
  const router = useRouter();
  const ctx = trpc.useContext();
  const { data: session } = useSession();
  const { id } = router.query;
  const posts = trpc.useQuery([
    "main.posts",
    { type: "THEIRS", userId: id as string },
  ]);
  useEffect(() => {
    if (id === session?.user?.id) {
      Router.push(`/myprofile/${id}`);
    }
  }, []);
  const { data, isLoading } = trpc.useQuery([
    "search.getUserData",
    { userId: id as string },
  ]);

  const sendFriendRequest = trpc.useMutation("search.sendRequest", {
    onMutate: () => {
      ctx.cancelQuery(["search.getUserData"]);
      let optimisticUpdate = ctx.getQueryData([
        "search.getUserData",
        { userId: id as string },
      ]);
      optimisticUpdate!.sentRequest = true;
      if (optimisticUpdate) {
        ctx.setQueryData(["search.getUserData"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["search.getUserData"]);
    },
  });
  const cancelFriendRequest = trpc.useMutation("search.cancelRequest", {
    onMutate: () => {
      ctx.cancelQuery(["search.getUserData"]);
      let optimisticUpdate = ctx.getQueryData([
        "search.getUserData",
        { userId: id as string },
      ]);
      optimisticUpdate!.sentRequest = false;
      if (optimisticUpdate) {
        ctx.setQueryData(["search.getUserData"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["search.getUserData"]);
    },
  });
  const removeFriend = trpc.useMutation("search.removeFriend", {
    onMutate: () => {
      ctx.cancelQuery(["search.getUserData"]);
      let optimisticUpdate = ctx.getQueryData([
        "search.getUserData",
        { userId: id as string },
      ]);
      optimisticUpdate!.isFriend = false;
      if (optimisticUpdate) {
        ctx.setQueryData(["search.getUserData"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["search.getUserData"]);
    },
  });
  function handleRemoveFriend() {
    removeFriend.mutate({ userId: id as string });
  }
  function handleSendFriendRequest() {
    sendFriendRequest.mutate({ userId: id as string });
  }
  function handleCancelFriendRequest() {
    cancelFriendRequest.mutate({ userId: id as string });
  }
  const acceptRequest = trpc.useMutation("search.acceptRequest", {
    onMutate: () => {
      ctx.cancelQuery(["search.getUserData", { userId: id as string }]);

      let optimisticUpdate = ctx.getQueryData([
        "search.getUserData",
        { userId: id as string },
      ]);
      optimisticUpdate!.isFriend = true;
      optimisticUpdate!.recievedRequestFromThem = false;
      optimisticUpdate!.sentRequest = false;

      if (optimisticUpdate) {
        ctx.setQueryData(
          ["search.getUserData", { userId: id as string }],
          optimisticUpdate,
        );
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["search.getUserData", { userId: id as string }]);
      ctx.invalidateQueries([
        "main.posts",
        { type: "THEIRS", userId: id as string },
      ]);
    },
  });
  const declineRequest = trpc.useMutation("search.declineRequest", {
    onMutate: () => {
      ctx.cancelQuery(["search.getUserData", { userId: id as string }]);

      let optimisticUpdate = ctx.getQueryData([
        "search.getUserData",
        { userId: id as string },
      ]);
      optimisticUpdate!.isFriend = false;
      optimisticUpdate!.recievedRequestFromThem = false;
      optimisticUpdate!.sentRequest = false;

      if (optimisticUpdate) {
        ctx.setQueryData(
          ["search.getUserData", { userId: id as string }],
          optimisticUpdate,
        );
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["search.getUserData", { userId: id as string }]);
    },
  });
  function handleDecline() {
    declineRequest.mutate({ userId: id as string });
  }
  function handleAccept() {
    acceptRequest.mutate({ userId: id as string });
  }
  if (isLoading) return <div>Loading...</div>;
  return (
    <>
      <Header />
      <ProfileHeader
        imgURL={data?.userData?.image as string}
        name={data?.userData?.name as string}
      />
      {data?.isFriend ? (
        <>
          <button onClick={handleRemoveFriend}>Remove Friend</button>
        </>
      ) : (
        <>
          {data?.recievedRequestFromThem ? (
            <>
              <button onClick={handleDecline}>Decline</button>
              <button onClick={handleAccept}>Accept</button>
            </>
          ) : data?.sentRequest ? (
            <button onClick={handleCancelFriendRequest}>Cancel Request</button>
          ) : (
            <button onClick={handleSendFriendRequest}>
              Send Friend Request
            </button>
          )}
        </>
      )}
      {data?.isFriend &&
        posts.data?.posts.map((post) => (
          <TheirPost post={post} key={post.id} userId={id as string} />
        ))}
    </>
  );
};

export default UserPage;

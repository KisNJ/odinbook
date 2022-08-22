import type { NextPage } from "next";
import { signIn, useSession, signOut } from "next-auth/react";
import Head from "next/head";

import Router from "next/router";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <main>Loading...</main>;
  }
  function moveToMainPage() {
    Router.push("/mainpage");
  }
  return (
    <>
      <Head>
        <title>OdinBook</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <h1>Welcome to OdinBook</h1>
        {!session ? (
          <>
            <div>{JSON.stringify(session)}</div>
            <h2>LogIn to continue</h2>
            <button onClick={() => signIn("google")}>Login with Google</button>
            {/* <button onClick={() => signOut()}>Log out</button> */}
          </>
        ) : (
          <>{moveToMainPage()}</>
        )}
      </main>
    </>
  );
};

export default Home;
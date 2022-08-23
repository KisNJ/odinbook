import { useRouter } from "next/router";
import React from "react";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <div>{id}</div>;
};

export default UserPage;

import Image from "next/image";
import React from "react";

const ProfileHeader = ({ imgURL, name }: { imgURL: string; name: string }) => {
  return (
    <div className="flex mt-3 items-center py-5 px-10 justify-between mx-10 bg-sky-300 text-slate-900 shadow-xl rounded-md">
      <Image
        src={imgURL}
        width={150}
        height={150}
        className="rounded-full shadow-sm"
      />
      <div className="text-3xl font-bold">{name}</div>
    </div>
  );
};

export default ProfileHeader;

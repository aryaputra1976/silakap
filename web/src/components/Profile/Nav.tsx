"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav: React.FC = () => {
  const pathname = usePathname();

  return (
    <>
      <ul className="mb-[25px] text-center">
        <li className="inline-block mx-[3px]">
          <Link
            href="/profile/user-profile/"
            className={`block py-[8.5px] px-[15px] font-medium rounded-md border hover:bg-primary-500 hover:text-white  ${
              pathname === "/profile/user-profile/"
                ? "bg-primary-500 text-white border-primary-500"
                : ""
            }`}
          >
            Profile
          </Link>
        </li>
      </ul>
    </>
  );
};

export default Nav;

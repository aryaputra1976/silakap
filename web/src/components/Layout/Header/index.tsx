"use client";

import React, { useEffect } from "react";
import DarkMode from "./DarkMode";
import Fullscreen from "./Fullscreen";
import Notifications from "./Notifications";
import ProfileMenu from "./ProfileMenu";

interface HeaderProps {
  toggleActive: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  useEffect(() => {
    const elementId = document.getElementById("header");
    const handleScroll = () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("shadow-sm");
      } else {
        elementId?.classList.remove("shadow-sm");
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="header"
      className="header-area bg-white dark:bg-[#0c1427] py-[13px] px-[20px] md:px-[25px] fixed top-0 z-[6] rounded-b-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hide-sidebar-toggle transition-all inline-block hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined !text-[20px]">menu</i>
          </button>
          <span className="hidden md:block text-sm font-medium text-gray-500 dark:text-gray-400">
            Sistem Informasi Layanan Administrasi Kepegawaian
          </span>
        </div>

        <div className="flex items-center gap-1">
          <DarkMode />
          <Fullscreen />
          <Notifications />
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;

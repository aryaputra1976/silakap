"use client";

import React, { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();

  const [active, setActive] = useState<boolean>(false);

  const toggleActive = () => {
    setActive(!active);
  };

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/authentication") ||
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/front-pages");

  return (
    <>
      <div
        className={`main-content-wrap transition-all ${active ? "active" : ""}`}
      >
        {!isAuthPage && (
          <>
            <SidebarMenu toggleActive={toggleActive} />

            <Header toggleActive={toggleActive} />
          </>
        )}

        <div className="main-content transition-all flex flex-col overflow-hidden min-h-screen">
          {children}

          {!isAuthPage && <Footer />}
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;

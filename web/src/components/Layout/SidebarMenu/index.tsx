"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { SILAKAP_MENUS } from "./silakap-menu";
import { normalizeRoleName } from "@/lib/dashboard-redirect";
import { useAuthStore } from "@/store/auth.store";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const normalizePath = (href: string) => {
  const [path] = href.split(/[?#]/);
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
};

// Used for parent items: true if current path IS or is UNDER the item path
const isActivePath = (pathname: string, href: string) => {
  const itemPath = normalizePath(href);
  const currentPath = normalizePath(pathname);
  if (itemPath === "#") return false;
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

// Used for child (leaf) items: exact match only — prevents sibling/parent highlight
const isActiveExact = (
  pathname: string,
  href: string,
  currentSearch: URLSearchParams,
) => {
  const itemPath = normalizePath(href);
  if (itemPath === "#") return false;
  if (normalizePath(pathname) !== itemPath) return false;

  const [, queryString] = href.split("?");
  if (!queryString) {
    return Array.from(currentSearch.keys()).length === 0;
  }

  const itemSearch = new URLSearchParams(queryString);
  return Array.from(itemSearch.entries()).every(
    ([key, value]) =>
      currentSearch.get(key)?.toLowerCase() === value.toLowerCase(),
  );
};

const SidebarMenuContent: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const roleName = user ? normalizeRoleName(user.roleNama) : null;
  const menuItems = roleName ? SILAKAP_MENUS[roleName] ?? [] : [];
  const firstOpenIndex = menuItems.findIndex((item) =>
    item.children?.some((child) => isActivePath(pathname, child.href)),
  );

  const [openIndex, setOpenIndex] = React.useState<number | null>(
    firstOpenIndex >= 0 ? firstOpenIndex : 0,
  );

  React.useEffect(() => {
    if (firstOpenIndex >= 0) {
      setOpenIndex(firstOpenIndex);
    }
  }, [firstOpenIndex]);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
          <Link
            href="/dashboard"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/logo-icon.svg"
              alt="logo-icon"
              width={26}
              height={26}
            />
            <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-xl">
              SILAKAP
            </span>
          </Link>

          <button
            type="button"
            className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
          <div className="accordion">
            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
              Main
            </span>

            {menuItems.map((item, index) => {
              const hasChildren = Boolean(item.children?.length);
              const itemActive =
                isActivePath(pathname, item.href) ||
                item.children?.some((child) =>
                  isActivePath(pathname, child.href),
                );

              if (!hasChildren) {
                return (
                  <div
                    className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap"
                    key={item.label}
                  >
                    <Link
                      href={item.href}
                      className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                        itemActive ? "active" : ""
                      }`}
                    >
                      <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                        {item.icon}
                      </i>
                      <span className="title leading-none">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full font-medium inline-block text-center min-w-[20px] h-[20px] text-[11px] leading-[20px] text-orange-500 bg-orange-50 dark:bg-[#ffffff14] ltr:ml-auto rtl:mr-auto px-[6px]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </div>
                );
              }

              return (
                <div
                  className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap"
                  key={item.label}
                >
                  <button
                    className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                      openIndex === index ? "open" : ""
                    } ${itemActive ? "active" : ""}`}
                    type="button"
                    onClick={() => toggleAccordion(index)}
                  >
                    <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                      {item.icon}
                    </i>
                    <span className="title leading-none">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full font-medium inline-block text-center min-w-[20px] h-[20px] text-[11px] leading-[20px] text-orange-500 bg-orange-50 dark:bg-[#ffffff14] ltr:ml-auto rtl:mr-auto px-[6px]">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>

                  <div
                    className={`accordion-collapse ${
                      openIndex === index ? "open" : "hidden"
                    }`}
                  >
                    <div className="pt-[4px]">
                      <ul className="sidebar-sub-menu">
                        {item.children?.map((child) => (
                          <li
                            className="sidemenu-item mb-[4px] last:mb-0"
                            key={child.href}
                          >
                            <Link
                              href={child.href}
                              className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                                isActiveExact(pathname, child.href, searchParams)
                                  ? "active"
                                  : ""
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarMenu: React.FC<SidebarMenuProps> = (props) => (
  <React.Suspense fallback={null}>
    <SidebarMenuContent {...props} />
  </React.Suspense>
);

export default SidebarMenu;

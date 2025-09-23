"use client";

import Create from "@/components/Create";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const tabs = [
    { label: "Workflows", href: "/home/workflows" },
    { label: "Credentials", href: "/home/credentials" },
  ];

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-8">
      <div className="mb-8 flex justify-end">
        <Create />
      </div>

      <nav className="flex items-center gap-4  mb-6">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href.split("?")[0]);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-2 px-3 font-medium ${
                isActive ? "border-b-2" : "text-gray-600 hover:text-[#ff6f5c]"
              }`}
              style={{
                color: isActive ? "#ff6f5c" : undefined,
                borderBottomColor: isActive ? "#ff6f5c" : undefined,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
};

export default Layout;

"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activePage = pathname === "/" ? "home" : pathname.split("/")[1] || "home";

  return (
    <>
      <Navbar />
      <div className="flex pt-[60px]">
        <Suspense fallback={<div className="fixed top-[60px] left-0 bottom-0 w-[210px] bg-white border-r border-gray-100 z-[200]" />}>
          <Sidebar activePage={activePage} />
        </Suspense>
        <main className="ml-[210px] min-h-[calc(100vh-60px)] flex-1 min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

import { Suspense } from "react";
import { Navbar } from "./navbar";

function NavbarFallback() {
  return <div style={{ height: 72 }} className="fixed top-0 inset-x-0 z-[300]" />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main>{children}</main>
    </>
  );
}

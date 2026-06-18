import Link from "next/link";
import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#e5ded2] bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-black tracking-normal text-ink">
            Blog Studio
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold text-[#53606d]">
            <Link className="rounded-md px-3 py-2 hover:bg-[#eee8df]" href="/">
              공개 블로그
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

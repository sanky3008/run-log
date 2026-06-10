import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trainer Log — Sankalp's Run Journey",
  description: "Sankalp's run training log — auto-synced from Whoop.",
};

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/trends", label: "TRENDS" },
  { href: "/badges", label: "RECORDS" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable} h-full`}>
      <body className="min-h-full flex flex-col items-center px-2 py-6 sm:py-10">
        {/* handheld shell */}
        <div className="w-full max-w-3xl">
          {/* top bezel */}
          <header className="flex items-end justify-between px-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="led inline-block size-2.5 rounded-full bg-led" aria-hidden />
              <span className="font-pixel text-[9px] tracking-widest text-[#8a8496]">SYNC</span>
            </div>
            <h1 className="font-pixel text-[11px] sm:text-sm text-[#cdc8d8] tracking-wider">
              TRAINER&nbsp;LOG
            </h1>
            <span className="font-pixel text-[9px] text-[#8a8496]">EST. 2026</span>
          </header>

          {/* the screen */}
          <div className="screen border-[10px] border-bezel rounded-sm shadow-[0_0_0_4px_#141218,0_24px_60px_rgba(0,0,0,0.6)]">
            {/* menu bar, dialog-box style */}
            <nav className="pixel-panel--dark m-3 flex items-center px-4 py-2.5 gap-5 sm:gap-8">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-pixel text-[9px] sm:text-[11px] hover:text-gold group"
                >
                  <span className="opacity-0 group-hover:opacity-100">▶</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <main className="px-3 pb-4 sm:px-5">{children}</main>

            {/* dialog footer */}
            <footer className="pixel-panel--dark m-3 px-4 py-2 flex items-center justify-between">
              <p className="font-pixel text-[8px] sm:text-[9px]">
                AUTO-SYNCED FROM WHOOP
              </p>
              <span className="blink font-pixel text-[10px]" aria-hidden>
                ▼
              </span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

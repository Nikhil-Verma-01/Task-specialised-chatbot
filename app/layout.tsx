import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Lean Startup Mentor Bot",
  description:
    "A brutally honest startup mentor bot for validating ideas, exposing execution gaps, and guiding sharper decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: import("react").ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${headingFont.variable} font-[var(--font-body)]`}
      >
        {children}
      </body>
    </html>
  );
}



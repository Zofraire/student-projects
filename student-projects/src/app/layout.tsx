import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Projects Showcase",
  description: "Discover innovative projects created by talented students",
  keywords: [
    "student projects",
    "portfolio",
    "showcase",
    "academic work",
    "3D models",
    "research",
  ].join(", "),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { ArchiveChat } from "@/components/ArchiveChat";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADS of the day",
  description: "Una campagna pubblicitaria al giorno.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full antialiased">
        <div className="mesh-bg" aria-hidden />
        <main>{children}</main>
        <ArchiveChat />
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgriManage™",
  description: "Flower farm records, costs, notes, and AI support",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
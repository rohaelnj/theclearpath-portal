// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "The Clear Path",
  description: "Online therapy rooted in the UAE.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#DED4C8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

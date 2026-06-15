import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Studio",
  description: "A focused writing and publishing studio"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WordTogether — Read the Bible Together",
  description: "Real-time Bible reading and discussion with friends. Compare NIV, KJV, ESV, The Message, and TB side by side.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}

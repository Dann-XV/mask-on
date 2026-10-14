import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
});

const clashDisplay = localFont({
  src: "../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
});

export const metadata: Metadata = {
  title: "MaskOn",
  description: "Temporary private messaging for close contacts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Portfolio Studio — IT", description: "Dự án, kỹ năng và hành trình của một kỹ sư phần mềm.", icons: { icon: "/favicon.svg" } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="vi" className="dark"><body>{children}</body></html>; }

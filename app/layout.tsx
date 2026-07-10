import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jira Clone - 任务管理系统",
  description: "现代化的任务管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

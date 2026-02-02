import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "宠物命运鉴定 - 揭晓你家毛孩子的前世身份",
  description: "AI命运鉴定，揭晓你家毛孩子的真实身份！上传照片，回答5个搞笑问题，抽取专属命运卡牌！",
  keywords: "宠物,命运鉴定,AI,抽卡,搞笑,娱乐",
  openGraph: {
    title: "宠物命运鉴定 - 揭晓你家毛孩子的前世身份",
    description: "AI命运鉴定，揭晓你家毛孩子的真实身份！",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

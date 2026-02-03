import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "宠物真实身份鉴定 - 揭晓你家毛孩子的真实身份",
  description: "AI身份鉴定，揭晓你家毛孩子的真实身份！上传照片，回答5个搞笑问题，抽取专属身份卡牌！",
  keywords: "宠物,身份鉴定,AI,抽卡,搞笑,娱乐",
  openGraph: {
    title: "宠物真实身份鉴定 - 揭晓你家毛孩子的真实身份",
    description: "AI身份鉴定，揭晓你家毛孩子的真实身份！",
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

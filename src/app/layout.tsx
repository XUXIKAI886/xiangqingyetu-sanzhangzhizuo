import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '美团外卖详情页生成器',
  description: '基于AI的外卖商品详情页海报自动生成工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

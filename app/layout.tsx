// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // ✅ 이 파일이 반드시 app 폴더 안에 있어야 합니다.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"], // ✅ subsets 누락 시 빌드 에러 발생
});

export const metadata: Metadata = {
  title: "Next Weight Lab | 대사 가교(Metabolic Bridge) 로드맵",
  description: "비만학회 지침 기반, 요요 방지를 위한 GPS(Drug, Protein, Strength) 전략을 확인하세요.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

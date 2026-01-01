// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"], // ✅ 폰트 빌드 에러 해결을 위해 subsets 추가
});

export const metadata: Metadata = {
  // ✅ 도메인 연결 후에는 실제 구매하신 도메인으로 변경해 주세요 (예: https://nextweightlab.com)
  metadataBase: new URL('https://nextweight-web.vercel.app'), 
  title: {
    default: "Next Weight Lab | 비만학회 지침 기반 대사 가교 리포트",
    template: "%s | Next Weight Lab"
  },
  description: "마운자로, 위고비 투약 후 요요 방지를 위한 GPS(Drug, Protein, Strength) 전략을 확인하세요.",
  openGraph: {
    title: "Next Weight Lab",
    description: "대한비만학회 2024 지침 기반, 과학적인 대사 가교를 설계합니다.",
    siteName: 'Next Weight Lab',
    locale: 'ko_KR',
    type: 'website',
  },
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

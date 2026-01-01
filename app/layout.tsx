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
});

export const metadata: Metadata = {
  // ✅ 도메인 연결 후 필수 설정: 소셜 공유 및 SEO용 베이스 URL
  metadataBase: new URL('https://nextweight.co.kr'), 
  title: {
    default: "Next Weight Lab | 비싼 다이어트의 대사 가교 솔루션",
    template: "%s | Next Weight Lab"
  },
  description: "마운자로, 위고비 투약 후 요요가 걱정되시나요? GPS(Drug, Protein, Strength) 전략으로 당신의 대사를 사수하세요.",
  openGraph: {
    title: "Next Weight Lab",
    description: "비싼 다이어트가 요요로 끝나지 않도록, 과학적인 대사 가교를 설계합니다.",
    url: 'https://yourdomain.com',
    siteName: 'Next Weight Lab',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next Weight Lab',
    description: '과학 기반 GLP-1 대사 가교 로드맵',
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

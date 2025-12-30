import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextWeight Lab",
  description: "터제타파이드 및 세마글루타이드 개인별 로드맵 가이드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evolution Championship API',
  description: 'Backend API for Evolution Championship MMA App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

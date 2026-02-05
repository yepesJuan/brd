import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Greenlight',
  description: 'Requirements approval and sign-off platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <TRPCProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TRPCProvider>
      </body>
    </html>
  );
}

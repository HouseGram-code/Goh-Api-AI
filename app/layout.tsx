import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GOH AI | Neural Might',
  description: 'Enterprise AI API Access with character limits and usage tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-[#020205] text-slate-200 relative overflow-x-hidden selection:bg-blue-500/30" suppressHydrationWarning>
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[130px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[130px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        </div>
        {children}
      </body>
    </html>
  );
}

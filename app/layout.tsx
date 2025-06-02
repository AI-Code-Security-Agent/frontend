// layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
// import { Header } from "@/components/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'CodeGuardian - AI-Powered Code Security Analysis',
  description: 'Analyze your code for security vulnerabilities and get intelligent recommendations to protect your applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${montserrat.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <Header /> */}
          <main>
            {children}
          </main>
          {/* <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen">
              <ImSpinner2 className="animate-spin" />
            </div>
          }
        >
          <NuqsAdapter>{children}</NuqsAdapter>
        </Suspense> */}
        </ThemeProvider>
         <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
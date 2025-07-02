
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Santaan.in Fertility Pathway Planner',
  description: 'AI-powered fertility treatment planning system for healthcare professionals',
  keywords: 'fertility, IVF, IUI, treatment planning, medical AI, Santaan.in',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
              <div className="container mx-auto max-w-7xl px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full medical-gradient flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-foreground">
                          Santaan.in
                        </h1>
                        <p className="text-xs text-muted-foreground">
                          Fertility Pathway Planner
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Powered by GreyBrain.ai
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium">AI Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <main className="container mx-auto max-w-7xl px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'
import { Inter } from 'next/font/google'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Stripe → Factură Automată RO',
  description: 'Generează automat facturi românești din plățile Stripe către SmartBill sau FGO',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
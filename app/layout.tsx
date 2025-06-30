import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrueStory.ai - Phil AI Assistant',
  description: 'AI Assistant with database integration',
  generator: 'TrueStory.ai',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

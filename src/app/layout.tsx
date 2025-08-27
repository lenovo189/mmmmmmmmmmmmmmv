import type { Metadata } from "next"; 
import { Geist, Geist_Mono } from "next/font/google"; 
import GoogleAnalytics from "@/components/google-analytics"; 
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"; 

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], }); 
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], }); 

export const metadata: Metadata = { 
  title: "Excel to PDF Converter - AI-Powered Report Generation", 
  description: "Transform Excel files into comprehensive PDF reports with AI analysis, data visualization, and insights. Upload Excel, get AI-powered analysis, and download professional PDF reports.", 
}; 

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) { 
  return ( 
    <html lang="en"> 
      <body className={${geistSans.variable} ${geistMono.variable} antialiased} > 
        <Analytics/>
        <GoogleAnalytics /> 
        {children} 
      </body> 
    </html> 
  ); 
} 

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, LogIn, Flashlight } from "lucide-react";
import { trackUserEngagement } from "@/lib/analytics";
import Image from "next/image";

export function Navbar() {
  const handleGetStarted = () => {
    trackUserEngagement("landing_cta_clicked", {
      action: "get_started",
      source: "navbar",
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md text-white grid place-items-center tracking-tight text-sm font-semibold">
            <Image src="/logo.png" alt="Excel to PDF" width={75} height={75} />
          </div>
          <span className="text-slate-900 text-[15px] font-medium tracking-tight">
            Sheet2Report
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          <Link href="/#features" className="hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link href="/#showcase" className="hover:text-slate-900 transition-colors">
            Showcase
          </Link>
          {/* <Link href="/#pricing" className="hover:text-slate-900 transition-colors">
            Pricing
          </Link> */}
          <Link href="/#faq" className="hover:text-slate-900 transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* <Button
            variant="outline"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-800 text-sm font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors"
          >
            <LogIn className="w-4 h-4" strokeWidth={1.5} />
            Sign in
          </Button> */}
          <Link href="/converter">
            <Button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              onClick={handleGetStarted}
            >
              <Flashlight className="w-4 h-4" strokeWidth={1.5} />
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
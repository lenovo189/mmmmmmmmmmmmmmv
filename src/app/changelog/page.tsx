"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Linkedin } from "lucide-react";
import XLogoIcon from "@/components/x-logo-icon";
import { trackPageView } from "@/lib/analytics";
import { Navbar } from "@/components/navbar";
import Image from "next/image";

// Changelog data - this would typically come from a data source
const changelogData = [
  {
    version: "1.2.0",
    date: "2025-09-01",
    title: "Enhanced Analytics and Row Limit Validation",
    type: "feature",
    changes: [
      "Implemented Google Analytics 4 (GA4) tracking for complete conversion funnel",
      "Added 100-row file limit validation with clear user feedback",
      "Enhanced file upload component with size guidelines",
      "Improved error handling and user experience for oversized files",
      "Added comprehensive analytics dashboard setup with custom reports"
    ]
  },
  {
    version: "1.1.0",
    date: "2025-08-25",
    title: "Chart Customization and Template System",
    type: "feature",
    changes: [
      "Introduced 5 professional PDF templates with unique color schemes",
      "Implemented dynamic chart styling based on selected template",
      "Added template selection dialog with preview options",
      "Enhanced chart rendering with improved color parsing and validation",
      "Fixed various chart rendering issues and inconsistencies"
    ]
  },
  {
    version: "1.0.5",
    date: "2025-08-18",
    title: "Performance Improvements and Bug Fixes",
    type: "fix",
    changes: [
      "Optimized Excel file processing for faster performance",
      "Fixed chart rendering issues in PDF exports",
      "Resolved template styling inconsistencies",
      "Improved error handling for AI analysis failures",
      "Enhanced mobile responsiveness of the converter interface"
    ]
  },
  {
    version: "1.0.0",
    date: "2025-08-10",
    title: "Initial Release",
    type: "release",
    changes: [
      "Launched Excel to PDF converter with AI-powered analysis",
      "Implemented drag & drop file upload functionality",
      "Added Excel preview with preserved formatting",
      "Integrated Google Gemini AI for comprehensive data analysis",
      "Created professional PDF report generation with executive summary",
      "Implemented template-based styling for reports"
    ]
  }
];

export default function ChangelogPage() {
  // Track changelog page view
  trackPageView('Changelog Page', {
    page_type: 'information',
    entry_point: 'landing_page'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Changelog</h1>
            <p className="text-slate-600 mt-2">
              Stay up to date with the latest improvements, features, and fixes.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {changelogData.map((release, index) => (
            <div 
              key={release.version} 
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-slate-900">{release.version}</h2>
                    {release.type === "feature" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Feature
                      </span>
                    )}
                    {release.type === "fix" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Fix
                      </span>
                    )}
                    {release.type === "release" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Release
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">{release.title}</h3>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(release.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <ul className="space-y-2">
                {release.changes.map((change, changeIndex) => (
                  <li key={changeIndex} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></div>
                    <span className="text-slate-700">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            That's all the updates for now. Check back later for more improvements!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md text-white grid place-items-center tracking-tight text-sm font-semibold">
                  <Image src="/logo.png" alt="Sheet2Report" width={75} height={75} />
                </div>
                <span className="text-slate-900 text-[15px] font-medium tracking-tight">
                  Sheet2Report
                </span>
              </div>
              <div className="text-sm text-slate-600">
                © {new Date().getFullYear()} Sheet2Report. All rights reserved.
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.linkedin.com/company/sheet2report" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://x.com/sheet2report" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <XLogoIcon className="w-5 h-5 [&>path]:fill-current" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
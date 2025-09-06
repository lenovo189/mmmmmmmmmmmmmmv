"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle, 
  Rocket, 
  BookOpen, 
  MonitorPlay, 
  Play,
  Check,
  Workflow,
  ShieldCheck,
  ArrowRight,
  MousePointerClick,
  Calendar,
  Flashlight,
  HelpCircle,
  Mail,
  Linkedin
} from "lucide-react";
import XLogoIcon from "@/components/x-logo-icon";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FeedbackForm } from "@/components/feedback-form";
import { trackPageView, trackUserEngagement } from "@/lib/analytics";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Listen for feedback modal open event from navbar
  useEffect(() => {
      const handleOpenFeedback = () => setIsFeedbackOpen(true);

      if (typeof window !== "undefined") {
        window.addEventListener("openFeedbackModal", handleOpenFeedback);
      }

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("openFeedbackModal", handleOpenFeedback);
        }
      };
    }, []);

  // Track landing page view
  trackPageView('Landing Page', {
    page_type: 'marketing',
    entry_point: 'main'
  });

  const handleGetStarted = () => {
    trackUserEngagement('landing_cta_clicked', {
      action: 'get_started',
      source: 'landing_page'
    });
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
    trackUserEngagement('video_played', {
      action: 'play_demo_video',
      source: 'landing_page'
    });
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Transform your data into actionable insights with Google Gemini AI integration."
    },
    {
      icon: Workflow,
      title: "Seamless Workflow",
      description: "From upload to export, our streamlined process keeps you focused on your data."
    },
    {
      icon: ShieldCheck,
      title: "Secure Processing",
      description: "Your data is processed securely with no storage on our servers."
    }
  ];

  const faqs = [
    {
      question: "What file formats do you support?",
      answer: "We support .xlsx and .csv files with a maximum of 100 rows for optimal performance."
    },
    {
      question: "Is my data stored on your servers?",
      answer: "No, all processing happens in your browser. Your files are never stored on our servers."
    },
    {
      question: "Do I need to create an account?",
      answer: "No account is required. Simply upload your file, process it, and download your PDF."
    },
    {
      question: "Is there a file size limit?",
      answer: "We recommend files under 5MB for best performance. Larger files may take longer to process."
    }
  ];

  return (
    <div className="antialiased font-sans text-slate-800 bg-slate-50 selection:bg-slate-900 selection:text-white">
      <Navbar />
      {/* Top Notification */}
      <div className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-2.5 text-center text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            Early access is open. Transform your Excel files effortlessly.
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-x-0 -top-24 -z-10 h-64 opacity-50">
          <div className="max-w-7xl mx-auto px-6 h-full">
            <div className="h-full w-full rounded-3xl bg-gradient-to-br from-slate-100 to-white border border-slate-200/80"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="mx-auto text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              Trusted by data professionals worldwide
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900">
              Transform Excel into beautiful reports, effortlessly
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600">
              Upload your Excel files and get AI-powered analysis, stunning charts, and professionally formatted PDF reports in seconds.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/converter">
                <Button 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  onClick={handleGetStarted}
                >
                  <Rocket className="w-4 h-4" strokeWidth={1.5} />
                  Try it free
                </Button>
              </Link>
              <Link href="/changelog">
                <Button 
                  variant="outline"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 text-sm font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors"
                >
                  <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                  Changelog
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-xs text-slate-500">This is 100% free</div>
          </div>

          {/* Video Showcase */}
          <div id="showcase" className="mt-10 md:mt-14 w-full flex justify-center" style={{ perspective: "1200px" }}>
  <div 
    className="w-[92vw] md:w-[90vw] max-w-6xl aspect-[16/9] rounded-2xl overflow-hidden relative shadow-[0_50px_120px_rgba(0,0,0,0.35)]"
  >
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <iframe
        title="Excel to PDF Converter Demo"
        className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] rounded-2xl"
        src="https://www.youtube.com/embed/Af_qetmBLQs?autoplay=1&mute=1&loop=1&playlist=Af_qetmBLQs&controls=0&modestbranding=0&rel=0&showinfo=0&playsinline=1&jsapi=1&color=white"
        frameBorder="0"
        allow="autoplay; fullscreen; encrypted-media"
      />
    </div>
  </div>
</div>


          {/* Social Proof */}
          {/* <div className="max-w-6xl mx-auto mt-10 md:mt-12">
            <p className="text-center text-xs text-slate-500 mb-4">Trusted by teams at</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-6 items-center">
              <div className="h-10 rounded-md bg-white border border-slate-200 grid place-items-center text-slate-600 text-sm tracking-tight">DATA</div>
              <div className="h-10 rounded-md bg-white border border-slate-200 grid place-items-center text-slate-600 text-sm tracking-tight">ANALYZE</div>
              <div className="h-10 rounded-md bg-white border border-slate-200 grid place-items-center text-slate-600 text-sm tracking-tight">REPORT</div>
              <div className="h-10 rounded-md bg-white border border-slate-200 grid place-items-center text-slate-600 text-sm tracking-tight">INSIGHT</div>
              <div className="h-10 rounded-md bg-white border border-slate-200 grid place-items-center text-slate-600 text-sm tracking-tight">CHART</div>
              <div className="h-10 rounded-md bg-white border border-slate-200 grid place-items-center text-slate-600 text-sm tracking-tight">PDF</div>
            </div>
          </div> */}

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 md:mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Everything you need to transform data</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Thoughtful features that help you create professional reports faster.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="w-10 h-10 rounded-md bg-blue-600 text-white grid place-items-center mb-4">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Secondary Section with image */}
      <section className="py-16 md:py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Professional reports that impress</h3>
            <p className="mt-3 text-slate-600">From the first upload to the final PDF, our tool helps you create reports that clearly communicate your data insights.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 mt-0.5 text-emerald-600" strokeWidth={1.5} />
                AI-powered data analysis and insights
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 mt-0.5 text-emerald-600" strokeWidth={1.5} />
                Beautiful charts and visualizations
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 mt-0.5 text-emerald-600" strokeWidth={1.5} />
                Professional PDF formatting with cover pages
              </li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-700">
              <Link href="/converter">
                <Button 
                  variant="outline"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 transition-colors"
                  onClick={handleGetStarted}
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  Start converting
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <img 
              src="https://ucarecdn.com/d8dc7a6b-0683-412b-b9dd-c24865f7e254/-/preview/1920x1200/" 
              alt="Dashboard preview" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8 text-center">
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Frequently asked questions</h3>
            <p className="mt-3 text-slate-600">Quick answers to common questions.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-600 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold tracking-tight text-slate-900">{faq.question}</h4>
                    <p className="mt-1.5 text-sm text-slate-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 md:mt-12 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <h4 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Ready to transform your data?</h4>
              <p className="mt-1.5 text-slate-600">Convert your first Excel file to a professional PDF report in seconds.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/converter">
                <Button 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  onClick={handleGetStarted}
                >
                  <MousePointerClick className="w-4 h-4" strokeWidth={1.5} />
                  Try it Free
                </Button>
              </Link>
              <Button 
                variant="outline"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 text-sm font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors"
                onClick={() => setIsFeedbackOpen(true)}
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                Bug/Feedback Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white">
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
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                <span className="text-slate-300">•</span>
                <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                <span className="text-slate-300">•</span>
                <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bug Report or Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackForm onClose={() => setIsFeedbackOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
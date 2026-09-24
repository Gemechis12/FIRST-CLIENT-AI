import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutTemplate, MessageSquare, Briefcase, FileText, Sparkles, Target, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">FIRST CLIENT AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#how-it-works">
            How it works
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#tools">
            Tools
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium shadow hover:bg-[var(--foreground)]/90 transition-colors"
            href="/register"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 px-4 md:px-6 text-center">
          <div className="container mx-auto max-w-5xl">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              The smart way to start freelancing
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
              Turn Your Skill Into <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Your First Client.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-[var(--muted-foreground)] mb-10 leading-relaxed">
              FIRST CLIENT AI helps beginners turn what they already know into a freelance service, find the right niche, create an offer, reach prospects, and write better proposals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-white shadow hover:bg-primary/90 transition-all hover:scale-105"
              >
                Start Building My Freelance Business
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-[var(--border)] bg-transparent px-8 text-base font-medium hover:bg-[var(--muted)] transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Workflow Visual Section */}
        <section className="w-full py-16 bg-[var(--muted)]/50 border-y border-[var(--border)] overflow-hidden">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-8">Your Journey to the First Client</p>
            <div className="flex items-center justify-start md:justify-center overflow-x-auto pb-4 gap-2 md:gap-4 no-scrollbar">
              {[
                { name: "SKILL", icon: Zap },
                { name: "SERVICE", icon: Briefcase },
                { name: "NICHE", icon: Target },
                { name: "OFFER", icon: LayoutTemplate },
                { name: "PORTFOLIO", icon: FileText },
                { name: "OUTREACH", icon: MessageSquare },
                { name: "PROPOSAL", icon: FileText },
                { name: "CLIENT", icon: CheckCircle2, highlight: true }
              ].map((step, i, arr) => (
                <div key={step.name} className="flex items-center shrink-0">
                  <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border ${step.highlight ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]'} shadow-sm transition-transform hover:-translate-y-1`}>
                    <step.icon className={`w-6 h-6 mb-2 ${step.highlight ? 'text-white' : 'text-primary'}`} />
                    <span className="text-[10px] font-bold tracking-wider">{step.name}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-8 md:w-12 h-[2px] bg-[var(--border)] mx-1 md:mx-2 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-[var(--border)] rotate-45"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Tools / How It Works */}
        <section id="tools" className="w-full py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to launch</h2>
              <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">Stop guessing what clients want. Our AI-powered tools guide you step-by-step from choosing a service to closing your first deal.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Service & Niche Finder", desc: "Turn your raw skills (like 'Canva') into a sellable service targeted at a specific, profitable niche.", icon: Target },
                { title: "Offer Builder", desc: "Package your service with clear deliverables, timelines, and suggested starter pricing that clients understand.", icon: LayoutTemplate },
                { title: "Portfolio Generator", desc: "No clients yet? Generate realistic sample briefs to create practice projects and build your initial portfolio.", icon: Briefcase },
                { title: "Smart Outreach", desc: "Generate personalized, non-spammy DMs and emails tailored to your prospect's business and industry.", icon: MessageSquare },
                { title: "Winning Proposals", desc: "Create structured, professional proposals that show you understand the client's problem and have the solution.", icon: FileText },
                { title: "Launch Dashboard", desc: "Track your progress visually. Always know what your next step is toward landing that first client.", icon: CheckCircle2 }
              ].map((tool) => (
                <div key={tool.title} className="flex flex-col p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                  <p className="text-[var(--muted-foreground)] flex-1">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 px-4 md:px-6 bg-[var(--foreground)] text-[var(--background)]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to find your first client?</h2>
            <p className="text-xl text-[var(--background)]/80 mb-10 max-w-2xl mx-auto">
              Join FIRST CLIENT AI today and turn your skills into a profitable freelance business.
            </p>
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-lg font-bold text-white shadow hover:bg-primary/90 transition-all hover:scale-105"
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold">FIRST CLIENT AI</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} First Client AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Terms</Link>
            <Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

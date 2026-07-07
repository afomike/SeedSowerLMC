import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="absolute inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <BookOpen className="h-6 w-6" />
          <span>DAKAT</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium shadow-sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Ministry Training Portal
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
              Grow in faith, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">equipped for the Kingdom.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DAKAT — Discipleship And Kingdom Advocacy Training — equips believers with structured, Spirit-led training to fulfil their calling and advance God's Kingdom.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="h-14 px-8 text-base shadow-md group">
                  Begin Your Training
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-muted-foreground/20">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Built for Kingdom growth</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to grow as a disciple and advocate for God's Kingdom — structured, purposeful, and accessible.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card border rounded-xl p-8 shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Guided Progression</h3>
                <p className="text-muted-foreground leading-relaxed">Each training module builds on the last. Lessons unlock in sequence so every believer builds a solid Biblical foundation before moving forward.</p>
              </div>
              
              <div className="bg-card border rounded-xl p-8 shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Rich Teaching Formats</h3>
                <p className="text-muted-foreground leading-relaxed">Engage through sermon videos, audio teachings, and PDF study materials — all within one simple, distraction-free platform.</p>
              </div>
              
              <div className="bg-card border rounded-xl p-8 shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Completion Certificates</h3>
                <p className="text-muted-foreground leading-relaxed">Receive a certificate upon completing each training module — a testament to your commitment and growth in discipleship.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t py-12 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <BookOpen className="h-5 w-5" />
            <span>DAKAT</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DAKAT — Discipleship And Kingdom Advocacy Training. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

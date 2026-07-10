import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, ShieldCheck, Zap, Award, Sparkles, PlayCircle, GraduationCap } from "lucide-react";
import heroImage from "@/assets/imagebg_1.png";
import ministryImage from "@/assets/imagebg_2.png";
import learningImage from "@/assets/imagebg_3.png";

const highlights = [
  { label: "Structured discipleship paths", value: "100+" },
  { label: "On-demand teaching modules", value: "24/7" },
  { label: "Trusted ministry learning", value: "Enterprise" },
];

const outcomes = [
  {
    title: "Guided progression",
    description: "Every lesson builds on the last, helping learners grow with clarity and purpose.",
    icon: ShieldCheck,
  },
  {
    title: "Rich formats",
    description: "Video, audio, and study materials connect effortlessly in one premium experience.",
    icon: Zap,
  },
  {
    title: "Recognized achievement",
    description: "Certificates and progress tracking keep learners engaged and accountable.",
    icon: Award,
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="absolute inset-x-0 top-0 z-50 flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg sm:text-xl text-primary">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>DAKAT</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
              <Button className="h-10 px-3 text-sm sm:px-4">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="h-10 px-3 text-sm font-medium sm:px-4">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 px-3 text-sm font-medium shadow-sm sm:px-4">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="A faith-based digital learning environment" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.95),rgba(15,23,42,0.8),rgba(15,23,42,0.55))]" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 sm:gap-12 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-36">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100 backdrop-blur-md">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Christian e-learning, designed with excellence
              </div>

              <h1 className="mt-6 text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-7xl">
                Equip believers for
                <span className="block bg-gradient-to-r from-emerald-300 via-primary to-lime-300 bg-clip-text text-transparent">
                  Kingdom impact.
                </span>
              </h1>

              <p className="mt-6 text-base leading-7 text-slate-200 sm:text-lg sm:leading-8 lg:text-xl">
                DAKAT delivers structured discipleship training, mentorship-ready content, and measurable growth in a modern platform built for ministries and learners alike.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 w-full px-8 text-base shadow-lg shadow-emerald-950/40 group sm:w-auto">
                    Begin Your Training
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/courses" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-14 w-full border-white/20 bg-white/10 px-8 text-base text-white backdrop-blur-md hover:bg-white/20 sm:w-auto">
                    Explore Courses
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-sm text-slate-200 sm:gap-3">
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs sm:px-4 sm:text-sm">Structured learning paths</div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs sm:px-4 sm:text-sm">Progress tracking</div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs sm:px-4 sm:text-sm">Certificate-ready completion</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-slate-950/45 p-3 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-4">
              <img src={ministryImage} alt="Learners engaging with ministry training content" className="h-64 w-full rounded-[20px] object-cover sm:h-72" />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-slate-50/80 py-14 dark:bg-slate-900/50 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-3xl sm:mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Why DAKAT stands out</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Built for modern discipleship and ministry growth</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                The platform balances spiritual depth with polished digital delivery so every learner receives a premium, focused experience.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">Executive-level learning design</p>
                    <h3 className="text-xl font-semibold">A premium experience for every believer</h3>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {outcomes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-2xl border border-border/60 bg-background/80 p-5">
                        <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm sm:min-h-[420px]">
                <img src={learningImage} alt="A learner reviewing a study module" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 sm:text-sm">
                    <PlayCircle className="h-4 w-4" />
                    Learn anywhere, grow deeply
                  </div>
                  <h3 className="mt-3 max-w-[18ch] text-xl font-semibold leading-tight break-words sm:max-w-none sm:text-2xl">
                    A polished path from curiosity to spiritual confidence
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                    Whether you are joining from a local ministry or learning independently, DAKAT brings clarity, momentum, and purpose to every lesson.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[32px] border border-border/70 bg-gradient-to-br from-primary/10 via-background to-secondary/50 p-6 shadow-[0_20px_80px_-40px_hsl(var(--primary))] sm:p-8 md:p-12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Start your journey</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Ready to grow in faith and purpose?</h2>
                  <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                    Join a platform that feels modern, intentional, and spiritually grounded from the first click.
                  </p>
                </div>
                <Link href={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
                    Create Your Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-2 font-semibold text-lg text-primary">
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

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import authImage from "@/assets/imagebg_4.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        setAuthUser(response.token);

        toast({
          title: "Welcome back!",
          description: "You are now signed in to your DAKAT account.",
        });

        if (response.user.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      },
      onError: (error) => {
        const message =
          typeof error === "object" && error !== null && "data" in error && typeof (error as any).data?.error === "string"
            ? (error as any).data.error
            : "Invalid credentials. Please try again.";

        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: message,
        });
      },
    });
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-slate-950">
      <img src={authImage} alt="A calm learning environment" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/75" />

      <div className="relative flex min-h-[100dvh] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl shadow-slate-950/35 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden lg:block">
            <img src={authImage} alt="Faith-based training illustration" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur-md">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Secure access to your learning journey
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Continue your growth with intention.</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-200">
                Sign in to access courses, track progress, and stay connected to your discipleship path.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-semibold text-primary transition-opacity hover:opacity-80">
              <BookOpen className="h-8 w-8" />
              <span>DAKAT</span>
            </Link>

            <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl">
              <CardHeader className="space-y-2 pb-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-slate-300">
                  Sign in to continue your discipleship training
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" type="email" autoComplete="email" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" autoComplete="current-password" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-6 w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="mt-2 flex flex-col border-t border-white/10 p-6 text-center">
                <div className="text-sm text-slate-300">
                  New to DAKAT?{" "}
                  <Link href="/register" className="font-semibold text-primary hover:underline">
                    Create an account
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, LayoutDashboard, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch("/api/settings");
  if (!res.ok) return {};
  return res.json();
}

function SiteLogo() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });

  const logoUrl = settings?.logoUrl;
  const siteName = settings?.siteName || "TOFINISH THE TASK";

  return (
    <span className="flex items-center gap-2 font-bold text-xl text-primary">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={siteName}
          className="h-8 w-8 object-contain rounded"
        />
      ) : (
        <BookOpen className="h-6 w-6" />
      )}
      <span>{siteName}</span>
    </span>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={user?.role === "admin" ? "/admin" : "/"}>
            <SiteLogo />
          </Link>
          
          {user?.role === "student" && (
            <div className="hidden md:flex gap-4">
              <Link href="/dashboard">
                <Button variant={location === "/dashboard" ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant={location.startsWith("/courses") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Catalog
                </Button>
              </Link>
            </div>
          )}
          
          {user?.role === "admin" && (
            <div className="hidden md:flex gap-4">
              <Link href="/admin">
                <Button variant={location === "/admin" ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Overview
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button variant={location.startsWith("/admin/courses") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </Button>
              </Link>
              <Link href="/admin/students">
                <Button variant={location.startsWith("/admin/students") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Students
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant={location === "/admin/settings" ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.fullname} />
                    <AvatarFallback>{getInitials(user.fullname)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullname}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

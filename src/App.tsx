import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CourseCatalog from "@/pages/course-catalog";
import CourseDetail from "@/pages/course-detail";
import LessonPlayer from "@/pages/lesson-player";
import Profile from "@/pages/profile";
import Certificate from "@/pages/certificate";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCourses from "@/pages/admin-courses";
import AdminCourseDetail from "@/pages/admin-course-detail";
import AdminStudents from "@/pages/admin-students";
import AdminSettings from "@/pages/admin-settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Student protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/courses" component={CourseCatalog} />
      <ProtectedRoute path="/courses/:id" component={CourseDetail} />
      <ProtectedRoute path="/courses/:id/lessons/:lessonId" component={LessonPlayer} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/certificates/:courseId" component={Certificate} />
      
      {/* Admin protected routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} requireAdmin={true} />
      <ProtectedRoute path="/admin/courses" component={AdminCourses} requireAdmin={true} />
      <ProtectedRoute path="/admin/courses/:id" component={AdminCourseDetail} requireAdmin={true} />
      <ProtectedRoute path="/admin/students" component={AdminStudents} requireAdmin={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} requireAdmin={true} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="elearn-theme">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </WouterRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

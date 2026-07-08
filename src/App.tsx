import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const CourseCatalog = lazy(() => import("@/pages/course-catalog"));
const CourseDetail = lazy(() => import("@/pages/course-detail"));
const LessonPlayer = lazy(() => import("@/pages/lesson-player"));
const Profile = lazy(() => import("@/pages/profile"));
const Certificate = lazy(() => import("@/pages/certificate"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminCourses = lazy(() => import("@/pages/admin-courses"));
const AdminCourseDetail = lazy(() => import("@/pages/admin-course-detail"));
const AdminStudents = lazy(() => import("@/pages/admin-students"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));

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
  const fallback = <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <Suspense fallback={fallback}>
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
    </Suspense>
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

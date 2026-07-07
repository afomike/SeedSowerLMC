import { useGetAdminStats, useGetPopularCourses } from "@/lib/api-client";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, CheckCircle, TrendingUp, UserPlus, Clock } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStats();
  const { data: popularCourses, isLoading: isPopularLoading } = useGetPopularCourses();

  const isLoading = isStatsLoading || isPopularLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor platform engagement and course performance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.activeStudents || 0} active currently
              </p>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.totalLessons || 0} lessons total
              </p>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats?.overallCompletionRate || 0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average across all courses
              </p>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Enrollments</CardTitle>
              <UserPlus className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats?.recentEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In the last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Popular Courses
              </CardTitle>
              <CardDescription>Most enrolled courses across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {popularCourses?.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No courses available yet.</p>
                ) : (
                  popularCourses?.map((course) => (
                    <Link key={course.id} href={`/admin/courses/${course.id}`} className="block group">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                              <BookOpen className="h-6 w-6 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {course.enrollmentCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> {Math.round(course.completionRate)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted shadow-sm flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
            <Clock className="h-12 w-12 text-primary mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">Ready to expand?</h3>
            <p className="text-slate-400 mb-6 max-w-sm">
              Create a new course or manage existing ones to provide more value to your students.
            </p>
            <Link href="/admin/courses">
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2">
                Manage Courses
              </span>
            </Link>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

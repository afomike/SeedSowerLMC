import { useGetMyProgress, useGetStudentStats, useListCourses } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { StudentLayout } from "@/components/layout/student-layout";
import { CourseCard } from "@/components/course-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, Clock, MessageSquareText, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default function Dashboard() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });
  const { data: stats, isLoading: isStatsLoading } = useGetStudentStats();
  const { data: progress, isLoading: isProgressLoading } = useGetMyProgress();
  const { data: courses, isLoading: isCoursesLoading } = useListCourses();

  const isLoading = isStatsLoading || isProgressLoading || isCoursesLoading;

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-6 w-32 mt-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  const enrolledCourses = progress?.enrolledCourses || [];
  const inProgressCourses = enrolledCourses.filter(c => !c.isCompleted);
  const completedCoursesList = enrolledCourses.filter(c => c.isCompleted);
  
  const recommendedCourses = courses?.filter(
    c => !enrolledCourses.some(ec => ec.courseId === c.id)
  ).slice(0, 3) || [];

  return (
    <StudentLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Training</h1>
          <p className="text-muted-foreground">Welcome back. Here is your discipleship training progress.</p>
        </div>

        {/* Welcome / About banner — only shown when an admin has set a message */}
        {settings?.welcomeMessage && (
          <div className="flex gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="shrink-0 mt-0.5">
              <MessageSquareText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {settings.welcomeMessage}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-muted shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEnrolled || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedCourses || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedLessons || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats?.overallProgress || 0)}%</div>
              <Progress value={stats?.overallProgress || 0} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Continue Training */}
        {inProgressCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Continue Training</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  id={course.courseId}
                  title={course.courseTitle}
                  description={`${course.completedLessons} of ${course.totalLessons} lessons completed`}
                  thumbnailUrl={course.thumbnailUrl}
                  lessonCount={course.totalLessons}
                  progressPercent={course.progressPercent}
                  isCompleted={course.isCompleted}
                  isEnrolled={true}
                  href={`/courses/${course.courseId}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Modules */}
        {recommendedCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Recommended for You</h2>
              <Link href="/courses">
                <Button variant="ghost" size="sm" className="hidden sm:flex">View all training modules</Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnailUrl={course.thumbnailUrl}
                  lessonCount={course.lessonCount}
                  enrollmentCount={course.enrollmentCount}
                  href={`/courses/${course.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Modules */}
        {completedCoursesList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Completed Modules</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCoursesList.map((course) => (
                <Card key={course.courseId} className="flex flex-col border-muted shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-video w-full relative bg-muted overflow-hidden rounded-t-xl">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.courseTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                        <Trophy className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Link href={`/certificates/${course.courseId}`}>
                        <Button variant="secondary" className="gap-2">
                          <Trophy className="h-4 w-4" />
                          View Certificate
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">{course.courseTitle}</CardTitle>
                    <CardDescription>Completed on {course.lastActivityAt ? new Date(course.lastActivityAt).toLocaleDateString() : 'recently'}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {enrolledCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/30">
            <BookOpen className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your training journey starts here</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">You are not enrolled in any training modules yet. Browse our catalogue and begin your discipleship journey today.</p>
            <Link href="/courses">
              <Button>Browse Training Modules</Button>
            </Link>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

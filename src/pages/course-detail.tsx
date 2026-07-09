import { useGetCourse, useEnrollCourse, getGetCourseQueryKey, getGetMyProgressQueryKey, getGetStudentStatsQueryKey } from "@/lib/api-client";
import { StudentLayout } from "@/components/layout/student-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, FileText, Headphones, Lock, PlayCircle, PlaySquare, Trophy, Video } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetail({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: course, isLoading } = useGetCourse(courseId, {
    query: {
      enabled: !!courseId,
      queryKey: getGetCourseQueryKey(courseId)
    }
  });

  const enrollMutation = useEnrollCourse();

  const handleEnroll = () => {
    enrollMutation.mutate({ id: courseId }, {
      onSuccess: () => {
        toast({
          title: "Enrolled Successfully!",
          description: `You are now enrolled in "${course?.title}". Your training begins now.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
        queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStudentStatsQueryKey() });
        
        const firstLesson = course?.lessons?.[0];
        if (firstLesson) {
          setLocation(`/courses/${courseId}/lessons/${firstLesson.id}`);
        }
      },
      onError: (error) => {
        const message =
          typeof error === "object" && error !== null && "data" in error && typeof (error as any).data?.error === "string"
            ? (error as any).data.error
            : "Failed to enroll. Please try again.";

        toast({
          variant: "destructive",
          title: "Enrollment Failed",
          description: message,
        });
      }
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-5 w-5" />;
      case "audio": return <Headphones className="h-5 w-5" />;
      case "pdf": return <FileText className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  if (isLoading || !course) {
    return (
      <StudentLayout>
        <div className="space-y-8">
          <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-muted animate-pulse rounded-xl" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2 pt-8">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const lessons = course.lessons ?? [];
  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const lessonCount = course.lessonCount ?? lessons.length;
  const progressPercent = lessonCount > 0 ? (completedLessons / lessonCount) * 100 : 0;
  const isFullyCompleted = lessonCount > 0 && completedLessons === lessonCount;

  return (
    <StudentLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        {/* Module Header / Hero */}
        <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-2xl overflow-hidden bg-slate-900 border">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-green-900/80" />
          )}
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent">
            <Badge className="w-fit mb-4 bg-primary/20 text-primary-foreground hover:bg-primary/30 border-none backdrop-blur-md">
              {course.lessonCount} {course.lessonCount === 1 ? "Lesson" : "Lessons"}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 max-w-4xl tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-300 max-w-3xl text-lg line-clamp-2">
              {course.description}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content - Lesson List */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Training Curriculum</h2>
              <span className="text-muted-foreground text-sm font-medium">{course.lessons.length} {course.lessons.length === 1 ? "lesson" : "lessons"}</span>
            </div>

            <div className="space-y-3">
              {course.lessons.map((lesson, index) => {
                const isLocked = lesson.isLocked;
                const isCompleted = lesson.isCompleted;
                const isAvailable = course.isEnrolled && !isLocked;
                
                return (
                  <div 
                    key={lesson.id} 
                    className={`
                      relative flex items-center p-4 rounded-xl border transition-all duration-200
                      ${isCompleted ? 'bg-primary/5 border-primary/20' : ''}
                      ${!isCompleted && !isLocked ? 'bg-card hover:border-primary/50 hover:shadow-sm' : ''}
                      ${isLocked ? 'bg-muted/50 border-muted opacity-60 grayscale-[0.5]' : ''}
                    `}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-muted">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <span className="font-semibold text-sm text-primary">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0 pr-4">
                      <h3 className={`font-medium truncate ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          {getContentTypeIcon(lesson.contentType)}
                          <span className="capitalize">{lesson.contentType}</span>
                        </span>
                        {lesson.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {isAvailable ? (
                        <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                          <Button variant={isCompleted ? "outline" : "default"} size="sm" className="gap-2 shrink-0 rounded-full">
                            {isCompleted ? "Review" : "Start"} <PlayCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : isLocked && course.isEnrolled ? (
                        <Button variant="outline" size="sm" disabled className="gap-2 rounded-full">
                          Locked <Lock className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              
              {course.lessons.length === 0 && (
                <div className="text-center p-12 border border-dashed rounded-xl bg-muted/30">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground">No lessons have been added to this training module yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-sm">
              {course.isEnrolled ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" /> 
                      Your Progress
                    </h3>
                    <div className="flex justify-between text-sm font-medium">
                      <span>{completedLessons} / {course.lessonCount} Lessons</span>
                      <span className="text-primary">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3 rounded-full" />
                  </div>
                  
                  {isFullyCompleted ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Module Completed!</p>
                          <p className="text-xs opacity-90 mt-1">Well done, faithful servant. Your certificate awaits.</p>
                        </div>
                      </div>
                      <Link href={`/certificates/${courseId}`} className="block">
                        <Button className="w-full gap-2 text-base h-12 shadow-md">
                          <Trophy className="h-5 w-5" /> View Certificate
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link href={`/courses/${courseId}/lessons/${course.lessons.find(l => !l.isCompleted && !l.isLocked)?.id || course.lessons[0]?.id}`} className="block">
                      <Button className="w-full gap-2 text-base h-12 shadow-md hover:-translate-y-0.5 transition-transform">
                        <PlaySquare className="h-5 w-5" /> Continue Training
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1 tracking-tight">Free</div>
                    <p className="text-muted-foreground text-sm">Full lifetime access</p>
                  </div>
                  
                  <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-primary" /> {course.lessonCount} structured lessons
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy className="h-4 w-4 text-primary" /> Completion certificate
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" /> Learn at your own pace
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full text-base h-12 shadow-md font-semibold mt-4" 
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enrol Now"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

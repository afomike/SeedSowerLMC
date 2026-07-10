import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  useGetCourse, 
  useGetLesson, 
  useCompleteLesson,
  getGetCourseQueryKey,
  getGetLessonQueryKey,
  getListLessonsQueryKey,
  getGetCourseProgressQueryKey,
  getGetStudentStatsQueryKey,
  getGetMyProgressQueryKey
} from "@/lib/api-client";
import { StudentLayout } from "@/components/layout/student-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle, ClipboardList, FileText, Play, ArrowLeft, Lock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { QuizModal } from "@/components/quiz-modal";
import { getAuthToken } from "@/lib/api-client";

async function fetchLessonQuiz(lessonId: string) {
  const token = getAuthToken();
  const res = await fetch(`/api/lessons/${lessonId}/quiz`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load quiz");
  return res.json();
}

async function fetchBestAttempt(lessonId: string) {
  const token = getAuthToken();
  const res = await fetch(`/api/lessons/${lessonId}/quiz/best-attempt`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { hasPassed: false, bestScore: null };
  return res.json();
}

// ---------------------------------------------------------------------------
// External-link / embed detection helpers
// ---------------------------------------------------------------------------

const VIDEO_FILE_EXTS = [".mp4", ".webm", ".mov", ".ogg", ".m3u8", ".mkv"];
const AUDIO_FILE_EXTS = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"];
const PDF_FILE_EXTS = [".pdf"];

function hasExtension(url: string, exts: string[]): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return exts.some((ext) => path.endsWith(ext));
  } catch {
    return false;
  }
}

/** Returns a YouTube/Vimeo embed URL if the link matches, otherwise null. */
function getVideoPlatformEmbed(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

/** Returns a Spotify/SoundCloud embed URL if the link matches, otherwise null. */
function getAudioPlatformEmbed(url: string): string | null {
  const spotify = url.match(/open\.spotify\.com\/(track|episode|album|playlist)\/([\w]+)/);
  if (spotify) return `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`;

  if (/soundcloud\.com\//.test(url)) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&color=%23ff5500`;
  }

  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;

  const ytEmbed = getVideoPlatformEmbed(url);
  if (ytEmbed) return ytEmbed;

  return null;
}
/** Returns a preview/embed URL for common document-hosting links (Google Drive, Dropbox). */
function getDocPlatformEmbed(url: string): string | null {
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;

  if (/dropbox\.com\//.test(url)) {
    const raw = url.replace(/\?dl=0$/, "?raw=1").replace(/\?dl=1$/, "?raw=1");
    return `https://docs.google.com/viewer?url=${encodeURIComponent(raw)}&embedded=true`;
  }

  return null;
}

type MediaResolution =
  | { kind: "direct"; url: string }
  | { kind: "embed"; url: string }
  | { kind: "unknown"; url: string };

function resolveVideo(url: string): MediaResolution {
  if (hasExtension(url, VIDEO_FILE_EXTS)) return { kind: "direct", url };
  const embed = getVideoPlatformEmbed(url);
  if (embed) return { kind: "embed", url: embed };
  return { kind: "unknown", url };
}

function resolveAudio(url: string): MediaResolution {
  if (hasExtension(url, AUDIO_FILE_EXTS)) return { kind: "direct", url };
  const embed = getAudioPlatformEmbed(url);
  if (embed) return { kind: "embed", url: embed };
  return { kind: "unknown", url };
}

function resolveDoc(url: string): MediaResolution {
  if (hasExtension(url, PDF_FILE_EXTS)) return { kind: "direct", url };
  const embed = getDocPlatformEmbed(url);
  if (embed) return { kind: "embed", url: embed };
  // Last resort: try Google Docs Viewer on the raw url — works for many
  // publicly accessible pdf/doc links that don't match a known platform.
  return { kind: "embed", url: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` };
}

// A small manual "mark as finished" control shown under embeds where we
// can't reliably detect completion (cross-origin iframes don't expose
// ended/progress events the way native <video>/<audio> tags do).
function openOriginalLink(url: string) {
  if (typeof window === "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const shouldOpen = window.confirm("This will open the original resource in a new tab. Continue?");
  if (shouldOpen) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function ManualFinishControl({
  label,
  originalUrl,
  onFinish,
  finished,
}: {
  label: string;
  originalUrl: string;
  onFinish: () => void;
  finished: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-card border-t">
      {!finished && (
        <Button size="sm" onClick={onFinish} className="gap-2 shadow-sm border-emerald-600/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          {label}
        </Button>
      )}
      <a
        href={originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          event.preventDefault();
          openOriginalLink(originalUrl);
        }}
        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open original link
      </a>
    </div>
  );
}

export default function LessonPlayer({ params }: { params: { id: string, lessonId: string } }) {
  const { id: courseId, lessonId } = params;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [completedPartIndexes, setCompletedPartIndexes] = useState<Set<number>>(new Set());

  const { data: course, isLoading: isCourseLoading } = useGetCourse(courseId, {
    query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) }
  });

  const { data: lesson, isLoading: isLessonLoading } = useGetLesson(lessonId, {
    query: { enabled: !!lessonId, queryKey: getGetLessonQueryKey(lessonId) }
  });

  // Quiz data for this lesson
  const { data: quiz } = useQuery({
    queryKey: ["lesson-quiz", lessonId],
    queryFn: () => fetchLessonQuiz(lessonId),
    enabled: !!lessonId,
    staleTime: 60_000,
  });

  const { data: bestAttempt, refetch: refetchBestAttempt } = useQuery({
    queryKey: ["quiz-best-attempt", lessonId],
    queryFn: () => fetchBestAttempt(lessonId),
    enabled: !!lessonId && !!quiz,
    staleTime: 30_000,
  });

  const hasQuiz = quiz !== null && quiz !== undefined;
  const quizPassed = bestAttempt?.hasPassed === true;

  const completeMutation = useCompleteLesson();

  useEffect(() => {
    setActivePartIndex(0);
    setCompletedPartIndexes(new Set());
  }, [lessonId]);

  // Find current lesson in course lessons to check status and get neighbors
  const courseLesson = course?.lessons?.find(l => l.id === lessonId);
  const isCompleted = courseLesson?.isCompleted || false;
  
  // Find prev/next navigation
  const currentIndex = course?.lessons?.findIndex(l => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? course?.lessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex < (course?.lessons?.length || 0) - 1 ? course?.lessons?.[currentIndex + 1] : null;

  // Handle lesson lock state
  useEffect(() => {
    if (courseLesson?.isLocked) {
      toast({
        variant: "destructive",
        title: "Lesson Locked",
        description: "You must complete previous lessons first.",
      });
      setLocation(`/courses/${courseId}`);
    }
  }, [courseLesson?.isLocked, courseId, setLocation, toast]);

  const handleComplete = () => {
    if (isCompleted || completeMutation.isPending) return;

    completeMutation.mutate({ data: { lessonId } }, {
      onSuccess: () => {
        toast({
          title: "Lesson Completed!",
          description: "Great job. Keep up the momentum.",
        });
        queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
        queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey(courseId) });
        queryClient.invalidateQueries({ queryKey: getGetCourseProgressQueryKey(courseId) });
        queryClient.invalidateQueries({ queryKey: getGetStudentStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
      }
    });
  };

  // Called when content finishes — if quiz exists show Take Quiz, else mark complete
  const handlePartFinished = (partIndex = activePartIndex) => {
    setCompletedPartIndexes((previous) => {
      const next = new Set(previous);
      next.add(partIndex);

      const allPartsFinished = next.size >= (lesson?.parts?.length || 1);
      if (allPartsFinished && !hasQuiz && !isCompleted) {
        handleComplete();
      }

      return next;
    });
  };

  // Called by quiz modal when student passes
  const handleQuizPassed = () => {
    setQuizModalOpen(false);
    refetchBestAttempt();
    handleComplete();
  };

  const handleVideoEnded = () => {
    handlePartFinished();
  };

  if (isCourseLoading || isLessonLoading || !course || !lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b flex items-center px-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48 ml-4" />
        </header>
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="w-full aspect-video rounded-xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full" />
        </main>
      </div>
    );
  }

  if (courseLesson?.isLocked) {
    return null; // Will redirect via useEffect
  }

  const lessonParts = (lesson.parts?.length ?? 0) > 0
    ? lesson.parts
    : [{
        title: lesson.title,
        contentType: lesson.contentType,
        fileUrl: lesson.fileUrl,
        duration: lesson.duration ?? null,
      }];
  const activePart = lessonParts[Math.min(activePartIndex, lessonParts.length - 1)]!;
  const allPartsFinished = completedPartIndexes.size >= lessonParts.length;
  const activePartFinished = completedPartIndexes.has(activePartIndex);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Immersive Header */}
      <header className="h-16 border-b bg-card sticky top-0 z-10 flex items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <div className="flex items-center gap-2 min-w-0 text-sm font-medium">
            <span className="text-muted-foreground hidden md:inline truncate">{course.title}</span>
            <span className="text-muted-foreground hidden md:inline">/</span>
            <span className="truncate max-w-[200px] md:max-w-[400px]">{lesson.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
            </div>
          ) : hasQuiz ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizModalOpen(true)}
              disabled={!allPartsFinished && !quizPassed}
              className={`gap-2 rounded-full ${
                quizPassed
                  ? "border-primary/20 hover:bg-primary/5 hover:text-primary"
                  : "border-amber-400/40 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">
                {quizPassed ? "Retake Quiz" : allPartsFinished ? "Take Quiz" : "Finish Parts"}
              </span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <CheckCircle className="h-4 w-4 opacity-50" />
              <span className="hidden sm:inline">Mark Complete</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto py-6 md:py-8 px-4 md:px-8">
          {/* Player Container */}
          <div className="bg-card border shadow-sm rounded-2xl overflow-hidden mb-8 animate-in fade-in zoom-in-95 duration-500">
            {activePart.contentType === "video" && (() => {
              const resolved = resolveVideo(activePart.fileUrl);
              return (
                <div className="flex flex-col">
                  <div className="aspect-video w-full bg-black relative group">
                    {resolved.kind === "direct" ? (
                      <video
                        key={`${lesson.id}-${activePartIndex}-${activePart.fileUrl}`}
                        ref={videoRef}
                        src={resolved.url}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full object-contain"
                        onEnded={handleVideoEnded}
                        poster={course.thumbnailUrl || undefined}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        key={`${lesson.id}-${activePartIndex}-${resolved.url}`}
                        src={resolved.url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={activePart.title}
                      />
                    )}
                  </div>
                  {/* Embeds (YouTube/Vimeo/unknown) can't reliably signal "ended" across
                      origins, so give the learner a manual way to mark this part finished. */}
                  {resolved.kind !== "direct" && !activePartFinished && (
                    <ManualFinishControl
                      label={hasQuiz ? "I've watched this — continue" : "Mark as watched"}
                      originalUrl={activePart.fileUrl}
                      finished={activePartFinished}
                      onFinish={() => handlePartFinished()}
                    />
                  )}
                </div>
              );
            })()}

            {activePart.contentType === "audio" && (() => {
              const resolved = resolveAudio(activePart.fileUrl);
              return (
                <div className="flex flex-col">
                  <div className="p-12 md:p-24 flex flex-col items-center justify-center bg-slate-900 text-white">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 pulse-ring">
                      <Play className="h-10 w-10 text-primary ml-1" />
                    </div>
                    <h3 className="text-xl font-medium mb-8 text-center">{activePart.title}</h3>
                    {resolved.kind === "direct" ? (
                      <audio
                        key={`${lesson.id}-${activePartIndex}-${activePart.fileUrl}`}
                        ref={audioRef}
                        src={resolved.url}
                        controls
                        controlsList="nodownload"
                        className="w-full max-w-md"
                        onEnded={() => handlePartFinished()}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <iframe
                        key={`${lesson.id}-${activePartIndex}-${resolved.url}`}
                        src={resolved.url}
                        className="w-full max-w-md rounded-lg"
                        height={resolved.url.includes("spotify") ? 152 : 166}
                        allow="autoplay; clipboard-write; encrypted-media"
                        title={activePart.title}
                      />
                    )}
                  </div>
                  {resolved.kind !== "direct" && !activePartFinished && (
                    <ManualFinishControl
                      label={hasQuiz ? "I've listened — continue" : "Mark as listened"}
                      originalUrl={activePart.fileUrl}
                      finished={activePartFinished}
                      onFinish={() => handlePartFinished()}
                    />
                  )}
                </div>
              );
            })()}

            {activePart.contentType === "pdf" && (() => {
              const resolved = resolveDoc(activePart.fileUrl);
              const iframeSrc = resolved.kind === "direct" ? `${resolved.url}#toolbar=0` : resolved.url;
              return (
                <div className="h-[70vh] min-h-[600px] w-full bg-muted flex flex-col">
                  <iframe 
                    src={iframeSrc} 
                    className="flex-1 w-full"
                    title={activePart.title}
                  />
                  {!activePartFinished && (
                    <div className="p-4 bg-card border-t flex items-center justify-between gap-3">
                      <a
                        href={activePart.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          event.preventDefault();
                          openOriginalLink(activePart.fileUrl);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open original link
                      </a>
                      {hasQuiz ? (
                        <Button
                          onClick={() => handlePartFinished()}
                          className="gap-2 shadow-sm"
                        >
                          <ClipboardList className="h-4 w-4" />
                          I've Read This — Take Quiz
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handlePartFinished()} 
                          disabled={completeMutation.isPending}
                          className="gap-2 shadow-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Lesson Metadata & Navigation */}
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{lesson.title}</h1>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>Welcome to lesson {lesson.lessonOrder}. Make sure to go through all the material carefully before proceeding.</p>
              </div>

              {lessonParts.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                  <h2 className="text-sm font-semibold mb-3">Lesson parts</h2>
                  <div className="space-y-3">
                    {lessonParts.map((part, index) => (
                      <button
                        key={`${part.title}-${index}`}
                        type="button"
                        onClick={() => setActivePartIndex(index)}
                        className={`w-full text-left flex gap-3 rounded-lg border p-3 transition-colors ${
                          index === activePartIndex ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                          {completedPartIndexes.has(index) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{part.title}</h3>
                          {part.description && (
                            <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {part.contentType}
                            {part.duration ? ` · ${Math.floor(part.duration / 60)}:${String(part.duration % 60).padStart(2, "0")}` : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz CTA — shown when lesson has a quiz and content type is video/audio (PDF has its own inline button) */}
              {hasQuiz && allPartsFinished && !isCompleted && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/30 px-4 py-3">
                  <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {quizPassed ? "You passed the quiz!" : "This lesson has a quiz"}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      {quizPassed
                        ? "Lesson will be marked complete once you click the button in the header."
                        : `Pass the quiz (${quiz?.passingScore ?? 70}% or above) to complete this lesson.`}
                    </p>
                  </div>
                  {!quizPassed && (
                    <Button size="sm" onClick={() => setQuizModalOpen(true)} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
                      Take Quiz
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex w-full md:w-auto gap-3 shrink-0">
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none h-12 px-6 rounded-full"
                disabled={!prevLesson}
                onClick={() => prevLesson && setLocation(`/courses/${courseId}/lessons/${prevLesson.id}`)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" /> Previous
              </Button>
              
              <Button 
                className="flex-1 md:flex-none h-12 px-6 rounded-full shadow-md"
                disabled={!nextLesson || (nextLesson.isLocked && !isCompleted)}
                onClick={() => nextLesson && setLocation(`/courses/${courseId}/lessons/${nextLesson.id}`)}
              >
                Next <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Quiz Modal */}
      {hasQuiz && quiz && (
        <QuizModal
          open={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          quiz={quiz}
          lessonId={lessonId}
          onPassed={handleQuizPassed}
        />
      )}
    </div>
  );
}

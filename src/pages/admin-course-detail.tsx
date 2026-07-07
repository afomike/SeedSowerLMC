import { useState, useRef } from "react";
import { 
  useGetCourse, 
  useUpdateCourse, 
  useCreateLesson, 
  useUpdateLesson, 
  useDeleteLesson,
  getGetCourseQueryKey
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, Clock, FileText, GripVertical, Headphones, Plus, Trash2, Video, Pencil, Upload, Link as LinkIcon, Loader2, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { getAuthToken } from "@/lib/api-client";
import { QuizEditor } from "@/components/quiz-editor";

const courseUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const lessonSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
});

type UploadMode = "upload" | "url";
type ContentType = "video" | "audio" | "pdf";
type LessonPart = {
  title: string;
  contentType: ContentType;
  fileUrl: string;
  description?: string;
  duration?: number | null;
};

function FileUploadField({
  value,
  onChange,
  contentType,
  hideUrlMode,
}: {
  value: string;
  onChange: (url: string) => void;
  contentType: "video" | "audio" | "pdf" | "image";
  hideUrlMode?: boolean;
}) {
  const [mode, setMode] = useState<UploadMode>(value && value.startsWith("/api/storage") ? "upload" : "url");
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptMap: Record<string, string> = {
    video: "video/mp4,video/webm,video/ogg,video/*",
    audio: "audio/mp3,audio/ogg,audio/wav,audio/*",
    pdf: "application/pdf",
    image: "image/png,image/jpeg,image/webp,image/svg+xml,image/*",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = getAuthToken();
      // Step 1: Request a presigned URL
      const metaRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!metaRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await metaRes.json();

      // Step 2: Upload directly to GCS presigned URL
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      // Step 3: Set the serving URL in the form
      const serveUrl = `/api/storage${objectPath}`;
      onChange(serveUrl);
      setUploadedName(file.name);
      toast({ title: "File uploaded", description: file.name });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload failed", description: (err as Error).message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Upload className="h-4 w-4" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
            mode === "url"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <LinkIcon className="h-4 w-4" /> Enter Link
        </button>
      </div>

      {mode === "upload" ? (
        <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-2 bg-muted/30">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Uploading…</span>
            </div>
          ) : uploadedName || (value && value.startsWith("/api/storage")) ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-primary">
                {uploadedName ?? "File uploaded"}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-muted-foreground underline"
              >
                Replace file
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Click to choose a {contentType} file
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMap[contentType]}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setUploadedName(null);
          }}
          placeholder={`https://example.com/lesson.${contentType === "pdf" ? "pdf" : contentType === "audio" ? "mp3" : "mp4"}`}
        />
      )}
    </div>
  );
}

export default function AdminCourseDetail({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonParts, setLessonParts] = useState<LessonPart[]>([]);

  const { data: course, isLoading } = useGetCourse(courseId, {
    query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) }
  });

  const updateCourseMutation = useUpdateCourse();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const courseForm = useForm<z.infer<typeof courseUpdateSchema>>({
    resolver: zodResolver(courseUpdateSchema),
    values: {
      title: course?.title || "",
      description: course?.description || "",
      thumbnailUrl: course?.thumbnailUrl || "",
    }
  });

  const lessonForm = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
    }
  });

  const onCourseSubmit = (data: z.infer<typeof courseUpdateSchema>) => {
    updateCourseMutation.mutate({ id: courseId, data }, {
      onSuccess: () => {
        toast({ title: "Course updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
      }
    });
  };

  const openAddLesson = () => {
    setEditingLessonId(null);
    lessonForm.reset({ title: "" });
    setLessonParts([{ title: "", contentType: "video", fileUrl: "", description: "", duration: 0 }]);
    setIsLessonModalOpen(true);
  };

  const openEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    lessonForm.reset({
      title: lesson.title,
    });
    setLessonParts(
      lesson.parts?.length
        ? lesson.parts
        : [{
            title: lesson.title,
            contentType: lesson.contentType as ContentType,
            fileUrl: lesson.fileUrl,
            description: "",
            duration: lesson.duration ?? 0,
          }],
    );
    setIsLessonModalOpen(true);
  };

  const onLessonSubmit = (data: z.infer<typeof lessonSchema>) => {
    const parts = lessonParts
      .map((part) => ({
        title: part.title.trim(),
        contentType: part.contentType,
        fileUrl: part.fileUrl.trim(),
        description: part.description?.trim() || undefined,
        duration: part.duration ?? null,
      }))
      .filter((part) => part.title.length > 0 && part.fileUrl.length > 0);

    if (parts.length === 0) {
      toast({
        variant: "destructive",
        title: "Add part content",
        description: "Each lesson needs at least one part with a title and content file.",
      });
      return;
    }

    if (editingLessonId) {
      updateLessonMutation.mutate({ id: editingLessonId, data: { ...data, parts } }, {
        onSuccess: () => {
          toast({ title: "Lesson updated" });
          setIsLessonModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
        }
      });
    } else {
      const nextOrder = (course?.lessons?.length || 0) + 1;
      createLessonMutation.mutate({ 
        courseId, 
        data: { ...data, parts, lessonOrder: nextOrder } 
      }, {
        onSuccess: () => {
          toast({ title: "Lesson created" });
          setIsLessonModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
        }
      });
    }
  };

  const handleDeleteLesson = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    deleteLessonMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Lesson deleted" });
        queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
      }
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "audio": return <Headphones className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const updateLessonPart = (index: number, updates: Partial<LessonPart>) => {
    setLessonParts((parts) =>
      parts.map((part, partIndex) =>
        partIndex === index ? { ...part, ...updates } : part,
      ),
    );
  };

  const addLessonPart = () => {
    setLessonParts((parts) => [...parts, { title: "", contentType: "video", fileUrl: "", description: "", duration: 0 }]);
  };

  const removeLessonPart = (index: number) => {
    setLessonParts((parts) => parts.filter((_, partIndex) => partIndex !== index));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="md:col-span-1 h-[400px]" />
            <Skeleton className="md:col-span-2 h-[500px]" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Course Details Form */}
          <Card className="lg:col-span-1 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Update the basic information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4">
                  <FormField
                    control={courseForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={courseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={courseForm.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail Image</FormLabel>
                        <FormControl>
                          <FileUploadField
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            contentType="image"
                          />
                        </FormControl>
                        {field.value && (
                          <div className="mt-2 aspect-video bg-muted rounded-md overflow-hidden">
                            <img src={field.value} alt="Thumbnail preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-2" disabled={updateCourseMutation.isPending}>
                    {updateCourseMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Curriculum Manager */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Curriculum</h2>
              <Button onClick={openAddLesson} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Lesson
              </Button>
            </div>

            <div className="space-y-3">
              {course?.lessons?.map((lesson, index) => (
                <div key={lesson.id} className="bg-card border rounded-lg p-3 shadow-sm">
                  <div className="flex items-center group">
                    <div className="mr-3 cursor-grab text-muted-foreground opacity-50 hover:opacity-100">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center text-sm font-medium mr-4 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-medium truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          {getContentTypeIcon(lesson.contentType)} {lesson.contentType}
                        </span>
                        {lesson.parts.length > 0 && (
                          <span>{lesson.parts.length} parts</span>
                        )}
                        {lesson.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lesson.duration}m
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id, lesson.title)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {lesson.parts.length > 0 && (
                    <div className="mt-3 ml-14 border-l pl-4 space-y-2">
                      {lesson.parts.map((part, partIndex) => (
                        <div key={`${lesson.id}-${partIndex}`} className="text-sm">
                          <span className="font-medium text-foreground">
                            {partIndex + 1}. {part.title}
                          </span>
                          {part.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {part.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <QuizEditor lessonId={lesson.id} />
                </div>
              ))}

              {course?.lessons?.length === 0 && (
                <div className="text-center p-12 border border-dashed rounded-xl bg-muted/30">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground mb-4">No lessons have been added yet.</p>
                  <Button onClick={openAddLesson} variant="outline">Create your first lesson</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Dialog */}
        <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLessonId ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
            </DialogHeader>
            <Form {...lessonForm}>
              <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={lessonForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Setting up your environment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label>Lesson Parts</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add the content inside each part.
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addLessonPart} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Part
                    </Button>
                  </div>

                  {lessonParts.length === 0 ? (
                    <div className="rounded-md bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
                      No parts yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lessonParts.map((part, index) => (
                        <div key={index} className="rounded-md border bg-background p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                              {index + 1}
                            </div>
                            <Input
                              value={part.title}
                              onChange={(event) => updateLessonPart(index, { title: event.target.value })}
                              placeholder="e.g. How to use paragraphs in HTML5"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLessonPart(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Content Type</Label>
                              <Select
                                value={part.contentType}
                                onValueChange={(value) => updateLessonPart(index, { contentType: value as ContentType })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">
                                    <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Video</span>
                                  </SelectItem>
                                  <SelectItem value="audio">
                                    <span className="flex items-center gap-2"><Headphones className="h-4 w-4" /> Audio</span>
                                  </SelectItem>
                                  <SelectItem value="pdf">
                                    <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> PDF</span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Duration (seconds)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={part.duration ?? 0}
                                onChange={(event) => updateLessonPart(index, { duration: Number(event.target.value) || 0 })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Content File</Label>
                            <FileUploadField
                              value={part.fileUrl}
                              onChange={(fileUrl) => updateLessonPart(index, { fileUrl })}
                              contentType={part.contentType}
                            />
                          </div>
                          <Textarea
                            value={part.description ?? ""}
                            onChange={(event) => updateLessonPart(index, { description: event.target.value })}
                            placeholder="Optional notes, learning points, or explanation"
                            className="min-h-[72px]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button variant="outline" type="button" onClick={() => setIsLessonModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLessonMutation.isPending || updateLessonMutation.isPending}>
                    {editingLessonId ? "Save Changes" : "Add Lesson"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

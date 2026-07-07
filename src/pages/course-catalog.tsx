import { useState } from "react";
import { useListCourses } from "@/lib/api-client";
import { StudentLayout } from "@/components/layout/student-layout";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: courses, isLoading } = useListCourses({
    search: debouncedSearch || undefined
  });

  return (
    <StudentLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Training Catalogue</h1>
            <p className="text-muted-foreground">Explore our discipleship and kingdom advocacy training modules.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search training modules..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setDebouncedSearch(search);
              }}
              onBlur={() => setDebouncedSearch(search)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-[320px] rounded-xl" />
            ))}
          </div>
        ) : courses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              {search ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {search ? "No training modules found" : "No modules available yet"}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {search
                ? `We couldn't find any training modules matching "${search}". Try a different search.`
                : "Training modules will appear here once they are published by the ministry team."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses?.map((course) => (
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
        )}
      </div>
    </StudentLayout>
  );
}

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  lessonCount: number;
  enrollmentCount?: number;
  progressPercent?: number;
  isCompleted?: boolean;
  isEnrolled?: boolean;
  href: string;
}

export function CourseCard({
  title,
  description,
  thumbnailUrl,
  lessonCount,
  enrollmentCount,
  progressPercent,
  isCompleted,
  isEnrolled,
  href,
}: CourseCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover-elevate">
        <div className="aspect-video w-full relative bg-muted overflow-hidden">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
              <BookOpen className="h-12 w-12 opacity-20" />
            </div>
          )}
          
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-green-500/90 hover:bg-green-500 text-white border-none shadow-sm gap-1 backdrop-blur-sm">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-end">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{lessonCount} lessons</span>
            </div>
            {enrollmentCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{enrollmentCount} students</span>
              </div>
            )}
          </div>
          
          {isEnrolled && progressPercent !== undefined && (
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between text-xs font-medium">
                <span>Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

import { useListUsers, useUpdateUserStatus, getListUsersQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function AdminStudents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: users, isLoading } = useListUsers();
  const updateStatusMutation = useUpdateUserStatus();

  const handleToggleStatus = (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const action = newStatus === "suspended" ? "suspend" : "activate";
    
    if (!confirm(`Are you sure you want to ${action} ${name}'s account?`)) return;

    updateStatusMutation.mutate({ id, data: { status: newStatus as "active" | "suspended" } }, {
      onSuccess: () => {
        toast({ title: `Student account ${newStatus}` });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: "Could not change student status",
        });
      }
    });
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "S";
  };

  // Filter only students to show in list
  const students = users?.filter(u => u.role === "student") || [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Student Management</h1>
          <p className="text-muted-foreground">View and manage enrolled students.</p>
        </div>

        <Card className="border-muted shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={student.avatarUrl || ""} alt={student.fullname} />
                            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(student.fullname)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{student.fullname}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={student.status === "active" ? "secondary" : "destructive"} 
                          className={student.status === "active" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium">{student.enrolledCourses} enrolled</span>
                          <span className="text-xs text-muted-foreground">{student.completedLessons} lessons done</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant={student.status === "active" ? "outline" : "default"} 
                          size="sm"
                          className="gap-2"
                          onClick={() => handleToggleStatus(student.id, student.status, student.fullname)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {student.status === "active" ? (
                            <><ShieldAlert className="h-3.5 w-3.5" /> Suspend</>
                          ) : (
                            <><ShieldCheck className="h-3.5 w-3.5" /> Activate</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

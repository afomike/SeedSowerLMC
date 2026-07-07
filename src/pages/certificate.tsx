import { useGetCertificate, getGetCertificateQueryKey } from "@/lib/api-client";
import { StudentLayout } from "@/components/layout/student-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Download, Printer, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";

export default function Certificate({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const printRef = useRef<HTMLDivElement>(null);

  const { data: certificate, isLoading, isError } = useGetCertificate(courseId, {
    query: {
      enabled: !!courseId,
      queryKey: getGetCertificateQueryKey(courseId),
      retry: false
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto mt-8 flex flex-col items-center">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="w-full aspect-[1.414/1] rounded-none border-[16px] border-muted" />
        </div>
      </StudentLayout>
    );
  }

  if (isError || !certificate) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto mt-20 text-center space-y-6 bg-card border rounded-2xl p-10 shadow-sm">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Certificate Unavailable</h1>
          <p className="text-muted-foreground">
            We couldn't find a certificate for this training module. Please ensure you have completed all lessons before claiming your certificate.
          </p>
          <Link href={`/courses/${courseId}`}>
            <Button>Return to Module</Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate of Completion</h1>
            <p className="text-muted-foreground mt-1">Well done — you have completed this training module. To God be the glory!</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint} className="gap-2 bg-card">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button onClick={handlePrint} className="gap-2 shadow-sm">
              <Download className="h-4 w-4" /> Save as PDF
            </Button>
          </div>
        </div>

        {/* Certificate Rendering Area */}
        <div className="bg-slate-100 dark:bg-slate-900 p-4 md:p-8 rounded-xl flex justify-center overflow-x-auto print:p-0 print:bg-white">
          <div 
            ref={printRef}
            className="relative w-[1000px] h-[707px] min-w-[1000px] bg-white text-slate-900 flex flex-col items-center justify-center border-[20px] border-double border-slate-200 p-16 shadow-xl print:shadow-none"
            style={{ 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-transparent pointer-events-none"></div>
            <div className="absolute top-8 left-8 w-32 h-32 border-t-4 border-l-4 border-primary/20"></div>
            <div className="absolute top-8 right-8 w-32 h-32 border-t-4 border-r-4 border-primary/20"></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 border-b-4 border-l-4 border-primary/20"></div>
            <div className="absolute bottom-8 right-8 w-32 h-32 border-b-4 border-r-4 border-primary/20"></div>
            
            {/* Header */}
            <div className="text-center space-y-6 mb-12 z-10">
              <Award className="h-20 w-20 mx-auto text-primary" strokeWidth={1} />
              <h1 className="text-5xl font-serif font-bold tracking-widest text-slate-800 uppercase">
                Certificate of Completion
              </h1>
              <p className="text-xl tracking-widest text-slate-500 uppercase">
                This is to certify that
              </p>
            </div>

            {/* Name */}
            <div className="text-center mb-10 border-b border-slate-300 pb-4 px-12 z-10 min-w-[500px]">
              <h2 className="text-6xl font-serif text-primary italic">
                {certificate.studentName}
              </h2>
            </div>

            {/* Module Details */}
            <div className="text-center space-y-6 mb-16 z-10 max-w-[700px]">
              <p className="text-xl text-slate-600">
                has faithfully completed the training module
              </p>
              <h3 className="text-4xl font-bold text-slate-800 leading-tight">
                {certificate.courseTitle}
              </h3>
            </div>

            {/* Footer / Signatures */}
            <div className="w-full flex justify-between items-end px-12 mt-auto z-10">
              <div className="text-center">
                <div className="w-48 border-b border-slate-400 mb-2"></div>
                <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">Date</p>
                <p className="text-lg font-serif mt-1">{new Date(certificate.completedAt).toLocaleDateString()}</p>
              </div>
              
              <div className="text-center">
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative mx-auto mb-4">
                  <div className="absolute inset-1 rounded-full border border-primary/30 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-primary/40" />
                  </div>
                  <div className="absolute -rotate-12 text-[10px] font-bold text-primary tracking-widest uppercase">Verified</div>
                </div>
                <p className="text-xs text-slate-400 font-mono">ID: {certificate.certificateNumber}</p>
              </div>

              <div className="text-center">
                <div className="w-48 border-b border-slate-400 mb-2 h-12 flex items-end justify-center pb-2">
                  <span className="font-serif italic text-2xl text-slate-700">DAKAT</span>
                </div>
                <p className="text-sm font-medium tracking-wider text-slate-500 uppercase">Discipleship And Kingdom Advocacy Training</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

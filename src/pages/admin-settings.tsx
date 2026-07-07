import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, CheckCircle, Trash2, ImageIcon, MessageSquareText } from "lucide-react";
import { getAuthToken } from "@/lib/api-client";

async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function saveSettings(updates: Record<string, string>): Promise<void> {
  const token = getAuthToken();
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to save settings");
}

async function uploadImage(file: File): Promise<string> {
  const token = getAuthToken();
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

  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Upload failed");
  return `/api/storage${objectPath}`;
}

function LogoUpload({
  currentUrl,
  onSave,
}: {
  currentUrl: string | undefined;
  onSave: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onSave(url);
      toast({ title: "Logo uploaded successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload failed", description: (err as Error).message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {currentUrl ? (
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
            <img src={currentUrl} alt="Ministry logo" className="h-full w-full object-contain p-1" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Logo is set and showing in the navbar.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Replace Logo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onSave("")}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/30 space-y-3">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Uploading logo…</span>
            </div>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                PNG, SVG, or JPEG recommended. Will appear in the navbar.
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" /> Upload Logo
              </Button>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Save failed", description: (err as Error).message });
    },
  });

  const handleLogoSave = (url: string) => {
    saveMutation.mutate({ logoUrl: url });
  };

  const handleSiteNameSave = (name: string) => {
    saveMutation.mutate({ siteName: name });
  };

  const handleWelcomeMessageSave = (msg: string) => {
    saveMutation.mutate({ welcomeMessage: msg });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your ministry platform branding.</p>
        </div>

        {/* Logo */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ministry Logo</CardTitle>
            <CardDescription>
              Upload your ministry's logo. It will appear in the navigation bar across the entire platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <LogoUpload
                currentUrl={settings?.logoUrl}
                onSave={handleLogoSave}
              />
            )}
          </CardContent>
        </Card>

        {/* Display Name */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Platform Name</CardTitle>
            <CardDescription>
              Shown as the text name beside the logo in the navbar. Defaults to "DAKAT" if not set.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SiteNameField
              defaultValue={settings?.siteName ?? ""}
              onSave={handleSiteNameSave}
              saving={saveMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Welcome / About Message */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Welcome Message</CardTitle>
                <CardDescription className="mt-0.5">
                  A greeting, Bible verse, or ministry note shown to all members at the top of their dashboard. Leave blank to hide it.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <WelcomeMessageField
                defaultValue={settings?.welcomeMessage ?? ""}
                onSave={handleWelcomeMessageSave}
                saving={saveMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function SiteNameField({
  defaultValue,
  onSave,
  saving,
}: {
  defaultValue: string;
  onSave: (v: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Label htmlFor="siteName" className="sr-only">Platform name</Label>
        <Input
          id="siteName"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="DAKAT"
        />
      </div>
      <Button onClick={() => onSave(value)} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </Button>
    </div>
  );
}

function WelcomeMessageField({
  defaultValue,
  onSave,
  saving,
}: {
  defaultValue: string;
  onSave: (v: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const charLimit = 500;

  return (
    <div className="space-y-3">
      <Textarea
        id="welcomeMessage"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`e.g. "Welcome to DAKAT! 'Go therefore and make disciples of all nations…' — Matthew 28:19. We're glad you're here."`}
        className="min-h-[120px] resize-y"
        maxLength={charLimit}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value.length}/{charLimit} characters · Supports line breaks
        </p>
        <div className="flex gap-2">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => { setValue(""); onSave(""); }}
              disabled={saving}
            >
              Clear
            </Button>
          )}
          <Button size="sm" onClick={() => onSave(value)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Message
          </Button>
        </div>
      </div>
    </div>
  );
}

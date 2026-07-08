import { useMutation, useQuery } from "@tanstack/react-query";

let baseUrl: string | null = null;
let authTokenGetter: (() => string | null) | null = null;

export type User = {
  id?: string;
  fullname?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
  enrolledCourses?: number;
  completedLessons?: number;
  [key: string]: any;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  lessonCount?: number;
  enrollmentCount?: number;
  completionRate?: number;
  isEnrolled?: boolean;
  lessons?: Array<{
    id: string;
    title: string;
    contentType?: string;
    isCompleted?: boolean;
    isLocked?: boolean;
    duration?: number | null;
    parts?: Array<Record<string, any>>;
  }>;
  [key: string]: any;
};

export type Lesson = {
  id: string;
  title: string;
  contentType?: string;
  fileUrl?: string;
  description?: string;
  duration?: number | null;
  parts?: Array<Record<string, any>>;
  [key: string]: any;
};

export type ApiError = {
  message?: string;
  error?: string;
  data?: Record<string, any>;
};

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!baseUrl) return normalizedPath;
  return `${baseUrl}${normalizedPath}`;
}

function getAuthHeader(): Record<string, string> {
  const token = authTokenGetter?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");

  const isJsonBody = init.body && typeof init.body === "string";
  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const authHeaders = getAuthHeader();
  Object.entries(authHeaders).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const text = await response.text();
  let payload: any = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.data?.error || "Request failed";
    const error: ApiError = { message, data: payload };
    throw error;
  }

  return payload as T;
}

export function setBaseUrl(url: string | null): void {
  baseUrl = url?.replace(/\/$/, "") ?? null;
}

export function setAuthTokenGetter(getter: () => string | null): void {
  authTokenGetter = getter;
}

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const storage = safeStorage();
  return storage?.getItem("elearn_token") ?? null;
}

export function setAuthToken(token: string): void {
  const storage = safeStorage();
  storage?.setItem("elearn_token", token);
}

export function clearAuthToken(): void {
  const storage = safeStorage();
  storage?.removeItem("elearn_token");
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
setBaseUrl(apiBaseUrl || null);
setAuthTokenGetter(getAuthToken);

function buildQueryOptions<T>(defaultKey: unknown[], options?: { query?: Record<string, any> }, queryFn?: () => Promise<T>) {
  const { queryKey, ...queryOptions } = options?.query ?? {};
  return {
    queryKey: queryKey ?? defaultKey,
    queryFn,
    ...queryOptions,
  };
}

export const getGetMeQueryKey = () => ["auth", "me"];
export function useGetMe(options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getGetMeQueryKey(), options, () => apiRequest<User>("/api/auth/me")),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, any> }) =>
      apiRequest<{ token: string; user: User }>('/api/auth/login', {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, any> }) =>
      apiRequest<{ token: string; user: User }>('/api/auth/register', {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, any> }) =>
      apiRequest<User>("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

export const getListCoursesQueryKey = () => ["courses"];
export function useListCourses(params?: { search?: string }, options?: { query?: Record<string, any> }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  const queryString = query.toString() ? `?${query.toString()}` : "";

  return useQuery({
    ...buildQueryOptions(getListCoursesQueryKey(), options, () => apiRequest<Course[]>(`/api/courses${queryString}`)),
  });
}

export function useCreateCourse() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, any> }) =>
      apiRequest<Course>("/api/courses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteCourse() {
  return useMutation({
    mutationFn: ({ id }: { id: string }) => apiRequest(`/api/courses/${id}`, { method: "DELETE" }),
  });
}

export const getGetCourseQueryKey = (id: string) => ["courses", id];
export function useGetCourse(id: string, options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getGetCourseQueryKey(id), options, () => apiRequest<Course>(`/api/courses/${id}`)),
  });
}

export const getGetLessonQueryKey = (id: string) => ["lessons", id];
export function useGetLesson(id: string, options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getGetLessonQueryKey(id), options, () => apiRequest<Lesson>(`/api/lessons/${id}`)),
  });
}

export function useCompleteLesson() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: Record<string, any> }) =>
      apiRequest(`/api/lessons/${id}/complete`, {
        method: "POST",
        body: JSON.stringify(data ?? {}),
      }),
  });
}

export function useUpdateLessonProgress() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      apiRequest(`/api/lessons/${id}/progress`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

export const getListLessonsQueryKey = (courseId: string) => ["courses", courseId, "lessons"];
export const getGetCourseProgressQueryKey = (courseId: string) => ["courses", courseId, "progress"];

export function useUpdateCourse() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      apiRequest<Course>(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

export function useCreateLesson() {
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Record<string, any> }) =>
      apiRequest<Lesson>(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateLesson() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      apiRequest<Lesson>(`/api/lessons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteLesson() {
  return useMutation({
    mutationFn: ({ id }: { id: string }) => apiRequest(`/api/lessons/${id}`, { method: "DELETE" }),
  });
}

export function useEnrollCourse() {
  return useMutation({
    mutationFn: ({ id }: { id: string }) => apiRequest(`/api/courses/${id}/enroll`, { method: "POST" }),
  });
}

export const getGetMyProgressQueryKey = () => ["student", "progress"];
export function useGetMyProgress(options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getGetMyProgressQueryKey(), options, () => apiRequest(`/api/student/progress`)),
  });
}

export const getGetStudentStatsQueryKey = () => ["student", "stats"];
export function useGetStudentStats(options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getGetStudentStatsQueryKey(), options, () => apiRequest(`/api/student/stats`)),
  });
}

export const getListUsersQueryKey = () => ["admin", "users"];
export function useListUsers(options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getListUsersQueryKey(), options, () => apiRequest(`/api/admin/users`)),
  });
}

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      apiRequest(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

export function useGetAdminStats(options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(["admin", "stats"], options, () => apiRequest(`/api/admin/stats`)),
  });
}

export function useGetPopularCourses(options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(["admin", "popular-courses"], options, () => apiRequest(`/api/admin/popular-courses`)),
  });
}

export const getGetCertificateQueryKey = (courseId: string) => ["certificates", courseId];
export function useGetCertificate(courseId: string, options?: { query?: Record<string, any> }) {
  return useQuery({
    ...buildQueryOptions(getGetCertificateQueryKey(courseId), options, () => apiRequest(`/api/certificates/${courseId}`)),
  });
}

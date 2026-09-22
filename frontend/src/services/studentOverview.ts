import { api } from './api.js';

export interface StudentMaterial {
  id: number;
  title: string;
  description?: string | null;
  type: 'pdf' | 'video' | 'gdrive_video' | 'upload_video';
  durationMinutes: number;
  url?: string | null;
  order: number;
  completed: boolean;
}

export interface StudentCourse {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  instructor?: string | null;
  progress: number;
  materials: StudentMaterial[];
  discussions: Array<{ id: number; title: string; content?: string | null; author: string; authorRole: string; avatar?: string | null; replyCount: number; createdAt: string }>;
}

export interface StudentOverview {
  user: { id: number; nama: string; email: string; foto?: string | null; role: string; department?: { nama_jurusan: string } | null; wilayah?: { nama_wilayah: string } | null; cabang?: { nama_cabang: string } | null };
  courses: StudentCourse[];
  events: Array<{ id: number; courseId: number; courseTitle?: string; title: string; description?: string | null; type: string; start: string; end?: string | null; link?: string | null }>;
  analytics: { activeCourses: number; averageProgress: number; totalMaterials: number; completedMaterials: number };
  generatedAt: string;
}

export const getStudentOverview = async () => (await api.get<StudentOverview>('/student/overview')).data;

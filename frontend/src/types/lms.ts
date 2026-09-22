export interface CourseModule {
  id: number;
  title: string;
  description: string;
  emoji: string;
  bgColor: string; // e.g. '#fadad1'
  duration?: string;
  active?: boolean;
}

export interface PlaylistItem {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'file' | 'audio';
  url?: string;
  isPlaying?: boolean;
}

export interface ChatMessageItem {
  id: number;
  sender: string;
  senderRole: 'instructor' | 'student';
  avatar: string;
  message: string;
  time: string;
  reactions?: Array<{ emoji: string; avatar?: string }>;
  viewsCount?: number;
  isDelivered?: boolean;
}

export interface CalendarEventItem {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: 'live_session' | 'assignment' | 'webinar' | 'critique';
  instructor?: string;
  cohort: string;
  colorBg: string;
  colorText: string;
}

export interface DiscussionThreadItem {
  id: number;
  title: string;
  channel: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  replyCount: number;
  likesCount: number;
  tags: string[];
  pinned?: boolean;
  replies?: Array<{
    id: number;
    author: string;
    authorRole: string;
    authorAvatar: string;
    timeAgo: string;
    content: string;
  }>;
}

export interface AnalyticsMetricItem {
  id: string;
  title: string;
  progressPercent: number;
  category: string;
  benchmarkScore: string;
  color: string;
}

export interface LibraryAssetItem {
  id: number;
  title: string;
  category: '3d_models' | 'textures' | 'linework' | 'handouts';
  fileFormat: string;
  fileSize: string;
  downloadsCount: number;
  previewUrl?: string;
  author: string;
  updatedAt: string;
}

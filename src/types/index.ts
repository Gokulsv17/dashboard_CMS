export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived';
  thumbnail?: string;
  readTime: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  author: string;
  uploadedAt: string;
  duration: string;
  views: number;
  status: 'published' | 'draft' | 'processing';
  thumbnail?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface DashboardStats {
  totalBlogs: number;
  totalVideos: number;
  totalViews: number;
  totalUsers: number;
}
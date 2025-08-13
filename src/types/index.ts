export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived' | boolean;
  thumbnail?: string;
  readTime: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  author: string;
  uploadedAt: string;
  duration: string;
  thumbnail?: string;
  thumbnailFile?: File;
  status: 'published' | 'draft' | 'processing';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (email: string,currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  isInitializing: boolean;
}

export interface DashboardStats {
  totalBlogs: number;
  totalVideos: number;
  totalViews: number;
  totalUsers: number;
}
import { Blog, Video, DashboardStats } from '../types';

// In-memory storage for demo purposes
// In a real app, this would be handled by a state management solution like Redux or Zustand
let blogIdCounter = 7;
let videoIdCounter = 4;

// TODO: Replace with actual API calls
// API Integration Points:
// 1. GET /api/blogs - Fetch all blogs
// 2. GET /api/videos - Fetch all videos  
// 3. GET /api/dashboard/stats - Fetch dashboard statistics
// 4. POST /api/auth/login - User authentication
// 5. POST /api/auth/forgot-password - Password reset

export const mockDashboardStats: DashboardStats = {
  totalBlogs: 248,
  totalVideos: 156,
  totalViews: 89543,
  totalUsers: 1247
};

export let mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'How AI Transformed Fortune 500 Operations: ',
    excerpt: 'Learn how to build modern web applications using React 18 with TypeScript for better type safety and developer experience.',
    description: 'A few years ago, AI was mostly stuck in innovation labs and boardroom decks ',
    author: 'Sarah Johnson',
    publishedAt: '2024-01-15T10:30:00Z',
    status: 'published',
    thumbnail: 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    readTime: 8
  },
  {
    id: '2',
    title: 'Advanced CSS Grid Techniques for Modern Layouts',
    excerpt: 'Explore advanced CSS Grid features and techniques to create complex, responsive layouts with ease.',
    description: 'Dive deep into advanced CSS Grid properties such as `grid-template-areas`, `auto-fit`, `auto-fill`, and nested grids. This post includes real-world layout examples, tips for combining Grid with Flexbox, and tricks for responsive design. Ideal for frontend developers who want more control over layout design.',
    author: 'Michael Chen',
    publishedAt: '2024-01-12T14:15:00Z',
    status: 'published',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    readTime: 12
  },
  {
    id: '3',
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Best practices for creating robust and scalable REST APIs using Node.js and Express.',
    description: 'Learn how to architect scalable and maintainable REST APIs with Node.js and Express. This guide includes layered architecture, middleware usage, error handling, rate limiting, and integrating MongoDB. A great resource for backend developers working on production-level API services.',
    author: 'Emily Rodriguez',
    publishedAt: '2024-01-10T09:45:00Z',
    status: 'draft',
    thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    readTime: 15
  },
  {
    id: '4',
    title: 'Getting Started with React 18 and TypeScript',
    excerpt: 'Learn how to build modern web applications using React 18 with TypeScript for better type safety and developer experience.',
    description: 'This blog walks you through setting up a React 18 project with TypeScript from scratch. It covers essential tooling, folder structure, best practices for type safety, and integrating modern React features like concurrent rendering and Suspense. Perfect for beginners and intermediate developers looking to future-proof their codebase.',
    author: 'Sarah Johnson',
    publishedAt: '2024-01-15T10:30:00Z',
    status: 'published',
    thumbnail: 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    readTime: 8
  },
  {
    id: '5',
    title: 'Advanced CSS Grid Techniques for Modern Layouts',
    excerpt: 'Explore advanced CSS Grid features and techniques to create complex, responsive layouts with ease.',
    description: 'Dive deep into advanced CSS Grid properties such as `grid-template-areas`, `auto-fit`, `auto-fill`, and nested grids. This post includes real-world layout examples, tips for combining Grid with Flexbox, and tricks for responsive design. Ideal for frontend developers who want more control over layout design.',
    author: 'Michael Chen',
    publishedAt: '2024-01-12T14:15:00Z',
    status: 'published',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    readTime: 12
  },
  {
    id: '6',
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Best practices for creating robust and scalable REST APIs using Node.js and Express.',
    description: 'Learn how to architect scalable and maintainable REST APIs with Node.js and Express. This guide includes layered architecture, middleware usage, error handling, rate limiting, and integrating MongoDB. A great resource for backend developers working on production-level API services.',
    author: 'Emily Rodriguez',
    publishedAt: '2024-01-10T09:45:00Z',
    status: 'draft',
    thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    readTime: 15
  },
];



export let mockVideos: Video[] = [
  {
    id: '1',
    title: 'Fortune 500 Operations',
    description: 'A comprehensive guide to React Hooks including useState, useEffect, and custom hooks.',
    author: 'David Kim',
    uploadedAt: '2024-01-14T16:20:00Z',
    duration: '28:45',
    views: 15420,
    status: 'published',
    thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
  },
  {
    id: '2',
    title: 'Design Systems in Figma',
    description: 'Learn how to create and maintain design systems using Figma for consistent UI design.',
    author: 'Lisa Wang',
    uploadedAt: '2024-01-13T11:10:00Z',
    duration: '34:12',
    views: 8765,
    status: 'published',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
  },
  {
    id: '3',
    title: 'JavaScript ES2024 New Features',
    description: 'Explore the latest JavaScript features and how they can improve your development workflow.',
    author: 'Alex Turner',
    uploadedAt: '2024-01-11T13:30:00Z',
    duration: '22:18',
    views: 12340,
    status: 'processing',
    thumbnail: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
  }
];

// CRUD operations for blogs
export const addBlog = (blogData: Omit<Blog, 'id'>) => {
  const newBlog: Blog = {
    ...blogData,
    id: (blogIdCounter++).toString()
  };
  mockBlogs.unshift(newBlog);
  return newBlog;
};

export const updateBlog = (id: string, blogData: Partial<Blog>) => {
  const index = mockBlogs.findIndex(blog => blog.id === id);
  if (index !== -1) {
    mockBlogs[index] = { ...mockBlogs[index], ...blogData };
    return mockBlogs[index];
  }
  return null;
};

export const deleteBlog = (id: string) => {
  const index = mockBlogs.findIndex(blog => blog.id === id);
  if (index !== -1) {
    mockBlogs.splice(index, 1);
    return true;
  }
  return false;
};

export const getBlogById = (id: string) => {
  return mockBlogs.find(blog => blog.id === id) || null;
};

// CRUD operations for videos
export const addVideo = (videoData: Omit<Video, 'id'>) => {
  const newVideo: Video = {
    ...videoData,
    id: (videoIdCounter++).toString()
  };
  mockVideos.unshift(newVideo);
  return newVideo;
};

export const updateVideo = (id: string, videoData: Partial<Video>) => {
  const index = mockVideos.findIndex(video => video.id === id);
  if (index !== -1) {
    mockVideos[index] = { ...mockVideos[index], ...videoData };
    return mockVideos[index];
  }
  return null;
};

export const deleteVideo = (id: string) => {
  const index = mockVideos.findIndex(video => video.id === id);
  if (index !== -1) {
    mockVideos.splice(index, 1);
    return true;
  }
  return false;
};

export const getVideoById = (id: string) => {
  return mockVideos.find(video => video.id === id) || null;
};
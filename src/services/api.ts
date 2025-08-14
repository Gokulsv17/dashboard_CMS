// API Configuration and Service Layer
const API_BASE_URL = 'http://localhost:5000/api';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  
  message: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Blog API Types
export interface BlogApiResponse {
  _id: string;
  title: string;
  excerpt: string;
  description: string;
  author: string;
  publishedAt: string;
  status: boolean;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCreateRequest {
  title: string;
  excerpt: string;
  description: string;
  author: string;
  publishedAt: string;
  status: boolean;
  thumbnail?: string;
  thumbnailFile?: File;
  thumbnailBase64?: string;
  contentBlocks?: ContentBlock[];
  templateData?: any;
  detailedContentSections?: any[];
  subheadingGroups?: any[];
}

export interface ContentBlock {
  id: string;
  type: 'heading' | 'subheading' | 'content' | 'image';
  value: string;
  file?: File;
  order: number;
}

// API Service Class
class ApiService {

    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        try{
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Login failed' };
            }

            const data: LoginResponse = await response.json();
            return { success: true, data, message: 'Login successful' };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
        }
    }

    async logout (): Promise<ApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Logout failed' };
            }

            return { success: true, message: 'Logout successful' };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
        }
    }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refreshToken: localStorage.getItem('refreshToken')}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Token refresh failed' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Token refreshed successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async changePassword(): Promise<ApiResponse<{email: string; currentPassword: string; newPassword: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: localStorage.getItem('email'),currentPassword: localStorage.getItem('currentPassword'), newPassword: localStorage.getItem('newPassword')}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Password change failed' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Password changed successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Blog API Methods
  async getBlogs(): Promise<ApiResponse<BlogApiResponse[]>> {
    try {
      // console.log('Making GET request to blogs API...');
      const token = localStorage.getItem('accessToken');
      // console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      // console.log('Response status:', response.status);
      // console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', errorText);
        const errorData = await response.json();
        console.error('Error data:', errorData);
        return { success: false, error: errorData.message || 'Failed to fetch blogs' };
      }

      const data = await response.json();
      // console.log('Success response data:', data);
      return { success: true, data, message: 'Blogs fetched successfully' };
    } catch (error) {
      console.error('API Service catch error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async getBlogById(id: string): Promise<ApiResponse<BlogApiResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to fetch blog' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Blog fetched successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async createBlog(blogData: BlogCreateRequest): Promise<ApiResponse<BlogApiResponse>> {
    try {
      // Convert thumbnail to base64 if file is provided
      let thumbnailBase64 = '';
      if (blogData.thumbnailFile) {
        thumbnailBase64 = await this.convertFileToBase64(blogData.thumbnailFile);
      }

      // Prepare JSON payload
      const payload = {
        title: blogData.title,
        excerpt: blogData.excerpt,
        description: blogData.description,
        author: blogData.author,
        publishedAt: blogData.publishedAt,
        status: blogData.status,
        thumbnail: thumbnailBase64,
        templateData: blogData.templateData,
        detailedContentSections: blogData.detailedContentSections,
        subheadingGroups: blogData.subheadingGroups
      };

      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to create blog' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Blog created successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async updateBlog(id: string, blogData: Partial<BlogCreateRequest>): Promise<ApiResponse<BlogApiResponse>> {
    try {
      // Convert thumbnail to base64 if file is provided
      let thumbnailBase64 = '';
      if (blogData.thumbnailFile) {
        thumbnailBase64 = await this.convertFileToBase64(blogData.thumbnailFile);
      }

      // Prepare JSON payload
      const payload: any = {};
      if (blogData.title) payload.title = blogData.title;
      if (blogData.excerpt) payload.excerpt = blogData.excerpt;
      if (blogData.description) payload.description = blogData.description;
      if (blogData.author) payload.author = blogData.author;
      if (blogData.publishedAt) payload.publishedAt = blogData.publishedAt;
      if (blogData.status !== undefined) payload.status = blogData.status;
      if (thumbnailBase64) payload.thumbnail = thumbnailBase64;
      if (blogData.templateData) payload.templateData = blogData.templateData;
      if (blogData.detailedContentSections) payload.detailedContentSections = blogData.detailedContentSections;
      if (blogData.subheadingGroups) payload.subheadingGroups = blogData.subheadingGroups;

      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to update blog' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Blog updated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async updateBlogStatus(id: string, status: boolean): Promise<ApiResponse<BlogApiResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to update blog status' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Blog status updated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async deleteBlog(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to delete blog' };
      }

      return { success: true, message: 'Blog deleted successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // User Profile Methods
  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to fetch profile' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Profile fetched successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  async updateUserProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to update profile' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Profile updated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Helper method to convert file to base64
  private async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert file to base64'));
      };
      reader.readAsDataURL(file);
    });
  }
}


export const apiService = new ApiService();
export default apiService;
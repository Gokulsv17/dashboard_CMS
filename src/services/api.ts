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
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// API Service Class
class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login API Error:', data);
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    return this.handleResponse(response);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    return this.handleResponse(response);
  }

  async logout(): Promise<ApiResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ refreshToken })
    });

    return this.handleResponse(response);
  }

  async changePassword(data: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // Blog APIs (to be implemented in backend)
  async getBlogs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/blogs?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getBlogById(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async createBlog(blogData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: blogData
    });

    return this.handleResponse(response);
  }

  async updateBlog(id: string, blogData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: blogData
    });

    return this.handleResponse(response);
  }

  async deleteBlog(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async updateBlogStatus(id: string, status: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    return this.handleResponse(response);
  }

  // Video APIs (to be implemented in backend)
  async getVideos(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/videos?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getVideoById(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async createVideo(videoData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: videoData
    });

    return this.handleResponse(response);
  }

  async updateVideo(id: string, videoData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: videoData
    });

    return this.handleResponse(response);
  }

  async deleteVideo(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async updateVideoStatus(id: string, status: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/videos/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    return this.handleResponse(response);
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // File Upload APIs
  async uploadImage(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  async uploadVideo(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('video', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  // Search API
  async search(query: string, type?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (type) queryParams.append('type', type);

    const response = await fetch(`${API_BASE_URL}/search?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;
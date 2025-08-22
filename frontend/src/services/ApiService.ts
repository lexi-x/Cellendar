import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private static async getAuthToken(): Promise<string | null> {
    try {
      const sessionJson = await AsyncStorage.getItem('auth_session');
      if (!sessionJson) return null;
      
      const session = JSON.parse(sessionJson);
      return session.access_token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Culture API methods
  static async getCultures(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/cultures');
  }

  static async getCulture(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/cultures/${id}`);
  }

  static async createCulture(cultureData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/cultures', {
      method: 'POST',
      body: JSON.stringify(cultureData),
    });
  }

  static async updateCulture(id: string, cultureData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/cultures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cultureData),
    });
  }

  static async deleteCulture(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/cultures/${id}`, {
      method: 'DELETE',
    });
  }

  static async incrementPassage(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/cultures/${id}/passage`, {
      method: 'POST',
    });
  }

  // Task API methods
  static async getTasks(params?: { culture_id?: string; completed?: boolean }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.culture_id) queryParams.append('culture_id', params.culture_id);
    if (params?.completed !== undefined) queryParams.append('completed', params.completed.toString());
    
    const queryString = queryParams.toString();
    return this.makeRequest(`/tasks${queryString ? `?${queryString}` : ''}`);
  }

  static async getTask(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/tasks/${id}`);
  }

  static async createTask(taskData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  static async updateTask(id: string, taskData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  static async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  static async completeTask(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/tasks/${id}/complete`, {
      method: 'POST',
    });
  }

  static async getTodaysTasks(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/tasks/today/list');
  }

  static async getOverdueTasks(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/tasks/overdue/list');
  }

  // Notification settings API methods
  static async getNotificationSettings(): Promise<ApiResponse<any>> {
    return this.makeRequest('/notifications/settings');
  }

  static async updateNotificationSettings(settings: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export default ApiService;

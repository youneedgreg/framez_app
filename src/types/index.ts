export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
  }
  
  export interface Post {
    id: string;
    user_id: string;
    author_name: string;
    content: string;
    image_url?: string;
    created_at: string;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }
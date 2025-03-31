export interface User {
    id: string;
    username: string;
    avatarUrl: string;
    email: string;
    githubId: string;
    createdAt: Date;
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: 'dark';
    categoriesOrder: string[];
    defaultView: 'list' | 'grid';
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
}
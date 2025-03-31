export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: number;
    userId: string;
    category?: 'frontend' | 'backend' | 'feature' | 'bug';
    priority: 'low' | 'medium' | 'high';
}
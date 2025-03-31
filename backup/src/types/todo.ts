export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    priority: 'low' | 'medium' | 'high';
    category?: string;
    dueDate?: Date;
}

export type TodoFilter = {
    status?: 'all' | 'active' | 'completed';
    priority?: Todo['priority'];
    category?: string;
    search?: string;
};
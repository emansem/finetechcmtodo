import { Timestamp } from 'firebase/firestore';

export type TodoStatus = 'todo' | 'in_progress' | 'completed' | 'on_hold';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: 'admin' | 'user';
    lastActive: Timestamp;
    createdAt: Timestamp;
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
        categoriesOrder?: string[];
        defaultView?: 'list' | 'grid';
    };
}

export interface Todo {
    id: string;
    title: string;
    description: string;
    status: TodoStatus;
    priority: TodoPriority;
    dueDate?: Timestamp;
    assignedTo?: string;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    tags: string[];
    attachments?: Attachment[];
    comments?: Comment[];
    labels?: string[];
    dependencies?: string[];
    linkedTodos?: string[];
    recurring?: RecurringConfig;
    subtasks?: Subtask[];
    reminders?: Reminder[];
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Timestamp;
    completedAt?: Timestamp;
    assignedTo?: string;
}

export interface Reminder {
    id: string;
    time: Timestamp;
    type: 'email' | 'notification' | 'both';
    sent: boolean;
    acknowledged: boolean;
}

export interface TodoFilter {
    status?: TodoStatus | 'all';
    priority?: TodoPriority;
    search?: string;
    labels?: string[];
    assignedTo?: string[];
    dueDateRange?: {
        start: Timestamp;
        end: Timestamp;
    };
}

export interface TodoStats {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byPriority: Record<TodoPriority, number>;
    byCategory: Record<string, number>;
    completionRate: number;
}

export interface WeeklyStats {
    weeklyTotal: number;
    weeklyCompleted: number;
    completionRate: number;
}

export interface Comment {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp | null;
    attachments?: Attachment[];
    mentions?: string[];
    replyTo?: string;
}

export interface Attachment {
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Timestamp;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    createdBy: string;
    createdAt: Timestamp;
}

export interface RecurringConfig {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Timestamp;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    count?: number;
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    type: 'frontend' | 'backend' | 'both';
    category: string;
    priority: TodoPriority;
    status: TodoStatus;
    assignedTo?: string;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    implementation: {
        frontend?: {
            components: string[];
            routes: string[];
            services: string[];
        };
        backend?: {
            endpoints: string[];
            services: string[];
            security: string[];
        };
    };
    requirements: {
        functional: string[];
        technical: string[];
        security: string[];
    };
    testing: {
        frontend?: string[];
        backend?: string[];
        integration?: string[];
    };
    tags: string[];
    attachments?: Attachment[];
    comments?: Comment[];
}

export interface FirebaseActivity {
    id: string;
    type: 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'status_change';
    entityType: 'todo' | 'feature' | 'comment';
    entityId: string;
    userId: string;
    timestamp: Timestamp;
    details: {
        [key: string]: any;
    };
}

export interface TodoHistory {
    id: string;
    todoId: string;
    field: string;
    oldValue: any;
    newValue: any;
    changedAt: Timestamp;
    changedBy: string;
}

export interface Component {
    getElement(): HTMLElement;
}

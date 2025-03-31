export type FeatureStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type FeatureTeam = 'frontend' | 'backend';
export type FeaturePriority = 'low' | 'medium' | 'high';

export interface Feature {
    id: string;
    title: string;
    description: string;
    team: FeatureTeam;
    status: FeatureStatus;
    priority: FeaturePriority;
    assignedTo?: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
    order: number;
    dependencies?: string[];
    tags?: string[];
}
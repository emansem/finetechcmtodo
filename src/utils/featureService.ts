import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    getDocs,
    getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Feature, Comment, TodoStatus, TodoPriority } from '../types/types';
import { FeatureParser } from './featureParser';

// Define missing types
interface FeatureProgress {
    overall: number;
    frontend?: number;
    backend?: number;
}

export type FeatureCategory = 
    | 'Authentication'
    | 'User Management'
    | 'Financial'
    | 'Messaging'
    | 'Media'
    | 'UI Components'
    | 'Security'
    | 'API Integration'
    | 'Database'
    | 'Infrastructure';

export class FeatureService {
    private static COLLECTION = 'features';

    static async getAllFeatures(): Promise<Feature[]> {
        const q = query(
            collection(db, this.COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as Feature[];
    }

    static async createFeature(feature: Omit<Feature, 'id'>): Promise<Feature> {
        const featureWithDates = {
            ...feature,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: feature.status || 'todo' as TodoStatus,
            priority: feature.priority || 'medium' as TodoPriority,
            tags: feature.tags || [],
            attachments: feature.attachments || [],
            comments: feature.comments || []
        };
        const docRef = await addDoc(collection(db, this.COLLECTION), featureWithDates);
        return {
            ...featureWithDates,
            id: docRef.id
        } as Feature;
    }

    static async updateFeature(id: string, updates: Partial<Feature>): Promise<void> {
        const featureRef = doc(db, this.COLLECTION, id);
        await updateDoc(featureRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    }

    static async deleteFeature(id: string): Promise<void> {
        await deleteDoc(doc(db, this.COLLECTION, id));
    }

    static subscribeToFeatures(callback: (features: Feature[]) => void): () => void {
        const q = query(
            collection(db, this.COLLECTION),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const features = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Feature[];
            callback(features);
        });
    }

    static async addComment(featureId: string, comment: Omit<Comment, 'id'>): Promise<Comment> {
        const featureRef = doc(db, this.COLLECTION, featureId);
        const commentWithDates = {
            ...comment,
            id: crypto.randomUUID(),
            createdAt: Timestamp.now()
        };
        
        await updateDoc(featureRef, {
            comments: [...(await this.getFeatureComments(featureId)), commentWithDates],
            updatedAt: Timestamp.now()
        });

        return commentWithDates as Comment;
    }

    static async getFeatureComments(featureId: string): Promise<Comment[]> {
        const featureDoc = await getDoc(doc(db, this.COLLECTION, featureId));
        const data = featureDoc.data();
        return (data?.comments || []) as Comment[];
    }

    // Import features from features.md
    static async importFeaturesFromMd(content: string, userId: string): Promise<void> {
        try {
            const features = FeatureParser.parseFeaturesMd(content, userId);
            for (const feature of features) {
                await this.createFeature({
                    ...feature,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }
        } catch (error) {
            console.error('Error importing features from MD:', error);
            throw error;
        }
    }

    private static determineFeatureType(feature: any): Feature['type'] {
        if (feature.category.toLowerCase().includes('ui') || 
            feature.category.toLowerCase().includes('frontend')) {
            return 'frontend';
        }
        
        if (feature.category.toLowerCase().includes('api') || 
            feature.category.toLowerCase().includes('database') ||
            feature.category.toLowerCase().includes('security')) {
            return 'backend';
        }

        return 'both';
    }

    private static determineCategory(feature: any): FeatureCategory {
        const categoryMap: { [key: string]: FeatureCategory } = {
            'authentication': 'Authentication',
            'user': 'User Management',
            'financial': 'Financial',
            'messaging': 'Messaging',
            'media': 'Media',
            'ui': 'UI Components',
            'security': 'Security',
            'api': 'API Integration',
            'database': 'Database',
            'infrastructure': 'Infrastructure'
        };

        const featureCategory = Object.entries(categoryMap)
            .find(([key]) => feature.category.toLowerCase().includes(key));

        return featureCategory ? featureCategory[1] : 'UI Components';
    }

    static async getFeatureProgress(featureId: string): Promise<FeatureProgress> {
        const feature = (await getDoc(doc(db, this.COLLECTION, featureId))).data() as Feature;
        
        if (!feature) {
            throw new Error('Feature not found');
        }

        const progress: FeatureProgress = {
            overall: 0,
            frontend: 0,
            backend: 0
        };

        if (feature.type === 'frontend' || feature.type === 'both') {
            progress.frontend = this.calculateProgress(feature, 'frontend');
        }

        if (feature.type === 'backend' || feature.type === 'both') {
            progress.backend = this.calculateProgress(feature, 'backend');
        }

        progress.overall = this.calculateOverallProgress(progress);

        return progress;
    }

    private static calculateProgress(feature: Feature, type: 'frontend' | 'backend'): number {
        const implementation = feature.implementation?.[type];
        if (!implementation) return 0;

        const totalTasks = Object.values(implementation).reduce((acc, curr) => 
            acc + (Array.isArray(curr) ? curr.length : 0), 0);

        if (totalTasks === 0) return 0;

        const completedTasks = Object.values(implementation).reduce((acc, curr) => 
            acc + (Array.isArray(curr) ? curr.filter(task => task.includes('[✓]')).length : 0), 0);

        return (completedTasks / totalTasks) * 100;
    }

    private static calculateOverallProgress(progress: FeatureProgress): number {
        if (progress.frontend && progress.backend) {
            return (progress.frontend + progress.backend) / 2;
        }
        return progress.frontend || progress.backend || 0;
    }
} 
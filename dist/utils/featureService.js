import { collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp, getDocs, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FeatureParser } from './featureParser';
export class FeatureService {
    static async getAllFeatures() {
        const q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    }
    static async createFeature(feature) {
        const featureWithDates = {
            ...feature,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: feature.status || 'todo',
            priority: feature.priority || 'medium',
            tags: feature.tags || [],
            attachments: feature.attachments || [],
            comments: feature.comments || []
        };
        const docRef = await addDoc(collection(db, this.COLLECTION), featureWithDates);
        return {
            ...featureWithDates,
            id: docRef.id
        };
    }
    static async updateFeature(id, updates) {
        const featureRef = doc(db, this.COLLECTION, id);
        await updateDoc(featureRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    }
    static async deleteFeature(id) {
        await deleteDoc(doc(db, this.COLLECTION, id));
    }
    static subscribeToFeatures(callback) {
        const q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const features = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            callback(features);
        });
    }
    static async addComment(featureId, comment) {
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
        return commentWithDates;
    }
    static async getFeatureComments(featureId) {
        const featureDoc = await getDoc(doc(db, this.COLLECTION, featureId));
        const data = featureDoc.data();
        return (data?.comments || []);
    }
    // Import features from features.md
    static async importFeaturesFromMd(content, userId) {
        try {
            const features = FeatureParser.parseFeaturesMd(content, userId);
            for (const feature of features) {
                await this.createFeature({
                    ...feature,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }
        }
        catch (error) {
            console.error('Error importing features from MD:', error);
            throw error;
        }
    }
    static determineFeatureType(feature) {
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
    static determineCategory(feature) {
        const categoryMap = {
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
    static async getFeatureProgress(featureId) {
        const feature = (await getDoc(doc(db, this.COLLECTION, featureId))).data();
        if (!feature) {
            throw new Error('Feature not found');
        }
        const progress = {
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
    static calculateProgress(feature, type) {
        const implementation = feature.implementation?.[type];
        if (!implementation)
            return 0;
        const totalTasks = Object.values(implementation).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
        if (totalTasks === 0)
            return 0;
        const completedTasks = Object.values(implementation).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.filter(task => task.includes('[✓]')).length : 0), 0);
        return (completedTasks / totalTasks) * 100;
    }
    static calculateOverallProgress(progress) {
        if (progress.frontend && progress.backend) {
            return (progress.frontend + progress.backend) / 2;
        }
        return progress.frontend || progress.backend || 0;
    }
}
FeatureService.COLLECTION = 'features';
//# sourceMappingURL=featureService.js.map
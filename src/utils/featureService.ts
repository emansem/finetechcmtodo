import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Feature, FeatureTeam, FeatureStatus } from '../types/feature';

export const featureService = {
    async getFeatures(team: FeatureTeam): Promise<Feature[]> {
        const featuresRef = collection(db, `${team}_features`);
        const q = query(
            featuresRef,
            orderBy('order', 'asc'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Feature));
    },

    async addFeature(feature: Omit<Feature, 'id'>): Promise<Feature> {
        const featuresRef = collection(db, `${feature.team}_features`);
        const docRef = await addDoc(featuresRef, feature);
        return {
            id: docRef.id,
            ...feature
        };
    },

    async updateFeature(feature: Feature): Promise<void> {
        const featureRef = doc(db, `${feature.team}_features`, feature.id);
        const { id, ...updateData } = feature;
        await updateDoc(featureRef, {
            ...updateData,
            updatedAt: Date.now()
        });
    },

    async deleteFeature(team: FeatureTeam, featureId: string): Promise<void> {
        const featureRef = doc(db, `${team}_features`, featureId);
        await deleteDoc(featureRef);
    },

    async updateFeatureStatus(
        team: FeatureTeam,
        featureId: string,
        status: FeatureStatus
    ): Promise<void> {
        const featureRef = doc(db, `${team}_features`, featureId);
        await updateDoc(featureRef, {
            status,
            updatedAt: Date.now(),
            ...(status === 'completed' ? { completedAt: Date.now() } : {})
        });
    },

    async reorderFeatures(team: FeatureTeam, updates: { id: string; order: number }[]): Promise<void> {
        const batch = writeBatch(db);

        updates.forEach(({ id, order }) => {
            const featureRef = doc(db, `${team}_features`, id);
            batch.update(featureRef, { order });
        });

        await batch.commit();
    },

    async getFeaturesByStatus(team: FeatureTeam, status: FeatureStatus): Promise<Feature[]> {
        const featuresRef = collection(db, `${team}_features`);
        const q = query(
            featuresRef,
            where('status', '==', status),
            orderBy('order', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Feature));
    }
};
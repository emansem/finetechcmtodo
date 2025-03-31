import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Feature, FeatureTeam, FeatureStatus } from '../types/feature';

interface FeatureState {
    features: {
        frontend: Feature[];
        backend: Feature[];
    };
    loading: boolean;
    error: string | null;
    activeTeam: FeatureTeam;
    modalOpen: boolean;
    editingFeature: Feature | null;
}

const initialState: FeatureState = {
    features: {
        frontend: [],
        backend: []
    },
    loading: false,
    error: null,
    activeTeam: 'frontend',
    modalOpen: false,
    editingFeature: null
};

const featureSlice = createSlice({
    name: 'features',
    initialState,
    reducers: {
        setFeatures: (state, action: PayloadAction<{ team: FeatureTeam; features: Feature[] }>) => {
            state.features[action.payload.team] = action.payload.features;
        },
        addFeature: (state, action: PayloadAction<Feature>) => {
            state.features[action.payload.team].push(action.payload);
        },
        updateFeature: (state, action: PayloadAction<Feature>) => {
            const team = action.payload.team;
            const index = state.features[team].findIndex(f => f.id === action.payload.id);
            if (index !== -1) {
                state.features[team][index] = action.payload;
            }
        },
        deleteFeature: (state, action: PayloadAction<{ team: FeatureTeam; id: string }>) => {
            const { team, id } = action.payload;
            state.features[team] = state.features[team].filter(f => f.id !== id);
        },
        updateFeatureStatus: (
            state,
            action: PayloadAction<{ team: FeatureTeam; id: string; status: FeatureStatus }>
        ) => {
            const { team, id, status } = action.payload;
            const feature = state.features[team].find(f => f.id === id);
            if (feature) {
                feature.status = status;
                if (status === 'completed') {
                    feature.completedAt = Date.now();
                }
            }
        },
        reorderFeatures: (
            state,
            action: PayloadAction<{ team: FeatureTeam; updates: { id: string; order: number }[] }>
        ) => {
            const { team, updates } = action.payload;
            updates.forEach(({ id, order }) => {
                const feature = state.features[team].find(f => f.id === id);
                if (feature) {
                    feature.order = order;
                }
            });
            state.features[team].sort((a, b) => a.order - b.order);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setActiveTeam: (state, action: PayloadAction<FeatureTeam>) => {
            state.activeTeam = action.payload;
        },
        setModalOpen: (state, action: PayloadAction<boolean>) => {
            state.modalOpen = action.payload;
            if (!action.payload) {
                state.editingFeature = null;
            }
        },
        setEditingFeature: (state, action: PayloadAction<Feature | null>) => {
            state.editingFeature = action.payload;
            state.modalOpen = !!action.payload;
        }
    }
});

export const {
    setFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
    updateFeatureStatus,
    reorderFeatures,
    setLoading,
    setError,
    setActiveTeam,
    setModalOpen,
    setEditingFeature
} = featureSlice.actions;

export default featureSlice.reducer;
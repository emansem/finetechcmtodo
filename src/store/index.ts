import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import todoReducer from './todoSlice';
import featureReducer from './featureSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        todos: todoReducer,
        features: featureReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
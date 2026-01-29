import { configureStore } from '@reduxjs/toolkit';
import communityReducer from './slices/communitySlice';

export const store = configureStore({
    reducer: {
        community: communityReducer,
    },
});

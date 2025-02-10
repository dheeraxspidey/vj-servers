import {configureStore} from '@reduxjs/toolkit';
import applicationReducer from './slices/ApplicationSlice'
export let store=configureStore({
    reducer:{
        applications:applicationReducer,
    },
});
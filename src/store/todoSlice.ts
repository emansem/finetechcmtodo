import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Todo } from '../types/todo';

interface TodoState {
    todos: Todo[];
    loading: boolean;
    error: string | null;
    filter: {
        status: 'all' | 'completed' | 'active';
        category?: 'frontend' | 'backend' | 'feature' | 'bug';
        priority?: 'low' | 'medium' | 'high';
    };
}

const initialState: TodoState = {
    todos: [],
    loading: false,
    error: null,
    filter: {
        status: 'all'
    }
};

const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        setTodos: (state, action: PayloadAction<Todo[]>) => {
            state.todos = action.payload;
        },
        addTodo: (state, action: PayloadAction<Todo>) => {
            state.todos.push(action.payload);
        },
        updateTodo: (state, action: PayloadAction<Todo>) => {
            const index = state.todos.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) {
                state.todos[index] = action.payload;
            }
        },
        deleteTodo: (state, action: PayloadAction<string>) => {
            state.todos = state.todos.filter(todo => todo.id !== action.payload);
        },
        toggleTodo: (state, action: PayloadAction<string>) => {
            const todo = state.todos.find(todo => todo.id === action.payload);
            if (todo) {
                todo.completed = !todo.completed;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setFilter: (state, action: PayloadAction<Partial<TodoState['filter']>>) => {
            state.filter = { ...state.filter, ...action.payload };
        }
    }
});

export const {
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setLoading,
    setError,
    setFilter
} = todoSlice.actions;

export default todoSlice.reducer;
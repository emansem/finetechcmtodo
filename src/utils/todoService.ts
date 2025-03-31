import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Todo } from '../types/todo';

export const todoService = {
    async getTodos(userId: string): Promise<Todo[]> {
        const todosRef = collection(db, 'todos');
        const q = query(
            todosRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Todo));
    },

    async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
        const todosRef = collection(db, 'todos');
        const docRef = await addDoc(todosRef, todo);
        return {
            id: docRef.id,
            ...todo
        };
    },

    async updateTodo(todo: Todo): Promise<void> {
        const todoRef = doc(db, 'todos', todo.id);
        const { id, ...updateData } = todo;
        await updateDoc(todoRef, updateData);
    },

    async deleteTodo(todoId: string): Promise<void> {
        const todoRef = doc(db, 'todos', todoId);
        await deleteDoc(todoRef);
    },

    async toggleTodoStatus(todo: Todo): Promise<void> {
        const todoRef = doc(db, 'todos', todo.id);
        await updateDoc(todoRef, {
            completed: !todo.completed
        });
    }
};
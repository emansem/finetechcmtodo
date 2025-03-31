import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDocs, getDoc, Timestamp, } from 'firebase/firestore';
import { db } from './firebase';
export class TodoService {
    static async createTodo(todo) {
        try {
            const docRef = await addDoc(collection(db, this.COLLECTION), {
                ...todo,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: todo.status || 'todo',
                tags: todo.tags || [],
                attachments: todo.attachments || [],
                comments: todo.comments || [],
                labels: todo.labels || [],
                dependencies: todo.dependencies || [],
                linkedTodos: todo.linkedTodos || [],
                subtasks: todo.subtasks || []
            });
            await this.createActivity({
                type: 'create',
                entityType: 'todo',
                entityId: docRef.id,
                userId: todo.createdBy,
                details: { title: todo.title }
            });
            return docRef.id;
        }
        catch (error) {
            console.error('Error creating todo:', error);
            throw new Error('Failed to create todo');
        }
    }
    static async getTodo(id) {
        try {
            const docRef = doc(db, this.COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists())
                return null;
            return { id: docSnap.id, ...docSnap.data() };
        }
        catch (error) {
            console.error('Error getting todo:', error);
            throw new Error('Failed to get todo');
        }
    }
    static async updateTodo(id, updates) {
        try {
            const todo = await this.getTodo(id);
            if (!todo)
                throw new Error('Todo not found');
            const docRef = doc(db, this.COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
            await this.createActivity({
                type: 'update',
                entityType: 'todo',
                entityId: id,
                userId: todo.createdBy,
                details: { title: todo.title, ...updates }
            });
        }
        catch (error) {
            console.error('Error updating todo:', error);
            throw new Error('Failed to update todo');
        }
    }
    static async deleteTodo(id) {
        try {
            const todo = await this.getTodo(id);
            if (!todo)
                return;
            const docRef = doc(db, this.COLLECTION, id);
            await deleteDoc(docRef);
            await this.createActivity({
                type: 'delete',
                entityType: 'todo',
                entityId: id,
                userId: todo.createdBy,
                details: { title: todo.title }
            });
        }
        catch (error) {
            console.error('Error deleting todo:', error);
            throw new Error('Failed to delete todo');
        }
    }
    static subscribeToTodos(userId, callback) {
        const q = query(collection(db, this.COLLECTION), where('createdBy', '==', userId), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const todos = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            callback(todos);
        }, (error) => {
            console.error('Error subscribing to todos:', error);
        });
    }
    static async getTodosByFilter(filter) {
        try {
            let q = query(collection(db, this.COLLECTION));
            if (filter.status && filter.status !== 'all') {
                q = query(q, where('status', '==', filter.status));
            }
            if (filter.priority) {
                q = query(q, where('priority', '==', filter.priority));
            }
            if (filter.assignedTo?.length) {
                q = query(q, where('assignedTo', 'in', filter.assignedTo));
            }
            if (filter.labels?.length) {
                q = query(q, where('labels', 'array-contains-any', filter.labels));
            }
            if (filter.dueDateRange) {
                q = query(q, where('dueDate', '>=', filter.dueDateRange.start), where('dueDate', '<=', filter.dueDateRange.end));
            }
            const snapshot = await getDocs(q);
            const todos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Apply text search filter if provided
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                return todos.filter(todo => todo.title.toLowerCase().includes(searchLower) ||
                    todo.description.toLowerCase().includes(searchLower));
            }
            return todos;
        }
        catch (error) {
            console.error('Error getting todos by filter:', error);
            throw new Error('Failed to get todos');
        }
    }
    static async getTodoStats(userId) {
        const todos = await this.getTodosByFilter({ assignedTo: [userId] });
        const now = Timestamp.now();
        const completed = todos.filter(todo => todo.status === 'completed').length;
        const overdue = todos.filter(todo => {
            if (!todo.dueDate || todo.status === 'completed')
                return false;
            return todo.dueDate.toDate() < now.toDate();
        }).length;
        const byPriority = {
            high: todos.filter(todo => todo.priority === 'high').length,
            medium: todos.filter(todo => todo.priority === 'medium').length,
            low: todos.filter(todo => todo.priority === 'low').length
        };
        const byCategory = {};
        todos.forEach(todo => {
            todo.tags.forEach(tag => {
                byCategory[tag] = (byCategory[tag] || 0) + 1;
            });
        });
        return {
            total: todos.length,
            completed,
            pending: todos.length - completed,
            overdue,
            byPriority,
            byCategory,
            completionRate: todos.length > 0 ? (completed / todos.length) * 100 : 0
        };
    }
    static async getWeeklyStats(userId) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekStartTimestamp = Timestamp.fromDate(weekStart);
        const q = query(collection(db, this.COLLECTION), where('createdBy', '==', userId), where('createdAt', '>=', weekStartTimestamp));
        const snapshot = await getDocs(q);
        const todos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        const weeklyCompleted = todos.filter(todo => todo.status === 'completed').length;
        return {
            weeklyTotal: todos.length,
            weeklyCompleted,
            completionRate: todos.length > 0 ? (weeklyCompleted / todos.length) * 100 : 0
        };
    }
    static async getRecentActivities(userId) {
        const q = query(collection(db, this.ACTIVITIES_COLLECTION), where('userId', '==', userId), orderBy('timestamp', 'desc'), where('timestamp', '>=', Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    }
    static async createActivity(activity) {
        try {
            await addDoc(collection(db, this.ACTIVITIES_COLLECTION), {
                ...activity,
                timestamp: Timestamp.now()
            });
        }
        catch (error) {
            console.error('Error creating activity:', error);
        }
    }
}
TodoService.COLLECTION = 'todos';
TodoService.ACTIVITIES_COLLECTION = 'activities';
//# sourceMappingURL=todoService.js.map
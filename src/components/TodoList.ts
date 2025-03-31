import { Todo, TodoStatus, TodoPriority } from '../types/types';
import { TodoService } from '../utils/todoService';
import { Timestamp } from 'firebase/firestore';

export interface TodoFilter {
    status?: TodoStatus | 'all';
    priority?: TodoPriority;
    search?: string;
    labels?: string[];
    assignedTo?: string[];
    dueDateRange?: {
        start: Timestamp;
        end: Timestamp;
    };
}

export class TodoList {
    private container: HTMLElement;
    private todos: Todo[] = [];
    private viewMode: 'list' | 'grid' = 'list';
    private unsubscribe: (() => void) | null = null;

    constructor(private userId: string) {
        this.container = document.createElement('div');
        this.container.className = 'todo-list fade-in';
        this.setupViewToggle();
        this.subscribeToTodos();
    }

    private setupViewToggle() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'view-toggle';
        toggleContainer.innerHTML = `
            <button class="btn-icon active" data-view="list">
                <i class="fas fa-list"></i>
            </button>
            <button class="btn-icon" data-view="grid">
                <i class="fas fa-th-large"></i>
            </button>
        `;

        toggleContainer.addEventListener('click', (e) => {
            const button = (e.target as HTMLElement).closest('[data-view]');
            if (button instanceof HTMLElement && button.dataset.view) {
                this.setViewMode(button.dataset.view as 'list' | 'grid');
            }
        });

        this.container.appendChild(toggleContainer);
    }

    private setViewMode(mode: 'list' | 'grid') {
        this.viewMode = mode;
        this.container.className = `todo-list fade-in ${mode}-view`;

        const buttons = this.container.querySelectorAll('[data-view]');
        buttons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-view') === mode);
        });

        this.renderTodos();
    }

    private subscribeToTodos() {
        this.unsubscribe = TodoService.subscribeToTodos(this.userId, (todos: Todo[]) => {
            this.todos = todos;
            this.renderTodos();
        });
    }

    private renderTodos() {
        const todosContainer = document.createElement('div');
        todosContainer.className = 'todos-container';

        if (this.todos.length === 0) {
            todosContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No todos yet. Create your first todo!</p>
                </div>
            `;
        } else {
            this.todos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                todosContainer.appendChild(todoElement);
            });
        }

        const existing = this.container.querySelector('.todos-container');
        if (existing) {
            this.container.replaceChild(todosContainer, existing);
        } else {
            this.container.appendChild(todosContainer);
        }
    }

    private createTodoElement(todo: Todo): HTMLElement {
        const element = document.createElement('div');
        element.className = `todo-item priority-${todo.priority}`;
        element.dataset.todoId = todo.id;
        
        if (todo.status === 'completed') {
            element.classList.add('completed');
        }

        const dueDate = todo.dueDate instanceof Timestamp ? 
            todo.dueDate.toDate().toLocaleDateString() : 
            undefined;

        element.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" ${todo.status === 'completed' ? 'checked' : ''}>
                <h3>${this.escapeHtml(todo.title)}</h3>
                <div class="todo-actions">
                    <button class="btn-icon edit-todo" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-todo" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${todo.description ? `<p class="todo-description">${this.escapeHtml(todo.description)}</p>` : ''}
            <div class="todo-meta">
                <span class="todo-status">${todo.status}</span>
                <span class="todo-priority">${todo.priority}</span>
            </div>
            <div class="todo-footer">
                ${todo.tags.map(tag => `<span class="todo-tag">${this.escapeHtml(tag)}</span>`).join('')}
                ${dueDate ? `<span class="todo-due-date">Due: ${dueDate}</span>` : ''}
                ${todo.assignedTo ? `<span class="todo-assigned">Assigned to: ${this.escapeHtml(todo.assignedTo)}</span>` : ''}
            </div>
            ${this.renderSubtasks(todo)}
        `;

        // Event Listeners
        const checkbox = element.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', () => this.toggleTodoStatus(todo));
        }

        const editButton = element.querySelector('.edit-todo');
        if (editButton) {
            editButton.addEventListener('click', () => this.editTodo(todo));
        }

        const deleteButton = element.querySelector('.delete-todo');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteTodo(todo.id));
        }

        return element;
    }

    private renderSubtasks(todo: Todo): string {
        if (!todo.subtasks?.length) return '';

        return `
            <div class="subtasks">
                <h4>Subtasks</h4>
                <ul>
                    ${todo.subtasks.map(subtask => `
                        <li class="${subtask.completed ? 'completed' : ''}">
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            <span>${this.escapeHtml(subtask.title)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    private async toggleTodoStatus(todo: Todo) {
        try {
            const newStatus: TodoStatus = todo.status === 'completed' ? 'todo' : 'completed';
            await TodoService.updateTodo(todo.id, {
                status: newStatus,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating todo status:', error);
            // Revert checkbox state
            const checkbox = this.container.querySelector(`[data-todo-id="${todo.id}"] input[type="checkbox"]`);
            if (checkbox instanceof HTMLInputElement) {
                checkbox.checked = todo.status === 'completed';
            }
        }
    }

    private editTodo(todo: Todo) {
        // Dispatch custom event for edit
        const event = new CustomEvent('edit-todo', { detail: todo });
        this.container.dispatchEvent(event);
    }

    private async deleteTodo(id: string) {
        if (!confirm('Are you sure you want to delete this todo?')) return;

        try {
            await TodoService.deleteTodo(id);
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }

    public applyFilter(filter: TodoFilter) {
        const filteredTodos = this.todos.filter(todo => {
            if (filter.status && filter.status !== 'all') {
                if (todo.status !== filter.status) return false;
            }
            if (filter.priority && todo.priority !== filter.priority) return false;
            if (filter.labels?.length && !filter.labels.some(label => todo.labels?.includes(label))) return false;
            if (filter.assignedTo?.length && !filter.assignedTo.includes(todo.assignedTo || '')) return false;
            if (filter.dueDateRange && todo.dueDate) {
                const dueDate = todo.dueDate.toDate();
                const start = filter.dueDateRange.start.toDate();
                const end = filter.dueDateRange.end.toDate();
                if (dueDate < start || dueDate > end) return false;
            }
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                return todo.title.toLowerCase().includes(searchLower) ||
                       todo.description.toLowerCase().includes(searchLower);
            }
            return true;
        });

        const todosContainer = document.createElement('div');
        todosContainer.className = 'todos-container';

        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            todosContainer.appendChild(todoElement);
        });

        const existing = this.container.querySelector('.todos-container');
        if (existing) {
            this.container.replaceChild(todosContainer, existing);
        } else {
            this.container.appendChild(todosContainer);
        }
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    public getElement(): HTMLElement {
        return this.container;
    }

    public destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
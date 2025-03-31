import { Todo, TodoStatus, TodoPriority, Subtask, RecurringConfig } from '../types/types';
import { TodoService } from '../utils/todoService';
import { Timestamp } from 'firebase/firestore';

export class TodoForm {
    private container: HTMLElement;
    private todo: Partial<Todo> | null;
    private mode: 'create' | 'edit';
    private onSave: (todo: Todo) => void;
    private onCancel: () => void;
    private userId: string;

    constructor(
        userId: string,
        todo: Partial<Todo> | null = null,
        onSave: (todo: Todo) => void,
        onCancel: () => void
    ) {
        this.container = document.createElement('div');
        this.container.className = 'todo-form';
        this.todo = todo;
        this.mode = todo?.id ? 'edit' : 'create';
        this.onSave = onSave;
        this.onCancel = onCancel;
        this.userId = userId;
        this.initialize();
    }

    private initialize() {
        this.createStructure();
        this.setupEventListeners();
        if (this.mode === 'edit') {
            this.populateForm();
        }
    }

    private createStructure() {
        this.container.innerHTML = `
            <form class="todo-form-content">
                <div class="form-header">
                    <h2>${this.mode === 'create' ? 'Create New Todo' : 'Edit Todo'}</h2>
                    <button type="button" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="form-body">
      <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" required>
      </div>

      <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" rows="3"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status">
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="priority">Priority</label>
                            <select id="priority" name="priority">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
          </select>
        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="tags">Tags</label>
                            <input type="text" id="tagInput" placeholder="Add tag and press Enter">
                            <div class="tags-container"></div>
                        </div>

                        <div class="form-group">
                            <label for="dueDate">Due Date</label>
                            <input type="datetime-local" id="dueDate" name="dueDate">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="labels">Labels</label>
                        <div class="labels-input">
                            <input type="text" id="labelInput" placeholder="Add label and press Enter">
                            <div class="labels-container"></div>
                        </div>
                    </div>

        <div class="form-group">
                        <label>Subtasks</label>
                        <div class="subtasks-container">
                            <div class="subtask-input">
                                <input type="text" id="subtaskInput" placeholder="Add subtask and press Enter">
                            </div>
                            <div class="subtasks-list"></div>
        </div>
      </div>

      <div class="form-group">
                        <label>Recurring</label>
                        <div class="recurring-config">
                            <div class="form-check">
                                <input type="checkbox" id="isRecurring" name="isRecurring">
                                <label for="isRecurring">Make this todo recurring</label>
                            </div>
                            <div class="recurring-options" style="display: none;">
                                <select id="frequency" name="frequency">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="custom">Custom</option>
                                </select>
                                <input type="number" id="interval" name="interval" min="1" value="1">
                                <input type="date" id="endDate" name="endDate">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                    <button type="submit" class="btn-primary save-btn">
                        ${this.mode === 'create' ? 'Create Todo' : 'Save Changes'}
                    </button>
      </div>
            </form>
        `;
    }

    private setupEventListeners() {
        const form = this.container.querySelector('form');
        const cancelBtn = this.container.querySelector('.cancel-btn');
        const closeBtn = this.container.querySelector('.btn-close');
        const labelInput = this.container.querySelector('#labelInput') as HTMLInputElement;
        const tagInput = this.container.querySelector('#tagInput') as HTMLInputElement;
        const subtaskInput = this.container.querySelector('#subtaskInput') as HTMLInputElement;
        const isRecurringCheckbox = this.container.querySelector('#isRecurring') as HTMLInputElement;
        const recurringOptions = this.container.querySelector('.recurring-options') as HTMLDivElement;

        form?.addEventListener('submit', this.handleSubmit.bind(this));
        cancelBtn?.addEventListener('click', this.onCancel);
        closeBtn?.addEventListener('click', this.onCancel);
        labelInput?.addEventListener('keydown', (e: KeyboardEvent) => this.handleLabelInput(e));
        tagInput?.addEventListener('keydown', (e: KeyboardEvent) => this.handleTagInput(e));
        subtaskInput?.addEventListener('keydown', (e: KeyboardEvent) => this.handleSubtaskInput(e));
        isRecurringCheckbox?.addEventListener('change', (e) => {
            recurringOptions.style.display = (e.target as HTMLInputElement).checked ? 'block' : 'none';
        });
    }

    private populateForm() {
        if (!this.todo) return;

        const form = this.container.querySelector('form');
        if (!form) return;

        // Populate basic fields
        const titleInput = form.querySelector('#title') as HTMLInputElement;
        const descriptionInput = form.querySelector('#description') as HTMLTextAreaElement;
        const statusSelect = form.querySelector('#status') as HTMLSelectElement;
        const prioritySelect = form.querySelector('#priority') as HTMLSelectElement;
        const dueDateInput = form.querySelector('#dueDate') as HTMLInputElement;

        if (titleInput) titleInput.value = this.todo.title || '';
        if (descriptionInput) descriptionInput.value = this.todo.description || '';
        if (statusSelect) statusSelect.value = this.todo.status || 'todo';
        if (prioritySelect) prioritySelect.value = this.todo.priority || 'medium';
        if (dueDateInput && this.todo.dueDate) {
            const date = this.todo.dueDate instanceof Timestamp ? 
                this.todo.dueDate.toDate() : 
                new Date();
            dueDateInput.value = date.toISOString().slice(0, 16);
        }

        // Populate labels
        this.todo.labels?.forEach(label => this.addLabel(label));

        // Populate tags
        this.todo.tags?.forEach(tag => this.addTag(tag));

        // Populate subtasks
        this.todo.subtasks?.forEach(subtask => this.addSubtask(subtask));

        // Populate recurring config
        if (this.todo.recurring) {
            const isRecurringCheckbox = form.querySelector('#isRecurring') as HTMLInputElement;
            const recurringOptions = form.querySelector('.recurring-options') as HTMLDivElement;
            if (isRecurringCheckbox && recurringOptions) {
                isRecurringCheckbox.checked = true;
                recurringOptions.style.display = 'block';
                
                const { frequency, interval, endDate } = this.todo.recurring;
                (form.querySelector('#frequency') as HTMLSelectElement).value = frequency;
                (form.querySelector('#interval') as HTMLInputElement).value = interval.toString();
                if (endDate) {
                    const date = endDate instanceof Timestamp ? endDate.toDate() : new Date();
                    (form.querySelector('#endDate') as HTMLInputElement).value = date.toISOString().slice(0, 10);
                }
            }
        }
    }

    private handleSubmit(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const todoData: Partial<Todo> = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            status: formData.get('status') as TodoStatus,
            priority: formData.get('priority') as TodoPriority,
            tags: this.getTags(),
            labels: this.getLabels(),
            subtasks: this.getSubtasks(),
            createdBy: this.userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const dueDateValue = formData.get('dueDate') as string;
        if (dueDateValue) {
            todoData.dueDate = Timestamp.fromDate(new Date(dueDateValue));
        }

        // Add recurring config if enabled
        const isRecurring = (form.querySelector('#isRecurring') as HTMLInputElement).checked;
        if (isRecurring) {
            const frequency = formData.get('frequency') as RecurringConfig['frequency'];
            const interval = parseInt(formData.get('interval') as string);
            const endDateValue = formData.get('endDate') as string;
            
            todoData.recurring = {
                frequency,
                interval,
                endDate: endDateValue ? Timestamp.fromDate(new Date(endDateValue)) : undefined
            };
        }

        if (this.mode === 'edit' && this.todo?.id) {
            TodoService.updateTodo(this.todo.id, todoData)
                .then(() => this.onSave({ ...todoData, id: this.todo!.id } as Todo))
                .catch(error => console.error('Error updating todo:', error));
        } else {
            TodoService.createTodo(todoData as Omit<Todo, 'id'>)
                .then(id => this.onSave({ ...todoData, id } as Todo))
                .catch(error => console.error('Error creating todo:', error));
        }
    }

    private handleLabelInput(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.target as HTMLInputElement;
            const label = input.value.trim();
            
            if (label) {
                this.addLabel(label);
                input.value = '';
            }
        }
    }

    private handleTagInput(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.target as HTMLInputElement;
            const tag = input.value.trim();
            
            if (tag) {
                this.addTag(tag);
                input.value = '';
            }
        }
    }

    private handleSubtaskInput(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.target as HTMLInputElement;
            const title = input.value.trim();
            
            if (title) {
                this.addSubtask({
                    id: crypto.randomUUID(),
                    title,
                    completed: false,
                    createdAt: Timestamp.now()
                });
                input.value = '';
            }
        }
    }

    private addLabel(label: string) {
        const labelsContainer = this.container.querySelector('.labels-container');
        if (!labelsContainer) return;

        const labelHtml = `
            <div class="label-item">
                <span>${this.escapeHtml(label)}</span>
                <button type="button" class="btn-icon remove-label">
                    <i class="fas fa-times"></i>
                </button>
      </div>
    `;

        labelsContainer.insertAdjacentHTML('beforeend', labelHtml);
        const removeBtn = labelsContainer.querySelector('.label-item:last-child .remove-label');
        removeBtn?.addEventListener('click', (e) => {
            (e.target as HTMLElement).closest('.label-item')?.remove();
        });
    }

    private addTag(tag: string) {
        const tagsContainer = this.container.querySelector('.tags-container');
        if (!tagsContainer) return;

        const tagHtml = `
            <div class="tag-item">
                <span>${this.escapeHtml(tag)}</span>
                <button type="button" class="btn-icon remove-tag">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        tagsContainer.insertAdjacentHTML('beforeend', tagHtml);
        const removeBtn = tagsContainer.querySelector('.tag-item:last-child .remove-tag');
        removeBtn?.addEventListener('click', (e) => {
            (e.target as HTMLElement).closest('.tag-item')?.remove();
        });
    }

    private addSubtask(subtask: Subtask) {
        const subtasksList = this.container.querySelector('.subtasks-list');
        if (!subtasksList) return;

        const subtaskHtml = `
            <div class="subtask-item" data-id="${subtask.id}">
                <div class="subtask-content">
                    <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                    <span>${this.escapeHtml(subtask.title)}</span>
                </div>
                <button type="button" class="btn-icon remove-subtask">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        subtasksList.insertAdjacentHTML('beforeend', subtaskHtml);
        const removeBtn = subtasksList.querySelector(`[data-id="${subtask.id}"] .remove-subtask`);
        removeBtn?.addEventListener('click', () => {
            subtasksList.querySelector(`[data-id="${subtask.id}"]`)?.remove();
        });
    }

    private getLabels(): string[] {
        const labels: string[] = [];
        this.container.querySelectorAll('.label-item span').forEach(label => {
            labels.push(label.textContent || '');
        });
        return labels;
    }

    private getTags(): string[] {
        const tags: string[] = [];
        this.container.querySelectorAll('.tag-item span').forEach(tag => {
            tags.push(tag.textContent || '');
        });
        return tags;
    }

    private getSubtasks(): Subtask[] {
        const subtasks: Subtask[] = [];
        this.container.querySelectorAll('.subtask-item').forEach(item => {
            subtasks.push({
                id: item.getAttribute('data-id') || crypto.randomUUID(),
                title: item.querySelector('span')?.textContent || '',
                completed: (item.querySelector('input[type="checkbox"]') as HTMLInputElement)?.checked || false,
                createdAt: Timestamp.now()
            });
        });
        return subtasks;
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
}
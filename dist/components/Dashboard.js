import { TodoService } from '../utils/todoService';
import { Charts } from '../utils/charts';
import { query, collection, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
export class Dashboard {
    constructor(userId) {
        this.userId = userId;
        this.statsUpdateInterval = null;
        this.currentDateRange = 'week';
        this.container = document.createElement('div');
        this.container.className = 'dashboard fade-in';
        this.initialize();
    }
    async initialize() {
        this.createStructure();
        await this.updateStats();
        this.setupAutoRefresh();
    }
    createStructure() {
        this.container.innerHTML = `
            <div class="dashboard-header">
                <h2>Dashboard</h2>
                <div class="date-filter">
                    <button class="btn-secondary active" data-range="week">Week</button>
                    <button class="btn-secondary" data-range="month">Month</button>
                    <button class="btn-secondary" data-range="year">Year</button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card total-todos">
                    <i class="fas fa-tasks"></i>
                    <div class="stat-content">
                        <h3>Total Tasks</h3>
                        <p class="stat-number">-</p>
                    </div>
                </div>
                
                <div class="stat-card completed-todos">
                    <i class="fas fa-check-circle"></i>
                    <div class="stat-content">
                        <h3>Completed</h3>
                        <p class="stat-number">-</p>
                    </div>
                </div>
                
                <div class="stat-card pending-todos">
                    <i class="fas fa-clock"></i>
                    <div class="stat-content">
                        <h3>Pending</h3>
                        <p class="stat-number">-</p>
                    </div>
                </div>
                
                <div class="stat-card overdue-todos">
                    <i class="fas fa-exclamation-circle"></i>
                    <div class="stat-content">
                        <h3>Overdue</h3>
                        <p class="stat-number">-</p>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Completion Rate</h3>
                    <div class="completion-chart"></div>
                </div>
                
                <div class="chart-card">
                    <h3>Priority Distribution</h3>
                    <div class="priority-chart"></div>
                </div>
            </div>

            <div class="activity-timeline">
                <h3>Recent Activity</h3>
                <div class="timeline-container">
                    <!-- Activity items will be dynamically added here -->
                </div>
            </div>
        `;
        // Add event listeners for date filter
        const dateFilter = this.container.querySelector('.date-filter');
        dateFilter?.addEventListener('click', (e) => {
            const button = e.target.closest('[data-range]');
            if (button instanceof HTMLElement && button.dataset.range) {
                this.updateDateRange(button.dataset.range);
            }
        });
    }
    async updateStats() {
        try {
            const stats = await this.calculateStats();
            // Update stat cards
            this.updateStatCard('total-todos', stats.total);
            this.updateStatCard('completed-todos', stats.completed);
            this.updateStatCard('pending-todos', stats.pending);
            this.updateStatCard('overdue-todos', stats.overdue);
            // Update charts
            this.updatePriorityChart(stats.byPriority);
            this.updateCompletionChart(stats.completionRate);
            // Update activity timeline
            await this.updateActivityTimeline();
        }
        catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }
    async calculateStats() {
        const now = Timestamp.now();
        const startDate = this.getStartDate();
        const q = query(collection(db, Dashboard.COLLECTION), where('createdBy', '==', this.userId), where('createdAt', '>=', startDate));
        const snapshot = await getDocs(q);
        const todos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
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
        return {
            total: todos.length,
            completed,
            pending: todos.length - completed,
            overdue,
            byPriority,
            completionRate: todos.length > 0 ? (completed / todos.length) * 100 : 0
        };
    }
    getStartDate() {
        const now = new Date();
        switch (this.currentDateRange) {
            case 'week':
                now.setDate(now.getDate() - 7);
                break;
            case 'month':
                now.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                now.setFullYear(now.getFullYear() - 1);
                break;
        }
        return Timestamp.fromDate(now);
    }
    updateStatCard(className, value) {
        const card = this.container.querySelector(`.${className} .stat-number`);
        if (card) {
            card.textContent = value.toString();
        }
    }
    updatePriorityChart(priorityData) {
        const container = this.container.querySelector('.priority-chart');
        if (container instanceof HTMLElement) {
            container.innerHTML = '';
            Charts.createPriorityPieChart(priorityData, container);
        }
    }
    updateCompletionChart(completionRate) {
        const container = this.container.querySelector('.completion-chart');
        if (container instanceof HTMLElement) {
            container.innerHTML = '';
            Charts.createProgressRing(Math.round(completionRate), container);
        }
    }
    async updateActivityTimeline() {
        const timelineContainer = this.container.querySelector('.timeline-container');
        if (!timelineContainer)
            return;
        try {
            const activities = await TodoService.getRecentActivities(this.userId);
            timelineContainer.innerHTML = activities.map((activity) => `
                <div class="timeline-item ${activity.type}">
                    <div class="timeline-time">${activity.timestamp.toDate().toLocaleString()}</div>
                    <div class="timeline-content">
                        ${this.formatActivityContent(activity)}
                    </div>
                </div>
            `).join('');
        }
        catch (error) {
            console.error('Error updating activity timeline:', error);
        }
    }
    formatActivityContent(activity) {
        const details = activity.details;
        switch (activity.type) {
            case 'create':
                return `Created new ${activity.entityType}: ${details.title}`;
            case 'update':
                return `Updated ${activity.entityType}: ${details.title}`;
            case 'delete':
                return `Deleted ${activity.entityType}`;
            case 'comment':
                return `Commented on ${activity.entityType}`;
            case 'assign':
                return `Assigned ${activity.entityType} to ${details.assignedTo}`;
            case 'status_change':
                return `Changed ${activity.entityType} status to ${details.newStatus}`;
            default:
                return `Performed action on ${activity.entityType}`;
        }
    }
    updateDateRange(range) {
        this.currentDateRange = range;
        const buttons = this.container.querySelectorAll('[data-range]');
        buttons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-range') === range);
        });
        this.updateStats();
    }
    setupAutoRefresh() {
        // Update stats every 5 minutes
        this.statsUpdateInterval = window.setInterval(() => {
            this.updateStats();
        }, 5 * 60 * 1000);
    }
    getElement() {
        return this.container;
    }
    destroy() {
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
    }
}
Dashboard.COLLECTION = 'todos';
//# sourceMappingURL=Dashboard.js.map
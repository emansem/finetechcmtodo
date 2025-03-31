import { TodoService } from '../utils/todoService';
import { Charts } from '../utils/charts';
import { TodoStats, Activity } from '../types/types';

export class Dashboard {
    private container: HTMLElement;
    private statsUpdateInterval: number | null = null;

    constructor(private userId: string) {
        this.container = document.createElement('div');
        this.container.className = 'dashboard fade-in';
        this.initialize();
    }

    private async initialize() {
        this.createStructure();
        await this.updateStats();
        this.setupAutoRefresh();
    }

    private createStructure() {
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
            const button = (e.target as HTMLElement).closest('[data-range]');
            if (button instanceof HTMLElement && button.dataset.range) {
                this.updateDateRange(button.dataset.range);
            }
        });

        // Add chart containers
        const priorityChartContainer = this.container.querySelector('.priority-chart');
        if (priorityChartContainer) {
            this.updatePriorityChart(priorityChartContainer as HTMLElement);
        }

        const completionChartContainer = this.container.querySelector('.completion-chart');
        if (completionChartContainer) {
            this.updateCompletionChart(completionChartContainer as HTMLElement);
        }
    }

    private async updateStats() {
        try {
            // Get raw stats and convert to correct type
            const rawStats = await TodoService.getTodoStats(this.userId);
            const stats: TodoStats = {
                ...rawStats,
                priorities: {
                    high: 0,
                    medium: 0,
                    low: 0,
                    ...rawStats.priorities
                }
            };

            const weeklyStats = await TodoService.getWeeklyStats(this.userId);

            // Update stat cards
            this.updateStatCard('total-todos', stats.total);
            this.updateStatCard('completed-todos', stats.completed);
            this.updateStatCard('pending-todos', stats.pending);
            this.updateStatCard('overdue-todos', stats.overdue);

            // Priority distribution
            const priorityData = {
                high: stats.priorities?.high || 0,
                medium: stats.priorities?.medium || 0,
                low: stats.priorities?.low || 0
            };

            const priorityChartContainer = this.container.querySelector('.priority-chart');
            if (priorityChartContainer) {
                priorityChartContainer.innerHTML = '';
                Charts.createPriorityPieChart(priorityData, priorityChartContainer as HTMLElement);
            }

            // Completion rate
            const completionRate = Math.round(weeklyStats.completionRate);
            const completionChartContainer = this.container.querySelector('.completion-chart');
            if (completionChartContainer) {
                completionChartContainer.innerHTML = '';
                Charts.createProgressRing(completionRate, completionChartContainer as HTMLElement);
            }

            // Update activity timeline
            await this.updateActivityTimeline();
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    private updateStatCard(className: string, value: number) {
        const card = this.container.querySelector(`.${className} .stat-number`);
        if (card) {
            card.textContent = value.toString();
        }
    }

    private updateCompletionChart(container: HTMLElement) {
        const chartContainer = container;
        if (chartContainer) {
            chartContainer.innerHTML = `
        <div class="progress-circle">
          <svg viewBox="0 0 36 36">
            <path d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--bg-dark-secondary)"
              stroke-width="3"
            />
            <path d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--primary)"
              stroke-width="3"
              stroke-dasharray="0, 100"
            />
          </svg>
          <div class="percentage">0%</div>
        </div>
      `;
        }
    }

    private updatePriorityChart(container: HTMLElement) {
        container.innerHTML = `
      <div class="priority-chart-placeholder">
        <p>Loading priority chart...</p>
      </div>
    `;
    }

    private async updateActivityTimeline() {
        const timelineContainer = this.container.querySelector('.timeline-container');
        if (!timelineContainer) return;

        try {
            const activities = await TodoService.getRecentActivities(this.userId);
            timelineContainer.innerHTML = activities.map((activity: Activity) => `
        <div class="timeline-item ${activity.type}">
          <div class="timeline-time">${new Date(activity.timestamp).toLocaleString()}</div>
          <div class="timeline-content">${activity.description}</div>
        </div>
      `).join('');
        } catch (error) {
            console.error('Error updating activity timeline:', error);
        }
    }

    private updateDateRange(range: string) {
        const buttons = this.container.querySelectorAll('[data-range]');
        buttons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-range') === range);
        });
        this.updateStats();
    }

    private setupAutoRefresh() {
        // Update stats every 5 minutes
        this.statsUpdateInterval = window.setInterval(() => {
            this.updateStats();
        }, 5 * 60 * 1000);
    }

    public getElement(): HTMLElement {
        return this.container;
    }

    public destroy() {
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
    }
}
import { Feature, } from '../types/types';
import { FeatureService } from '../utils/featureService';

type FilterType = 'all' | 'frontend' | 'backend' | 'both';

export class FeatureList {
    private container: HTMLElement;
    private features: Feature[] = [];
    private currentFilter: {
        type?: FilterType;
        category?: string;
        status?: 'todo' | 'inProgress' | 'completed';
    } = {};

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'feature-list';
        this.initialize();
    }

    private async initialize() {
        this.createStructure();
        await this.loadFeatures();
        this.setupEventListeners();
    }

    private createStructure() {
        this.container.innerHTML = `
            <div class="feature-list-header">
                <div class="feature-filters">
                    <div class="filter-group">
                        <button class="filter-btn active" data-type="all">All</button>
                        <button class="filter-btn" data-type="frontend">Frontend</button>
                        <button class="filter-btn" data-type="backend">Backend</button>
                    </div>
                    <div class="filter-group">
                        <button class="filter-btn" data-status="todo">Todo</button>
                        <button class="filter-btn" data-status="inProgress">In Progress</button>
                        <button class="filter-btn" data-status="completed">Completed</button>
                    </div>
                </div>
                <button class="btn-primary add-feature">
                    <i class="fas fa-plus"></i> Add Feature
                </button>
            </div>
            <div class="features-grid"></div>
        `;
    }

    private async loadFeatures() {
        try {
            this.features = await FeatureService.getAllFeatures();
            this.renderFeatures();
        } catch (error) {
            console.error('Error loading features:', error);
            this.showError('Failed to load features');
        }
    }

    private renderFeatures() {
        const grid = this.container.querySelector('.features-grid');
        if (!grid) return;

        const filteredFeatures = this.filterFeatures();
        
        grid.innerHTML = filteredFeatures.map(feature => this.createFeatureCard(feature)).join('');
        
        // Add event listeners to the cards
        filteredFeatures.forEach(feature => {
            const card = grid.querySelector(`[data-feature-id="${feature.id}"]`);
            if (card) {
                this.attachCardEventListeners(card, feature);
            }
        });
    }

    private createFeatureCard(feature: Feature): string {
        return `
            <div class="feature-card" data-feature-id="${feature.id}">
                <div class="feature-header ${feature.type}">
                    <span class="feature-type">${feature.type}</span>
                    <span class="feature-category">${feature.category}</span>
                </div>
                <div class="feature-content">
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
                <div class="feature-progress">
                    ${feature.type !== 'backend' ? `
                        <div class="progress-bar frontend">
                            <div class="progress" style="width: ${this.getProgress(feature, 'frontend')}%"></div>
                            <span>Frontend: ${this.getProgress(feature, 'frontend')}%</span>
                        </div>
                    ` : ''}
                    ${feature.type !== 'frontend' ? `
                        <div class="progress-bar backend">
                            <div class="progress" style="width: ${this.getProgress(feature, 'backend')}%"></div>
                            <span>Backend: ${this.getProgress(feature, 'backend')}%</span>
                        </div>
                    ` : ''}
                </div>
                <div class="feature-footer">
                    <div class="feature-meta">
                        <span class="priority ${feature.priority}">${feature.priority}</span>
                        <span class="status ${feature.status}">${feature.status}</span>
                    </div>
                    <div class="feature-actions">
                        <button class="btn-icon edit-feature" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon view-details" title="View Details">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button class="btn-icon delete-feature" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private async getProgress(feature: Feature, type: 'frontend' | 'backend'): Promise<number> {
        try {
            const progress = await FeatureService.getFeatureProgress(feature.id);
            return type === 'frontend' ? progress.frontend || 0 : progress.backend || 0;
        } catch (error) {
            console.error('Error getting progress:', error);
            return 0;
        }
    }

    private filterFeatures(): Feature[] {
        return this.features.filter(feature => {
            if (this.currentFilter.type && this.currentFilter.type !== 'all') {
                if (feature.type !== this.currentFilter.type) return false;
            }
            if (this.currentFilter.status) {
                if (feature.status !== this.currentFilter.status) return false;
            }
            if (this.currentFilter.category) {
                if (feature.category !== this.currentFilter.category) return false;
            }
            return true;
        });
    }

    private setupEventListeners() {
        // Filter buttons
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                const status = button.getAttribute('data-status');
                
                if (type) {
                    this.currentFilter.type = type as any;
                    this.updateFilterButtons('type', type);
                }
                if (status) {
                    this.currentFilter.status = status as any;
                    this.updateFilterButtons('status', status);
                }
                
                this.renderFeatures();
            });
        });

        // Add feature button
        const addButton = this.container.querySelector('.add-feature');
        addButton?.addEventListener('click', () => {
            // TODO: Implement feature creation modal
            console.log('Add feature clicked');
        });
    }

    private attachCardEventListeners(card: Element, feature: Feature) {
        const editButton = card.querySelector('.edit-feature');
        editButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            // TODO: Implement edit feature modal
            console.log('Edit feature:', feature);
        });

        const deleteButton = card.querySelector('.delete-feature');
        deleteButton?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this feature?')) {
                try {
                    await FeatureService.deleteFeature(feature.id);
                    await this.loadFeatures();
                } catch (error) {
                    console.error('Error deleting feature:', error);
                    this.showError('Failed to delete feature');
                }
            }
        });

        const viewButton = card.querySelector('.view-details');
        viewButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            // TODO: Implement feature details modal
            console.log('View feature details:', feature);
        });
    }

    private updateFilterButtons(type: 'type' | 'status', value: string) {
        const buttons = this.container.querySelectorAll(`.filter-btn[data-${type}]`);
        buttons.forEach(button => {
            button.classList.toggle('active', button.getAttribute(`data-${type}`) === value);
        });
    }

    private showError(message: string) {
        // TODO: Implement proper error notification
        console.error(message);
    }

    public getElement(): HTMLElement {
        return this.container;
    }
} 
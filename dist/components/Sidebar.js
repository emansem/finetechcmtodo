import { FeatureService } from '../utils/featureService';
export class Sidebar {
    constructor() {
        this.features = [];
        this.activeSection = 'features';
        this.container = document.createElement('div');
        this.container.className = 'sidebar';
        this.initialize();
    }
    async initialize() {
        this.createStructure();
        await this.loadFeatures();
    }
    createStructure() {
        this.container.innerHTML = `
            <div class="sidebar-header">
                <h2>Finetechcm</h2>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section active" data-section="features">
                    <i class="fas fa-list-check"></i>
                    <span>Features</span>
                </div>
                <div class="nav-section" data-section="user-stories">
                    <i class="fas fa-book"></i>
                    <span>User Stories</span>
                </div>
                <div class="nav-section" data-section="discussions">
                    <i class="fas fa-comments"></i>
                    <span>Discussions</span>
                </div>
                <div class="nav-section" data-section="team">
                    <i class="fas fa-users"></i>
                    <span>Team</span>
                </div>
            </nav>
            <div class="feature-categories">
                <h3>Feature Categories</h3>
                <div class="category-list">
                    <!-- Categories will be dynamically added here -->
                </div>
            </div>
            <div class="quick-filters">
                <h3>Quick Filters</h3>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="frontend">Frontend</button>
                    <button class="filter-btn" data-filter="backend">Backend</button>
                    <button class="filter-btn" data-filter="inProgress">In Progress</button>
                    <button class="filter-btn" data-filter="completed">Completed</button>
                </div>
            </div>
        `;
        this.attachEventListeners();
    }
    async loadFeatures() {
        try {
            const features = await FeatureService.getAllFeatures();
            this.features = features;
            this.updateCategories();
        }
        catch (error) {
            console.error('Error loading features:', error);
        }
    }
    updateCategories() {
        const categories = new Set(this.features.map(f => f.category));
        const categoryList = this.container.querySelector('.category-list');
        if (categoryList) {
            categoryList.innerHTML = Array.from(categories).map(category => `
                <div class="category-item" data-category="${category}">
                    <i class="fas fa-folder"></i>
                    <span>${category}</span>
                    <span class="count">${this.features.filter(f => f.category === category).length}</span>
                </div>
            `).join('');
        }
    }
    attachEventListeners() {
        // Navigation section clicks
        const navSections = this.container.querySelectorAll('.nav-section');
        navSections.forEach(section => {
            section.addEventListener('click', () => {
                this.setActiveSection(section.getAttribute('data-section') || 'features');
            });
        });
        // Filter clicks
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.applyFilter(button.getAttribute('data-filter') || 'all');
            });
        });
        // Category clicks
        this.container.querySelector('.category-list')?.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const category = categoryItem.getAttribute('data-category');
                if (category) {
                    this.filterByCategory(category);
                }
            }
        });
    }
    setActiveSection(section) {
        this.activeSection = section;
        const navSections = this.container.querySelectorAll('.nav-section');
        navSections.forEach(nav => {
            nav.classList.toggle('active', nav.getAttribute('data-section') === section);
        });
        // Emit event for main content to update
        this.container.dispatchEvent(new CustomEvent('sectionChange', {
            detail: { section: this.activeSection }
        }));
    }
    applyFilter(filter) {
        this.container.dispatchEvent(new CustomEvent('filterChange', {
            detail: { filter }
        }));
    }
    filterByCategory(category) {
        this.container.dispatchEvent(new CustomEvent('categoryChange', {
            detail: { category }
        }));
    }
    getElement() {
        return this.container;
    }
}
//# sourceMappingURL=Sidebar.js.map
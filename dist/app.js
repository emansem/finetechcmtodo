import { AuthService } from './utils/auth';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { Dashboard } from './components/Dashboard';
import { UserFlow } from './components/UserFlow';
import { UserStories } from './components/UserStories';
class App {
    constructor() {
        this.dashboard = null;
        this.todoList = null;
        this.todoForm = null;
        this.userFlow = null;
        this.userStories = null;
        this.mainContent = document.querySelector('.main-content');
        this.loadingOverlay = document.querySelector('.loading-overlay');
        this.setupWelcomePage();
        this.checkAuthState();
    }
    setupWelcomePage() {
        const githubButton = document.querySelector('.btn-github');
        const demoButton = document.querySelector('.btn-demo');
        githubButton?.addEventListener('click', async () => {
            this.showLoading();
            try {
                const user = await AuthService.signInWithGithub();
                if (user) {
                    this.initializeApp(user.uid);
                }
            }
            catch (error) {
                console.error('Login failed:', error);
                this.showError('Login failed. Please try again.');
            }
            finally {
                this.hideLoading();
            }
        });
        demoButton?.addEventListener('click', () => {
            this.initializeApp('demo-user');
            localStorage.setItem('demo-mode', 'true');
        });
    }
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    showError(message) {
        // You can implement a proper error notification system here
        alert(message);
    }
    async checkAuthState() {
        const isDemoMode = localStorage.getItem('demo-mode') === 'true';
        if (isDemoMode) {
            this.initializeApp('demo-user');
            return;
        }
        const user = await AuthService.getCurrentUser();
        if (user) {
            this.initializeApp(user.uid);
        }
    }
    setupUI() {
        // Create sidebar navigation
        const nav = document.querySelector('.sidebar-nav');
        nav.innerHTML = `
            <div class="nav-item active" data-page="dashboard">
                <i class="fas fa-chart-pie"></i>
                <span>Dashboard</span>
            </div>
            <div class="nav-item" data-page="todos">
                <i class="fas fa-tasks"></i>
                <span>Todos</span>
            </div>
            <div class="nav-item" data-page="user-flow">
                <i class="fas fa-project-diagram"></i>
                <span>User Flow</span>
            </div>
            <div class="nav-item" data-page="user-stories">
                <i class="fas fa-book"></i>
                <span>User Stories</span>
            </div>
        `;
        nav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem instanceof HTMLElement && navItem.dataset.page) {
                this.navigateToPage(navItem.dataset.page);
                // Update active state
                nav.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.toggle('active', item === navItem);
                });
            }
        });
        // Add logout button for demo mode
        if (localStorage.getItem('demo-mode') === 'true') {
            const logoutButton = document.createElement('div');
            logoutButton.className = 'nav-item logout';
            logoutButton.innerHTML = `
                <i class="fas fa-sign-out-alt"></i>
                <span>Exit Demo</span>
            `;
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('demo-mode');
                window.location.reload();
            });
            nav.appendChild(logoutButton);
        }
    }
    initializeApp(userId) {
        // Initialize components
        this.dashboard = new Dashboard(userId);
        this.todoList = new TodoList(userId);
        this.todoForm = new TodoForm(userId, null, (todo) => {
            // Refresh todo list when new todo is added
            this.navigateToPage('todos');
        }, () => {
            // Handle cancel
            this.navigateToPage('todos');
        });
        this.userFlow = new UserFlow();
        this.userStories = new UserStories();
        // Show dashboard by default
        this.navigateToPage('dashboard');
    }
    navigateToPage(page) {
        this.mainContent.innerHTML = '';
        switch (page) {
            case 'dashboard':
                if (this.dashboard) {
                    this.mainContent.appendChild(this.dashboard.getElement());
                }
                break;
            case 'todos':
                const todosContainer = document.createElement('div');
                todosContainer.className = 'todos-page fade-in';
                if (this.todoForm) {
                    todosContainer.appendChild(this.todoForm.getElement());
                }
                if (this.todoList) {
                    todosContainer.appendChild(this.todoList.getElement());
                }
                this.mainContent.appendChild(todosContainer);
                break;
            case 'user-flow':
                if (this.userFlow) {
                    this.mainContent.appendChild(this.userFlow.getElement());
                }
                break;
            case 'user-stories':
                if (this.userStories) {
                    this.mainContent.appendChild(this.userStories.getElement());
                }
                break;
        }
    }
}
// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
//# sourceMappingURL=app.js.map
import { AuthService } from '../utils/auth';
import { User } from '../types/types';

export class Auth {
    private container: HTMLElement;
    private user: User | null = null;
    private onAuthStateChange: ((user: User | null) => void) | null = null;

    constructor(onAuthStateChange?: (user: User | null) => void) {
        this.container = document.createElement('div');
        this.container.className = 'auth-container';
        this.onAuthStateChange = onAuthStateChange || null;
        this.initialize();
    }

    private initialize() {
        this.createAuthUI();
        this.setupAuthListener();
    }

    private createAuthUI() {
        if (this.user) {
            this.createUserProfile();
        } else {
            this.createLoginButton();
        }
    }

    private createLoginButton() {
        this.container.innerHTML = `
            <div class="login-container">
                <h2 class="text-primary mb-4">Welcome to FineTech Todo</h2>
                <p class="text-secondary mb-4">Sign in with your GitHub account to get started</p>
                <button class="btn-github">
                    <i class="fab fa-github"></i>
                    Login with GitHub
                </button>
                <div class="loading-spinner" style="display: none;">
                    <div class="spinner"></div>
                </div>
                <div class="error-message" style="display: none;"></div>
            </div>
        `;

        const loginButton = this.container.querySelector('.btn-github');
        loginButton?.addEventListener('click', this.handleLogin.bind(this));
    }

    private createUserProfile() {
        if (!this.user) return;

        this.container.innerHTML = `
            <div class="user-profile">
                <div class="user-info">
                    <div class="user-avatar">
                        <img src="${this.user.photoURL}" alt="${this.user.displayName}" />
                    </div>
                    <div class="user-details">
                        <h3 class="user-name">${this.user.displayName}</h3>
                        <p class="user-email">${this.user.email}</p>
                        <span class="user-role">${this.user.role}</span>
                    </div>
                </div>
                
                <div class="user-preferences">
                    <label class="theme-toggle">
                        Dark Mode
                        <input type="checkbox" 
                               ${this.user.preferences.theme === 'dark' ? 'checked' : ''}
                        />
                    </label>
                    <label class="notifications-toggle">
                        Notifications
                        <input type="checkbox" 
                               ${this.user.preferences.notifications ? 'checked' : ''}
                        />
                    </label>
                </div>

                <button class="btn-logout">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        `;

        // Add event listeners
        const logoutButton = this.container.querySelector('.btn-logout');
        logoutButton?.addEventListener('click', this.handleLogout.bind(this));

        const themeToggle = this.container.querySelector('.theme-toggle input');
        themeToggle?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.updatePreference('theme', target.checked ? 'dark' : 'light');
        });

        const notificationsToggle = this.container.querySelector('.notifications-toggle input');
        notificationsToggle?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.updatePreference('notifications', target.checked);
        });
    }

    private async updatePreference(key: keyof User['preferences'], value: any) {
        if (!this.user) return;
        
        try {
            const updatedUser = {
                ...this.user,
                preferences: {
                    ...this.user.preferences,
                    [key]: value
                }
            };
            
            // Update the local state
            this.user = updatedUser;
            
            // Notify about the change
            this.onAuthStateChange?.(updatedUser);
            
            // TODO: Update the user preferences in the database
            // This would require a new method in AuthService to update user preferences
        } catch (error) {
            console.error('Failed to update preference:', error);
        }
    }

    private async handleLogin() {
        const loginContainer = this.container.querySelector('.login-container');
        const spinner = this.container.querySelector('.loading-spinner') as HTMLElement;
        const errorMessage = this.container.querySelector('.error-message') as HTMLElement;
        const loginButton = this.container.querySelector('.btn-github') as HTMLButtonElement;

        if (!loginContainer || !spinner || !errorMessage || !loginButton) return;

        try {
            loginButton.disabled = true;
            spinner.style.display = 'block';
            errorMessage.style.display = 'none';

            const user = await AuthService.signInWithGithub();
            
            if (user) {
                this.user = user;
                this.createUserProfile();
                this.onAuthStateChange?.(user);
            }
        } catch (error) {
            console.error('Login failed:', error);
            errorMessage.textContent = 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            loginButton.disabled = false;
            spinner.style.display = 'none';
        }
    }

    private async handleLogout() {
        try {
            await AuthService.signOut();
            this.user = null;
            this.createLoginButton();
            this.onAuthStateChange?.(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    private setupAuthListener() {
        AuthService.onAuthStateChange((user) => {
            this.user = user;
            this.createAuthUI();
            this.onAuthStateChange?.(user);
        });
    }

    public getElement(): HTMLElement {
        return this.container;
    }
} 
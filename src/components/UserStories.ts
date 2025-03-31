export class UserStories {
    private container: HTMLElement;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'user-stories fade-in';
        this.initialize();
    }

    private initialize() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2>User Stories</h2>
                <p class="subtitle">Core functionality and requirements from the user's perspective</p>
            </div>

            <div class="stories-container">
                <section class="story-section">
                    <h3>Authentication</h3>
                    <div class="story-card">
                        <div class="story-header">
                            <span class="story-type">As a</span> User
                        </div>
                        <div class="story-content">
                            <span class="story-type">I want to</span> authenticate with my GitHub account
                            <span class="story-type">So that</span> I can access my personalized todo workspace
                        </div>
                        <div class="acceptance-criteria">
                            <h4>Acceptance Criteria:</h4>
                            <ul>
                                <li>User can click on GitHub login button</li>
                                <li>User is redirected to GitHub for authentication</li>
                                <li>After successful auth, user sees their dashboard</li>
                                <li>User's profile information is displayed</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="story-section">
                    <h3>Todo Management</h3>
                    <div class="story-card">
                        <div class="story-header">
                            <span class="story-type">As a</span> User
                        </div>
                        <div class="story-content">
                            <span class="story-type">I want to</span> create and manage todos
                            <span class="story-type">So that</span> I can track my tasks and stay organized
                        </div>
                        <div class="acceptance-criteria">
                            <h4>Acceptance Criteria:</h4>
                            <ul>
                                <li>User can create new todos with title and description</li>
                                <li>User can set priority, status, and due dates</li>
                                <li>User can add labels and tags to todos</li>
                                <li>User can edit and delete existing todos</li>
                                <li>User can mark todos as complete</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="story-section">
                    <h3>Feature Management</h3>
                    <div class="story-card">
                        <div class="story-header">
                            <span class="story-type">As a</span> Developer
                        </div>
                        <div class="story-content">
                            <span class="story-type">I want to</span> track feature implementation progress
                            <span class="story-type">So that</span> I can manage development workflow effectively
                        </div>
                        <div class="acceptance-criteria">
                            <h4>Acceptance Criteria:</h4>
                            <ul>
                                <li>Developer can create new feature entries</li>
                                <li>Developer can specify frontend and backend requirements</li>
                                <li>Developer can update feature status and progress</li>
                                <li>Developer can link related todos to features</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="story-section">
                    <h3>Dashboard</h3>
                    <div class="story-card">
                        <div class="story-header">
                            <span class="story-type">As a</span> User
                        </div>
                        <div class="story-content">
                            <span class="story-type">I want to</span> see an overview of my todos and features
                            <span class="story-type">So that</span> I can quickly understand my current workload
                        </div>
                        <div class="acceptance-criteria">
                            <h4>Acceptance Criteria:</h4>
                            <ul>
                                <li>User sees todo completion statistics</li>
                                <li>User sees priority distribution</li>
                                <li>User sees upcoming deadlines</li>
                                <li>User sees recent activity timeline</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    public getElement(): HTMLElement {
        return this.container;
    }
} 
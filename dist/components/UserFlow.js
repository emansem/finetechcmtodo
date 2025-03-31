export class UserFlow {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'user-flow fade-in';
        this.initialize();
    }
    initialize() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2>User Flow</h2>
                <p class="subtitle">Understanding the application's navigation and interaction patterns</p>
            </div>

            <div class="flow-sections">
                <section class="flow-section">
                    <h3>Authentication Flow</h3>
                    <div class="flow-diagram">
                        <div class="flow-step">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>Login</span>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <i class="fas fa-check-circle"></i>
                            <span>Auth</span>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <i class="fas fa-home"></i>
                            <span>Dashboard</span>
                        </div>
                    </div>
                    <div class="flow-description">
                        <p>Users begin at the login screen and authenticate using GitHub. Upon successful authentication, they are redirected to the dashboard.</p>
                    </div>
                </section>

                <section class="flow-section">
                    <h3>Todo Management Flow</h3>
                    <div class="flow-diagram">
                        <div class="flow-step">
                            <i class="fas fa-plus-circle"></i>
                            <span>Create</span>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <i class="fas fa-tasks"></i>
                            <span>Manage</span>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <i class="fas fa-check-double"></i>
                            <span>Complete</span>
                        </div>
                    </div>
                    <div class="flow-description">
                        <p>Users can create new todos, manage existing ones through various actions (edit, delete, assign), and mark them as complete.</p>
                    </div>
                </section>

                <section class="flow-section">
                    <h3>Feature Management Flow</h3>
                    <div class="flow-diagram">
                        <div class="flow-step">
                            <i class="fas fa-lightbulb"></i>
                            <span>Propose</span>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <i class="fas fa-code-branch"></i>
                            <span>Develop</span>
                        </div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-step">
                            <i class="fas fa-check"></i>
                            <span>Release</span>
                        </div>
                    </div>
                    <div class="flow-description">
                        <p>Features go through a lifecycle from proposal to development and finally release, with tracking at each stage.</p>
                    </div>
                </section>
            </div>
        `;
    }
    getElement() {
        return this.container;
    }
}
//# sourceMappingURL=UserFlow.js.map
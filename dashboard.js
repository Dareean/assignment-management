// dashboard.js - Complete Dashboard Functionality
class Dashboard {
    constructor() {
        this.currentFilter = 'all';
        this.assignments = [];
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Dashboard...');
        
        // Check authentication
        if (!this.checkAuth()) {
            return;
        }

        // Set user info
        this.setUserInfo();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial data
        await this.loadAssignments();

        console.log('✅ Dashboard initialized successfully');
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            alert('Please login to access the dashboard');
            window.location.href = 'login.html';
            return false;
        }

        return true;
    }

    setUserInfo() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.email) {
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
        }
    }

    setupEventListeners() {
        // Add assignment form
        const addForm = document.getElementById('addAssignmentForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleCreateAssignment(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Search functionality (optional enhancement)
        this.setupSearch();
    }

    setupSearch() {
        // You can add a search input in your HTML and handle it here
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    async handleCreateAssignment(e) {
        e.preventDefault();
        
        const title = document.getElementById('assignmentTitle').value.trim();
        const description = document.getElementById('assignmentDescription').value.trim();
        const dueDate = document.getElementById('assignmentDueDate').value;
        
        // Validation
        if (!title) {
            this.showAlert('Judul assignment harus diisi!', 'error');
            return;
        }
        
        if (!dueDate) {
            this.showAlert('Due date harus diisi!', 'error');
            return;
        }

        // Check if due date is in the past
        const selectedDate = new Date(dueDate);
        if (selectedDate < new Date()) {
            if (!confirm('Due date yang dipilih sudah lewat. Tetap lanjutkan?')) {
                return;
            }
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            console.log('📝 Creating assignment...', { title, description, dueDate });
            
            const result = await AssignmentAPI.createAssignment({
                title,
                description: description || '',
                dueDate
            });
            
            console.log('✅ Assignment created:', result);
            
            // Reset form
            e.target.reset();
            
            // Reload assignments
            await this.loadAssignments();
            
            this.showAlert('Assignment berhasil dibuat!', 'success');
            
        } catch (error) {
            console.error('❌ Error creating assignment:', error);
            this.showAlert('Gagal membuat assignment: ' + error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async loadAssignments() {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;

        try {
            console.log('🔄 Loading assignments...');
            this.showLoadingState(true);
            
            const assignments = await AssignmentAPI.getAssignments();
            console.log('✅ Assignments loaded:', assignments);
            
            this.assignments = assignments;
            this.displayAssignments(assignments);
            this.updateStats(assignments);
            this.updateFilterCounts(assignments);
            
        } catch (error) {
            console.error('❌ Error loading assignments:', error);
            
            // Handle authentication errors
            if (error.message.includes('401') || error.message.includes('token')) {
                this.showAlert('Session expired. Please login again.', 'error');
                this.handleLogout();
            } else {
                this.showErrorState('Gagal memuat assignments: ' + error.message);
            }
        } finally {
            this.showLoadingState(false);
        }
    }

    displayAssignments(assignments) {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;

        if (!assignments || assignments.length === 0) {
            this.showEmptyState();
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Sort assignments: overdue first, then by due date
        const sortedAssignments = this.sortAssignments(assignments);

        sortedAssignments.forEach(assignment => {
            const assignmentElement = this.createAssignmentElement(assignment);
            container.appendChild(assignmentElement);
        });
    }

    sortAssignments(assignments) {
        return assignments.sort((a, b) => {
            const aDue = new Date(a.dueDate);
            const bDue = new Date(b.dueDate);
            const now = new Date();

            // Overdue assignments first
            if (!a.isCompleted && aDue < now && !b.isCompleted && bDue < now) {
                return aDue - bDue; // Both overdue, earlier due date first
            }
            if (!a.isCompleted && aDue < now) return -1; // Only a is overdue
            if (!b.isCompleted && bDue < now) return 1;  // Only b is overdue

            // Then incomplete assignments by due date
            if (!a.isCompleted && !b.isCompleted) {
                return aDue - bDue;
            }

            // Then completed assignments
            if (a.isCompleted && !b.isCompleted) return 1;
            if (!a.isCompleted && b.isCompleted) return -1;

            // Both completed, sort by completion date (most recent first)
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }

    createAssignmentElement(assignment) {
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = !assignment.isCompleted && dueDate < new Date();
        const isToday = !assignment.isCompleted && dueDate.toDateString() === new Date().toDateString();
        const isUrgent = !assignment.isCompleted && this.isUrgent(dueDate);
        
        const assignmentElement = document.createElement('div');
        assignmentElement.className = `assignment-item ${assignment.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isToday ? 'today' : ''} ${isUrgent ? 'urgent' : ''}`;
        assignmentElement.setAttribute('data-id', assignment._id);
        assignmentElement.setAttribute('data-status', assignment.isCompleted ? 'completed' : 'pending');
        
        // Determine status badge
        const { statusClass, statusText } = this.getStatusInfo(assignment, isOverdue);
        
        assignmentElement.innerHTML = `
            <div class="assignment-col title" data-label="Assignment">
                <div class="assignment-title">${this.escapeHtml(assignment.title)}</div>
                ${assignment.description ? `<div class="assignment-description">${this.escapeHtml(assignment.description)}</div>` : ''}
            </div>
            
            <div class="assignment-col status" data-label="Status">
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>
            
            <div class="assignment-col description" data-label="Description">
                <div class="assignment-description">${assignment.description ? this.escapeHtml(assignment.description) : 'No description'}</div>
            </div>
            
            <div class="assignment-col due-date" data-label="Due Date">
                <div class="due-date-text ${isOverdue ? 'overdue' : (isToday ? 'today' : 'future')}">
                    ${this.formatTableDate(dueDate)}
                </div>
            </div>
            
            <div class="assignment-col actions" data-label="Actions">
                <div class="action-buttons">
                    <button class="btn-small toggle-btn" onclick="dashboard.toggleAssignment('${assignment._id}', ${!assignment.isCompleted})" title="${assignment.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
                        ${assignment.isCompleted ? '↶ Undo' : '✓ Complete'}
                    </button>
                    <button class="btn-small btn-delete" onclick="dashboard.deleteAssignment('${assignment._id}')" title="Delete assignment">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
        
        return assignmentElement;
    }

    getStatusInfo(assignment, isOverdue) {
        if (assignment.isCompleted) {
            return { statusClass: 'status-completed', statusText: 'Completed' };
        } else if (isOverdue) {
            return { statusClass: 'status-overdue', statusText: 'Overdue' };
        } else {
            return { statusClass: 'status-pending', statusText: 'Pending' };
        }
    }

    isUrgent(dueDate) {
        const now = new Date();
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 1 && daysDiff >= 0; // Due within 1 day
    }

    formatTableDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const timeDiff = targetDate.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let dateString = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
        
        // Add time if it's not 00:00
        if (date.getHours() !== 0 || date.getMinutes() !== 0) {
            dateString += ' ' + date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Add relative time indicator
        if (dayDiff === 0) {
            dateString += ' (Today)';
        } else if (dayDiff === 1) {
            dateString += ' (Tomorrow)';
        } else if (dayDiff === -1) {
            dateString += ' (Yesterday)';
        } else if (dayDiff < 0) {
            dateString += ` (${Math.abs(dayDiff)} days ago)`;
        } else if (dayDiff <= 7) {
            dateString += ` (in ${dayDiff} days)`;
        }
        
        return dateString;
    }

    async toggleAssignment(id, isCompleted) {
        try {
            console.log(`🔄 Toggling assignment ${id} to ${isCompleted}`);
            
            const result = await AssignmentAPI.updateAssignment(id, { isCompleted });
            console.log('✅ Assignment updated:', result);
            
            // Update local data
            const assignmentIndex = this.assignments.findIndex(a => a._id === id);
            if (assignmentIndex !== -1) {
                this.assignments[assignmentIndex].isCompleted = isCompleted;
                this.assignments[assignmentIndex].updatedAt = new Date().toISOString();
            }
            
            // Reload display
            this.displayAssignments(this.assignments);
            this.updateStats(this.assignments);
            this.updateFilterCounts(this.assignments);
            
            this.showAlert(`Assignment marked as ${isCompleted ? 'completed' : 'incomplete'}!`, 'success');
            
        } catch (error) {
            console.error('❌ Error toggling assignment:', error);
            this.showAlert('Error updating assignment: ' + error.message, 'error');
        }
    }

    async deleteAssignment(id) {
        if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            return;
        }
        
        try {
            console.log('🗑️ Deleting assignment:', id);
            
            await AssignmentAPI.deleteAssignment(id);
            console.log('✅ Assignment deleted');
            
            // Remove from local data
            this.assignments = this.assignments.filter(a => a._id !== id);
            
            // Update display
            this.displayAssignments(this.assignments);
            this.updateStats(this.assignments);
            this.updateFilterCounts(this.assignments);
            
            this.showAlert('Assignment deleted successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error deleting assignment:', error);
            this.showAlert('Error deleting assignment: ' + error.message, 'error');
        }
    }

    handleFilterChange(e) {
        const filter = e.target.getAttribute('data-filter');
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.applyFilter(filter);
    }

    applyFilter(filter) {
        const assignments = document.querySelectorAll('.assignment-item:not(.empty-state)');
        
        assignments.forEach(assignment => {
            const status = assignment.getAttribute('data-status');
            const isOverdue = assignment.classList.contains('overdue');
            const isCompleted = status === 'completed';
            const isPending = status === 'pending' && !isOverdue;
            
            let show = false;
            switch(filter) {
                case 'all':
                    show = true;
                    break;
                case 'pending':
                    show = isPending;
                    break;
                case 'completed':
                    show = isCompleted;
                    break;
                case 'overdue':
                    show = isOverdue;
                    break;
            }
            
            assignment.style.display = show ? 'grid' : 'none';
        });

        // Update visible count
        this.updateVisibleCount();
    }

    updateVisibleCount() {
        const visibleCount = document.querySelectorAll('.assignment-item[style=""]').length + 
                           document.querySelectorAll('.assignment-item:not([style])').length;
        
        const counter = document.getElementById('visibleCount');
        if (counter) {
            counter.textContent = `Showing ${visibleCount} assignments`;
        }
    }

    handleSearch(searchTerm) {
        const assignments = document.querySelectorAll('.assignment-item:not(.empty-state)');
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        assignments.forEach(assignment => {
            const title = assignment.querySelector('.assignment-title').textContent.toLowerCase();
            const description = assignment.querySelector('.assignment-description').textContent.toLowerCase();
            
            const matches = title.includes(lowerSearchTerm) || description.includes(lowerSearchTerm);
            assignment.style.display = matches ? 'grid' : 'none';
        });
        
        this.updateVisibleCount();
    }

    updateStats(assignments) {
        const total = assignments.length;
        const pending = assignments.filter(a => !a.isCompleted && new Date(a.dueDate) >= new Date()).length;
        const completed = assignments.filter(a => a.isCompleted).length;
        const overdue = assignments.filter(a => !a.isCompleted && new Date(a.dueDate) < new Date()).length;

        const totalElement = document.getElementById('totalAssignments');
        const pendingElement = document.getElementById('pendingAssignments');
        const completedElement = document.getElementById('completedAssignments');
        const overdueElement = document.getElementById('overdueAssignments');

        if (totalElement) totalElement.textContent = total;
        if (pendingElement) pendingElement.textContent = pending;
        if (completedElement) completedElement.textContent = completed;
        if (overdueElement) overdueElement.textContent = overdue;
    }

    updateFilterCounts(assignments) {
        const filters = {
            all: assignments.length,
            pending: assignments.filter(a => !a.isCompleted && new Date(a.dueDate) >= new Date()).length,
            completed: assignments.filter(a => a.isCompleted).length,
            overdue: assignments.filter(a => !a.isCompleted && new Date(a.dueDate) < new Date()).length
        };

        // Update filter button counts if you have badge elements
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.getAttribute('data-filter');
            const badge = btn.querySelector('.filter-count');
            if (badge) {
                badge.textContent = filters[filter];
            }
        });
    }

    showLoadingState(show) {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;

        if (show) {
            container.innerHTML = `
                <div class="assignment-item loading">
                    <div class="assignment-col title" data-label="Assignment">
                        <div class="assignment-title">Loading assignments...</div>
                    </div>
                    <div class="assignment-col status" data-label="Status">-</div>
                    <div class="assignment-col description" data-label="Description">-</div>
                    <div class="assignment-col due-date" data-label="Due Date">-</div>
                    <div class="assignment-col actions" data-label="Actions">-</div>
                </div>
            `;
        }
    }

    showEmptyState() {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="assignment-item empty-state">
                <div class="empty-icon">📝</div>
                <h3>No Assignments Found</h3>
                <p>Create your first assignment to get started!</p>
                <button class="btn btn-primary mt-2" onclick="document.getElementById('assignmentTitle').focus()">
                    Create First Assignment
                </button>
            </div>
        `;
    }

    showErrorState(message) {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="assignment-item error-state">
                <div class="error-icon">⚠️</div>
                <h3>Error Loading Assignments</h3>
                <p>${message}</p>
                <button class="btn btn-primary mt-2" onclick="dashboard.loadAssignments()">
                    Try Again
                </button>
            </div>
        `;
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add styles for alert if not already in CSS
        if (!document.querySelector('#alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                .alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 6px;
                    border-left: 4px solid;
                    background: #111111;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                .alert-success { border-left-color: #00C851; }
                .alert-error { border-left-color: #ff4444; }
                .alert-warning { border-left-color: #ffbb33; }
                .alert-info { border-left-color: #33b5e5; }
                .alert-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            const text = button.querySelector('.btn-text');
            const loadingText = button.querySelector('.btn-loading');
            if (text) text.style.display = 'none';
            if (loadingText) loadingText.style.display = 'inline';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            const text = button.querySelector('.btn-text');
            const loadingText = button.querySelector('.btn-loading');
            if (text) text.style.display = 'inline';
            if (loadingText) loadingText.style.display = 'none';
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Utility method to refresh data
    async refresh() {
        await this.loadAssignments();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new Dashboard();
});

// Global functions for HTML onclick handlers
window.toggleAssignment = function(id, isCompleted) {
    if (window.dashboard) {
        window.dashboard.toggleAssignment(id, isCompleted);
    }
};

window.deleteAssignment = function(id) {
    if (window.dashboard) {
        window.dashboard.deleteAssignment(id);
    }
};

window.loadAssignments = function() {
    if (window.dashboard) {
        window.dashboard.loadAssignments();
    }
};

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}
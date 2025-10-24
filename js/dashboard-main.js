// Dashboard Main - Handle Projects and Tasks on Main Calendar Page

class DashboardManager {
    constructor() {
        this.projects = [];
        this.tasks = [];
        this.staff = [];
        this.activities = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadAllData();
            this.updateDashboardStats();
            this.setupEventListeners();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
        }
    }

    async loadAllData() {
        try {
            const [projectsRes, tasksRes, staffRes, activitiesRes] = await Promise.all([
                fetch('tables/projects?limit=1000'),
                fetch('tables/tasks?limit=1000'),
                fetch('tables/staff_members'),
                fetch('tables/daily_activities?limit=1000')
            ]);

            if (projectsRes.ok) {
                const data = await projectsRes.json();
                this.projects = data.data || [];
            }

            if (tasksRes.ok) {
                const data = await tasksRes.json();
                this.tasks = data.data || [];
            }

            if (staffRes.ok) {
                const data = await staffRes.json();
                this.staff = data.data || [];
            }

            if (activitiesRes.ok) {
                const data = await activitiesRes.json();
                this.activities = data.data || [];
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats() {
        // Update active projects count
        const activeProjects = this.projects.filter(p => p.status === 'In Progress').length;
        const activeProjectsEl = document.getElementById('activeProjectsCount');
        if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;

        // Update pending tasks count
        const pendingTasks = this.tasks.filter(t => t.status !== 'Completed').length;
        const pendingTasksEl = document.getElementById('pendingTasksCount');
        if (pendingTasksEl) pendingTasksEl.textContent = pendingTasks;

        // Update overdue items count
        const now = Date.now();
        const overdueTasks = this.tasks.filter(t => 
            t.due_date && new Date(t.due_date).getTime() < now && t.status !== 'Completed'
        ).length;
        const overdueProjects = this.projects.filter(p => 
            p.due_date && new Date(p.due_date).getTime() < now && p.status !== 'Completed'
        ).length;
        const overdueEl = document.getElementById('overdueCount');
        if (overdueEl) overdueEl.textContent = overdueTasks + overdueProjects;

        // Calculate staff utilization
        const totalHours = this.staff.reduce((sum, s) => sum + (s.hours_per_week || 40), 0);
        const assignedHours = this.tasks
            .filter(t => t.status === 'In Progress')
            .reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
        const utilization = totalHours > 0 ? Math.round((assignedHours / totalHours) * 100) : 0;
        const utilizationEl = document.getElementById('staffUtilization');
        if (utilizationEl) utilizationEl.textContent = `${utilization}%`;
    }

    setupEventListeners() {
        // Create Project Form
        const createProjectForm = document.getElementById('createProjectForm');
        if (createProjectForm) {
            createProjectForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateProject(e.target);
            });
        }

        // Create Task Form
        const createTaskForm = document.getElementById('createTaskForm');
        if (createTaskForm) {
            createTaskForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateTask(e.target);
            });
        }
    }

    async handleCreateProject(form) {
        const formData = new FormData(form);
        
        const projectData = {
            title: formData.get('title'),
            client_name: formData.get('client_name'),
            description: formData.get('description'),
            project_manager_id: formData.get('project_manager_id') || null,
            priority: formData.get('priority') || 'Medium',
            status: 'Planning',
            start_date: formData.get('start_date') || null,
            due_date: formData.get('due_date') || null,
            budget_rmb: parseFloat(formData.get('budget_rmb')) || 0,
            estimated_hours: parseInt(formData.get('estimated_hours')) || 0,
            attachments: window.projectFilesTemp && window.projectFilesTemp.create ? window.projectFilesTemp.create : []
        };

        try {
            const response = await fetch('tables/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const newProject = await response.json();
                
                // Clear uploaded files
                if (window.clearProjectFiles) {
                    window.clearProjectFiles('create');
                }
                
                this.showNotification('Project created successfully!', 'success');
                this.closeCreateProjectModal();
                
                // Reload data and update stats
                await this.loadAllData();
                this.updateDashboardStats();
                
                // Refresh calendar if app exists
                if (window.app && window.app.calendar) {
                    window.app.loadCalendarEvents();
                }
                
                // Open the new project for editing
                if (window.projectsManager) {
                    window.projectsManager.projects = this.projects;
                    window.projectsManager.showProjectDetail(newProject);
                }
            } else {
                throw new Error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            this.showNotification('Error creating project. Please try again.', 'error');
        }
    }

    async handleCreateTask(form) {
        const formData = new FormData(form);
        
        const taskData = {
            project_id: formData.get('project_id') || null,
            title: formData.get('title'),
            description: formData.get('description'),
            assigned_to_id: formData.get('assigned_to_id') || null,
            status: formData.get('status') || 'Not Started',
            priority: formData.get('priority') || 'Medium',
            due_date: formData.get('due_date') || null,
            estimated_hours: parseInt(formData.get('estimated_hours')) || 0,
            actual_hours: 0,
            attachments: window.taskFilesTemp && window.taskFilesTemp.create ? window.taskFilesTemp.create : []
        };

        try {
            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const newTask = await response.json();
                
                // Clear uploaded files
                if (window.clearTaskFiles) {
                    window.clearTaskFiles('create');
                }
                
                this.showNotification('Task created successfully!', 'success');
                this.closeCreateTaskModal();
                
                // Reload data and update stats
                await this.loadAllData();
                this.updateDashboardStats();
                
                // Refresh calendar if app exists
                if (window.app && window.app.calendar) {
                    window.app.loadCalendarEvents();
                }
                
                // If projectsManager exists, sync tasks
                if (window.projectsManager) {
                    window.projectsManager.tasks = this.tasks;
                }
            } else {
                throw new Error('Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            this.showNotification('Error creating task. Please try again.', 'error');
        }
    }

    closeCreateProjectModal() {
        // Clear uploaded files
        if (window.clearProjectFiles) {
            window.clearProjectFiles('create');
        }
        
        const modal = document.getElementById('createProjectModal');
        if (modal) {
            modal.classList.add('hidden');
            const form = document.getElementById('createProjectForm');
            if (form) form.reset();
        }
    }

    closeCreateTaskModal() {
        // Clear uploaded files
        if (window.clearTaskFiles) {
            window.clearTaskFiles('create');
        }
        
        const modal = document.getElementById('createTaskModal');
        if (modal) {
            modal.classList.add('hidden');
            const form = document.getElementById('createTaskForm');
            if (form) form.reset();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for buttons
function showCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Populate staff dropdown if dashboardManager exists
        if (window.dashboardManager && window.dashboardManager.staff.length > 0) {
            const managerSelect = document.querySelector('#createProjectForm select[name="project_manager_id"]');
            if (managerSelect) {
                managerSelect.innerHTML = '<option value="">Select manager...</option>' +
                    window.dashboardManager.staff.map(s => 
                        `<option value="${s.id}">${s.name} (${s.office})</option>`
                    ).join('');
            }
        }
    }
}

function closeCreateProjectModal() {
    if (window.dashboardManager) {
        window.dashboardManager.closeCreateProjectModal();
    }
}

function showCreateTaskModal() {
    const modal = document.getElementById('createTaskModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Populate dropdowns if dashboardManager exists
        if (window.dashboardManager) {
            // Populate project dropdown
            if (window.dashboardManager.projects.length > 0) {
                const projectSelect = document.querySelector('#createTaskForm select[name="project_id"]');
                if (projectSelect) {
                    projectSelect.innerHTML = '<option value="">No project (standalone task)</option>' +
                        window.dashboardManager.projects
                            .filter(p => p.status !== 'Completed' && p.status !== 'Cancelled')
                            .map(p => `<option value="${p.id}">${p.title}</option>`)
                            .join('');
                }
            }
            
            // Populate staff dropdown
            if (window.dashboardManager.staff.length > 0) {
                const assignedSelect = document.querySelector('#createTaskForm select[name="assigned_to_id"]');
                if (assignedSelect) {
                    assignedSelect.innerHTML = '<option value="">Unassigned</option>' +
                        window.dashboardManager.staff.map(s => 
                            `<option value="${s.id}">${s.name} (${s.office})</option>`
                        ).join('');
                }
            }
        }
    }
}

function closeCreateTaskModal() {
    if (window.dashboardManager) {
        window.dashboardManager.closeCreateTaskModal();
    }
}

// Initialize dashboard manager on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the main dashboard page
    if (document.getElementById('activeProjectsCount')) {
        window.dashboardManager = new DashboardManager();
        console.log('Dashboard Manager initialized');
    }
});

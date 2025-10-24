class ProjectsManager {
    constructor() {
        this.projects = [];
        this.tasks = [];
        this.staff = [];
        this.timelineChart = null;
        this.filteredProjects = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.updateStats();
            this.renderProjects();
            this.createTimelineChart();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load projects data', 'error');
        }
    }

    async loadData() {
        try {
            // Load projects
            const projectsResponse = await fetch('tables/projects');
            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                this.projects = projectsData.data || [];
            }

            // Load tasks
            const tasksResponse = await fetch('tables/tasks');
            if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json();
                this.tasks = tasksData.data || [];
            }

            // Load staff
            const staffResponse = await fetch('tables/staff_members');
            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                this.staff = staffData.data || [];
            }

            this.filteredProjects = [...this.projects];
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    updateStats() {
        const totalProjects = this.projects.length;
        const inProgressProjects = this.projects.filter(p => p.status === 'In Progress').length;
        const totalBudget = this.projects.reduce((sum, p) => sum + (p.budget_rmb || 0), 0);
        const completedProjects = this.projects.filter(p => p.status === 'Completed').length;
        const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

        // Only update if elements exist (projects.html page)
        const totalProjectsEl = document.getElementById('totalProjects');
        const inProgressProjectsEl = document.getElementById('inProgressProjects');
        const totalBudgetEl = document.getElementById('totalBudget');
        const completionRateEl = document.getElementById('completionRate');
        
        if (totalProjectsEl) totalProjectsEl.textContent = totalProjects;
        if (inProgressProjectsEl) inProgressProjectsEl.textContent = inProgressProjects;
        if (totalBudgetEl) totalBudgetEl.textContent = `¥${totalBudget.toLocaleString()}`;
        if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
    }

    renderProjects() {
        const container = document.getElementById('projectsList');
        if (!container) return; // Skip if not on projects.html page
        container.innerHTML = '';

        if (this.filteredProjects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-project-diagram text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No projects found matching your criteria</p>
                </div>
            `;
            return;
        }

        this.filteredProjects.forEach(project => {
            const projectTasks = this.tasks.filter(t => t.project_id === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
            const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
            
            const projectManager = this.staff.find(s => s.id === project.project_manager_id);
            const dueDate = project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No due date';
            const isOverdue = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'Completed';

            const projectDiv = document.createElement('div');
            projectDiv.className = `project-card ${isOverdue ? 'border-l-red-500' : ''}`;
            projectDiv.onclick = () => this.showProjectDetail(project);
            projectDiv.style.cursor = 'pointer';

            projectDiv.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <span class="priority-dot priority-${project.priority.toLowerCase()}"></span>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-900">${project.title}</h3>
                            <p class="text-gray-600">${project.client_name || 'Internal Project'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="px-3 py-1 text-xs font-medium rounded-full ${this.getStatusBadgeClass(project.status)}">
                            ${project.status}
                        </span>
                        ${isOverdue ? '<div class="text-red-500 text-xs mt-1"><i class="fas fa-exclamation-triangle"></i> Overdue</div>' : ''}
                    </div>
                </div>

                <p class="text-gray-700 mb-4 line-clamp-2">${project.description || 'No description available'}</p>

                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-600">Progress</span>
                        <span class="text-sm font-medium">${Math.round(progress)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Manager:</span>
                        <p class="font-medium">${projectManager ? projectManager.name : 'Unassigned'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Tasks:</span>
                        <p class="font-medium">${completedTasks}/${projectTasks.length}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Due Date:</span>
                        <p class="font-medium ${isOverdue ? 'text-red-600' : ''}">${dueDate}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Budget:</span>
                        <p class="font-medium">¥${(project.budget_rmb || 0).toLocaleString()}</p>
                    </div>
                </div>

                ${projectTasks.length > 0 ? `
                <div class="mt-4 pt-4 border-t">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Recent Tasks</span>
                        <span class="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">View all</span>
                    </div>
                    <div class="mt-2 space-y-1">
                        ${projectTasks.slice(0, 3).map(task => `
                            <div class="flex items-center justify-between text-xs">
                                <span class="flex items-center gap-2">
                                    <i class="fas ${task.status === 'Completed' ? 'fa-check-circle text-green-500' : 'fa-clock text-yellow-500'}"></i>
                                    ${task.title}
                                </span>
                                <span class="text-gray-500">${task.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            `;

            container.appendChild(projectDiv);
        });
    }

    createTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) return; // Skip if not on projects.html page
        
        if (this.timelineChart) {
            this.timelineChart.destroy();
        }

        // Prepare data for timeline
        const projectsWithDates = this.projects.filter(p => p.start_date && p.due_date);
        
        if (projectsWithDates.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        const datasets = projectsWithDates.map((project, index) => {
            const startDate = new Date(project.start_date);
            const endDate = new Date(project.due_date);
            
            return {
                label: project.title,
                data: [
                    {
                        x: startDate.toISOString().split('T')[0],
                        y: index,
                        xEnd: endDate.toISOString().split('T')[0]
                    }
                ],
                backgroundColor: this.getPriorityColor(project.priority),
                borderColor: this.getPriorityColor(project.priority),
                borderWidth: 2,
                barThickness: 20
            };
        });

        this.timelineChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM dd'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Timeline'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index) {
                                return projectsWithDates[index]?.title || '';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const project = projectsWithDates[context.dataIndex];
                                return `${project.title}: ${project.status}`;
                            }
                        }
                    }
                }
            }
        });
    }

    showProjectDetail(project) {
        // Store current project for editing
        window.currentEditingProject = project;
        
        const projectTasks = this.tasks.filter(t => t.project_id === project.id);
        
        const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
        const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress').length;
        const blockedTasks = projectTasks.filter(t => t.status === 'Blocked').length;
        
        const totalHours = projectTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
        const actualHours = projectTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

        document.getElementById('projectDetailTitle').textContent = `Edit Project: ${project.title}`;
        
        const content = document.getElementById('projectDetailContent');
        content.innerHTML = `
            <form id="projectDetailForm" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Left Column: Project Details -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                            <input type="text" id="detailProjectTitle" value="${project.title || ''}" 
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                            <input type="text" id="detailClientName" value="${project.client_name || ''}" 
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                                <select id="detailPriority" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                                    <option value="Low" ${project.priority === 'Low' ? 'selected' : ''}>Low</option>
                                    <option value="Medium" ${project.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                    <option value="High" ${project.priority === 'High' ? 'selected' : ''}>High</option>
                                    <option value="Critical" ${project.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                <select id="detailStatus" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                                    <option value="Planning" ${project.status === 'Planning' ? 'selected' : ''}>Planning</option>
                                    <option value="In Progress" ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="On Hold" ${project.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                                    <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="Cancelled" ${project.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                            <select id="detailProjectManager" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                <option value="">Unassigned</option>
                                ${this.staff.map(s => `
                                    <option value="${s.id}" ${project.project_manager_id === s.id ? 'selected' : ''}>
                                        ${s.name} (${s.office})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" id="detailStartDate" value="${project.start_date ? project.start_date.split('T')[0] : ''}" 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input type="date" id="detailDueDate" value="${project.due_date ? project.due_date.split('T')[0] : ''}" 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Budget (¥)</label>
                                <input type="number" id="detailBudget" value="${project.budget_rmb || ''}" step="0.01"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                                <input type="number" id="detailEstimatedHours" value="${project.estimated_hours || ''}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="detailDescription" rows="4" 
                                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">${project.description || ''}</textarea>
                        </div>
                    </div>
                    
                    <!-- Right Column: Task Summary -->
                    <div class="space-y-4">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-3">Task Summary</h4>
                            <div class="grid grid-cols-2 gap-4 text-center text-sm">
                                <div>
                                    <div class="text-2xl font-bold text-blue-600">${projectTasks.length}</div>
                                    <div class="text-gray-600">Total Tasks</div>
                                </div>
                                <div>
                                    <div class="text-2xl font-bold text-green-600">${completedTasks}</div>
                                    <div class="text-gray-600">Completed</div>
                                </div>
                                <div>
                                    <div class="text-2xl font-bold text-yellow-600">${inProgressTasks}</div>
                                    <div class="text-gray-600">In Progress</div>
                                </div>
                                <div>
                                    <div class="text-2xl font-bold text-red-600">${blockedTasks}</div>
                                    <div class="text-gray-600">Blocked</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-3">Time Tracking</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Estimated Hours:</span>
                                    <span class="font-medium">${totalHours}h</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Actual Hours:</span>
                                    <span class="font-medium">${actualHours}h</span>
                                </div>
                                <div class="flex justify-between pt-2 border-t">
                                    <span class="text-gray-600 font-semibold">Variance:</span>
                                    <span class="font-bold ${actualHours > totalHours ? 'text-red-600' : 'text-green-600'}">
                                        ${actualHours > totalHours ? '+' : ''}${actualHours - totalHours}h
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-semibold">Tasks (${projectTasks.length})</h4>
                                <button type="button" onclick="window.projectsManager.showAddTaskModal('${project.id}')" 
                                        class="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-1"></i>Add Task
                                </button>
                            </div>
                            <div class="space-y-2 max-h-80 overflow-y-auto">
                                ${projectTasks.length === 0 ? 
                                    '<p class="text-gray-500 text-center py-4 text-sm">No tasks yet. Click "Add Task" to create one.</p>' :
                                    projectTasks.map(task => {
                                        const assignee = this.staff.find(s => s.id === task.assigned_to_id);
                                        return `
                                            <div class="task-item bg-white p-3 rounded border hover:border-blue-300 cursor-pointer" 
                                                 onclick="window.projectsManager.showEditTaskModal('${task.id}')">
                                                <div class="flex justify-between items-start mb-2">
                                                    <span class="font-medium text-sm">${task.title}</span>
                                                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusBadgeClass(task.status)}">
                                                        ${task.status}
                                                    </span>
                                                </div>
                                                <div class="flex justify-between text-xs text-gray-600">
                                                    <span><i class="fas fa-user mr-1"></i>${assignee ? assignee.name : 'Unassigned'}</span>
                                                    <span><i class="fas fa-clock mr-1"></i>${task.estimated_hours || 0}h</span>
                                                </div>
                                                ${task.due_date ? `
                                                    <div class="text-xs text-gray-500 mt-1">
                                                        <i class="fas fa-calendar mr-1"></i>${new Date(task.due_date).toLocaleDateString()}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }).join('')
                                }
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-4 border-t mt-6">
                    <button type="button" onclick="window.projectsManager.closeProjectDetailModal()" 
                            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onclick="window.projectsManager.saveProjectFromDetail()" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <i class="fas fa-save"></i>
                        Save Changes
                    </button>
                    <button type="button" onclick="window.projectsManager.deleteProjectFromDetail('${project.id}')" 
                            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <i class="fas fa-trash"></i>
                        Delete Project
                    </button>
                </div>
            </form>
        `;
        
        document.getElementById('projectDetailModal').classList.remove('hidden');
    }

    setupEventListeners() {
        // Only setup if elements exist (projects.html page)
        const searchEl = document.getElementById('searchProjects');
        const statusFilterEl = document.getElementById('statusFilter');
        const priorityFilterEl = document.getElementById('priorityFilter');
        
        if (!searchEl || !statusFilterEl || !priorityFilterEl) return;
        
        // Search functionality
        searchEl.addEventListener('input', (e) => {
            this.filterProjects();
        });

        // Filter change listeners
        statusFilterEl.addEventListener('change', () => {
            this.filterProjects();
        });

        priorityFilterEl.addEventListener('change', () => {
            this.filterProjects();
        });
    }

    filterProjects() {
        const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        this.filteredProjects = this.projects.filter(project => {
            const matchesSearch = !searchTerm || 
                project.title.toLowerCase().includes(searchTerm) ||
                (project.description && project.description.toLowerCase().includes(searchTerm)) ||
                (project.client_name && project.client_name.toLowerCase().includes(searchTerm));
            
            const matchesStatus = !statusFilter || project.status === statusFilter;
            const matchesPriority = !priorityFilter || project.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });

        this.renderProjects();
    }

    getPriorityColor(priority) {
        const colors = {
            'Low': '#9ca3af',
            'Medium': '#f59e0b',
            'High': '#ea580c',
            'Critical': '#dc2626'
        };
        return colors[priority] || '#3b82f6';
    }

    getStatusBadgeClass(status) {
        const classes = {
            'Planning': 'bg-gray-100 text-gray-600',
            'In Progress': 'bg-blue-100 text-blue-600',
            'On Hold': 'bg-yellow-100 text-yellow-600',
            'Completed': 'bg-green-100 text-green-600',
            'Cancelled': 'bg-red-100 text-red-600',
            'Not Started': 'bg-gray-100 text-gray-600',
            'Review': 'bg-purple-100 text-purple-600',
            'Blocked': 'bg-red-100 text-red-600'
        };
        return classes[status] || 'bg-gray-100 text-gray-600';
    }

    closeProjectDetailModal() {
        document.getElementById('projectDetailModal').classList.add('hidden');
        window.currentEditingProject = null;
    }

    async saveProjectFromDetail() {
        if (!window.currentEditingProject) return;
        
        const projectId = window.currentEditingProject.id;
        const projectData = {
            title: document.getElementById('detailProjectTitle').value,
            client_name: document.getElementById('detailClientName').value,
            priority: document.getElementById('detailPriority').value,
            status: document.getElementById('detailStatus').value,
            project_manager_id: document.getElementById('detailProjectManager').value || null,
            start_date: document.getElementById('detailStartDate').value || null,
            due_date: document.getElementById('detailDueDate').value || null,
            budget_rmb: parseFloat(document.getElementById('detailBudget').value) || 0,
            estimated_hours: parseInt(document.getElementById('detailEstimatedHours').value) || 0,
            description: document.getElementById('detailDescription').value
        };

        try {
            const response = await fetch(`tables/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                this.showNotification('Project updated successfully!', 'success');
                this.closeProjectDetailModal();
                await this.loadData();
                this.updateStats();
                this.renderProjects();
                this.createTimelineChart();
            } else {
                throw new Error('Failed to update project');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            this.showNotification('Error updating project. Please try again.', 'error');
        }
    }

    async deleteProjectFromDetail(projectId) {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone. All associated tasks will also be deleted.')) {
            return;
        }

        try {
            // First, delete all tasks associated with this project
            const projectTasks = this.tasks.filter(t => t.project_id === projectId);
            for (const task of projectTasks) {
                await fetch(`tables/tasks/${task.id}`, {
                    method: 'DELETE'
                });
            }

            // Then delete the project
            const response = await fetch(`tables/projects/${projectId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Project and all its tasks deleted successfully!', 'success');
                this.closeProjectDetailModal();
                await this.loadData();
                this.updateStats();
                this.renderProjects();
                this.createTimelineChart();
            } else {
                throw new Error('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            this.showNotification('Error deleting project. Please try again.', 'error');
        }
    }

    showAddTaskModal(projectId) {
        // Store project ID for task creation
        window.currentTaskProjectId = projectId;
        
        // Build modal HTML
        const modalHTML = `
            <div id="addTaskModal" class="fixed inset-0 bg-black bg-opacity-50 z-[70]">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-gray-900">
                                <i class="fas fa-tasks text-blue-600 mr-2"></i>
                                Add New Task
                            </h3>
                            <button onclick="window.projectsManager.closeAddTaskModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="addTaskForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                                <input type="text" id="taskTitle" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                                    <select id="taskAssignedTo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                        <option value="">Unassigned</option>
                                        ${this.staff.map(s => `<option value="${s.id}">${s.name} (${s.office})</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                    <select id="taskStatus" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                                    <input type="number" id="taskEstimatedHours" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input type="date" id="taskDueDate" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea id="taskDescription" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onclick="window.projectsManager.closeAddTaskModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <i class="fas fa-plus"></i>
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('addTaskModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submit listener
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewTask();
        });
    }

    closeAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        if (modal) modal.remove();
        window.currentTaskProjectId = null;
    }

    async saveNewTask() {
        const taskData = {
            project_id: window.currentTaskProjectId,
            title: document.getElementById('taskTitle').value,
            assigned_to_id: document.getElementById('taskAssignedTo').value || null,
            status: document.getElementById('taskStatus').value,
            estimated_hours: parseInt(document.getElementById('taskEstimatedHours').value) || 0,
            actual_hours: 0,
            due_date: document.getElementById('taskDueDate').value || null,
            description: document.getElementById('taskDescription').value,
            attachments: window.taskFilesTemp && window.taskFilesTemp.add ? window.taskFilesTemp.add : []
        };

        try {
            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                this.showNotification('Task created successfully!', 'success');
                
                // Clear uploaded files
                if (window.clearTaskFiles) {
                    window.clearTaskFiles('add');
                }
                
                this.closeAddTaskModal();
                await this.loadData();
                // Refresh project detail view
                const project = this.projects.find(p => p.id === window.currentTaskProjectId);
                if (project && window.currentEditingProject) {
                    window.currentEditingProject = project;
                    this.showProjectDetail(project);
                }
            } else {
                throw new Error('Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            this.showNotification('Error creating task. Please try again.', 'error');
        }
    }

    showEditTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        window.currentEditingTask = task;
        
        // Build modal HTML
        const modalHTML = `
            <div id="editTaskModal" class="fixed inset-0 bg-black bg-opacity-50 z-[70]">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-gray-900">
                                <i class="fas fa-edit text-blue-600 mr-2"></i>
                                Edit Task
                            </h3>
                            <button onclick="window.projectsManager.closeEditTaskModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="editTaskForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                                <input type="text" id="editTaskTitle" value="${task.title || ''}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                                    <select id="editTaskAssignedTo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                        <option value="">Unassigned</option>
                                        ${this.staff.map(s => `<option value="${s.id}" ${task.assigned_to_id === s.id ? 'selected' : ''}>${s.name} (${s.office})</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                    <select id="editTaskStatus" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                        <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="Review" ${task.status === 'Review' ? 'selected' : ''}>Review</option>
                                        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                        <option value="Blocked" ${task.status === 'Blocked' ? 'selected' : ''}>Blocked</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                                    <input type="number" id="editTaskEstimatedHours" value="${task.estimated_hours || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
                                    <input type="number" id="editTaskActualHours" value="${task.actual_hours || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input type="date" id="editTaskDueDate" value="${task.due_date ? task.due_date.split('T')[0] : ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea id="editTaskDescription" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">${task.description || ''}</textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onclick="window.projectsManager.closeEditTaskModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <i class="fas fa-save"></i>
                                    Save Changes
                                </button>
                                <button type="button" onclick="window.projectsManager.deleteTask('${task.id}')" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                                    <i class="fas fa-trash"></i>
                                    Delete Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editTaskModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submit listener
        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTaskEdits();
        });
    }

    closeEditTaskModal() {
        const modal = document.getElementById('editTaskModal');
        if (modal) modal.remove();
        window.currentEditingTask = null;
    }

    async saveTaskEdits() {
        if (!window.currentEditingTask) return;
        
        const taskId = window.currentEditingTask.id;
        
        // Merge existing attachments with new ones
        const existingAttachments = window.currentEditingTask.attachments || [];
        const newAttachments = window.taskFilesTemp && window.taskFilesTemp.edit ? window.taskFilesTemp.edit : [];
        const allAttachments = [...existingAttachments, ...newAttachments];
        
        const taskData = {
            title: document.getElementById('editTaskTitle').value,
            assigned_to_id: document.getElementById('editTaskAssignedTo').value || null,
            status: document.getElementById('editTaskStatus').value,
            estimated_hours: parseInt(document.getElementById('editTaskEstimatedHours').value) || 0,
            actual_hours: parseInt(document.getElementById('editTaskActualHours').value) || 0,
            due_date: document.getElementById('editTaskDueDate').value || null,
            description: document.getElementById('editTaskDescription').value,
            attachments: allAttachments
        };

        try {
            const response = await fetch(`tables/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                this.showNotification('Task updated successfully!', 'success');
                
                // Clear uploaded files
                if (window.clearTaskFiles) {
                    window.clearTaskFiles('edit');
                }
                
                this.closeEditTaskModal();
                await this.loadData();
                // Refresh project detail view
                const task = this.tasks.find(t => t.id === taskId);
                if (task && window.currentEditingProject) {
                    const project = this.projects.find(p => p.id === task.project_id);
                    if (project) {
                        window.currentEditingProject = project;
                        this.showProjectDetail(project);
                    }
                }
            } else {
                throw new Error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            this.showNotification('Error updating task. Please try again.', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`tables/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Task deleted successfully!', 'success');
                this.closeEditTaskModal();
                await this.loadData();
                // Refresh project detail view
                if (window.currentEditingProject) {
                    const project = this.projects.find(p => p.id === window.currentEditingProject.id);
                    if (project) {
                        window.currentEditingProject = project;
                        this.showProjectDetail(project);
                    }
                }
            } else {
                throw new Error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showNotification('Error deleting task. Please try again.', 'error');
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

// Global functions
function closeProjectDetail() {
    document.getElementById('projectDetailModal').classList.add('hidden');
}

function applyFilters() {
    if (window.projectsManager) {
        window.projectsManager.filterProjects();
    }
}

function exportProjects() {
    if (window.projectsManager) {
        // Implementation for exporting projects data
        console.log('Exporting projects...');
        window.projectsManager.showNotification('Export feature coming soon', 'info');
    }
}

function refreshData() {
    if (window.projectsManager) {
        window.projectsManager.loadData().then(() => {
            window.projectsManager.updateStats();
            window.projectsManager.renderProjects();
            window.projectsManager.createTimelineChart();
            window.projectsManager.showNotification('Data refreshed successfully', 'success');
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
    
    // Setup create project form submission
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createNewProject();
        });
    }
    
    // Setup edit project form submission
    const editProjectForm = document.getElementById('editProjectForm');
    if (editProjectForm) {
        editProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProjectEdits();
        });
    }
});

// Global variable to store current project being edited
let currentEditingProject = null;

// Show create project modal
function showCreateProjectModal() {
    // Populate staff dropdown
    const managerSelect = document.getElementById('createProjectManager');
    managerSelect.innerHTML = '<option value="">Select manager...</option>';
    if (window.projectsManager && window.projectsManager.staff) {
        window.projectsManager.staff.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = `${staff.name} - ${staff.role}`;
            managerSelect.appendChild(option);
        });
    }
    
    document.getElementById('createProjectModal').classList.remove('hidden');
}

// Close create project modal
function closeCreateProjectModal() {
    document.getElementById('createProjectModal').classList.add('hidden');
    document.getElementById('createProjectForm').reset();
}

// Create new project
async function createNewProject() {
    const formData = new FormData(document.getElementById('createProjectForm'));
    
    const projectData = {
        title: formData.get('title'),
        client_name: formData.get('client_name') || null,
        project_manager_id: formData.get('project_manager_id') || null,
        priority: formData.get('priority') || 'Medium',
        status: formData.get('status') || 'Planning',
        start_date: formData.get('start_date') || null,
        due_date: formData.get('due_date') || null,
        budget_rmb: parseFloat(formData.get('budget_rmb')) || 0,
        estimated_hours: parseInt(formData.get('estimated_hours')) || 0,
        actual_hours: 0,
        description: formData.get('description') || '',
        tags: []
    };

    try {
        const response = await fetch('tables/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            closeCreateProjectModal();
            if (window.projectsManager) {
                await window.projectsManager.loadData();
                window.projectsManager.updateStats();
                window.projectsManager.renderProjects();
                window.projectsManager.createTimelineChart();
                window.projectsManager.showNotification('Project created successfully!', 'success');
            }
        } else {
            alert('Error creating project. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating project. Please try again.');
    }
}

// Open edit project modal
async function openEditProjectModal() {
    if (!currentEditingProject) return;
    
    // Populate form with current project data
    document.getElementById('editProjectId').value = currentEditingProject.id;
    document.getElementById('editProjectTitle').value = currentEditingProject.title || '';
    document.getElementById('editProjectClient').value = currentEditingProject.client_name || '';
    document.getElementById('editProjectPriority').value = currentEditingProject.priority || 'Medium';
    document.getElementById('editProjectStatus').value = currentEditingProject.status || 'Planning';
    document.getElementById('editProjectStartDate').value = currentEditingProject.start_date || '';
    document.getElementById('editProjectDueDate').value = currentEditingProject.due_date || '';
    document.getElementById('editProjectBudget').value = currentEditingProject.budget_rmb || '';
    document.getElementById('editProjectEstHours').value = currentEditingProject.estimated_hours || '';
    document.getElementById('editProjectActualHours').value = currentEditingProject.actual_hours || '';
    document.getElementById('editProjectDescription').value = currentEditingProject.description || '';
    
    // Populate project manager dropdown
    const managerSelect = document.getElementById('editProjectManager');
    managerSelect.innerHTML = '<option value="">Select manager...</option>';
    if (window.projectsManager && window.projectsManager.staff) {
        window.projectsManager.staff.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = `${staff.name} - ${staff.role}`;
            if (staff.id === currentEditingProject.project_manager_id) {
                option.selected = true;
            }
            managerSelect.appendChild(option);
        });
    }
    
    // Close detail modal and open edit modal
    document.getElementById('projectDetailModal').classList.add('hidden');
    document.getElementById('editProjectModal').classList.remove('hidden');
}

// Close edit project modal
function closeEditProjectModal() {
    document.getElementById('editProjectModal').classList.add('hidden');
    currentEditingProject = null;
}

// Save project edits
async function saveProjectEdits() {
    const projectId = document.getElementById('editProjectId').value;
    
    const projectData = {
        title: document.getElementById('editProjectTitle').value,
        client_name: document.getElementById('editProjectClient').value,
        project_manager_id: document.getElementById('editProjectManager').value || null,
        priority: document.getElementById('editProjectPriority').value,
        status: document.getElementById('editProjectStatus').value,
        start_date: document.getElementById('editProjectStartDate').value || null,
        due_date: document.getElementById('editProjectDueDate').value || null,
        budget_rmb: parseFloat(document.getElementById('editProjectBudget').value) || 0,
        estimated_hours: parseInt(document.getElementById('editProjectEstHours').value) || 0,
        actual_hours: parseInt(document.getElementById('editProjectActualHours').value) || 0,
        description: document.getElementById('editProjectDescription').value
    };

    try {
        const response = await fetch(`tables/projects/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            closeEditProjectModal();
            if (window.projectsManager) {
                await window.projectsManager.loadData();
                window.projectsManager.updateStats();
                window.projectsManager.renderProjects();
                window.projectsManager.createTimelineChart();
                window.projectsManager.showNotification('Project updated successfully!', 'success');
            }
        } else {
            alert('Error updating project. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating project. Please try again.');
    }
}

// Delete project
async function deleteProject() {
    if (!currentEditingProject) return;
    
    if (!confirm(`Are you sure you want to delete the project "${currentEditingProject.title}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`tables/projects/${currentEditingProject.id}`, {
            method: 'DELETE'
        });

        if (response.ok || response.status === 204) {
            closeProjectDetail();
            if (window.projectsManager) {
                await window.projectsManager.loadData();
                window.projectsManager.updateStats();
                window.projectsManager.renderProjects();
                window.projectsManager.createTimelineChart();
                window.projectsManager.showNotification('Project deleted successfully!', 'success');
            }
        } else {
            alert('Error deleting project. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting project. Please try again.');
    }
}
class ProjectTimelineManager {
    constructor() {
        this.calendar = null;
        this.currentView = 'calendar';
        this.staff = [];
        this.projects = [];
        this.tasks = [];
        this.orders = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.initializeCalendar();
            this.updateDashboard();
            this.populateDropdowns();
            this.renderStaffWorkload();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    async loadData() {
        try {
            // Load staff members
            const staffResponse = await fetch('tables/staff_members');
            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                this.staff = staffData.data || [];
            }

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

            // Load orders
            const ordersResponse = await fetch('tables/orders');
            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                this.orders = ordersData.data || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Reload calendar events (called after creating/updating tasks/projects)
    async loadCalendarEvents() {
        await this.loadData();
        if (this.calendar) {
            const events = this.generateCalendarEvents();
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(events);
        }
        this.updateDashboard();
    }

    initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 700,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            editable: true,
            droppable: true,
            eventResizableFromStart: true,
            eventDurationEditable: true,
            events: this.generateCalendarEvents(),
            eventDidMount: this.customizeEvent.bind(this),
            eventClick: this.handleEventClick.bind(this),
            eventDrop: this.handleEventDrop.bind(this),
            eventResize: this.handleEventResize.bind(this),
            dateClick: this.handleDateClick.bind(this)
        });

        this.calendar.render();
    }

    generateCalendarEvents() {
        const events = [];

        // Add project events
        this.projects.forEach(project => {
            if (project.start_date && project.due_date) {
                events.push({
                    id: `project_${project.id}`,
                    title: `📊 ${project.title}`,
                    start: new Date(project.start_date).toISOString().split('T')[0],
                    end: new Date(project.due_date).toISOString().split('T')[0],
                    backgroundColor: this.getPriorityColor(project.priority),
                    borderColor: this.getPriorityColor(project.priority),
                    classNames: ['project-event'],
                    extendedProps: {
                        type: 'project',
                        data: project,
                        priority: project.priority,
                        status: project.status
                    }
                });
            }
        });

        // Add task events
        this.tasks.forEach(task => {
            if (task.start_date && task.due_date) {
                const assignee = this.staff.find(s => s.id === task.assigned_to_id);
                events.push({
                    id: `task_${task.id}`,
                    title: `✓ ${task.title}${assignee ? ` (${assignee.name})` : ''}`,
                    start: new Date(task.start_date).toISOString().split('T')[0],
                    end: new Date(task.due_date).toISOString().split('T')[0],
                    backgroundColor: this.getStatusColor(task.status),
                    borderColor: this.getPriorityColor(task.priority),
                    classNames: ['task-event'],
                    extendedProps: {
                        type: 'task',
                        data: task,
                        priority: task.priority,
                        status: task.status,
                        assignee: assignee
                    }
                });
            }
        });

        return events;
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

    getStatusColor(status) {
        const colors = {
            'Not Started': '#9ca3af',
            'In Progress': '#3b82f6',
            'Review': '#f59e0b',
            'Completed': '#10b981',
            'Blocked': '#ef4444',
            'Planning': '#9ca3af',
            'On Hold': '#f59e0b'
        };
        return colors[status] || '#6b7280';
    }

    customizeEvent(info) {
        const event = info.event;
        const el = info.el;
        
        // Add priority indicator
        const priorityDot = document.createElement('span');
        priorityDot.className = `priority-dot priority-${event.extendedProps.priority.toLowerCase()}`;
        el.prepend(priorityDot);
        
        // Add tooltip
        el.title = this.generateEventTooltip(event);
    }

    generateEventTooltip(event) {
        const data = event.extendedProps.data;
        const type = event.extendedProps.type;
        
        let tooltip = `${type.toUpperCase()}: ${data.title}\\n`;
        tooltip += `Priority: ${data.priority}\\n`;
        tooltip += `Status: ${data.status}\\n`;
        
        if (type === 'task' && event.extendedProps.assignee) {
            tooltip += `Assigned to: ${event.extendedProps.assignee.name}\\n`;
        }
        
        if (data.estimated_hours) {
            tooltip += `Estimated: ${data.estimated_hours}h`;
        }
        
        return tooltip;
    }

    handleEventClick(info) {
        const event = info.event;
        const data = event.extendedProps.data;
        const type = event.extendedProps.type;
        
        if (type === 'project') {
            this.showProjectDetails(data);
        } else if (type === 'task') {
            // Pass task object with id property
            this.showTaskDetails({ id: data.id });
        }
    }

    async handleEventDrop(info) {
        const event = info.event;
        const data = event.extendedProps.data;
        const type = event.extendedProps.type;
        
        const newStart = event.start.toISOString().split('T')[0];
        const newEnd = event.end ? event.end.toISOString().split('T')[0] : newStart;
        
        try {
            if (type === 'project') {
                await this.updateProject(data.id, {
                    start_date: new Date(newStart).getTime(),
                    due_date: new Date(newEnd).getTime()
                });
            } else if (type === 'task') {
                await this.updateTask(data.id, {
                    start_date: new Date(newStart).getTime(),
                    due_date: new Date(newEnd).getTime()
                });
            }
            
            this.showNotification(`${type} dates updated successfully`, 'success');
            await this.loadData();
        } catch (error) {
            console.error('Error updating event:', error);
            info.revert();
            this.showNotification('Failed to update dates', 'error');
        }
    }

    async handleEventResize(info) {
        await this.handleEventDrop(info);
    }

    handleDateClick(info) {
        // Open daily activities modal on date click
        const date = info.dateStr;
        showDailyActivitiesModal(date);
    }

    updateDashboard() {
        // Update stats
        const activeProjects = this.projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
        const pendingTasks = this.tasks.filter(t => t.status === 'Not Started' || t.status === 'In Progress').length;
        const overdueTasks = this.tasks.filter(t => {
            if (!t.due_date) return false;
            const dueDate = new Date(t.due_date);
            return dueDate < new Date() && t.status !== 'Completed';
        }).length;
        
        // Calculate staff utilization
        const totalCapacity = this.staff.reduce((sum, s) => sum + (s.capacity_hours_per_week || 0), 0);
        const totalAssigned = this.tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
        const utilization = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

        document.getElementById('activeProjectsCount').textContent = activeProjects;
        document.getElementById('pendingTasksCount').textContent = pendingTasks;
        document.getElementById('staffUtilization').textContent = `${utilization}%`;
        document.getElementById('overdueCount').textContent = overdueTasks;
        
        // Refresh calendar events
        if (this.calendar) {
            const events = this.generateCalendarEvents();
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(events);
        }
        
        // Refresh staff workload
        this.renderStaffWorkload();
        
        // Refresh tasks list if in list view
        if (this.currentView === 'list') {
            this.renderTasksList();
        }
    }

    renderStaffWorkload() {
        const container = document.getElementById('staffWorkloadList');
        container.innerHTML = '';

        this.staff.forEach(member => {
            const assignedTasks = this.tasks.filter(t => t.assigned_to_id === member.id);
            const totalHours = assignedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
            const utilization = member.capacity_hours_per_week ? 
                Math.round((totalHours / member.capacity_hours_per_week) * 100) : 0;
            
            const memberDiv = document.createElement('div');
            memberDiv.className = 'bg-gray-50 p-3 rounded-lg border cursor-pointer hover:shadow-md transition';
            
            // Add click handler to show staff tasks
            memberDiv.addEventListener('click', () => {
                this.showStaffTasksModal(member, assignedTasks);
            });
            
            const avatar = this.generateAvatar(member.name);
            const officeBadge = this.getOfficeBadge(member.office_location);
            
            memberDiv.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <div class="staff-avatar" style="background: ${avatar.color}">${avatar.initials}</div>
                    <div class="flex-1">
                        <div class="font-medium text-sm">${member.name}</div>
                        <div class="text-xs text-gray-500">${member.role}</div>
                    </div>
                    <span class="office-badge ${member.office_location.toLowerCase()}-badge">${officeBadge}</span>
                </div>
                <div class="mb-2">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Workload</span>
                        <span>${utilization}%</span>
                    </div>
                    <div class="workload-bar h-2 bg-gray-200 rounded">
                        <div class="h-full rounded transition-all duration-300" 
                             style="width: ${Math.min(utilization, 100)}%; background: ${this.getUtilizationColor(utilization)}">
                        </div>
                    </div>
                </div>
                <div class="text-xs text-gray-500">
                    ${assignedTasks.length} tasks • ${totalHours}h assigned
                </div>
            `;
            
            container.appendChild(memberDiv);
        });
    }

    generateAvatar(name) {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const color = colors[name.length % colors.length];
        
        return { initials, color };
    }

    getOfficeBadge(location) {
        const badges = {
            'Yiwu': '义乌',
            'Shenzhen': '深圳',
            'Greece': 'GR',
            'Remote': 'RM'
        };
        return badges[location] || location;
    }

    getUtilizationColor(utilization) {
        if (utilization <= 70) return '#10b981';
        if (utilization <= 90) return '#f59e0b';
        return '#ef4444';
    }

    populateDropdowns() {
        // Populate project manager dropdown
        const projectManagerSelect = document.getElementById('projectManagerSelect');
        projectManagerSelect.innerHTML = '<option value="">Select Manager</option>';
        
        // Populate task project dropdown
        const taskProjectSelect = document.getElementById('taskProjectSelect');
        taskProjectSelect.innerHTML = '<option value="">Select Project (Optional)</option>';
        
        // Populate task assignee dropdown
        const taskAssigneeSelect = document.getElementById('taskAssigneeSelect');
        taskAssigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
        
        this.staff.forEach(member => {
            const option1 = document.createElement('option');
            option1.value = member.id;
            option1.textContent = `${member.name} (${member.role})`;
            projectManagerSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = member.id;
            option2.textContent = `${member.name} (${member.role})`;
            taskAssigneeSelect.appendChild(option2);
        });
        
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            taskProjectSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        // Project form submission
        document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateProject(e.target);
        });

        // Task form submission
        document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateTask(e.target);
        });
    }

    async handleCreateProject(form) {
        const formData = new FormData(form);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            client_name: formData.get('client_name'),
            priority: formData.get('priority'),
            status: 'Planning',
            project_manager_id: formData.get('project_manager_id'),
            estimated_hours: parseFloat(formData.get('estimated_hours')) || 0,
            budget_rmb: parseFloat(formData.get('budget_rmb')) || 0,
            actual_hours: 0,
            tags: []
        };

        if (formData.get('start_date')) {
            projectData.start_date = new Date(formData.get('start_date')).getTime();
        }
        if (formData.get('due_date')) {
            projectData.due_date = new Date(formData.get('due_date')).getTime();
        }

        try {
            const response = await fetch('tables/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                this.showNotification('Project created successfully', 'success');
                this.closeCreateProjectModal();
                await this.loadData();
                this.calendar.refetchEvents();
                this.updateDashboard();
                this.populateDropdowns();
            } else {
                throw new Error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            this.showNotification('Failed to create project', 'error');
        }
    }

    async handleCreateTask(form) {
        const formData = new FormData(form);
        const taskData = {
            project_id: formData.get('project_id') || null,
            title: formData.get('title'),
            description: formData.get('description'),
            assigned_to_id: formData.get('assigned_to_id'),
            priority: formData.get('priority'),
            status: 'Not Started',
            estimated_hours: parseFloat(formData.get('estimated_hours')) || 0,
            actual_hours: 0,
            completion_percentage: 0,
            dependencies: [],
            notes: ''
        };

        if (formData.get('start_date')) {
            taskData.start_date = new Date(formData.get('start_date')).getTime();
        }
        if (formData.get('due_date')) {
            taskData.due_date = new Date(formData.get('due_date')).getTime();
        }

        try {
            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                this.showNotification('Task created successfully', 'success');
                this.closeCreateTaskModal();
                await this.loadData();
                this.calendar.refetchEvents();
                this.updateDashboard();
                this.renderStaffWorkload();
            } else {
                throw new Error('Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            this.showNotification('Failed to create task', 'error');
        }
    }

    async updateProject(id, updates) {
        const response = await fetch(`tables/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update project');
        }
        
        return response.json();
    }

    async updateTask(id, updates) {
        const response = await fetch(`tables/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        return response.json();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    toggleView() {
        const calendarView = document.getElementById('calendarView');
        const listView = document.getElementById('listView');
        const toggleBtn = document.getElementById('viewToggle');
        
        if (this.currentView === 'calendar') {
            calendarView.classList.add('hidden');
            listView.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-calendar"></i> Calendar View';
            this.currentView = 'list';
            this.renderTasksList();
        } else {
            calendarView.classList.remove('hidden');
            listView.classList.add('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-list"></i> List View';
            this.currentView = 'calendar';
        }
    }

    renderTasksList() {
        const container = document.getElementById('tasksList');
        container.innerHTML = '';

        // Initialize selected items set if not exists
        if (!this.selectedTasksListItems) {
            this.selectedTasksListItems = new Set();
        }

        const allItems = [
            ...this.projects.map(p => ({ ...p, type: 'project' })),
            ...this.tasks.map(t => ({ ...t, type: 'task' }))
        ].sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
        });

        allItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'task-card relative';
            itemDiv.dataset.itemId = item.id;
            itemDiv.dataset.itemType = item.type;
            
            // Add click handler to open edit modal
            itemDiv.addEventListener('click', (e) => {
                // Don't open modal if clicking checkbox or delete button area
                if (e.target.type === 'checkbox' || e.target.closest('.task-checkbox-container')) {
                    return;
                }
                
                if (item.type === 'project') {
                    this.showProjectDetails(item);
                } else {
                    this.showTaskDetails(item);
                }
            });
            
            const assignee = item.type === 'task' && item.assigned_to_id ? 
                this.staff.find(s => s.id === item.assigned_to_id) : null;
            
            const dueDate = item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date';
            
            const isSelected = this.selectedTasksListItems.has(item.id);
            
            itemDiv.innerHTML = `
                <div class="flex items-start gap-3">
                    <!-- Checkbox -->
                    <div class="task-checkbox-container flex-shrink-0 pt-1" onclick="event.stopPropagation()">
                        <input type="checkbox" 
                               class="task-list-checkbox w-4 h-4 rounded border-gray-300" 
                               data-item-id="${item.id}"
                               data-item-type="${item.type}"
                               ${isSelected ? 'checked' : ''}
                               onchange="window.app.toggleTaskListSelection('${item.id}', '${item.type}', this.checked)">
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center gap-2">
                                <span class="priority-dot priority-${item.priority.toLowerCase()}"></span>
                                <span class="text-lg">${item.type === 'project' ? '📊' : '✓'}</span>
                                <h4 class="font-semibold">${item.title}</h4>
                            </div>
                            <span class="text-xs px-2 py-1 rounded-full ${this.getStatusBadgeClass(item.status)}">${item.status}</span>
                        </div>
                        <p class="text-gray-600 text-sm mb-2">${item.description || 'No description'}</p>
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span>Due: ${dueDate}</span>
                            ${assignee ? `<span>Assigned to: ${assignee.name}</span>` : ''}
                            ${item.estimated_hours ? `<span>${item.estimated_hours}h estimated</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(itemDiv);
        });
        
        // Update UI to reflect current selection state
        this.updateTasksListSelectionUI();
    }

    getStatusBadgeClass(status) {
        const classes = {
            'Planning': 'bg-gray-100 text-gray-600',
            'Not Started': 'bg-gray-100 text-gray-600',
            'In Progress': 'bg-blue-100 text-blue-600',
            'Review': 'bg-yellow-100 text-yellow-600',
            'Completed': 'bg-green-100 text-green-600',
            'Blocked': 'bg-red-100 text-red-600',
            'On Hold': 'bg-yellow-100 text-yellow-600'
        };
        return classes[status] || 'bg-gray-100 text-gray-600';
    }

    // ==========================================
    // TASKS LIST SELECTION & DELETE FUNCTIONS
    // ==========================================

    toggleTaskListSelection(itemId, itemType, isChecked) {
        if (!this.selectedTasksListItems) {
            this.selectedTasksListItems = new Set();
        }

        if (isChecked) {
            this.selectedTasksListItems.add(itemId);
        } else {
            this.selectedTasksListItems.delete(itemId);
        }

        this.updateTasksListSelectionUI();
    }

    toggleSelectAllTasksList(selectAll) {
        if (!this.selectedTasksListItems) {
            this.selectedTasksListItems = new Set();
        }

        const checkboxes = document.querySelectorAll('.task-list-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
            const itemId = checkbox.dataset.itemId;
            
            if (selectAll) {
                this.selectedTasksListItems.add(itemId);
            } else {
                this.selectedTasksListItems.delete(itemId);
            }
        });

        this.updateTasksListSelectionUI();
    }

    updateTasksListSelectionUI() {
        if (!this.selectedTasksListItems) {
            this.selectedTasksListItems = new Set();
        }

        const count = this.selectedTasksListItems.size;
        const deleteBtn = document.getElementById('deleteSelectedTasksBtn');
        const countSpan = document.getElementById('selectedTasksCount');
        const selectAllCheckbox = document.getElementById('selectAllTasksList');

        if (deleteBtn) {
            if (count > 0) {
                deleteBtn.classList.remove('hidden');
            } else {
                deleteBtn.classList.add('hidden');
            }
        }

        if (countSpan) {
            countSpan.textContent = count;
        }

        // Update "Select All" checkbox state
        if (selectAllCheckbox) {
            const totalCheckboxes = document.querySelectorAll('.task-list-checkbox').length;
            selectAllCheckbox.checked = count > 0 && count === totalCheckboxes;
            selectAllCheckbox.indeterminate = count > 0 && count < totalCheckboxes;
        }
    }

    async deleteSelectedTasksList() {
        if (!this.selectedTasksListItems || this.selectedTasksListItems.size === 0) {
            alert('⚠️ No items selected');
            return;
        }

        const itemIds = Array.from(this.selectedTasksListItems);
        const confirmed = confirm(`Are you sure you want to delete ${itemIds.length} selected item(s)?\n\nThis action cannot be undone.`);
        
        if (!confirmed) return;

        const deleteBtn = document.getElementById('deleteSelectedTasksBtn');
        const originalHTML = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Deleting...';

        try {
            let successCount = 0;
            let failCount = 0;
            const failedItems = [];

            for (const itemId of itemIds) {
                try {
                    // Determine item type from the DOM
                    const itemDiv = document.querySelector(`[data-item-id="${itemId}"]`);
                    const itemType = itemDiv ? itemDiv.dataset.itemType : null;

                    if (!itemType) {
                        console.warn(`Could not determine type for item ${itemId}`);
                        failCount++;
                        failedItems.push(itemId);
                        continue;
                    }

                    const endpoint = itemType === 'project' ? `tables/projects/${itemId}` : `tables/tasks/${itemId}`;
                    const response = await fetch(endpoint, { method: 'DELETE' });

                    if (response.ok || response.status === 204) {
                        successCount++;
                        console.log(`✅ Deleted ${itemType} ${itemId}`);
                    } else {
                        console.error(`❌ Failed to delete ${itemType} ${itemId}:`, response.status);
                        failCount++;
                        failedItems.push(itemId);
                    }
                } catch (error) {
                    console.error(`❌ Error deleting item ${itemId}:`, error);
                    failCount++;
                    failedItems.push(itemId);
                }
            }

            // Show results
            if (successCount > 0 && failCount === 0) {
                alert(`✅ Successfully deleted ${successCount} item(s)!`);
            } else if (successCount > 0 && failCount > 0) {
                alert(`⚠️ Deleted ${successCount} item(s), but ${failCount} failed.\n\nCheck browser console for details.`);
            } else {
                alert(`❌ Failed to delete ${failCount} item(s).\n\nCheck browser console for details.`);
            }

            // Clear selection and reload data
            this.selectedTasksListItems.clear();
            await this.loadData();
            this.updateDashboard();
            this.renderTasksList();

        } catch (error) {
            console.error('❌ Error in delete operation:', error);
            alert('❌ Error deleting items. Please try again.');
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalHTML;
        }
    }

    showProjectDetails(project) {
        // Open editable project form via ProjectsManager
        if (window.projectsManager) {
            window.projectsManager.showProjectDetail(project);
        } else {
            console.error('ProjectsManager not loaded');
            alert('Unable to open project editor. Please refresh the page.');
        }
    }

    showTaskDetails(task) {
        // Open editable task form via TaskSyncManager
        if (window.taskSyncManager) {
            window.taskSyncManager.openEditTaskModal(task.id);
        } else if (window.projectsManager) {
            // Fallback to old method
            window.projectsManager.showEditTaskModal(task.id);
        } else {
            console.error('TaskSyncManager not loaded');
            alert('Unable to open task editor. Please refresh the page.');
        }
    }

    showStaffTasksModal(member, assignedTasks) {
        // Use the existing stat details modal
        const modal = document.getElementById('statDetailsModal');
        const title = document.getElementById('statModalTitle');
        const content = document.getElementById('statModalContent');
        
        const avatar = this.generateAvatar(member.name);
        const totalHours = assignedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
        const utilization = member.capacity_hours_per_week ? 
            Math.round((totalHours / member.capacity_hours_per_week) * 100) : 0;
        
        title.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style="background: ${avatar.color}">
                    ${avatar.initials}
                </div>
                <div>
                    <div class="text-xl font-bold">${member.name}</div>
                    <div class="text-sm text-gray-500 font-normal">${member.role} - ${member.office_location}</div>
                </div>
            </div>
        `;
        
        if (assignedTasks.length === 0) {
            content.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fas fa-inbox text-5xl mb-3"></i>
                    <p>No tasks assigned to ${member.name}</p>
                </div>
            `;
        } else {
            // Show workload summary
            let summaryHTML = `
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-blue-600">${assignedTasks.length}</div>
                            <div class="text-sm text-gray-600">Tasks</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-purple-600">${totalHours}h</div>
                            <div class="text-sm text-gray-600">Assigned Hours</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold ${utilization > 100 ? 'text-red-600' : utilization > 80 ? 'text-yellow-600' : 'text-green-600'}">${utilization}%</div>
                            <div class="text-sm text-gray-600">Utilization</div>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div class="${utilization > 100 ? 'bg-red-600' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'} h-2 rounded-full transition-all" style="width: ${Math.min(utilization, 100)}%"></div>
                    </div>
                </div>
            `;
            
            // Show tasks list
            summaryHTML += assignedTasks.map(task => {
                const dueDate = task.due_date ? new Date(task.due_date) : null;
                const isOverdue = dueDate && dueDate < new Date() && task.status !== 'Completed';
                
                return `
                    <div class="bg-white border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'} rounded-lg p-4 mb-3 hover:shadow-md transition cursor-pointer" onclick="window.openEditTaskModal('${task.id}')">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900">${task.title}</h4>
                                <p class="text-sm text-gray-600">${task.description || 'No description'}</p>
                            </div>
                            <span class="px-2 py-1 text-xs rounded-full ${this.getStatusBadgeClass(task.status)} ml-3">${task.status}</span>
                        </div>
                        <div class="flex items-center gap-4 text-sm text-gray-600">
                            ${task.due_date ? `<span><i class="fas fa-calendar ${isOverdue ? 'text-red-600' : ''} mr-1"></i>${task.due_date}</span>` : ''}
                            ${task.estimated_hours ? `<span><i class="fas fa-clock mr-1"></i>${task.estimated_hours}h</span>` : ''}
                            ${task.priority ? `<span class="px-2 py-1 text-xs rounded-full bg-${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'gray'}-100 text-${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'gray'}-800">${task.priority}</span>` : ''}
                            ${isOverdue ? '<span class="text-red-600 font-semibold"><i class="fas fa-exclamation-triangle mr-1"></i>Overdue</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            content.innerHTML = summaryHTML;
        }
        
        modal.classList.remove('hidden');
    }
}

// Global functions for modal management
function showCreateProjectModal() {
    document.getElementById('createProjectModal').classList.remove('hidden');
}

function closeCreateProjectModal() {
    document.getElementById('createProjectModal').classList.add('hidden');
    document.getElementById('createProjectForm').reset();
}

function showCreateTaskModal() {
    document.getElementById('createTaskModal').classList.remove('hidden');
}

function closeCreateTaskModal() {
    document.getElementById('createTaskModal').classList.add('hidden');
    document.getElementById('createTaskForm').reset();
}

function toggleView() {
    if (window.app) {
        window.app.toggleView();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProjectTimelineManager();
});
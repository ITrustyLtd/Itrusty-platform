// Task Sync Manager - Syncs Tasks with Daily Activities
class TaskSyncManager {
    constructor() {
        this.currentEditingTaskId = null;
    }

    // Open Edit Task Modal from anywhere (Dashboard, Staff Modal, Daily Activities)
    async openEditTaskModal(taskId) {
        try {
            // Fetch task data
            const response = await fetch(`tables/tasks/${taskId}`);
            if (!response.ok) throw new Error('Task not found');
            
            const task = await response.json();
            this.currentEditingTaskId = taskId;
            
            // Load staff list for dropdown
            await this.loadStaffDropdown();
            
            // Populate form fields
            document.getElementById('editTaskTitle').value = task.title || '';
            document.getElementById('editTaskAssignee').value = task.assigned_to_id || '';
            document.getElementById('editTaskPriority').value = task.priority || 'Medium';
            document.getElementById('editTaskStatus').value = task.status || 'Pending';
            document.getElementById('editTaskDueDate').value = task.due_date ? task.due_date.split('T')[0] : '';
            document.getElementById('editTaskEstimatedHours').value = task.estimated_hours || '';
            document.getElementById('editTaskActualHours').value = task.actual_hours || '';
            document.getElementById('editTaskDescription').value = task.description || '';
            document.getElementById('editTaskNotes').value = task.notes || '';
            
            // Show modal
            document.getElementById('editTaskModal').classList.remove('hidden');
            
        } catch (error) {
            console.error('Error opening edit task modal:', error);
            alert('❌ Error loading task data');
        }
    }

    // Load staff list into dropdown
    async loadStaffDropdown() {
        try {
            const response = await fetch('tables/staff_members');
            if (!response.ok) return;
            
            const data = await response.json();
            const staffMembers = data.data || [];
            
            const dropdown = document.getElementById('editTaskAssignee');
            if (!dropdown) return;
            
            // Clear existing options except the first one
            dropdown.innerHTML = '<option value="">Select staff...</option>';
            
            // Add staff options
            staffMembers.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id;
                option.textContent = `${staff.name} (${staff.role || staff.office_location})`;
                dropdown.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading staff list:', error);
        }
    }

    // Close Edit Task Modal
    closeEditTaskModal() {
        document.getElementById('editTaskModal').classList.add('hidden');
        this.currentEditingTaskId = null;
    }

    // Save Task Edits
    async saveTaskEdits() {
        if (!this.currentEditingTaskId) {
            alert('❌ No task selected');
            return;
        }

        const taskData = {
            title: document.getElementById('editTaskTitle').value,
            assigned_to_id: document.getElementById('editTaskAssignee').value || null,
            priority: document.getElementById('editTaskPriority').value,
            status: document.getElementById('editTaskStatus').value,
            due_date: document.getElementById('editTaskDueDate').value || null,
            estimated_hours: parseFloat(document.getElementById('editTaskEstimatedHours').value) || 0,
            actual_hours: parseFloat(document.getElementById('editTaskActualHours').value) || 0,
            description: document.getElementById('editTaskDescription').value,
            notes: document.getElementById('editTaskNotes').value
        };

        try {
            console.log('💾 Saving task:', this.currentEditingTaskId, taskData);
            
            const response = await fetch(`tables/tasks/${this.currentEditingTaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();
            console.log('✅ Task updated:', updatedTask);

            // Sync with Daily Activities if task has a due date
            if (updatedTask.due_date) {
                await this.syncTaskToDailyActivity(updatedTask);
            }

            alert('✅ Task updated successfully!');
            this.closeEditTaskModal();
            
            // Refresh data in all managers
            if (window.projectsManager) {
                await window.projectsManager.loadData();
            }
            if (window.app) {
                await window.app.loadData();
                window.app.updateDashboard();
            }
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                // Refresh calendar if on dashboard
                if (window.calendar) {
                    window.calendar.refetchEvents();
                }
            }

        } catch (error) {
            console.error('❌ Error updating task:', error);
            alert('❌ Error updating task. Please try again.');
        }
    }

    // Delete Task
    async deleteTask() {
        if (!this.currentEditingTaskId) return;

        if (!confirm('⚠️ Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`tables/tasks/${this.currentEditingTaskId}`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                alert('✅ Task deleted successfully!');
                this.closeEditTaskModal();
                
                // Refresh data in all managers
                if (window.projectsManager) {
                    await window.projectsManager.loadData();
                }
                if (window.app) {
                    await window.app.loadData();
                    window.app.updateDashboard();
                }
                if (window.calendar) {
                    window.calendar.refetchEvents();
                }
            } else {
                throw new Error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('❌ Error deleting task');
        }
    }

    // Sync Task to Daily Activity
    async syncTaskToDailyActivity(task) {
        try {
            // Check if activity already exists for this task
            const searchResponse = await fetch(`tables/daily_activities?search=${task.id}`);
            const searchData = await searchResponse.json();
            const existingActivities = searchData.data || [];
            
            const existingActivity = existingActivities.find(a => 
                a.related_project_id === task.id || 
                a.title === task.title
            );

            const activityData = {
                activity_type: 'other',
                activity_date: task.due_date.split('T')[0],
                title: task.title,
                description: task.description || '',
                assigned_to: task.assigned_to_id,
                status: this.mapTaskStatusToActivityStatus(task.status),
                priority: task.priority ? task.priority.toLowerCase() : 'medium',
                related_project_id: task.project_id,
                notes: `Synced from Task: ${task.title}`
            };

            if (existingActivity) {
                // Update existing activity
                await fetch(`tables/daily_activities/${existingActivity.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activityData)
                });
                console.log('✅ Updated existing daily activity');
            } else {
                // Create new activity
                await fetch('tables/daily_activities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activityData)
                });
                console.log('✅ Created new daily activity');
            }
        } catch (error) {
            console.error('Error syncing to daily activity:', error);
            // Don't throw - sync failure shouldn't block task update
        }
    }

    // Create Task from Daily Activity
    async createTaskFromActivity(activity) {
        try {
            const taskData = {
                title: activity.title,
                description: activity.description || '',
                assigned_to_id: activity.assigned_to,
                status: this.mapActivityStatusToTaskStatus(activity.status),
                priority: activity.priority ? activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1) : 'Medium',
                due_date: activity.activity_date,
                estimated_hours: 0,
                actual_hours: 0,
                project_id: activity.related_project_id,
                notes: `Created from Daily Activity: ${activity.title}`
            };

            const response = await fetch('tables/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const newTask = await response.json();
                console.log('✅ Created task from activity:', newTask);
                
                // Update activity to reference the task
                await fetch(`tables/daily_activities/${activity.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        related_project_id: newTask.id,
                        notes: (activity.notes || '') + `\nLinked to Task ID: ${newTask.id}`
                    })
                });
                
                return newTask;
            }
        } catch (error) {
            console.error('Error creating task from activity:', error);
            throw error;
        }
    }

    // Map Task Status to Activity Status
    mapTaskStatusToActivityStatus(taskStatus) {
        const statusMap = {
            'Pending': 'pending',
            'In Progress': 'in_progress',
            'Completed': 'completed',
            'On Hold': 'pending',
            'Blocked': 'pending',
            'Review': 'in_progress'
        };
        return statusMap[taskStatus] || 'pending';
    }

    // Map Activity Status to Task Status
    mapActivityStatusToTaskStatus(activityStatus) {
        const statusMap = {
            'pending': 'Pending',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'On Hold'
        };
        return statusMap[activityStatus] || 'Pending';
    }

    // Load tasks for a specific staff member
    async loadStaffTasks(staffId) {
        try {
            const response = await fetch(`tables/tasks?limit=1000`);
            if (!response.ok) return [];
            
            const data = await response.json();
            const allTasks = data.data || [];
            
            // Filter tasks for this staff member
            return allTasks.filter(task => task.assigned_to_id === staffId);
        } catch (error) {
            console.error('Error loading staff tasks:', error);
            return [];
        }
    }

    // Sync all tasks to daily activities (bulk sync)
    async syncAllTasksToDailyActivities() {
        try {
            const response = await fetch('tables/tasks?limit=1000');
            const data = await response.json();
            const tasks = data.data || [];
            
            let syncCount = 0;
            for (const task of tasks) {
                if (task.due_date && task.status !== 'Completed') {
                    await this.syncTaskToDailyActivity(task);
                    syncCount++;
                }
            }
            
            console.log(`✅ Synced ${syncCount} tasks to daily activities`);
            return syncCount;
        } catch (error) {
            console.error('Error syncing all tasks:', error);
            return 0;
        }
    }
}

// Initialize global TaskSyncManager
window.taskSyncManager = new TaskSyncManager();

// Expose functions globally for onclick handlers
window.openEditTaskModal = (taskId) => window.taskSyncManager.openEditTaskModal(taskId);
window.closeEditTaskModal = () => window.taskSyncManager.closeEditTaskModal();
window.saveTaskEdits = () => window.taskSyncManager.saveTaskEdits();
window.deleteTask = () => window.taskSyncManager.deleteTask();

console.log('✅ Task Sync Manager initialized');

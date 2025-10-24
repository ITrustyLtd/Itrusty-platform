class StaffDashboard {
    constructor() {
        this.staff = [];
        this.activities = [];
        this.tasks = [];
        this.projects = [];
        this.selectedStaffId = null;
        this.timeRange = 30;
        this.activityChart = null;
        this.trendsChart = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.populateStaffSelector();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    async loadData() {
        try {
            // Load all necessary data
            const [staffResponse, activitiesResponse, tasksResponse, projectsResponse] = await Promise.all([
                fetch('tables/staff_members'),
                fetch('tables/daily_activities'),
                fetch('tables/tasks'),
                fetch('tables/projects')
            ]);

            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                this.staff = staffData.data || [];
            }

            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                this.activities = activitiesData.data || [];
            }

            if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json();
                this.tasks = tasksData.data || [];
            }

            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                this.projects = projectsData.data || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    populateStaffSelector() {
        const selector = document.getElementById('staffSelector');
        selector.innerHTML = '<option value="">Select Staff Member</option>';
        
        this.staff.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.office_location})`;
            selector.appendChild(option);
        });
    }

    setupEventListeners() {
        document.getElementById('staffSelector').addEventListener('change', (e) => {
            this.selectedStaffId = e.target.value;
            if (this.selectedStaffId) {
                this.showStaffDashboard();
            } else {
                this.hideStaffDashboard();
            }
        });

        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.timeRange = parseInt(e.target.value);
            if (this.selectedStaffId) {
                this.updateStaffMetrics();
                this.renderPersonalTimeline();
                this.renderWorkloadCalendar();
                this.createCharts();
            }
        });
    }

    showStaffDashboard() {
        document.getElementById('selectStaffMessage').classList.add('hidden');
        document.getElementById('staffDashboard').classList.remove('hidden');
        
        const selectedStaff = this.staff.find(s => s.id === this.selectedStaffId);
        if (selectedStaff) {
            this.renderStaffProfile(selectedStaff);
            this.updateStaffMetrics();
            this.renderPersonalTimeline();
            this.renderWorkloadCalendar();
            this.renderSkillsList(selectedStaff);
            this.renderActiveAssignments();
            this.createCharts();
        }
    }

    hideStaffDashboard() {
        document.getElementById('selectStaffMessage').classList.remove('hidden');
        document.getElementById('staffDashboard').classList.add('hidden');
    }

    renderStaffProfile(staff) {
        const avatar = this.generateAvatar(staff.name);
        
        document.getElementById('staffAvatar').style.background = avatar.color;
        document.getElementById('staffAvatar').textContent = avatar.initials;
        document.getElementById('staffName').textContent = staff.name;
        document.getElementById('staffRole').textContent = staff.role;
        document.getElementById('staffLocation').textContent = staff.office_location;
        document.getElementById('staffCapacity').textContent = staff.capacity_hours_per_week || 40;
        document.getElementById('staffSkillsCount').textContent = (staff.skills || []).length;
    }

    updateStaffMetrics() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.timeRange);
        
        const staffActivities = this.activities.filter(activity => 
            activity.staff_id === this.selectedStaffId &&
            new Date(activity.activity_date) >= cutoffDate
        );
        
        const totalHours = staffActivities.reduce((sum, activity) => sum + (activity.hours_spent || 0), 0);
        const completedActivities = staffActivities.filter(activity => activity.outcome === 'Completed').length;
        const completionRate = staffActivities.length > 0 ? 
            Math.round((completedActivities / staffActivities.length) * 100) : 0;
        const avgHoursPerDay = this.timeRange > 0 ? (totalHours / this.timeRange).toFixed(1) : 0;
        
        const selectedStaff = this.staff.find(s => s.id === this.selectedStaffId);
        const weeklyCapacity = selectedStaff?.capacity_hours_per_week || 40;
        const weeksInRange = Math.ceil(this.timeRange / 7);
        const expectedHours = weeklyCapacity * weeksInRange;
        const utilization = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0;
        
        document.getElementById('staffTotalHours').textContent = totalHours.toFixed(1);
        document.getElementById('staffActivitiesCount').textContent = staffActivities.length;
        document.getElementById('staffCompletionRate').textContent = `${completionRate}%`;
        document.getElementById('staffAvgHours').textContent = avgHoursPerDay;
        document.getElementById('staffUtilization').textContent = `${utilization}%`;
    }

    renderPersonalTimeline() {
        const container = document.getElementById('personalTimeline');
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.timeRange);
        
        const staffActivities = this.activities
            .filter(activity => 
                activity.staff_id === this.selectedStaffId &&
                new Date(activity.activity_date) >= cutoffDate
            )
            .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date))
            .slice(0, 20); // Show last 20 activities
        
        if (staffActivities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-3xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">No activities recorded in the selected time range</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = staffActivities.map(activity => `
            <div class="activity-entry" onclick="showActivityDetail('${activity.id}')">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                        <span class="w-3 h-3 rounded-full ${this.getActivityColor(activity.activity_type)}"></span>
                        <div>
                            <h4 class="font-medium">${activity.title}</h4>
                            <p class="text-sm text-gray-600">${this.formatDate(activity.activity_date)} • ${activity.start_time} - ${activity.end_time}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${this.getOutcomeClass(activity.outcome)}">${activity.outcome}</span>
                </div>
                <p class="text-sm text-gray-700 mb-2">${activity.details || 'No details provided'}</p>
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>${activity.activity_type}</span>
                    <span>${activity.hours_spent || 0}h spent</span>
                </div>
            </div>
        `).join('');
    }

    renderWorkloadCalendar() {
        const container = document.getElementById('workloadCalendar');
        const today = new Date();
        
        // Create 30-day calendar
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        
        // Calculate workload for each day
        const dailyWorkload = {};
        this.activities
            .filter(activity => activity.staff_id === this.selectedStaffId)
            .forEach(activity => {
                const dateKey = this.formatDate(activity.activity_date);
                if (!dailyWorkload[dateKey]) {
                    dailyWorkload[dateKey] = 0;
                }
                dailyWorkload[dateKey] += activity.hours_spent || 0;
            });
        
        container.innerHTML = days.map(date => {
            const dateKey = this.formatDate(date);
            const hours = dailyWorkload[dateKey] || 0;
            const workloadLevel = Math.min(Math.floor(hours), 8);
            
            return `
                <div class="calendar-day workload-${workloadLevel}" 
                     title="${dateKey}: ${hours}h"
                     onclick="showDayActivities('${dateKey}')">
                    ${date.getDate()}
                </div>
            `;
        }).join('');
    }

    renderSkillsList(staff) {
        const container = document.getElementById('staffSkillsList');
        const skills = staff.skills || [];
        
        if (skills.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No skills recorded</p>';
            return;
        }
        
        container.innerHTML = skills.map(skill => `
            <div class="flex items-center justify-between">
                <span class="text-sm">${skill}</span>
                <i class="fas fa-check-circle text-green-500 text-xs"></i>
            </div>
        `).join('');
    }

    renderActiveAssignments() {
        const container = document.getElementById('activeAssignments');
        
        // Get active tasks and projects for this staff member
        const activeTasks = this.tasks.filter(task => 
            task.assigned_to_id === this.selectedStaffId &&
            !['Completed', 'Cancelled'].includes(task.status)
        );
        
        const managedProjects = this.projects.filter(project => 
            project.project_manager_id === this.selectedStaffId &&
            !['Completed', 'Cancelled'].includes(project.status)
        );
        
        let html = '';
        
        activeTasks.forEach(task => {
            html += `
                <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <div class="font-medium text-sm">Task: ${task.title}</div>
                    <div class="text-xs text-gray-600">Due: ${task.due_date ? this.formatDate(task.due_date) : 'No deadline'}</div>
                    <div class="text-xs text-gray-500">${task.status}</div>
                </div>
            `;
        });
        
        managedProjects.forEach(project => {
            html += `
                <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <div class="font-medium text-sm">Project: ${project.title}</div>
                    <div class="text-xs text-gray-600">Due: ${project.due_date ? this.formatDate(project.due_date) : 'No deadline'}</div>
                    <div class="text-xs text-gray-500">${project.status}</div>
                </div>
            `;
        });
        
        if (html === '') {
            html = '<p class="text-gray-500 text-sm">No active assignments</p>';
        }
        
        container.innerHTML = html;
    }

    createCharts() {
        this.createActivityDistributionChart();
        this.createWeeklyTrendsChart();
    }

    createActivityDistributionChart() {
        const ctx = document.getElementById('activityDistributionChart');
        
        if (this.activityChart) {
            this.activityChart.destroy();
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.timeRange);
        
        const staffActivities = this.activities.filter(activity => 
            activity.staff_id === this.selectedStaffId &&
            new Date(activity.activity_date) >= cutoffDate
        );
        
        const typeStats = {};
        staffActivities.forEach(activity => {
            const type = activity.activity_type;
            if (!typeStats[type]) {
                typeStats[type] = 0;
            }
            typeStats[type] += activity.hours_spent || 0;
        });
        
        this.activityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeStats),
                datasets: [{
                    data: Object.values(typeStats),
                    backgroundColor: Object.keys(typeStats).map(type => this.getActivityColorHex(type)),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            fontSize: 10
                        }
                    }
                }
            }
        });
    }

    createWeeklyTrendsChart() {
        const ctx = document.getElementById('weeklyTrendsChart');
        
        if (this.trendsChart) {
            this.trendsChart.destroy();
        }

        // Get last 4 weeks of data
        const weeks = [];
        const weeklyHours = [];
        
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const weekActivities = this.activities.filter(activity => {
                const activityDate = new Date(activity.activity_date);
                return activity.staff_id === this.selectedStaffId &&
                       activityDate >= weekStart && activityDate <= weekEnd;
            });
            
            const totalHours = weekActivities.reduce((sum, activity) => sum + (activity.hours_spent || 0), 0);
            
            weeks.push(`Week ${4-i}`);
            weeklyHours.push(totalHours);
        }
        
        this.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeks,
                datasets: [{
                    label: 'Hours Worked',
                    data: weeklyHours,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Utility functions
    formatDate(dateInput) {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return date.toISOString().split('T')[0];
    }

    getActivityColor(type) {
        const colors = {
            'Sourcing': 'bg-yellow-500',
            'Quality Control': 'bg-green-500',
            'Administrative': 'bg-purple-500',
            'Client Communication': 'bg-red-500',
            'Meeting': 'bg-blue-500',
            'Assigned Task': 'bg-indigo-500',
            'Research': 'bg-pink-500',
            'Travel': 'bg-gray-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    getActivityColorHex(type) {
        const colors = {
            'Sourcing': '#f59e0b',
            'Quality Control': '#10b981',
            'Administrative': '#8b5cf6',
            'Client Communication': '#ef4444',
            'Meeting': '#3b82f6',
            'Assigned Task': '#6366f1',
            'Research': '#ec4899',
            'Travel': '#6b7280'
        };
        return colors[type] || '#6b7280';
    }

    getOutcomeClass(outcome) {
        const classes = {
            'Completed': 'bg-green-100 text-green-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Blocked': 'bg-red-100 text-red-800',
            'Needs Follow-up': 'bg-yellow-100 text-yellow-800'
        };
        return classes[outcome] || 'bg-gray-100 text-gray-800';
    }

    generateAvatar(name) {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const color = colors[name.length % colors.length];
        
        return { initials, color };
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
function showActivityDetail(activityId) {
    console.log('Show activity detail:', activityId);
    // Could open modal or navigate to detail view
}

function showDayActivities(dateKey) {
    console.log('Show activities for date:', dateKey);
    // Could open modal showing all activities for that day
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.staffDashboard = new StaffDashboard();
});
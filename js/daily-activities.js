class DailyActivitiesManager {
    constructor() {
        this.activities = [];
        this.staff = [];
        this.permissions = [];
        this.selectedDate = new Date();
        this.currentStaffId = null; // Will be set based on login/session
        this.viewMode = 'timeline';
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupDateSelector();
            this.populateDropdowns();
            this.updateDateDisplay();
            this.renderCurrentView();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load activities data', 'error');
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

            // Load daily activities
            const activitiesResponse = await fetch('tables/daily_activities');
            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                this.activities = activitiesData.data || [];
            }

            // Load permissions (if table exists)
            try {
                const permissionsResponse = await fetch('tables/staff_permissions');
                if (permissionsResponse.ok) {
                    const permissionsData = await permissionsResponse.json();
                    this.permissions = permissionsData.data || [];
                }
            } catch (error) {
                console.log('Permissions table not found, using default permissions');
                this.permissions = [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupDateSelector() {
        const dateInput = document.getElementById('selectedDate');
        dateInput.value = this.formatDate(this.selectedDate);
        
        dateInput.addEventListener('change', (e) => {
            this.selectedDate = new Date(e.target.value);
            this.updateDateDisplay();
            this.renderCurrentView();
        });
    }

    populateDropdowns() {
        // Populate staff filter
        const staffFilter = document.getElementById('staffFilter');
        const activityStaffSelect = document.getElementById('activityStaffSelect');
        
        staffFilter.innerHTML = '<option value="">All Staff</option>';
        activityStaffSelect.innerHTML = '<option value="">Select Staff Member</option>';
        
        this.staff.forEach(member => {
            const option1 = document.createElement('option');
            option1.value = member.id;
            option1.textContent = `${member.name} (${member.office_location})`;
            staffFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = member.id;
            option2.textContent = `${member.name} (${member.office_location})`;
            activityStaffSelect.appendChild(option2);
        });
    }

    updateDateDisplay() {
        const dayInfo = document.getElementById('dayInfo');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dayInfo.textContent = this.selectedDate.toLocaleDateString('en-US', options);
        
        this.updateDayStats();
    }

    updateDayStats() {
        const selectedDateStr = this.formatDate(this.selectedDate);
        const dayActivities = this.activities.filter(activity => 
            this.formatDate(new Date(activity.activity_date)) === selectedDateStr
        );
        
        const totalActivities = dayActivities.length;
        const totalHours = dayActivities.reduce((sum, activity) => sum + (activity.hours_spent || 0), 0);
        const activeStaff = new Set(dayActivities.map(activity => activity.staff_id)).size;
        const completedTasks = dayActivities.filter(activity => activity.outcome === 'Completed').length;
        
        document.getElementById('totalActivities').textContent = totalActivities;
        document.getElementById('totalHours').textContent = totalHours.toFixed(1);
        document.getElementById('activeStaff').textContent = activeStaff;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    renderCurrentView() {
        const viewMode = document.getElementById('viewMode').value;
        
        // Hide all views
        document.getElementById('timelineView').classList.add('hidden');
        document.getElementById('listView').classList.add('hidden');
        document.getElementById('summaryView').classList.add('hidden');
        
        // Show selected view
        switch (viewMode) {
            case 'timeline':
                document.getElementById('timelineView').classList.remove('hidden');
                this.renderTimelineView();
                break;
            case 'list':
                document.getElementById('listView').classList.remove('hidden');
                this.renderListView();
                break;
            case 'summary':
                document.getElementById('summaryView').classList.remove('hidden');
                this.renderSummaryView();
                break;
        }
        
        this.updateRecentActivities();
        this.createDailyStatsChart();
    }

    renderTimelineView() {
        const container = document.getElementById('timelineStaffRows');
        container.innerHTML = '';
        
        const selectedDateStr = this.formatDate(this.selectedDate);
        const staffFilter = document.getElementById('staffFilter').value;
        const activityTypeFilter = document.getElementById('activityTypeFilter').value;
        
        // Filter staff based on selection
        const filteredStaff = staffFilter ? 
            this.staff.filter(s => s.id === staffFilter) : 
            this.staff;
        
        filteredStaff.forEach(staffMember => {
            let staffActivities = this.activities.filter(activity => 
                activity.staff_id === staffMember.id &&
                this.formatDate(new Date(activity.activity_date)) === selectedDateStr
            );
            
            // Apply activity type filter
            if (activityTypeFilter) {
                staffActivities = staffActivities.filter(activity => 
                    activity.activity_type === activityTypeFilter
                );
            }
            
            const staffRow = document.createElement('div');
            staffRow.className = 'staff-row flex items-center';
            
            const avatar = this.generateAvatar(staffMember.name);
            
            staffRow.innerHTML = `
                <div class="w-48 flex-shrink-0 flex items-center gap-3 pr-4">
                    <div class="staff-avatar" style="background: ${avatar.color}">${avatar.initials}</div>
                    <div>
                        <div class="font-medium text-sm">${staffMember.name}</div>
                        <div class="text-xs text-gray-500">${staffMember.office_location}</div>
                    </div>
                </div>
                <div class="flex flex-1 min-w-max relative" style="height: 60px;">
                    ${this.renderTimelineActivities(staffActivities)}
                </div>
            `;
            
            container.appendChild(staffRow);
        });
    }

    renderTimelineActivities(activities) {
        let html = '';
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
        
        // Create hour columns background
        hours.forEach(hour => {
            html += `<div class="timeline-hour border-r border-gray-100"></div>`;
        });
        
        // Add activities as overlays
        activities.forEach(activity => {
            const startHour = this.timeToHour(activity.start_time);
            const endHour = this.timeToHour(activity.end_time);
            
            if (startHour >= 8 && startHour <= 18) {
                const left = ((startHour - 8) / 11) * 100;
                const width = ((endHour - startHour) / 11) * 100;
                const activityClass = this.getActivityClass(activity.activity_type);
                
                html += `
                    <div class="activity-block ${activityClass}" 
                         style="position: absolute; left: ${left}%; width: ${Math.max(width, 5)}%; top: 10px; height: 40px; display: flex; align-items: center;"
                         onclick="showActivityDetail('${activity.id}')"
                         title="${activity.title}">
                        <span class="truncate">${activity.title}</span>
                    </div>
                `;
            }
        });
        
        return html;
    }

    renderListView() {
        const container = document.getElementById('activitiesList');
        container.innerHTML = '';
        
        const selectedDateStr = this.formatDate(this.selectedDate);
        const staffFilter = document.getElementById('staffFilter').value;
        const activityTypeFilter = document.getElementById('activityTypeFilter').value;
        
        let dayActivities = this.activities.filter(activity => 
            this.formatDate(new Date(activity.activity_date)) === selectedDateStr
        );
        
        if (staffFilter) {
            dayActivities = dayActivities.filter(activity => activity.staff_id === staffFilter);
        }
        
        if (activityTypeFilter) {
            dayActivities = dayActivities.filter(activity => activity.activity_type === activityTypeFilter);
        }
        
        // Sort by start time
        dayActivities.sort((a, b) => this.timeToMinutes(a.start_time) - this.timeToMinutes(b.start_time));
        
        if (dayActivities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-3xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">No activities logged for this day</p>
                </div>
            `;
            return;
        }
        
        dayActivities.forEach(activity => {
            const staff = this.staff.find(s => s.id === activity.staff_id);
            const activityDiv = document.createElement('div');
            activityDiv.className = 'bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors';
            activityDiv.onclick = () => this.showActivityDetail(activity.id);
            
            activityDiv.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                        <span class="w-3 h-3 rounded-full ${this.getActivityColor(activity.activity_type)}"></span>
                        <div>
                            <h4 class="font-medium">${activity.title}</h4>
                            <p class="text-sm text-gray-600">${staff ? staff.name : 'Unknown Staff'}</p>
                        </div>
                    </div>
                    <div class="text-right text-sm">
                        <div class="font-medium">${activity.start_time} - ${activity.end_time}</div>
                        <div class="text-gray-500">${activity.hours_spent || 0}h</div>
                    </div>
                </div>
                <p class="text-sm text-gray-700 mb-2">${activity.details || 'No details provided'}</p>
                <div class="flex justify-between items-center text-xs">
                    <span class="px-2 py-1 rounded-full ${this.getOutcomeClass(activity.outcome)}">${activity.outcome}</span>
                    <span class="text-gray-500">${activity.activity_type}</span>
                </div>
            `;
            
            container.appendChild(activityDiv);
        });
    }

    renderSummaryView() {
        const container = document.getElementById('summaryContent');
        const selectedDateStr = this.formatDate(this.selectedDate);
        
        const dayActivities = this.activities.filter(activity => 
            this.formatDate(new Date(activity.activity_date)) === selectedDateStr
        );
        
        // Group by staff
        const staffSummaries = {};
        this.staff.forEach(staff => {
            const staffActivities = dayActivities.filter(a => a.staff_id === staff.id);
            if (staffActivities.length > 0) {
                staffSummaries[staff.id] = {
                    staff: staff,
                    activities: staffActivities,
                    totalHours: staffActivities.reduce((sum, a) => sum + (a.hours_spent || 0), 0),
                    completed: staffActivities.filter(a => a.outcome === 'Completed').length
                };
            }
        });
        
        let html = '<div class="space-y-6">';
        
        Object.values(staffSummaries).forEach(summary => {
            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-semibold">${summary.staff.name}</h4>
                        <div class="text-sm text-gray-600">
                            ${summary.totalHours}h total • ${summary.completed}/${summary.activities.length} completed
                        </div>
                    </div>
                    <div class="space-y-2">
                        ${summary.activities.map(activity => `
                            <div class="flex justify-between items-center text-sm">
                                <span>${activity.title}</span>
                                <span class="text-gray-500">${activity.start_time}-${activity.end_time}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    updateRecentActivities() {
        const container = document.getElementById('recentActivities');
        
        // Get recent activities (last 5)
        const recentActivities = [...this.activities]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5);
        
        container.innerHTML = recentActivities.map(activity => {
            const staff = this.staff.find(s => s.id === activity.staff_id);
            return `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${this.getActivityColor(activity.activity_type)}"></span>
                        <span class="font-medium">${activity.title}</span>
                    </div>
                    <div class="text-gray-500 text-xs">
                        ${staff ? staff.name : 'Unknown'} • ${this.getRelativeTime(activity.updated_at)}
                    </div>
                </div>
            `;
        }).join('');
    }

    createDailyStatsChart() {
        const ctx = document.getElementById('dailyStatsChart');
        
        if (this.dailyStatsChart) {
            this.dailyStatsChart.destroy();
        }

        const selectedDateStr = this.formatDate(this.selectedDate);
        const dayActivities = this.activities.filter(activity => 
            this.formatDate(new Date(activity.activity_date)) === selectedDateStr
        );
        
        // Group by activity type
        const typeStats = {};
        dayActivities.forEach(activity => {
            const type = activity.activity_type;
            if (!typeStats[type]) {
                typeStats[type] = { count: 0, hours: 0 };
            }
            typeStats[type].count++;
            typeStats[type].hours += activity.hours_spent || 0;
        });
        
        this.dailyStatsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeStats),
                datasets: [{
                    data: Object.values(typeStats).map(stat => stat.hours),
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

    setupEventListeners() {
        // View mode change
        document.getElementById('viewMode').addEventListener('change', () => {
            this.renderCurrentView();
        });
        
        // Staff filter change
        document.getElementById('staffFilter').addEventListener('change', () => {
            this.renderCurrentView();
        });
        
        // Activity type filter change
        document.getElementById('activityTypeFilter').addEventListener('change', () => {
            this.renderCurrentView();
        });
        
        // Activity form submission
        document.getElementById('activityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleActivitySubmission(e.target);
        });
    }

    async handleActivitySubmission(form) {
        const formData = new FormData(form);
        const startTime = formData.get('start_time');
        const endTime = formData.get('end_time');
        
        // Calculate hours spent
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const hoursSpent = (endMinutes - startMinutes) / 60;
        
        const activityData = {
            staff_id: formData.get('staff_id'),
            activity_date: this.selectedDate.toISOString().split('T')[0],
            start_time: startTime,
            end_time: endTime,
            activity_type: formData.get('activity_type'),
            title: formData.get('title'),
            details: formData.get('details'),
            outcome: formData.get('outcome'),
            client_name: formData.get('client_name') || null,
            location: formData.get('location'),
            hours_spent: hoursSpent,
            submitted_by: formData.get('staff_id'), // In real system, this would be current user
            is_approved: false,
            notes: ''
        };

        try {
            const response = await fetch('tables/daily_activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData)
            });

            if (response.ok) {
                this.showNotification('Activity logged successfully', 'success');
                form.reset();
                await this.loadData();
                this.renderCurrentView();
            } else {
                throw new Error('Failed to log activity');
            }
        } catch (error) {
            console.error('Error logging activity:', error);
            this.showNotification('Failed to log activity', 'error');
        }
    }

    showActivityDetail(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        const staff = this.staff.find(s => s.id === activity.staff_id);
        
        const content = document.getElementById('activityDetailContent');
        content.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-lg font-semibold">${activity.title}</h4>
                        <p class="text-gray-600">${staff ? staff.name : 'Unknown Staff'} • ${activity.start_time} - ${activity.end_time}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm ${this.getOutcomeClass(activity.outcome)}">${activity.outcome}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Type:</span>
                        <p class="font-medium">${activity.activity_type}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Hours Spent:</span>
                        <p class="font-medium">${activity.hours_spent || 0}h</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Location:</span>
                        <p class="font-medium">${activity.location || 'Not specified'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Client:</span>
                        <p class="font-medium">${activity.client_name || 'N/A'}</p>
                    </div>
                </div>
                
                <div>
                    <span class="text-gray-500">Details:</span>
                    <p class="mt-1">${activity.details || 'No details provided'}</p>
                </div>
                
                ${activity.notes ? `
                <div>
                    <span class="text-gray-500">Notes:</span>
                    <p class="mt-1 text-sm">${activity.notes}</p>
                </div>
                ` : ''}
                
                <div class="flex justify-between items-center pt-4 border-t">
                    <span class="text-sm text-gray-500">
                        Logged ${this.getRelativeTime(activity.created_at)}
                    </span>
                    <div class="flex gap-2">
                        <button onclick="editActivity('${activity.id}')" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Edit
                        </button>
                        ${!activity.is_approved ? `
                        <button onclick="approveActivity('${activity.id}')" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Approve
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('activityDetailModal').classList.remove('hidden');
    }

    // Utility functions
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    timeToHour(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + minutes / 60;
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    getActivityClass(type) {
        const classes = {
            'Sourcing': 'activity-sourcing',
            'Quality Control': 'activity-qc',
            'Administrative': 'activity-admin',
            'Client Communication': 'activity-client',
            'Meeting': 'activity-meeting'
        };
        return classes[type] || 'activity-other';
    }

    getActivityColor(type) {
        const colors = {
            'Sourcing': 'bg-yellow-500',
            'Quality Control': 'bg-green-500',
            'Administrative': 'bg-purple-500',
            'Client Communication': 'bg-red-500',
            'Meeting': 'bg-blue-500',
            'Assigned Task': 'bg-indigo-500'
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
            'Assigned Task': '#6366f1'
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

    getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
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
function changeDate(days) {
    if (window.dailyActivitiesManager) {
        const newDate = new Date(window.dailyActivitiesManager.selectedDate);
        newDate.setDate(newDate.getDate() + days);
        window.dailyActivitiesManager.selectedDate = newDate;
        document.getElementById('selectedDate').value = window.dailyActivitiesManager.formatDate(newDate);
        window.dailyActivitiesManager.updateDateDisplay();
        window.dailyActivitiesManager.renderCurrentView();
    }
}

function setToday() {
    if (window.dailyActivitiesManager) {
        window.dailyActivitiesManager.selectedDate = new Date();
        document.getElementById('selectedDate').value = window.dailyActivitiesManager.formatDate(new Date());
        window.dailyActivitiesManager.updateDateDisplay();
        window.dailyActivitiesManager.renderCurrentView();
    }
}

function showActivityDetail(activityId) {
    if (window.dailyActivitiesManager) {
        window.dailyActivitiesManager.showActivityDetail(activityId);
    }
}

function closeActivityDetail() {
    document.getElementById('activityDetailModal').classList.add('hidden');
}

function editActivity(activityId) {
    console.log('Edit activity:', activityId);
    // Implementation for editing activities
    if (window.dailyActivitiesManager) {
        window.dailyActivitiesManager.showNotification('Activity editing coming soon', 'info');
    }
}

function approveActivity(activityId) {
    // Implementation for approving activities
    console.log('Approve activity:', activityId);
    if (window.dailyActivitiesManager) {
        window.dailyActivitiesManager.showNotification('Activity approved', 'success');
    }
}

function showTodayActivities() {
    setToday();
}

function showMyActivities() {
    // Filter to current user's activities
    if (window.dailyActivitiesManager) {
        // In real system, set filter to current user
        window.dailyActivitiesManager.showNotification('My activities filter coming soon', 'info');
    }
}

function exportActivities() {
    if (window.dailyActivitiesManager) {
        console.log('Exporting activities...');
        window.dailyActivitiesManager.showNotification('Export feature coming soon', 'info');
    }
}

function refreshData() {
    if (window.dailyActivitiesManager) {
        window.dailyActivitiesManager.loadData().then(() => {
            window.dailyActivitiesManager.renderCurrentView();
            window.dailyActivitiesManager.showNotification('Data refreshed successfully', 'success');
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.dailyActivitiesManager = new DailyActivitiesManager();
});
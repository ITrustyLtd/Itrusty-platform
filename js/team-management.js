class TeamManagement {
    constructor() {
        this.teamMembers = [];
        this.currentEditingId = null;
        this.init();
    }

    async init() {
        try {
            await this.loadTeamMembers();
            this.renderTeamGrid();
            this.updateStats();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load team data', 'error');
        }
    }

    async loadTeamMembers() {
        try {
            const response = await fetch('tables/staff_members');
            if (response.ok) {
                const data = await response.json();
                this.teamMembers = data.data || [];
            }
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    }

    renderTeamGrid() {
        const container = document.getElementById('teamGrid');
        const departmentFilter = document.getElementById('departmentFilter').value;
        
        let filteredMembers = this.teamMembers;
        if (departmentFilter) {
            filteredMembers = this.teamMembers.filter(m => m.department === departmentFilter);
        }

        if (filteredMembers.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No team members found</p>
                    <button onclick="showAddMemberModal()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Add First Team Member
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredMembers.map(member => {
            const avatar = this.generateAvatar(member.name);
            const deptClass = `dept-${member.department.toLowerCase().replace(' ', '-')}`;
            
            return `
                <div class="team-card" onclick="editTeamMember('${member.id}')">
                    <div class="member-avatar" style="background: ${avatar.color}">
                        ${avatar.initials}
                    </div>
                    <div class="text-center mb-3">
                        <h3 class="font-semibold text-gray-900">${member.name}</h3>
                        ${member.name_zh ? `<p class="text-sm text-gray-600">${member.name_zh}</p>` : ''}
                        <p class="text-xs text-gray-500 mt-1">${member.role}</p>
                    </div>
                    <div class="flex justify-center mb-3">
                        <span class="department-badge ${deptClass}">${member.department}</span>
                    </div>
                    <div class="text-center text-sm text-gray-600 space-y-1">
                        <div class="flex items-center justify-center gap-2">
                            <i class="fas fa-map-marker-alt text-xs"></i>
                            <span>${member.office_location}</span>
                        </div>
                        ${member.base_salary_rmb ? `
                        <div class="flex items-center justify-center gap-2">
                            <i class="fas fa-money-bill text-xs"></i>
                            <span>¥${member.base_salary_rmb.toLocaleString()}/mo</span>
                        </div>
                        ` : ''}
                        ${member.is_sales_person ? `
                        <div class="flex items-center justify-center gap-2">
                            <i class="fas fa-percent text-xs text-green-600"></i>
                            <span class="text-green-600">${member.commission_rate}% commission</span>
                        </div>
                        ` : ''}
                        ${member.wechat_id ? `
                        <div class="flex items-center justify-center gap-2">
                            <i class="fab fa-weixin text-xs text-green-600"></i>
                            <span>${member.wechat_id}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${!member.active ? `
                    <div class="mt-3 text-center">
                        <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Inactive</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const totalMembers = this.teamMembers.filter(m => m.active).length;
        const salesTeam = this.teamMembers.filter(m => m.is_sales_person && m.active).length;
        const totalMonthlyCost = this.teamMembers
            .filter(m => m.active)
            .reduce((sum, m) => sum + (m.base_salary_rmb || 0), 0);

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('salesTeam').textContent = salesTeam;
        document.getElementById('totalMonthlyCost').textContent = `¥${totalMonthlyCost.toLocaleString()}`;
    }

    setupEventListeners() {
        document.getElementById('departmentFilter').addEventListener('change', () => {
            this.renderTeamGrid();
        });

        document.getElementById('memberForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveMember(e.target);
        });

        // Show/hide commission field based on sales person checkbox
        document.querySelector('input[name="is_sales_person"]').addEventListener('change', (e) => {
            document.getElementById('commissionField').style.display = e.target.checked ? 'block' : 'none';
        });
    }

    async saveMember(form) {
        const formData = new FormData(form);
        
        const memberData = {
            name: formData.get('name'),
            name_zh: formData.get('name_zh') || '',
            role: formData.get('role'),
            role_zh: formData.get('role_zh') || '',
            department: formData.get('department'),
            office_location: formData.get('office_location'),
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            wechat_id: formData.get('wechat_id') || '',
            is_sales_person: formData.get('is_sales_person') === 'on',
            commission_rate: parseFloat(formData.get('commission_rate')) || 0,
            base_salary_rmb: parseFloat(formData.get('base_salary_rmb')) || 0,
            hourly_rate_rmb: parseFloat(formData.get('hourly_rate_rmb')) || 0,
            can_receive_notifications: formData.get('can_receive_notifications') === 'on',
            notification_preference: formData.get('notification_preference'),
            skills: [],
            languages: [],
            active: true
        };

        if (formData.get('hire_date')) {
            memberData.hire_date = new Date(formData.get('hire_date')).toISOString();
        }

        try {
            let response;
            if (this.currentEditingId) {
                // Update existing member
                response = await fetch(`tables/staff_members/${this.currentEditingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(memberData)
                });
            } else {
                // Create new member
                response = await fetch('tables/staff_members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(memberData)
                });
            }

            if (response.ok) {
                this.showNotification(
                    this.currentEditingId ? 'Team member updated successfully' : 'Team member added successfully',
                    'success'
                );
                this.closeMemberModal();
                await this.loadTeamMembers();
                this.renderTeamGrid();
                this.updateStats();
            } else {
                throw new Error('Failed to save team member');
            }
        } catch (error) {
            console.error('Error saving team member:', error);
            this.showNotification('Failed to save team member', 'error');
        }
    }

    async loadMemberForEdit(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        this.currentEditingId = memberId;
        
        // Populate form
        const form = document.getElementById('memberForm');
        form.elements['name'].value = member.name || '';
        form.elements['name_zh'].value = member.name_zh || '';
        form.elements['role'].value = member.role || '';
        form.elements['role_zh'].value = member.role_zh || '';
        form.elements['department'].value = member.department || '';
        form.elements['office_location'].value = member.office_location || '';
        form.elements['email'].value = member.email || '';
        form.elements['phone'].value = member.phone || '';
        form.elements['wechat_id'].value = member.wechat_id || '';
        form.elements['base_salary_rmb'].value = member.base_salary_rmb || '';
        form.elements['hourly_rate_rmb'].value = member.hourly_rate_rmb || '';
        form.elements['is_sales_person'].checked = member.is_sales_person || false;
        form.elements['commission_rate'].value = member.commission_rate || '';
        form.elements['can_receive_notifications'].checked = member.can_receive_notifications !== false;
        form.elements['notification_preference'].value = member.notification_preference || 'WeChat';
        
        if (member.hire_date) {
            form.elements['hire_date'].value = new Date(member.hire_date).toISOString().split('T')[0];
        }

        document.getElementById('commissionField').style.display = member.is_sales_person ? 'block' : 'none';
        document.getElementById('modalTitle').textContent = 'Edit Team Member';
        document.getElementById('memberModal').classList.remove('hidden');
    }

    closeMemberModal() {
        document.getElementById('memberModal').classList.add('hidden');
        document.getElementById('memberForm').reset();
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add Team Member';
    }

    generateAvatar(name) {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
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
function showAddMemberModal() {
    if (window.teamManagement) {
        window.teamManagement.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add Team Member';
        document.getElementById('memberModal').classList.remove('hidden');
    }
}

function closeMemberModal() {
    if (window.teamManagement) {
        window.teamManagement.closeMemberModal();
    }
}

function editTeamMember(memberId) {
    if (window.teamManagement) {
        window.teamManagement.loadMemberForEdit(memberId);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.teamManagement = new TeamManagement();
});/* Updated Tue Oct 28 14:00:46 CST 2025 */

class OrdersEnhanced {
    constructor() {
        this.orders = [];
        this.workflowSteps = [];
        this.teamMembers = [];
        this.notifications = [];
        this.workflowTemplates = [];
        this.activityFeed = [];
        this.stepComments = [];
        this.currentStepId = null;
        this.currentOrderId = null;
        this.refreshInterval = null;
        this.lastActivityCheck = Date.now();
        
        this.init();
    }

    async init() {
        try {
            await this.loadAllData();
            await this.initializeDefaultTemplates();
            this.renderOrders();
            this.updateAlarmSummary();
            this.loadNotifications();
            await this.loadActivityFeed();
            this.setupEventListeners();
            this.startLiveUpdates();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to load orders data', 'error');
        }
    }

    async loadAllData() {
        try {
            const [ordersRes, stepsRes, teamRes, templatesRes] = await Promise.all([
                fetch('tables/orders?limit=100&sort=-created_at'),
                fetch('tables/workflow_steps?limit=500&sort=-created_at'),
                fetch('tables/team_members?limit=100'),
                fetch('tables/order_workflow_templates?limit=50')
            ]);

            if (ordersRes.ok) {
                const data = await ordersRes.json();
                this.orders = data.data || [];
            }

            if (stepsRes.ok) {
                const data = await stepsRes.json();
                this.workflowSteps = data.data || [];
            }

            if (teamRes.ok) {
                const data = await teamRes.json();
                this.teamMembers = data.data || [];
            }

            if (templatesRes.ok) {
                const data = await templatesRes.json();
                this.workflowTemplates = data.data || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async initializeDefaultTemplates() {
        if (this.workflowTemplates.length > 0) return;

        // Create default I Trusty workflow template
        const defaultTemplate = {
            template_name: 'I Trusty Standard Workflow',
            template_name_zh: 'I Trusty 标准工作流程',
            order_type: 'Standard',
            is_default: true,
            active: true,
            created_by: 'system',
            steps: [
                { step_number: 1, step_name: 'Request', step_type: 'Request', default_duration_days: 1, department: 'Sales' },
                { step_number: 2, step_name: 'Sourcing', step_type: 'Sourcing', default_duration_days: 3, department: 'Sourcing' },
                { step_number: 3, step_name: 'Quotation Prep', step_type: 'Quotation Prep', default_duration_days: 2, department: 'Sales' },
                { step_number: 4, step_name: 'Customer Approval', step_type: 'Customer Approval', default_duration_days: 5, department: 'Sales' },
                { step_number: 5, step_name: 'Proforma Invoice', step_type: 'Proforma Invoice', default_duration_days: 1, department: 'Finance' },
                { step_number: 6, step_name: 'Deposit Payment', step_type: 'Deposit Payment', default_duration_days: 7, department: 'Finance' },
                { step_number: 7, step_name: 'Supplier Payment', step_type: 'Supplier Payment', default_duration_days: 2, department: 'Finance' },
                { step_number: 8, step_name: 'Production', step_type: 'Production', default_duration_days: 20, department: 'Sourcing' },
                { step_number: 9, step_name: 'Private Labeling', step_type: 'Private Labeling', default_duration_days: 7, department: 'Design' },
                { step_number: 10, step_name: 'Warehouse Arrival', step_type: 'Warehouse Arrival', default_duration_days: 3, department: 'Warehouse' },
                { step_number: 11, step_name: 'QC Inspection', step_type: 'QC Inspection', default_duration_days: 2, department: 'Quality Control' },
                { step_number: 12, step_name: 'Packing', step_type: 'Packing', default_duration_days: 2, department: 'Warehouse' },
                { step_number: 13, step_name: 'Export Prep', step_type: 'Export Prep', default_duration_days: 2, department: 'Administrative' },
                { step_number: 14, step_name: 'FOB', step_type: 'FOB', default_duration_days: 1, department: 'Administrative' },
                { step_number: 15, step_name: 'Shipment', step_type: 'Shipment', default_duration_days: 1, department: 'Administrative' },
                { step_number: 16, step_name: 'Telex Release', step_type: 'Telex Release', default_duration_days: 1, department: 'Finance' },
                { step_number: 17, step_name: 'Final Payment', step_type: 'Final Payment', default_duration_days: 7, department: 'Finance' }
            ]
        };

        try {
            const response = await fetch('tables/order_workflow_templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(defaultTemplate)
            });

            if (response.ok) {
                const newTemplate = await response.json();
                this.workflowTemplates.push(newTemplate);
            }
        } catch (error) {
            console.error('Error creating default template:', error);
        }
    }

    renderOrders() {
        const container = document.getElementById('ordersList');
        
        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 bg-white rounded-lg">
                    <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 mb-4">No orders yet</p>
                    <button onclick="showCreateOrderModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        Create First Order
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.orders.map(order => {
            // Get and sort workflow steps by step_order (ascending) - earliest first
            const orderSteps = this.workflowSteps
                .filter(s => s.order_id === order.id)
                .sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
            const completedSteps = orderSteps.filter(s => s.status === 'Completed').length;
            const progress = orderSteps.length > 0 ? (completedSteps / orderSteps.length) * 100 : 0;
            
            const currentStep = orderSteps.find(s => s.status === 'In Progress') || 
                              orderSteps.find(s => s.status === 'Not Started');
            
            const hasDelayed = orderSteps.some(s => this.isDelayed(s));
            const hasWarning = orderSteps.some(s => this.isDueSoon(s) && !this.isDelayed(s));
            
            // Determine order direction styling
            const isSupplierOrder = order.order_direction === 'us_to_supplier';
            const borderColor = isSupplierOrder ? '#fb923c' : '#3b82f6'; // orange : blue
            const bgGradient = isSupplierOrder ? 'from-orange-50 to-white' : 'from-blue-50 to-white';
            
            // Currency symbol
            const currencySymbols = { 'RMB': '¥', 'EUR': '€', 'USD': '$' };
            const currencySymbol = currencySymbols[order.currency] || '¥';
            const totalValue = order.total_value || order.total_value_rmb || 0;
            
            const cardClass = hasDelayed ? 'delayed' : hasWarning ? 'warning' : '';

            return `
                <div class="order-card ${cardClass} bg-gradient-to-br ${bgGradient}" style="border-left-color: ${borderColor};">
                    ${hasDelayed ? '<div class="alarm-badge"><i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i></div>' : ''}
                    ${hasWarning && !hasDelayed ? '<div class="alarm-badge"><i class="fas fa-clock text-yellow-500 text-2xl"></i></div>' : ''}
                    
                    <div class="flex justify-between items-start mb-4">
                        <div onclick="expandOrderWorkflow('${order.id}')" class="cursor-pointer flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">${order.order_number}</h3>
                                ${order.sub_order_number ? `<span class="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">${order.sub_order_number}</span>` : ''}
                            </div>
                            <p class="text-gray-600">${order.client_name}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs px-2 py-1 rounded ${isSupplierOrder ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}">
                                    ${isSupplierOrder ? '📤 Us → Supplier' : '📥 Customer → Us'}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">${order.product_description?.substring(0, 100)}...</p>
                        </div>
                        <div class="text-right">
                            <div class="flex gap-2 mb-2">
                                <button onclick="editOrder('${order.id}')" class="text-blue-600 hover:text-blue-700" title="Edit Order">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteOrderFromList('${order.id}', '${order.order_number}')" class="text-red-600 hover:text-red-700" title="Delete Order">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="text-lg font-bold text-gray-900">${currencySymbol}${totalValue.toLocaleString()}</div>
                            <div class="text-sm text-gray-500">${order.quantity} units</div>
                            <div class="text-xs text-gray-400 mt-1">${order.currency || 'RMB'}</div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">Progress: ${completedSteps}/${orderSteps.length} steps</span>
                            <span class="font-medium">${Math.round(progress)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${progress}%"></div>
                        </div>
                    </div>

                    ${currentStep ? `
                    <div class="text-sm mb-3">
                        <span class="text-gray-600">Current Step:</span>
                        <span class="font-medium text-blue-600"> ${currentStep.step_name}</span>
                        ${currentStep.assigned_to_id ? `
                        <span class="text-gray-500">
                            → ${this.getTeamMemberName(currentStep.assigned_to_id)}
                        </span>
                        ` : ''}
                    </div>
                    ` : ''}

                    <div class="workflow-progress" style="max-height: 150px; overflow-y: auto; flex-wrap: wrap;">
                        ${orderSteps.map(step => {
                            const stepClass = step.status === 'Completed' ? 'completed' :
                                            step.status === 'In Progress' ? 'current' :
                                            this.isDelayed(step) ? 'delayed' : 'pending';
                            const commentCount = this.getStepCommentCount(step.id);
                            return `<div class="workflow-step-mini ${stepClass} step-card" onclick="openStepDetail('${step.id}', '${order.id}')" title="Click to view details and add comments">
                                ${step.step_name}
                                ${commentCount > 0 ? `<div class="text-xs mt-1"><i class="fas fa-comments"></i> ${commentCount}</div>` : ''}
                            </div>`;
                        }).join('<div class="step-connector"></div>')}
                    </div>

                    <div class="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t">
                        <span>${order.assigned_office}</span>
                        <span>Created ${this.formatDate(order.created_at)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async createOrderWithWorkflow(orderData, orderType) {
        try {
            // 1. Create the order
            const orderResponse = await fetch('tables/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const newOrder = await orderResponse.json();

            // 2. Find appropriate template
            const template = this.workflowTemplates.find(t => 
                t.order_type === orderType && t.is_default
            ) || this.workflowTemplates.find(t => t.is_default);

            if (!template || !template.steps) {
                throw new Error('No workflow template found');
            }

            // 3. Create all workflow steps
            let currentDate = new Date();
            const workflowStepsToCreate = [];

            for (const templateStep of template.steps) {
                const dueDate = new Date(currentDate);
                dueDate.setDate(dueDate.getDate() + (templateStep.default_duration_days || 1));

                // Find team member by department
                const assignedMember = this.teamMembers.find(m => 
                    m.department === templateStep.department && m.active
                );

                const stepData = {
                    order_id: newOrder.id,
                    step_number: templateStep.step_number,
                    step_name: templateStep.step_name,
                    step_type: templateStep.step_type,
                    status: templateStep.step_number === 1 ? 'In Progress' : 'Not Started',
                    assigned_to_id: assignedMember?.id || null,
                    start_date: currentDate.toISOString(),
                    due_date: dueDate.toISOString(),
                    estimated_hours: templateStep.default_duration_days * 8,
                    actual_hours: 0,
                    cost_rmb: 0,
                    notes: '',
                    notes_zh: '',
                    dependencies: []
                };

                workflowStepsToCreate.push(stepData);
                currentDate = dueDate;
            }

            // 4. Batch create workflow steps
            for (const step of workflowStepsToCreate) {
                await fetch('tables/workflow_steps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(step)
                });
            }

            // 5. Create initial notification for first assignee
            if (workflowStepsToCreate[0].assigned_to_id) {
                await this.createNotification({
                    recipient_id: workflowStepsToCreate[0].assigned_to_id,
                    alert_type: 'Assignment',
                    priority: 'High',
                    related_order_id: newOrder.id,
                    related_workflow_step_id: workflowStepsToCreate[0].id,
                    title: 'New Order Assignment',
                    title_zh: '新订单分配',
                    message: `You have been assigned to handle the first step (${workflowStepsToCreate[0].step_name}) for order ${orderData.order_number}`,
                    message_zh: `您已被分配处理订单 ${orderData.order_number} 的第一步（${workflowStepsToCreate[0].step_name}）`,
                    action_required: true,
                    action_url: `orders-enhanced.html?order=${newOrder.id}`
                });
            }

            // 6. Log activity to feed
            await this.logActivity({
                activity_type: 'order_created',
                order_id: newOrder.id,
                order_number: orderData.order_number,
                staff_id: 'system',
                staff_name: 'System',
                step_name: workflowStepsToCreate[0].step_name,
                action_description: `Created new order with ${workflowStepsToCreate.length} workflow steps`,
                action_description_zh: `创建了包含 ${workflowStepsToCreate.length} 个工作流步骤的新订单`,
                new_status: 'Processing',
                metadata: JSON.stringify({ order_type: orderType, total_steps: workflowStepsToCreate.length })
            });

            return newOrder;
        } catch (error) {
            console.error('Error creating order with workflow:', error);
            throw error;
        }
    }

    async createNotification(notificationData) {
        const fullData = {
            ...notificationData,
            is_read: false,
            is_dismissed: false,
            sent_at: new Date().toISOString()
        };

        try {
            await fetch('tables/notifications_alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullData)
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('tables/notifications_alerts');
            if (response.ok) {
                const data = await response.json();
                this.notifications = (data.data || []).filter(n => !n.is_dismissed);
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderNotifications() {
        const unreadCount = this.notifications.filter(n => !n.is_read).length;
        const badge = document.getElementById('notificationCount');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        const container = document.getElementById('notificationsList');
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-3xl mb-2"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notif => `
            <div class="notification-item ${notif.is_read ? '' : 'unread'}" 
                 onclick="markNotificationRead('${notif.id}')">
                <div class="flex items-start gap-3">
                    <i class="fas ${this.getNotificationIcon(notif.alert_type)} text-lg ${this.getNotificationColor(notif.priority)}"></i>
                    <div class="flex-1">
                        <div class="font-medium text-sm">${notif.title}</div>
                        <div class="text-xs text-gray-600 mt-1">${notif.message?.substring(0, 100)}...</div>
                        <div class="text-xs text-gray-400 mt-1">${this.formatDate(notif.sent_at)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateAlarmSummary() {
        const now = new Date();
        let overdueCount = 0;
        let warningCount = 0;
        let activeCount = 0;
        let completedTodayCount = 0;

        this.workflowSteps.forEach(step => {
            if (this.isDelayed(step)) overdueCount++;
            else if (this.isDueSoon(step)) warningCount++;
            
            if (step.status === 'In Progress') activeCount++;
            
            if (step.completed_date && 
                new Date(step.completed_date).toDateString() === now.toDateString()) {
                completedTodayCount++;
            }
        });

        document.getElementById('overdueCount').textContent = overdueCount;
        document.getElementById('warningCount').textContent = warningCount;
        document.getElementById('activeOrdersCount').textContent = this.orders.filter(o => 
            o.status !== 'Delivered' && o.status !== 'Cancelled'
        ).length;
        document.getElementById('completedTodayCount').textContent = completedTodayCount;
    }

    isDelayed(step) {
        if (step.status === 'Completed' || !step.due_date) return false;
        return new Date(step.due_date) < new Date();
    }

    isDueSoon(step) {
        if (step.status === 'Completed' || !step.due_date) return false;
        const dueDate = new Date(step.due_date);
        const now = new Date();
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
        return hoursUntilDue > 0 && hoursUntilDue <= 48;
    }

    startLiveUpdates() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(async () => {
            await this.loadAllData();
            this.renderOrders();
            this.updateAlarmSummary();
            await this.loadNotifications();
            await this.loadActivityFeed();
        }, 30000);
    }

    setupEventListeners() {
        document.getElementById('createOrderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateOrder(e.target);
        });

        document.getElementById('orderTypeSelect').addEventListener('change', (e) => {
            this.updateWorkflowPreview(e.target.value);
        });

        document.getElementById('searchOrders').addEventListener('input', () => {
            this.filterOrders();
        });
    }

    filterOrders() {
        const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const officeFilter = document.getElementById('officeFilter').value;

        let filtered = this.orders;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.order_number?.toLowerCase().includes(searchTerm) ||
                order.client_name?.toLowerCase().includes(searchTerm) ||
                order.product_description?.toLowerCase().includes(searchTerm)
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(order => {
                const orderSteps = this.workflowSteps.filter(s => s.order_id === order.id);
                if (statusFilter === 'delayed') {
                    return orderSteps.some(s => this.isDelayed(s));
                } else if (statusFilter === 'warning') {
                    return orderSteps.some(s => this.isDueSoon(s) && !this.isDelayed(s));
                } else if (statusFilter === 'active') {
                    return orderSteps.some(s => s.status === 'In Progress');
                } else if (statusFilter === 'completed') {
                    return orderSteps.every(s => s.status === 'Completed');
                }
                return true;
            });
        }

        // Office filter
        if (officeFilter) {
            filtered = filtered.filter(order => order.assigned_office === officeFilter);
        }

        // Temporarily update orders array for rendering
        const originalOrders = this.orders;
        this.orders = filtered;
        this.renderOrders();
        this.orders = originalOrders;
    }

    async handleCreateOrder(form) {
        const formData = new FormData(form);
        const orderType = formData.get('order_type');
        const currency = formData.get('currency') || 'RMB';
        
        const orderData = {
            order_number: formData.get('order_number'),
            sub_order_number: formData.get('sub_order_number') || '',
            client_name: formData.get('client_name'),
            order_direction: formData.get('order_direction') || 'customer_to_us',
            customer_code: formData.get('customer_code') || '',
            supplier_code: formData.get('supplier_code') || '',
            product_code: formData.get('product_code') || '',
            product_description: formData.get('product_description'),
            assigned_office: formData.get('assigned_office'),
            currency: currency,
            status: 'Processing',
            priority: 'Medium',
            order_date: new Date().toISOString(),
            quantity: parseInt(formData.get('quantity')) || 0,
            total_value: parseFloat(formData.get('total_value')) || 0,
            // Keep legacy field for compatibility
            total_value_rmb: currency === 'RMB' ? (parseFloat(formData.get('total_value')) || 0) : 0
        };

        try {
            await this.createOrderWithWorkflow(orderData, orderType);
            this.showNotification('Order created with complete workflow!', 'success');
            this.closeCreateOrderModal();
            await this.loadAllData();
            this.renderOrders();
            this.updateAlarmSummary();
        } catch (error) {
            console.error('Error creating order:', error);
            this.showNotification('Failed to create order', 'error');
        }
    }

    updateWorkflowPreview(orderType) {
        const template = this.workflowTemplates.find(t => t.order_type === orderType && t.is_default) ||
                        this.workflowTemplates.find(t => t.is_default);
        
        const preview = document.getElementById('workflowPreview');
        if (template && template.steps) {
            preview.innerHTML = `
                <div class="space-y-1">
                    ${template.steps.slice(0, 5).map((step, i) => `
                        <div>${i + 1}. ${step.step_name} (${step.default_duration_days} days)</div>
                    `).join('')}
                    <div class="font-medium">... and ${template.steps.length - 5} more steps</div>
                </div>
            `;
        }
    }

    getTeamMemberName(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        return member ? member.name : 'Unassigned';
    }

    getNotificationIcon(type) {
        const icons = {
            'Deadline Approaching': 'fa-clock',
            'Overdue': 'fa-exclamation-triangle',
            'Step Completed': 'fa-check-circle',
            'Assignment': 'fa-tasks',
            'Payment Due': 'fa-dollar-sign'
        };
        return icons[type] || 'fa-bell';
    }

    getNotificationColor(priority) {
        const colors = {
            'Critical': 'text-red-600',
            'High': 'text-orange-600',
            'Medium': 'text-blue-600',
            'Low': 'text-gray-600'
        };
        return colors[priority] || 'text-gray-600';
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    }

    // ========= ACTIVITY FEED FUNCTIONS =========
    
    async loadActivityFeed() {
        try {
            const response = await fetch('tables/activity_feed?limit=100&sort=-timestamp');
            if (response.ok) {
                const data = await response.json();
                this.activityFeed = data.data || [];
                this.renderActivityFeed();
            }
        } catch (error) {
            console.error('Error loading activity feed:', error);
        }
    }

    async logActivity(activityData) {
        const fullData = {
            timestamp: new Date().toISOString(),
            ...activityData
        };

        try {
            const response = await fetch('tables/activity_feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullData)
            });

            if (response.ok) {
                const newActivity = await response.json();
                this.activityFeed.unshift(newActivity);
                this.renderActivityFeed();
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    renderActivityFeed() {
        const container = document.getElementById('activityFeedContainer');
        
        if (this.activityFeed.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-stream text-3xl mb-2"></i>
                    <p class="text-sm">No activities yet</p>
                    <p class="text-xs mt-1">Activities will appear here in real-time</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.activityFeed.map(activity => {
            const isNew = (Date.now() - new Date(activity.timestamp).getTime()) < 5000;
            const icon = this.getActivityIcon(activity.activity_type);
            const timeAgo = this.getTimeAgo(activity.timestamp);
            
            return `
                <div class="activity-item ${isNew ? 'new' : ''}" 
                     data-order-id="${activity.order_id || ''}"
                     data-step-name="${activity.step_name || ''}"
                     onclick="window.ordersEnhanced.openOrderFromActivity('${activity.order_id}', '${activity.step_name || ''}')">
                    <div class="flex items-start gap-3">
                        <div class="activity-icon ${this.getActivityIconClass(activity.activity_type)}">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900">
                                ${activity.order_number}
                                <i class="fas fa-external-link-alt ml-1 text-xs text-gray-400"></i>
                            </div>
                            <div class="text-xs text-gray-700 mt-1">
                                ${activity.staff_name}: ${activity.action_description}
                            </div>
                            ${activity.step_name ? `
                                <div class="text-xs text-blue-600 mt-1 font-medium">
                                    <i class="fas fa-arrow-right"></i> ${activity.step_name}
                                </div>
                            ` : ''}
                            ${activity.amount ? `
                                <div class="text-xs font-medium text-green-600 mt-1">
                                    ${activity.currency} ${activity.amount.toLocaleString()}
                                </div>
                            ` : ''}
                            <div class="time-watermark mt-2">
                                <i class="fas fa-clock"></i>
                                ${timeAgo}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'order_created': 'fa-plus-circle',
            'step_started': 'fa-play-circle',
            'step_completed': 'fa-check-circle',
            'status_changed': 'fa-sync-alt',
            'payment_received': 'fa-dollar-sign',
            'payment_sent': 'fa-credit-card',
            'sourcing_completed': 'fa-search',
            'qc_passed': 'fa-check-double',
            'qc_failed': 'fa-times-circle',
            'shipment_dispatched': 'fa-shipping-fast',
            'quotation_sent': 'fa-file-invoice-dollar',
            'deposit_received': 'fa-money-bill-wave',
            'production_started': 'fa-industry',
            'warehouse_arrival': 'fa-warehouse',
            'packing_completed': 'fa-boxes',
            'export_ready': 'fa-file-export',
            'fob_confirmed': 'fa-ship',
            'telex_released': 'fa-file-contract',
            'final_payment_received': 'fa-check-circle'
        };
        return icons[type] || 'fa-circle';
    }

    getActivityIconClass(type) {
        if (type.includes('payment') || type.includes('deposit') || type.includes('final_payment')) {
            return 'payment';
        } else if (type.includes('sourcing')) {
            return 'sourcing';
        } else if (type.includes('qc')) {
            return 'qc';
        } else if (type.includes('shipment') || type.includes('fob')) {
            return 'shipment';
        } else if (type.includes('completed') || type.includes('passed')) {
            return 'step-completed';
        } else if (type.includes('created')) {
            return 'order-created';
        } else if (type.includes('status')) {
            return 'status-changed';
        }
        return 'order-created';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000); // seconds

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        
        return time.toLocaleDateString() + ' ' + time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // ========= WORKFLOW STEP UPDATE FUNCTIONS =========
    
    async updateWorkflowStep(stepId, updates, staffId, staffName) {
        try {
            // Get the step details before updating
            const step = this.workflowSteps.find(s => s.id === stepId);
            const order = this.orders.find(o => o.id === step.order_id);
            
            if (!step || !order) {
                throw new Error('Step or order not found');
            }

            const oldStatus = step.status;
            const newStatus = updates.status || oldStatus;

            // Update the step
            const response = await fetch(`tables/workflow_steps/${stepId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update workflow step');
            }

            // Determine activity type and description
            let activityType = 'status_changed';
            let description = `Updated ${step.step_name}`;
            
            if (newStatus === 'Completed' && oldStatus !== 'Completed') {
                activityType = this.getStepCompletionActivityType(step.step_name);
                description = `Finished ${step.step_name}`;
            } else if (newStatus === 'In Progress' && oldStatus === 'Not Started') {
                activityType = 'step_started';
                description = `Started ${step.step_name}`;
            }

            // Log activity
            await this.logActivity({
                activity_type: activityType,
                order_id: order.id,
                order_number: order.order_number,
                staff_id: staffId,
                staff_name: staffName,
                step_name: step.step_name,
                action_description: description,
                action_description_zh: this.translateAction(description),
                old_status: oldStatus,
                new_status: newStatus
            });

            // Reload data
            await this.loadAllData();
            this.renderOrders();
            this.updateAlarmSummary();

            return true;
        } catch (error) {
            console.error('Error updating workflow step:', error);
            return false;
        }
    }

    getStepCompletionActivityType(stepName) {
        const mapping = {
            'Sourcing': 'sourcing_completed',
            'QC Inspection': 'qc_passed',
            'Shipment': 'shipment_dispatched',
            'Quotation Prep': 'quotation_sent',
            'Deposit Payment': 'deposit_received',
            'Production': 'production_started',
            'Warehouse Arrival': 'warehouse_arrival',
            'Packing': 'packing_completed',
            'Export Prep': 'export_ready',
            'FOB': 'fob_confirmed',
            'Telex Release': 'telex_released',
            'Final Payment': 'final_payment_received',
            'Proforma Invoice': 'quotation_sent',
            'Supplier Payment': 'payment_sent'
        };
        return mapping[stepName] || 'step_completed';
    }

    translateAction(englishText) {
        const translations = {
            'Finished Sourcing': '完成采购',
            'Started Sourcing': '开始采购',
            'Finished QC Inspection': '完成质检',
            'Started QC Inspection': '开始质检',
            'Finished Shipment': '完成发货',
            'Finished Quotation Prep': '完成报价',
            'Finished Deposit Payment': '收到定金',
            'Finished Production': '完成生产',
            'Finished Warehouse Arrival': '到达仓库',
            'Finished Packing': '完成打包',
            'Finished Export Prep': '完成出口准备',
            'Finished FOB': '完成离岸价',
            'Finished Telex Release': '完成电放',
            'Finished Final Payment': '收到尾款',
            'Finished Proforma Invoice': '完成形式发票',
            'Finished Supplier Payment': '完成供应商付款'
        };
        return translations[englishText] || englishText;
    }

    async logPaymentActivity(orderData, paymentType, amount, currency, staffId, staffName) {
        const activityType = paymentType === 'deposit' ? 'deposit_received' : 
                           paymentType === 'final' ? 'final_payment_received' :
                           paymentType === 'supplier' ? 'payment_sent' : 'payment_received';
        
        const description = paymentType === 'deposit' ? 'Received deposit payment' :
                          paymentType === 'final' ? 'Received final payment' :
                          paymentType === 'supplier' ? 'Paid supplier' : 'Payment processed';

        await this.logActivity({
            activity_type: activityType,
            order_id: orderData.id,
            order_number: orderData.order_number,
            staff_id: staffId,
            staff_name: staffName,
            action_description: description,
            action_description_zh: this.translateAction(description),
            amount: amount,
            currency: currency
        });
    }

    // ========= WORKFLOW STEP UPDATE FUNCTIONS =========
    
    async updateWorkflowStep(stepId, updates, staffId, staffName) {
        try {
            const step = this.workflowSteps.find(s => s.id === stepId);
            const order = this.orders.find(o => o.id === step?.order_id);
            
            if (!step || !order) {
                console.error('Step or order not found');
                return false;
            }

            const oldStatus = step.status;
            const newStatus = updates.status || oldStatus;

            const response = await fetch(`tables/workflow_steps/${stepId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update workflow step');
            }

            let activityType = 'status_changed';
            let description = `Updated ${step.step_name}`;
            
            if (newStatus === 'Completed' && oldStatus !== 'Completed') {
                activityType = this.getStepCompletionActivityType(step.step_name);
                description = `Finished ${step.step_name}`;
            } else if (newStatus === 'In Progress' && oldStatus === 'Not Started') {
                activityType = 'step_started';
                description = `Started ${step.step_name}`;
            }

            await this.logActivity({
                activity_type: activityType,
                order_id: order.id,
                order_number: order.order_number,
                staff_id: staffId || 'system',
                staff_name: staffName || 'System',
                step_name: step.step_name,
                action_description: description,
                action_description_zh: this.translateAction(description),
                old_status: oldStatus,
                new_status: newStatus
            });

            await this.loadAllData();
            this.renderOrders();
            this.updateAlarmSummary();

            return true;
        } catch (error) {
            console.error('Error updating workflow step:', error);
            return false;
        }
    }

    getStepCompletionActivityType(stepName) {
        const mapping = {
            'Sourcing': 'sourcing_completed',
            'QC Inspection': 'qc_passed',
            'Shipment': 'shipment_dispatched',
            'Quotation Prep': 'quotation_sent',
            'Deposit Payment': 'deposit_received',
            'Production': 'production_started',
            'Warehouse Arrival': 'warehouse_arrival',
            'Packing': 'packing_completed',
            'Export Prep': 'export_ready',
            'FOB': 'fob_confirmed',
            'Telex Release': 'telex_released',
            'Final Payment': 'final_payment_received',
            'Proforma Invoice': 'quotation_sent',
            'Supplier Payment': 'payment_sent'
        };
        return mapping[stepName] || 'step_completed';
    }

    translateAction(englishText) {
        const translations = {
            'Finished Sourcing': '完成采购',
            'Started Sourcing': '开始采购',
            'Finished QC Inspection': '完成质检',
            'Started QC Inspection': '开始质检',
            'Finished Shipment': '完成发货',
            'Finished Quotation Prep': '完成报价',
            'Finished Deposit Payment': '收到定金',
            'Finished Production': '完成生产',
            'Finished Warehouse Arrival': '到达仓库',
            'Finished Packing': '完成打包',
            'Finished Export Prep': '完成出口准备',
            'Finished FOB': '完成离岸价',
            'Finished Telex Release': '完成电放',
            'Finished Final Payment': '收到尾款',
            'Finished Proforma Invoice': '完成形式发票',
            'Finished Supplier Payment': '完成供应商付款',
            'Updated Sourcing': '更新采购',
            'Updated QC Inspection': '更新质检'
        };
        return translations[englishText] || englishText;
    }

    async logPaymentActivity(orderData, paymentType, amount, currency, staffId, staffName) {
        const activityType = paymentType === 'deposit' ? 'deposit_received' : 
                           paymentType === 'final' ? 'final_payment_received' :
                           paymentType === 'supplier' ? 'payment_sent' : 'payment_received';
        
        const description = paymentType === 'deposit' ? 'Received deposit payment' :
                          paymentType === 'final' ? 'Received final payment' :
                          paymentType === 'supplier' ? 'Paid supplier' : 'Payment processed';

        await this.logActivity({
            activity_type: activityType,
            order_id: orderData.id,
            order_number: orderData.order_number,
            staff_id: staffId,
            staff_name: staffName,
            action_description: description,
            action_description_zh: this.translateAction(description),
            amount: amount,
            currency: currency
        });
    }

    // ========= STEP COMMENTS FUNCTIONS =========
    
    async loadStepComments(stepId) {
        try {
            const response = await fetch(`tables/workflow_step_comments?limit=100`);
            if (response.ok) {
                const data = await response.json();
                this.stepComments = data.data || [];
                return this.stepComments.filter(c => c.workflow_step_id === stepId);
            }
            return [];
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    }

    getStepCommentCount(stepId) {
        return this.stepComments.filter(c => c.workflow_step_id === stepId).length;
    }

    async addStepComment(stepId, orderId, commentData) {
        const fullData = {
            workflow_step_id: stepId,
            order_id: orderId,
            staff_id: commentData.staff_id || 'current-user',
            staff_name: commentData.staff_name || 'Current User',
            comment_text: commentData.comment_text,
            comment_text_zh: commentData.comment_text_zh || '',
            timestamp: new Date().toISOString(),
            comment_type: commentData.comment_type || 'note',
            attachments: commentData.attachments || [],
            mentions: this.extractMentions(commentData.comment_text),
            parent_comment_id: commentData.parent_comment_id || null,
            is_edited: false
        };

        try {
            const response = await fetch('tables/workflow_step_comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullData)
            });

            if (response.ok) {
                const newComment = await response.json();
                this.stepComments.push(newComment);
                
                // Send WeChat notifications to mentioned users
                if (fullData.mentions.length > 0) {
                    await this.sendWeChatNotifications(fullData.mentions, orderId, stepId, commentData);
                }
                
                // Log activity
                const step = this.workflowSteps.find(s => s.id === stepId);
                const order = this.orders.find(o => o.id === orderId);
                await this.logActivity({
                    activity_type: 'comment_added',
                    order_id: orderId,
                    order_number: order?.order_number,
                    staff_id: fullData.staff_id,
                    staff_name: fullData.staff_name,
                    step_name: step?.step_name,
                    action_description: `Added comment: ${commentData.comment_text.substring(0, 50)}...`,
                    action_description_zh: `添加评论: ${commentData.comment_text.substring(0, 50)}...`
                });
                
                return newComment;
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
        return null;
    }

    extractMentions(text) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(text)) !== null) {
            const staffMember = this.teamMembers.find(m => 
                m.name.toLowerCase() === match[1].toLowerCase()
            );
            if (staffMember) {
                mentions.push(staffMember.id);
            }
        }
        return mentions;
    }

    async sendWeChatNotifications(mentionedStaffIds, orderId, stepId, commentData) {
        const order = this.orders.find(o => o.id === orderId);
        const step = this.workflowSteps.find(s => s.id === stepId);
        
        for (const staffId of mentionedStaffIds) {
            const staff = this.teamMembers.find(m => m.id === staffId);
            if (!staff || !staff.wechat_id) continue;

            const notificationData = {
                recipient_staff_id: staffId,
                wechat_id: staff.wechat_id,
                notification_type: 'comment',
                title: `💬 ${commentData.staff_name} mentioned you`,
                message: `In ${order?.order_number} - ${step?.step_name}: ${commentData.comment_text}`,
                order_number: order?.order_number,
                step_name: step?.step_name,
                action_url: `orders-enhanced.html?order=${orderId}&step=${stepId}`,
                sent_at: new Date().toISOString(),
                delivery_status: 'pending',
                priority: 'medium'
            };

            try {
                await fetch('tables/wechat_notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notificationData)
                });
                
                // In production, this would call WeChat API
                console.log(`WeChat notification sent to ${staff.name} (${staff.wechat_id})`);
            } catch (error) {
                console.error('Error sending WeChat notification:', error);
            }
        }
    }

    renderStepComments(stepId) {
        const comments = this.stepComments.filter(c => c.workflow_step_id === stepId);
        const container = document.getElementById('commentThread');
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-comments text-4xl mb-2"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            document.getElementById('commentCount').textContent = '(0)';
            return;
        }

        document.getElementById('commentCount').textContent = `(${comments.length})`;
        
        container.innerHTML = comments.map(comment => {
            const timeAgo = this.getTimeAgo(comment.timestamp);
            const isOwnComment = comment.staff_id === 'current-user'; // TODO: Replace with actual user ID
            
            const typeIcons = {
                'note': '💬',
                'issue': '⚠️',
                'question': '❓',
                'resolution': '✅',
                'update': '📝'
            };
            
            return `
                <div class="comment-item ${isOwnComment ? 'own-comment' : ''}">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            ${comment.staff_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-semibold text-gray-900">${comment.staff_name}</span>
                                <span class="text-xs text-gray-500">${typeIcons[comment.comment_type] || ''} ${comment.comment_type}</span>
                                <span class="text-xs text-gray-400">• ${timeAgo}</span>
                            </div>
                            <div class="text-gray-700">${this.renderCommentText(comment.comment_text)}</div>
                            ${comment.is_edited ? '<div class="text-xs text-gray-400 mt-1 italic">Edited</div>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCommentText(text) {
        // Convert @mentions to highlighted text
        return text.replace(/@(\w+)/g, '<span class="text-blue-600 font-semibold">@$1</span>');
    }

    // ========= ORDER EDITING FUNCTIONS =========
    
    async updateOrder(orderId, updates) {
        try {
            const response = await fetch(`tables/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const order = this.orders.find(o => o.id === orderId);
                
                // Log activity
                await this.logActivity({
                    activity_type: 'order_updated',
                    order_id: orderId,
                    order_number: order?.order_number,
                    staff_id: 'current-user',
                    staff_name: 'Current User',
                    action_description: `Updated order details`,
                    action_description_zh: `更新了订单详情`
                });

                await this.loadAllData();
                this.renderOrders();
                return true;
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
        return false;
    }

    loadOrderForEdit(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Basic fields
        document.getElementById('editOrderId').value = order.id;
        document.getElementById('editOrderNumber').value = order.order_number || '';
        document.getElementById('editSubOrderNumber').value = order.sub_order_number || '';
        document.getElementById('editClientName').value = order.client_name || '';
        document.getElementById('editOrderDirection').value = order.order_direction || 'customer_to_us';
        document.getElementById('editOrderStatus').value = order.status || 'Processing';
        document.getElementById('editOrderPriority').value = order.priority || 'Medium';
        
        // Currency and financial
        const currency = order.currency || 'RMB';
        document.getElementById('editCurrency').value = currency;
        const currencySymbols = { 'RMB': '¥', 'EUR': '€', 'USD': '$' };
        document.getElementById('editCurrencyLabel').textContent = currencySymbols[currency];
        
        document.getElementById('editOrderQuantity').value = order.quantity || 0;
        document.getElementById('editOrderValue').value = order.total_value || order.total_value_rmb || 0;
        document.getElementById('editProductDescription').value = order.product_description || '';
        
        // NEW: Tracking codes
        document.getElementById('editCustomerCode').value = order.customer_code || '';
        document.getElementById('editSupplierCode').value = order.supplier_code || '';
        document.getElementById('editProductCode').value = order.product_code || '';
        document.getElementById('editAssignedOffice').value = order.assigned_office || 'Both';
        
        // Load workflow steps
        this.loadWorkflowStepsInModal(orderId);
    }
    
    loadWorkflowStepsInModal(orderId) {
        const orderSteps = this.workflowSteps
            .filter(s => s.order_id === orderId)
            .sort((a, b) => (a.step_order || a.step_number || 0) - (b.step_order || b.step_number || 0));
        
        const container = document.getElementById('orderWorkflowSteps');
        
        if (orderSteps.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-info-circle text-4xl mb-2"></i>
                    <p>No workflow steps created yet for this order.</p>
                    <button onclick="window.ordersEnhanced.createDefaultWorkflow('${orderId}')" class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Create Workflow Steps
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = orderSteps.map((step, index) => {
            const statusColor = step.status === 'Completed' ? 'green' :
                              step.status === 'In Progress' ? 'blue' :
                              this.isDelayed(step) ? 'red' : 'gray';
            const commentCount = this.getStepCommentCount(step.id);
            const assignedMember = this.teamMembers.find(m => m.id === step.assigned_to_id);
            
            return `
                <div class="border-l-4 border-${statusColor}-500 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer" 
                     onclick="openStepDetail('${step.id}', '${orderId}')">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="font-bold text-${statusColor}-600">${index + 1}.</span>
                                <h5 class="font-semibold text-gray-900">${step.step_name}</h5>
                                <span class="px-2 py-1 text-xs rounded-full bg-${statusColor}-100 text-${statusColor}-700">
                                    ${step.status || 'Not Started'}
                                </span>
                            </div>
                            <div class="text-sm text-gray-600 space-y-1">
                                ${assignedMember ? `
                                    <div><i class="fas fa-user mr-1"></i> ${assignedMember.name}</div>
                                ` : ''}
                                ${step.due_date ? `
                                    <div><i class="fas fa-calendar mr-1"></i> Due: ${new Date(step.due_date).toLocaleDateString()}</div>
                                ` : ''}
                                ${commentCount > 0 ? `
                                    <div><i class="fas fa-comments mr-1 text-blue-500"></i> ${commentCount} comments</div>
                                ` : ''}
                            </div>
                        </div>
                        <button onclick="event.stopPropagation(); openStepDetail('${step.id}', '${orderId}')" 
                                class="text-blue-600 hover:text-blue-700" title="View details & add comments">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    openOrderFromActivity(orderId, stepName) {
        if (!orderId) {
            console.warn('No order ID provided for activity click');
            return;
        }
        
        // Open the order edit modal
        editOrder(orderId);
        
        // If a specific step is mentioned, scroll to it after a short delay
        if (stepName) {
            setTimeout(() => {
                const stepElements = document.querySelectorAll('#orderWorkflowSteps > div');
                for (let element of stepElements) {
                    const stepTitle = element.querySelector('h5');
                    if (stepTitle && stepTitle.textContent.trim() === stepName.trim()) {
                        // Scroll the step into view
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Add highlight effect
                        element.style.boxShadow = '0 0 0 3px #3b82f6';
                        element.style.transition = 'box-shadow 0.3s ease';
                        
                        // Remove highlight after 2 seconds
                        setTimeout(() => {
                            element.style.boxShadow = '';
                        }, 2000);
                        
                        break;
                    }
                }
            }, 300); // Wait for modal to fully render
        }
    }
    
    async createDefaultWorkflow(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Use existing createOrderWithWorkflow logic but just for workflow steps
        const template = this.workflowTemplates.find(t => t.is_default);
        if (!template || !template.steps) {
            alert('No default workflow template found. Please create workflow templates first.');
            return;
        }
        
        let currentDate = new Date();
        for (const templateStep of template.steps) {
            const dueDate = new Date(currentDate);
            dueDate.setDate(dueDate.getDate() + (templateStep.default_duration_days || 1));
            
            const assignedMember = this.teamMembers.find(m => 
                m.department === templateStep.department && m.active
            );
            
            const stepData = {
                order_id: orderId,
                step_number: templateStep.step_number,
                step_order: templateStep.step_number,
                step_name: templateStep.step_name,
                step_type: templateStep.step_type,
                status: templateStep.step_number === 1 ? 'In Progress' : 'Not Started',
                assigned_to_id: assignedMember?.id || null,
                start_date: currentDate.toISOString(),
                due_date: dueDate.toISOString(),
                estimated_hours: templateStep.default_duration_days * 8,
                actual_hours: 0,
                cost_rmb: 0,
                notes: '',
                attachments: [],
                dependencies: []
            };
            
            await fetch('tables/workflow_steps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stepData)
            });
            
            currentDate = dueDate;
        }
        
        // Reload data and refresh modal
        await this.loadAllData();
        this.loadWorkflowStepsInModal(orderId);
        this.showNotification('Workflow steps created successfully!', 'success');
    }

    closeCreateOrderModal() {
        document.getElementById('createOrderModal').classList.add('hidden');
        document.getElementById('createOrderForm').reset();
    }

    filterOrders() {
        const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const officeFilter = document.getElementById('officeFilter').value;

        let filtered = this.orders;

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.order_number?.toLowerCase().includes(searchTerm) ||
                order.client_name?.toLowerCase().includes(searchTerm) ||
                order.product_description?.toLowerCase().includes(searchTerm)
            );
        }

        if (officeFilter) {
            filtered = filtered.filter(order => order.assigned_office === officeFilter);
        }

        if (statusFilter === 'delayed') {
            filtered = filtered.filter(order => {
                const steps = this.workflowSteps.filter(s => s.order_id === order.id);
                return steps.some(s => this.isDelayed(s));
            });
        } else if (statusFilter === 'warning') {
            filtered = filtered.filter(order => {
                const steps = this.workflowSteps.filter(s => s.order_id === order.id);
                return steps.some(s => this.isDueSoon(s));
            });
        } else if (statusFilter === 'active') {
            filtered = filtered.filter(order => 
                order.status !== 'Delivered' && order.status !== 'Cancelled'
            );
        } else if (statusFilter === 'completed') {
            filtered = filtered.filter(order => order.status === 'Delivered');
        }

        // Temporarily replace orders array for rendering
        const originalOrders = this.orders;
        this.orders = filtered;
        this.renderOrders();
        this.orders = originalOrders;
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
function showCreateOrderModal() {
    document.getElementById('createOrderModal').classList.remove('hidden');
    if (window.ordersEnhanced) {
        window.ordersEnhanced.updateWorkflowPreview('Standard');
    }
}

function closeCreateOrderModal() {
    if (window.ordersEnhanced) {
        window.ordersEnhanced.closeCreateOrderModal();
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function markNotificationRead(notifId) {
    // Mark as read
    fetch(`tables/notifications_alerts/${notifId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true, read_at: new Date().toISOString() })
    });
}

function markAllAsRead() {
    if (window.ordersEnhanced) {
        window.ordersEnhanced.notifications.forEach(notif => {
            if (!notif.is_read) {
                markNotificationRead(notif.id);
            }
        });
    }
}

function viewOrderDetail(orderId) {
    // Navigate to order detail view
    window.location.href = `orders-enhanced.html?order=${orderId}`;
}

function applyFilters() {
    if (window.ordersEnhanced) {
        window.ordersEnhanced.filterOrders();
    }
}

function refreshActivityFeed() {
    if (window.ordersEnhanced) {
        window.ordersEnhanced.loadActivityFeed();
    }
}

async function clearActivityFeed() {
    if (confirm('Are you sure you want to clear all activities? This cannot be undone.')) {
        // This would require implementing a batch delete or clear function
        alert('Clear function would be implemented with proper confirmation');
    }
}

// Order editing functions
function editOrder(orderId) {
    if (window.ordersEnhanced) {
        window.ordersEnhanced.loadOrderForEdit(orderId);
        document.getElementById('editOrderModal').classList.remove('hidden');
    }
}

function closeEditOrderModal() {
    document.getElementById('editOrderModal').classList.add('hidden');
}

async function submitOrderEdit(e) {
    e.preventDefault();
    const orderId = document.getElementById('editOrderId').value;
    const currency = document.getElementById('editCurrency').value;
    const totalValue = parseFloat(document.getElementById('editOrderValue').value) || 0;
    
    const updates = {
        order_number: document.getElementById('editOrderNumber').value,
        sub_order_number: document.getElementById('editSubOrderNumber').value,
        client_name: document.getElementById('editClientName').value,
        order_direction: document.getElementById('editOrderDirection').value,
        customer_code: document.getElementById('editCustomerCode').value,
        supplier_code: document.getElementById('editSupplierCode').value,
        product_code: document.getElementById('editProductCode').value,
        assigned_office: document.getElementById('editAssignedOffice').value,
        currency: currency,
        status: document.getElementById('editOrderStatus').value,
        priority: document.getElementById('editOrderPriority').value,
        quantity: parseInt(document.getElementById('editOrderQuantity').value) || 0,
        total_value: totalValue,
        // Keep legacy field for compatibility
        total_value_rmb: currency === 'RMB' ? totalValue : 0,
        product_description: document.getElementById('editProductDescription').value
    };
    
    if (window.ordersEnhanced) {
        const success = await window.ordersEnhanced.updateOrder(orderId, updates);
        if (success) {
            closeEditOrderModal();
            window.ordersEnhanced.showNotification('Order updated successfully!', 'success');
            window.ordersEnhanced.renderOrders(); // Refresh the list
        } else {
            window.ordersEnhanced.showNotification('Failed to update order', 'error');
        }
    }
}

// Step detail and comment functions
async function openStepDetail(stepId, orderId) {
    if (!window.ordersEnhanced) return;
    
    window.ordersEnhanced.currentStepId = stepId;
    window.ordersEnhanced.currentOrderId = orderId;
    
    const step = window.ordersEnhanced.workflowSteps.find(s => s.id === stepId);
    const order = window.ordersEnhanced.orders.find(o => o.id === orderId);
    
    if (!step || !order) return;
    
    document.getElementById('stepModalTitle').textContent = step.step_name;
    document.getElementById('stepModalOrderNumber').textContent = `Order: ${order.order_number}`;
    document.getElementById('stepModalStatus').value = step.status || 'Not Started';
    document.getElementById('stepModalDueDate').value = step.due_date ? step.due_date.split('T')[0] : '';
    document.getElementById('stepModalHours').value = step.actual_hours || 0;
    
    const assigneeSelect = document.getElementById('stepModalAssignee');
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>' + 
        window.ordersEnhanced.teamMembers.filter(m => m.active).map(member => 
            `<option value="${member.id}" ${step.assigned_to_id === member.id ? 'selected' : ''}>${member.name}</option>`
        ).join('');
    
    await window.ordersEnhanced.loadStepComments(stepId);
    window.ordersEnhanced.renderStepComments(stepId);
    
    document.getElementById('stepDetailModal').classList.remove('hidden');
}

function closeStepModal() {
    document.getElementById('stepDetailModal').classList.add('hidden');
    window.ordersEnhanced.currentStepId = null;
    window.ordersEnhanced.currentOrderId = null;
}

async function updateStepStatusFromModal() {
    const stepId = window.ordersEnhanced.currentStepId;
    const newStatus = document.getElementById('stepModalStatus').value;
    
    if (window.ordersEnhanced && stepId) {
        await window.ordersEnhanced.updateWorkflowStep(
            stepId,
            { status: newStatus, completed_date: newStatus === 'Completed' ? new Date().toISOString() : null },
            'current-user',
            'Current User'
        );
    }
}

async function updateStepAssigneeFromModal() {
    const stepId = window.ordersEnhanced.currentStepId;
    const newAssigneeId = document.getElementById('stepModalAssignee').value;
    
    if (window.ordersEnhanced && stepId) {
        await fetch(`tables/workflow_steps/${stepId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assigned_to_id: newAssigneeId || null })
        });
        
        await window.ordersEnhanced.loadAllData();
        window.ordersEnhanced.renderOrders();
    }
}

async function updateStepDueDateFromModal() {
    const stepId = window.ordersEnhanced.currentStepId;
    const newDueDate = document.getElementById('stepModalDueDate').value;
    
    if (window.ordersEnhanced && stepId && newDueDate) {
        await fetch(`tables/workflow_steps/${stepId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ due_date: new Date(newDueDate).toISOString() })
        });
        
        await window.ordersEnhanced.loadAllData();
        window.ordersEnhanced.renderOrders();
    }
}

async function updateStepHoursFromModal() {
    const stepId = window.ordersEnhanced.currentStepId;
    const hours = parseFloat(document.getElementById('stepModalHours').value);
    
    if (window.ordersEnhanced && stepId && !isNaN(hours)) {
        const step = window.ordersEnhanced.workflowSteps.find(s => s.id === stepId);
        const assignee = window.ordersEnhanced.teamMembers.find(m => m.id === step?.assigned_to_id);
        const cost = assignee ? hours * (assignee.hourly_rate_rmb || 0) : 0;
        
        await fetch(`tables/workflow_steps/${stepId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actual_hours: hours, cost_rmb: cost })
        });
        
        await window.ordersEnhanced.loadAllData();
        window.ordersEnhanced.renderOrders();
    }
}

async function addComment() {
    const commentText = document.getElementById('newCommentText').value.trim();
    const commentType = document.getElementById('commentType').value;
    
    if (!commentText || !window.ordersEnhanced) return;
    
    const commentData = {
        staff_id: 'current-user',
        staff_name: 'Current User',
        comment_text: commentText,
        comment_type: commentType
    };
    
    await window.ordersEnhanced.addStepComment(
        window.ordersEnhanced.currentStepId,
        window.ordersEnhanced.currentOrderId,
        commentData
    );
    
    document.getElementById('newCommentText').value = '';
    document.getElementById('commentType').value = 'note';
    window.ordersEnhanced.renderStepComments(window.ordersEnhanced.currentStepId);
}

function expandOrderWorkflow(orderId) {
    if (!window.ordersEnhanced) return;
    
    const order = window.ordersEnhanced.orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Open the edit order modal with full workflow view
    editOrder(orderId);
}

function showAllSteps(orderId) {
    // Open expanded view showing all workflow steps
    expandOrderWorkflow(orderId);
}

// Helper functions for testing/manual updates
function testWorkflowUpdate(stepId, newStatus, staffName = 'Test User') {
    if (window.ordersEnhanced) {
        window.ordersEnhanced.updateWorkflowStep(
            stepId, 
            { status: newStatus, completed_date: newStatus === 'Completed' ? new Date().toISOString() : null },
            'test-staff-id',
            staffName
        );
    }
}

function testPaymentLog(orderNumber, paymentType, amount, currency, staffName = 'Test User') {
    if (window.ordersEnhanced) {
        const order = window.ordersEnhanced.orders.find(o => o.order_number === orderNumber);
        if (order) {
            window.ordersEnhanced.logPaymentActivity(
                order,
                paymentType,
                amount,
                currency,
                'test-staff-id',
                staffName
            );
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.ordersEnhanced = new OrdersEnhanced();
    
    // Setup edit order form submission
    const editForm = document.getElementById('editOrderForm');
    if (editForm) {
        editForm.addEventListener('submit', submitOrderEdit);
    }
});
// ========================================
// I TRUSTY LTD - ENHANCED DASHBOARD SYSTEM
// Complete Dashboard Logic with Theme, Language, Charts, and WeChat Integration
// ========================================

// ========================================
// 1. TRANSLATION SYSTEM (English/Chinese)
// ========================================

const translations = {
    en: {
        // Header
        dashboard: "Dashboard",
        welcomeBack: "Welcome back, Johny",
        
        // Quick Stats
        activeOrdersLabel: "Active Orders",
        monthlyRevenueLabel: "Monthly Revenue",
        teamCostLabel: "Monthly Payroll",
        overdueLabel: "Overdue Items",
        teamCount: "team members",
        
        // Navigation Buttons
        ordersNav: "Orders & Workflow",
        projectsNav: "Projects",
        teamNav: "Team",
        suppliersNav: "Suppliers",
        activitiesNav: "Activities",
        workflowNav: "Workflow",
        
        // Dashboard Cards
        pipelineLabel: "Orders Pipeline",
        utilizationLabel: "Team Utilization",
        alertsLabel: "Recent Alerts",
        performanceLabel: "Monthly Performance",
        
        // Pipeline Stages
        stageEnquiry: "Enquiry",
        stageProforma: "Proforma",
        stageConfirmed: "Confirmed",
        stageProduction: "Production",
        stageShipping: "Shipping",
        stageCompleted: "Completed",
        
        // Alert Types
        alertOverdue: "Overdue",
        alertUrgent: "Urgent",
        alertPayment: "Payment Due",
        alertQuality: "Quality Check",
        noAlerts: "No alerts at this time",
        
        // Time
        daysAgo: "days ago",
        hoursAgo: "hours ago",
        today: "Today",
        
        // Actions
        viewDetails: "View Details",
        sendNotification: "Send Notification",
        markComplete: "Mark Complete"
    },
    zh: {
        // Header
        dashboard: "控制面板",
        welcomeBack: "欢迎回来，Johny",
        
        // Quick Stats
        activeOrdersLabel: "活跃订单",
        monthlyRevenueLabel: "月收入",
        teamCostLabel: "月薪资",
        overdueLabel: "逾期项目",
        teamCount: "团队成员",
        
        // Navigation Buttons
        ordersNav: "订单与流程",
        projectsNav: "项目",
        teamNav: "团队",
        suppliersNav: "供应商",
        activitiesNav: "活动",
        workflowNav: "工作流程",
        
        // Dashboard Cards
        pipelineLabel: "订单流水线",
        utilizationLabel: "团队利用率",
        alertsLabel: "最近警报",
        performanceLabel: "月度业绩",
        
        // Pipeline Stages
        stageEnquiry: "询价",
        stageProforma: "形式发票",
        stageConfirmed: "已确认",
        stageProduction: "生产中",
        stageShipping: "运输中",
        stageCompleted: "已完成",
        
        // Alert Types
        alertOverdue: "逾期",
        alertUrgent: "紧急",
        alertPayment: "待付款",
        alertQuality: "质量检查",
        noAlerts: "目前没有警报",
        
        // Time
        daysAgo: "天前",
        hoursAgo: "小时前",
        today: "今天",
        
        // Actions
        viewDetails: "查看详情",
        sendNotification: "发送通知",
        markComplete: "标记完成"
    }
};

// Current language (default English)
let currentLanguage = localStorage.getItem('i-trusty-language') || 'en';

// ========================================
// 2. LANGUAGE SWITCHING FUNCTION
// ========================================

function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('i-trusty-language', lang);
    
    // Update active language button
    document.querySelectorAll('.lang-switcher').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements
    const t = translations[lang];
    
    // Header
    document.getElementById('dashboardTitle').textContent = t.dashboard;
    document.getElementById('welcomeMessage').textContent = t.welcomeBack;
    
    // Quick Stats
    document.getElementById('activeOrdersLabel').textContent = t.activeOrdersLabel;
    document.getElementById('monthlyRevenueLabel').textContent = t.monthlyRevenueLabel;
    document.getElementById('teamCostLabel').textContent = t.teamCostLabel;
    document.getElementById('overdueLabel').textContent = t.overdueLabel;
    
    // Navigation
    document.getElementById('ordersNav').textContent = t.ordersNav;
    document.getElementById('projectsNav').textContent = t.projectsNav;
    document.getElementById('teamNav').textContent = t.teamNav;
    document.getElementById('suppliersNav').textContent = t.suppliersNav;
    document.getElementById('activitiesNav').textContent = t.activitiesNav;
    document.getElementById('workflowNav').textContent = t.workflowNav;
    
    // Dashboard Cards
    document.getElementById('pipelineLabel').textContent = t.pipelineLabel;
    document.getElementById('utilizationLabel').textContent = t.utilizationLabel;
    document.getElementById('alertsLabel').textContent = t.alertsLabel;
    document.getElementById('performanceLabel').textContent = t.performanceLabel;
    
    // Refresh charts with new language
    refreshCharts();
}

// ========================================
// 3. THEME SWITCHING FUNCTION
// ========================================

function changeTheme(themeName) {
    // Update data-theme attribute
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Save to localStorage
    localStorage.setItem('i-trusty-theme', themeName);
    
    // Update active theme button
    document.querySelectorAll('.theme-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        }
    });
    
    // Refresh charts to match new theme colors
    refreshCharts();
}

// ========================================
// 4. DATA LOADING AND STATS CALCULATION
// ========================================

let dashboardData = {
    orders: [],
    teamMembers: [],
    workflowSteps: [],
    suppliers: [],
    projects: []
};

async function loadDashboardData() {
    try {
        // Load all necessary data in parallel
        const [ordersRes, teamRes, workflowRes, suppliersRes, projectsRes] = await Promise.all([
            fetch('tables/orders?limit=1000').catch(() => ({ json: () => ({ data: [] }) })),
            fetch('tables/team_members?limit=100').catch(() => ({ json: () => ({ data: [] }) })),
            fetch('tables/workflow_steps?limit=1000').catch(() => ({ json: () => ({ data: [] }) })),
            fetch('tables/suppliers?limit=500').catch(() => ({ json: () => ({ data: [] }) })),
            fetch('tables/projects?limit=100').catch(() => ({ json: () => ({ data: [] }) }))
        ]);
        
        dashboardData.orders = (await ordersRes.json()).data || [];
        dashboardData.teamMembers = (await teamRes.json()).data || [];
        dashboardData.workflowSteps = (await workflowRes.json()).data || [];
        dashboardData.suppliers = (await suppliersRes.json()).data || [];
        dashboardData.projects = (await projectsRes.json()).data || [];
        
        // Calculate and display stats
        updateQuickStats();
        
        // Generate alerts
        generateAlerts();
        
        // Render charts
        renderCharts();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// ========================================
// 5. QUICK STATS CALCULATION
// ========================================

function updateQuickStats() {
    const t = translations[currentLanguage];
    
    // Active Orders (not completed or cancelled)
    const activeOrders = dashboardData.orders.filter(order => 
        order.status !== 'Completed' && order.status !== 'Cancelled' && order.status !== 'Closed'
    );
    document.getElementById('activeOrdersCount').textContent = activeOrders.length;
    
    // Monthly Revenue (current month confirmed orders)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRevenue = dashboardData.orders
        .filter(order => {
            if (!order.order_date) return false;
            const orderDate = new Date(order.order_date);
            return orderDate.getMonth() === currentMonth && 
                   orderDate.getFullYear() === currentYear &&
                   (order.status === 'Confirmed' || order.status === 'Production' || order.status === 'Shipping' || order.status === 'Completed');
        })
        .reduce((sum, order) => sum + (parseFloat(order.total_value_usd) || 0), 0);
    
    document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    
    // Monthly Payroll (sum of all team salaries)
    const totalPayroll = dashboardData.teamMembers.reduce((sum, member) => 
        sum + (parseFloat(member.base_salary_rmb) || 0), 0
    );
    document.getElementById('teamCost').textContent = `¥${totalPayroll.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    document.getElementById('teamCount').textContent = `${dashboardData.teamMembers.length} ${t.teamCount}`;
    
    // Overdue Items (workflow steps past due date)
    const overdueSteps = dashboardData.workflowSteps.filter(step => {
        if (!step.due_date || step.status === 'Completed') return false;
        const dueDate = new Date(step.due_date);
        return dueDate < now;
    });
    document.getElementById('overdueCount').textContent = overdueSteps.length;
    
    // Apply warning style if overdue items exist
    const overdueCard = document.getElementById('overdueCount').closest('.stat-card');
    if (overdueSteps.length > 0) {
        overdueCard.style.borderLeft = '4px solid #EF4444';
    } else {
        overdueCard.style.borderLeft = '';
    }
}

// ========================================
// 6. ALERTS GENERATION
// ========================================

function generateAlerts() {
    const t = translations[currentLanguage];
    const alertsList = document.getElementById('alertsList');
    const alerts = [];
    const now = new Date();
    
    // Overdue workflow steps
    dashboardData.workflowSteps.forEach(step => {
        if (!step.due_date || step.status === 'Completed') return;
        const dueDate = new Date(step.due_date);
        if (dueDate < now) {
            const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
            alerts.push({
                type: 'overdue',
                severity: 'high',
                title: `${t.alertOverdue}: ${step.step_name || 'Workflow Step'}`,
                description: `Order #${step.order_id} - ${daysOverdue} ${t.daysAgo}`,
                timestamp: dueDate,
                orderId: step.order_id
            });
        }
    });
    
    // Orders stuck in Proforma stage for >7 days
    dashboardData.orders.forEach(order => {
        if (order.status === 'Proforma Sent' && order.proforma_date) {
            const proformaDate = new Date(order.proforma_date);
            const daysSince = Math.floor((now - proformaDate) / (1000 * 60 * 60 * 24));
            if (daysSince > 7) {
                alerts.push({
                    type: 'urgent',
                    severity: 'medium',
                    title: `${t.alertUrgent}: Proforma not confirmed`,
                    description: `Order #${order.order_number} - ${daysSince} ${t.daysAgo}`,
                    timestamp: proformaDate,
                    orderId: order.id
                });
            }
        }
    });
    
    // Payment reminders (orders with payment due within 3 days)
    dashboardData.orders.forEach(order => {
        if (order.payment_due_date && order.payment_status !== 'Paid') {
            const paymentDue = new Date(order.payment_due_date);
            const daysUntil = Math.floor((paymentDue - now) / (1000 * 60 * 60 * 24));
            if (daysUntil >= 0 && daysUntil <= 3) {
                alerts.push({
                    type: 'payment',
                    severity: 'medium',
                    title: `${t.alertPayment}`,
                    description: `Order #${order.order_number} - ${order.customer_name} - $${order.total_value_usd}`,
                    timestamp: paymentDue,
                    orderId: order.id
                });
            }
        }
    });
    
    // Quality check pending for >2 days
    dashboardData.workflowSteps.forEach(step => {
        if (step.step_name === 'Quality Check' && step.status === 'In Progress') {
            const startDate = new Date(step.actual_start_date || step.planned_start_date);
            const daysSince = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            if (daysSince > 2) {
                alerts.push({
                    type: 'quality',
                    severity: 'medium',
                    title: `${t.alertQuality}`,
                    description: `Order #${step.order_id} - ${daysSince} ${t.daysAgo}`,
                    timestamp: startDate,
                    orderId: step.order_id
                });
            }
        }
    });
    
    // Sort by severity and timestamp
    alerts.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return b.timestamp - a.timestamp;
    });
    
    // Display alerts (max 10)
    if (alerts.length === 0) {
        alertsList.innerHTML = `<div class="text-center py-6 text-gray-500">${t.noAlerts}</div>`;
    } else {
        alertsList.innerHTML = alerts.slice(0, 10).map(alert => `
            <div class="alert-item ${alert.severity}" data-order-id="${alert.orderId}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            ${getSeverityIcon(alert.severity)}
                            <strong>${alert.title}</strong>
                        </div>
                        <p class="text-sm text-gray-600">${alert.description}</p>
                    </div>
                    <button class="btn-wechat-notify" onclick="sendWeChatAlert('${alert.orderId}', '${alert.type}')" title="${t.sendNotification}">
                        <i class="fab fa-weixin"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function getSeverityIcon(severity) {
    const icons = {
        high: '<i class="fas fa-exclamation-triangle text-red-500"></i>',
        medium: '<i class="fas fa-exclamation-circle text-yellow-500"></i>',
        low: '<i class="fas fa-info-circle text-blue-500"></i>'
    };
    return icons[severity] || icons.low;
}

// ========================================
// 7. CHARTS RENDERING
// ========================================

let charts = {
    pipeline: null,
    utilization: null,
    performance: null
};

function renderCharts() {
    renderPipelineChart();
    renderUtilizationChart();
    renderPerformanceChart();
}

function refreshCharts() {
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Re-render with new theme/language
    renderCharts();
}

function getPrimaryColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
}

function getAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
}

function getPrimaryLight() {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary-light').trim();
}

// Pipeline Chart: Orders by Status
function renderPipelineChart() {
    const t = translations[currentLanguage];
    const ctx = document.getElementById('pipelineChart');
    
    const statusCounts = {
        'Enquiry': 0,
        'Proforma Sent': 0,
        'Confirmed': 0,
        'Production': 0,
        'Shipping': 0,
        'Completed': 0
    };
    
    dashboardData.orders.forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
            statusCounts[order.status]++;
        }
    });
    
    const primaryColor = getPrimaryColor();
    const accentColor = getAccentColor();
    const primaryLight = getPrimaryLight();
    
    charts.pipeline = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                t.stageEnquiry, 
                t.stageProforma, 
                t.stageConfirmed, 
                t.stageProduction, 
                t.stageShipping, 
                t.stageCompleted
            ],
            datasets: [{
                label: t.activeOrdersLabel,
                data: Object.values(statusCounts),
                backgroundColor: [
                    `${primaryColor}40`,
                    `${primaryColor}60`,
                    `${accentColor}80`,
                    `${accentColor}`,
                    `${primaryLight}`,
                    `${primaryColor}`
                ],
                borderColor: primaryColor,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: primaryColor,
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: '#E5E7EB' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Utilization Chart: Team Member Workload
function renderUtilizationChart() {
    const t = translations[currentLanguage];
    const ctx = document.getElementById('utilizationChart');
    
    // Calculate workload per team member (active tasks assigned)
    const memberWorkload = {};
    dashboardData.teamMembers.forEach(member => {
        memberWorkload[member.name] = 0;
    });
    
    dashboardData.workflowSteps.forEach(step => {
        if (step.assigned_to && step.status !== 'Completed' && memberWorkload.hasOwnProperty(step.assigned_to)) {
            memberWorkload[step.assigned_to]++;
        }
    });
    
    const sortedMembers = Object.entries(memberWorkload)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Top 8 members
    
    const primaryColor = getPrimaryColor();
    const accentColor = getAccentColor();
    
    charts.utilization = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedMembers.map(([name]) => name),
            datasets: [{
                data: sortedMembers.map(([_, count]) => count),
                backgroundColor: [
                    `${primaryColor}`,
                    `${primaryColor}CC`,
                    `${primaryColor}99`,
                    `${accentColor}`,
                    `${accentColor}CC`,
                    `${accentColor}99`,
                    `${primaryColor}66`,
                    `${accentColor}66`
                ],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: primaryColor,
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            return `${context.label}: ${context.parsed} ${t.activeOrdersLabel.toLowerCase()}`;
                        }
                    }
                }
            }
        }
    });
}

// Performance Chart: Monthly Revenue Trend
function renderPerformanceChart() {
    const t = translations[currentLanguage];
    const ctx = document.getElementById('performanceChart');
    
    // Get last 6 months
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = 0;
    }
    
    // Calculate revenue per month
    dashboardData.orders.forEach(order => {
        if (!order.order_date || !order.total_value_usd) return;
        const orderDate = new Date(order.order_date);
        const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.hasOwnProperty(key) && 
            (order.status === 'Confirmed' || order.status === 'Production' || order.status === 'Shipping' || order.status === 'Completed')) {
            monthlyData[key] += parseFloat(order.total_value_usd);
        }
    });
    
    const primaryColor = getPrimaryColor();
    const accentColor = getAccentColor();
    
    charts.performance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData).map(key => {
                const [year, month] = key.split('-');
                const date = new Date(year, month - 1);
                return date.toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US', { month: 'short' });
            }),
            datasets: [{
                label: t.monthlyRevenueLabel,
                data: Object.values(monthlyData),
                borderColor: primaryColor,
                backgroundColor: `${primaryColor}20`,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: accentColor,
                pointBorderColor: primaryColor,
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: primaryColor,
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            return `$${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `$${(value / 1000).toFixed(0)}K`
                    },
                    grid: { color: '#E5E7EB' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// ========================================
// 8. WECHAT NOTIFICATION SYSTEM
// ========================================

async function sendWeChatAlert(orderId, alertType) {
    const t = translations[currentLanguage];
    
    // Find order details
    const order = dashboardData.orders.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found');
        return;
    }
    
    // Determine recipients based on alert type
    let recipients = [];
    
    switch (alertType) {
        case 'overdue':
            // Send to assigned team member and manager
            const step = dashboardData.workflowSteps.find(s => s.order_id === orderId && new Date(s.due_date) < new Date());
            if (step && step.assigned_to) {
                const member = dashboardData.teamMembers.find(m => m.name === step.assigned_to);
                if (member && member.wechat_id) {
                    recipients.push(member.wechat_id);
                }
            }
            // Add managers
            recipients.push('peng_yiwu', 'lily_sz');
            break;
            
        case 'urgent':
            // Send to sales team and managers
            dashboardData.teamMembers
                .filter(m => m.is_sales_person && m.wechat_id)
                .forEach(m => recipients.push(m.wechat_id));
            recipients.push('peng_yiwu', 'lily_sz');
            break;
            
        case 'payment':
            // Send to finance (James) and managers
            recipients.push('james_finance', 'peng_yiwu', 'lily_sz');
            break;
            
        case 'quality':
            // Send to QC team
            recipients.push('zheng_qc', 'linyi_qc', 'peng_yiwu');
            break;
            
        default:
            recipients.push('peng_yiwu', 'lily_sz');
    }
    
    // Remove duplicates
    recipients = [...new Set(recipients)];
    
    // Construct message
    const alertMessages = {
        overdue: currentLanguage === 'zh' 
            ? `⚠️ 逾期警报\n订单: ${order.order_number}\n客户: ${order.customer_name}\n请立即处理!` 
            : `⚠️ Overdue Alert\nOrder: ${order.order_number}\nCustomer: ${order.customer_name}\nAction required!`,
        urgent: currentLanguage === 'zh'
            ? `🔴 紧急提醒\n订单: ${order.order_number}\n形式发票已发送超过7天\n请跟进客户!`
            : `🔴 Urgent Reminder\nOrder: ${order.order_number}\nProforma sent over 7 days ago\nFollow up with customer!`,
        payment: currentLanguage === 'zh'
            ? `💰 付款提醒\n订单: ${order.order_number}\n客户: ${order.customer_name}\n金额: $${order.total_value_usd}\n付款截止日期临近!`
            : `💰 Payment Reminder\nOrder: ${order.order_number}\nCustomer: ${order.customer_name}\nAmount: $${order.total_value_usd}\nPayment due soon!`,
        quality: currentLanguage === 'zh'
            ? `✅ 质量检查\n订单: ${order.order_number}\n质检已超过2天\n请尽快完成!`
            : `✅ Quality Check\nOrder: ${order.order_number}\nQC pending for 2+ days\nPlease complete ASAP!`
    };
    
    const message = alertMessages[alertType] || 'Alert notification';
    
    // Simulate WeChat notification (in production, this would call WeChat Work API)
    console.log('WeChat Notification:', {
        recipients,
        message,
        orderId,
        alertType
    });
    
    // Show user feedback
    const button = event.target.closest('button');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.style.backgroundColor = '#10B981';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.backgroundColor = '';
    }, 2000);
    
    // In production environment, uncomment and implement:
    /*
    try {
        const response = await fetch('/api/wechat/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipients,
                message,
                orderId,
                alertType
            })
        });
        
        if (response.ok) {
            alert(currentLanguage === 'zh' ? '通知已发送' : 'Notification sent');
        } else {
            alert(currentLanguage === 'zh' ? '发送失败' : 'Failed to send');
        }
    } catch (error) {
        console.error('WeChat notification error:', error);
        alert(currentLanguage === 'zh' ? '发送错误' : 'Notification error');
    }
    */
}

// ========================================
// 9. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('i-trusty-theme') || 'elegant';
    changeTheme(savedTheme);
    
    // Load saved language
    switchLanguage(currentLanguage);
    
    // Load dashboard data
    await loadDashboardData();
    
    // Refresh data every 2 minutes
    setInterval(async () => {
        await loadDashboardData();
    }, 120000);
    
    console.log('✅ I Trusty Enhanced Dashboard Initialized');
    console.log('📊 Dashboard Data:', dashboardData);
    console.log(`🌍 Language: ${currentLanguage}`);
    console.log(`🎨 Theme: ${savedTheme}`);
});

// ========================================
// 10. UTILITY FUNCTIONS
// ========================================

// Format currency
function formatCurrency(amount, currency = 'USD') {
    const formats = {
        'USD': { locale: 'en-US', symbol: '$' },
        'RMB': { locale: 'zh-CN', symbol: '¥' },
        'EUR': { locale: 'en-EU', symbol: '€' }
    };
    
    const format = formats[currency] || formats['USD'];
    return `${format.symbol}${parseFloat(amount).toLocaleString(format.locale, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    })}`;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
}

// Calculate days between dates
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Export functions for use in HTML
window.changeTheme = changeTheme;
window.switchLanguage = switchLanguage;
window.sendWeChatAlert = sendWeChatAlert;

// 🌐 I Trusty Ltd - Bilingual System (English/中文)
// Complete translation system for all pages

class I18nSystem {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // Navigation
                navigation: {
                    dashboard: 'Dashboard',
                    appTitle: 'I Trusty Project Timeline Manager',
                    appSubtitle: 'Calendar-Based Execution Planning & Staff Assignment',
                    theme: 'Theme',
                    projects: 'Projects',
                    orders: 'Orders',
                    dailyActivities: 'Daily Activities',
                    ordersWorkflow: 'Orders & Workflow',
                    team: 'Team',
                    messages: 'Messages',
                    suppliers: 'Suppliers',
                    finance: 'Finance',
                    ordersSystem: 'Orders System',
                    balanceSummary: 'Balance Summary',
                    customerInvoices: 'Customer Invoices',
                    supplierPayments: 'Supplier Payments',
                    profitAnalysis: 'Profit Analysis',
                    companyExpenses: 'Company Expenses',
                    customers: 'Customers',
                    salesCommissions: 'Sales Commissions',
                    newProject: 'New Project',
                    newTask: 'New Task',
                    listView: 'List View',
                    staff: 'Staff',
                    balance: 'Balance',
                    backToCalendar: 'Back to Calendar'
                },
                
                // Common terms
                common: {
                    dashboard: 'Dashboard',
                    logout: 'Logout',
                    settings: 'Settings',
                    help: 'Help',
                    search: 'Search',
                    filter: 'Filter',
                    export: 'Export',
                    import: 'Import',
                    save: 'Save',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    edit: 'Edit',
                    view: 'View',
                    add: 'Add',
                    close: 'Close',
                    submit: 'Submit',
                    refresh: 'Refresh',
                    loading: 'Loading...',
                    noData: 'No data available',
                    error: 'Error',
                    success: 'Success',
                    warning: 'Warning',
                    info: 'Information',
                    confirm: 'Confirm',
                    send: 'Send',
                    today: 'Today',
                    priority: 'Priority',
                    priorityLow: 'Low',
                    priorityMedium: 'Medium',
                    priorityHigh: 'High',
                    priorityCritical: 'Critical',
                    description: 'Description',
                    startDate: 'Start Date',
                    dueDate: 'Due Date',
                    estimatedHours: 'Estimated Hours'
                },
                
                // Dashboard
                dashboard: {
                    activeProjects: 'Active Projects',
                    pendingTasks: 'Pending Tasks',
                    staffUtilization: 'Staff Utilization',
                    overdueItems: 'Overdue Items',
                    staffWorkload: 'Staff Workload',
                    tasksProjectsList: 'Tasks & Projects List'
                },
                
                // Projects
                projects: {
                    createNew: 'Create New Project',
                    title: 'Project Title',
                    clientName: 'Client Name',
                    manager: 'Project Manager',
                    budget: 'Budget (RMB)',
                    createButton: 'Create Project'
                },
                
                // Tasks
                tasks: {
                    createNew: 'Create New Task',
                    title: 'Task Title',
                    project: 'Project',
                    assignedTo: 'Assigned To',
                    createButton: 'Create Task'
                },
                
                // Staff
                staff: {
                    title: 'Staff Productivity & Cost Analysis',
                    allOffices: 'All Offices',
                    performanceSummary: 'Team Performance Summary',
                    totalStaff: 'Total Staff',
                    totalHours: 'Total Hours Logged',
                    totalCost: 'Total Cost',
                    avgProductivity: 'Avg Productivity',
                    productivityComparison: 'Staff Productivity Comparison',
                    staffDetails: 'Staff Details'
                },
                
                // Orders
                orders: {
                    title: 'Orders Management',
                    newOrder: 'New Order'
                },
                
                // Daily Activities
                dailyActivities: {
                    title: 'Daily Activities Tracking',
                    allStaff: 'All Staff',
                    allActivities: 'All Activities',
                    timelineView: 'Timeline View',
                    listView: 'List View',
                    dailySummary: 'Daily Summary',
                    staffAnalytics: 'Staff Analytics',
                    activities: 'Activities',
                    hoursLogged: 'Hours Logged',
                    activeStaff: 'Active Staff',
                    completed: 'Completed',
                    dailyTimelineView: 'Daily Timeline View',
                    timelineDescription: 'Horizontal timeline showing all staff activities for the selected day',
                    activityTypes: {
                        assignedTask: 'Assigned Task',
                        clientCommunication: 'Client Communication',
                        sourcing: 'Sourcing',
                        qualityControl: 'Quality Control',
                        administrative: 'Administrative',
                        meeting: 'Meeting',
                        travel: 'Travel',
                        research: 'Research',
                        other: 'Other'
                    }
                },
                
                // Messaging System
                messaging: {
                    title: 'Team Messaging',
                    newMessage: 'New Message',
                    compose: 'Compose Message',
                    inbox: 'Inbox',
                    sent: 'Sent',
                    drafts: 'Drafts',
                    allMessages: 'All Messages',
                    unread: 'Unread',
                    recipients: 'Recipients',
                    selectRecipients: 'Select Recipients',
                    selectMultiple: '(Select multiple)',
                    selected: 'Selected',
                    messageType: 'Message Type',
                    priority: 'Priority',
                    category: 'Category',
                    subject: 'Subject',
                    message: 'Message',
                    relatedOrder: 'Related Order (Optional)',
                    relatedCustomer: 'Related Customer (Optional)',
                    attachFile: 'Attach File',
                    useTemplate: 'Use Template',
                    saveDraft: 'Save Draft',
                    sendMessage: 'Send Message',
                    staffDirectory: 'Staff Directory',
                    broadcast: 'Broadcast Message',
                    messageTemplates: 'Message Templates',
                    quickActions: 'Quick Actions',
                    notifications: 'Notifications',
                    markAllRead: 'Mark all read',
                    participants: 'Participants',
                    recentNotifications: 'Recent Notifications',
                    typeYourMessage: 'Type your message...',
                    searchStaff: 'Search staff by name or office...',
                    offices: {
                        all: 'All Offices',
                        yiwu: 'Yiwu Office',
                        shenzhen: 'Shenzhen Office',
                        greece: 'Greece Office'
                    },
                    types: {
                        internal: 'Internal Only',
                        email: 'Email Notification',
                        wechat: 'WeChat Notification'
                    },
                    priorities: {
                        low: 'Low',
                        normal: 'Normal',
                        high: 'High',
                        urgent: 'Urgent'
                    },
                    categories: {
                        general: 'General',
                        order: 'Order Related',
                        customer: 'Customer Related',
                        urgent: 'Urgent',
                        announcement: 'Announcement'
                    },
                    validation: {
                        selectRecipient: 'Please select at least one recipient!',
                        enterSubject: 'Please enter a subject!',
                        enterMessage: 'Please enter a message!',
                        messageSent: 'Message sent successfully!',
                        messageFailed: 'Failed to send message'
                    },
                    noMessages: 'No messages',
                    noNotifications: 'No notifications',
                    selectConversation: 'Select a conversation to view messages',
                    viewMessage: 'View Message',
                    allFeatures: 'View All Features'
                },
                
                // Daily Activities
                activities: {
                    title: 'Daily Activities Tracking',
                    allStaff: 'All Staff',
                    allActivities: 'All Activities',
                    timelineView: 'Timeline View',
                    listView: 'List View',
                    dailySummary: 'Daily Summary',
                    staffAnalytics: 'Staff Analytics',
                    logActivity: 'Log Activity',
                    staffMember: 'Staff Member',
                    startTime: 'Start Time',
                    endTime: 'End Time',
                    activityType: 'Activity Type',
                    activityTitle: 'Activity Title',
                    details: 'Details',
                    outcome: 'Outcome',
                    clientName: 'Client (if any)',
                    location: 'Location',
                    saveActivity: 'Save Activity',
                    todayPerformance: 'Today\'s Performance',
                    recentActivities: 'Recent Activities',
                    totalActivities: 'Activities',
                    hoursLogged: 'Hours Logged',
                    activeStaff: 'Active Staff',
                    completedTasks: 'Completed',
                    types: {
                        assignedTask: 'Assigned Task',
                        clientCommunication: 'Client Communication',
                        sourcing: 'Sourcing',
                        qualityControl: 'Quality Control',
                        administrative: 'Administrative',
                        meeting: 'Meeting',
                        travel: 'Travel',
                        research: 'Research',
                        other: 'Other'
                    },
                    outcomes: {
                        completed: 'Completed',
                        inProgress: 'In Progress',
                        blocked: 'Blocked',
                        needsFollowup: 'Needs Follow-up'
                    },
                    locations: {
                        office: 'Office',
                        clientSite: 'Client Site',
                        supplierLocation: 'Supplier Location',
                        remote: 'Remote',
                        travel: 'Travel'
                    },
                    noActivitiesLogged: 'No activities logged for this day'
                },
                
                // Staff & Team
                staff: {
                    title: 'Staff Management',
                    staffCosts: 'Staff Productivity & Cost Analysis',
                    teamPerformance: 'Team Performance Summary',
                    totalStaff: 'Total Staff',
                    totalHours: 'Total Hours Logged',
                    totalCost: 'Total Cost',
                    avgProductivity: 'Avg Productivity',
                    productivity: 'Productivity',
                    tasks: 'Tasks',
                    productiveHours: 'Prod. Hours',
                    adminHours: 'Admin Hours',
                    cost: 'Cost',
                    revenue: 'Revenue',
                    recentTasks: 'Recent Tasks',
                    viewAllTasks: 'View All',
                    messageStaff: 'Message',
                    noTasksLogged: 'No tasks logged this month',
                    role: 'Role',
                    office: 'Office',
                    email: 'Email',
                    phone: 'Phone',
                    wechatId: 'WeChat ID',
                    sendMessage: 'Send Message'
                },
                
                // Finance
                finance: {
                    title: 'Finance',
                    financialAccounts: 'Financial Accounts',
                    recordPayment: 'Record Payment',
                    transactions: 'Transactions',
                    customers: 'Customer Invoices',
                    suppliers: 'Supplier Payments',
                    balance: 'Balance',
                    income: 'Income',
                    expenses: 'Expenses',
                    profit: 'Profit',
                    currency: 'Currency',
                    amount: 'Amount',
                    date: 'Date',
                    description: 'Description',
                    account: 'Account',
                    status: 'Status',
                    paid: 'Paid',
                    pending: 'Pending',
                    overdue: 'Overdue',
                    paymentHistory: 'Payment History',
                    accountLedger: 'Account Ledger',
                    totalBalance: 'Total Balance',
                    bankAccounts: 'Bank Accounts',
                    officeFinancials: 'Office Financials',
                    companyCosts: 'Company Expenses',
                    staffCosts: 'Staff Costs',
                    salesCommissions: 'Sales Commissions'
                },
                
                // Orders
                orders: {
                    title: 'Orders Management',
                    allOrders: 'All Orders',
                    activeOrders: 'Active Orders',
                    completedOrders: 'Completed Orders',
                    pendingOrders: 'Pending Orders',
                    orderNumber: 'Order Number',
                    customer: 'Customer',
                    supplier: 'Supplier',
                    product: 'Product',
                    quantity: 'Quantity',
                    price: 'Price',
                    totalAmount: 'Total Amount',
                    orderDate: 'Order Date',
                    deliveryDate: 'Delivery Date',
                    orderStatus: 'Order Status',
                    paymentStatus: 'Payment Status',
                    shippingStatus: 'Shipping Status',
                    trackingNumber: 'Tracking Number',
                    notes: 'Notes',
                    addOrder: 'Add Order',
                    editOrder: 'Edit Order',
                    viewOrder: 'View Order',
                    workflow: 'Workflow',
                    step: 'Step'
                },
                
                // Projects
                projects: {
                    title: 'Projects',
                    allProjects: 'All Projects',
                    activeProjects: 'Active Projects',
                    completedProjects: 'Completed Projects',
                    projectName: 'Project Name',
                    projectManager: 'Project Manager',
                    startDate: 'Start Date',
                    endDate: 'End Date',
                    deadline: 'Deadline',
                    progress: 'Progress',
                    budget: 'Budget',
                    team: 'Team',
                    addProject: 'Add Project',
                    editProject: 'Edit Project',
                    viewProject: 'View Project'
                },
                
                // Common Forms
                form: {
                    required: 'Required',
                    optional: 'Optional',
                    selectOption: 'Select an option',
                    enterValue: 'Enter value',
                    chooseDate: 'Choose date',
                    chooseFile: 'Choose file',
                    uploadFile: 'Upload file',
                    dragDrop: 'Drag and drop or click to upload',
                    invalidInput: 'Invalid input',
                    fieldRequired: 'This field is required',
                    saveChanges: 'Save Changes',
                    discardChanges: 'Discard Changes',
                    confirmDelete: 'Are you sure you want to delete this?',
                    confirmAction: 'Are you sure you want to proceed?'
                },
                
                // Time & Dates
                time: {
                    today: 'Today',
                    yesterday: 'Yesterday',
                    tomorrow: 'Tomorrow',
                    thisWeek: 'This Week',
                    thisMonth: 'This Month',
                    lastMonth: 'Last Month',
                    selectDate: 'Select Date',
                    justNow: 'Just now',
                    minutesAgo: 'minutes ago',
                    hoursAgo: 'hours ago',
                    daysAgo: 'days ago',
                    weeksAgo: 'weeks ago',
                    monthsAgo: 'months ago'
                }
            },
            
            zh: {
                // 导航
                navigation: {
                    dashboard: '控制面板',
                    appTitle: 'I Trusty 项目时间管理系统',
                    appSubtitle: '基于日历的执行规划和员工分配',
                    theme: '主题',
                    projects: '项目',
                    orders: '订单',
                    dailyActivities: '日常活动',
                    ordersWorkflow: '订单与工作流',
                    team: '团队',
                    messages: '消息',
                    suppliers: '供应商',
                    finance: '财务',
                    ordersSystem: '订单系统',
                    balanceSummary: '余额汇总',
                    customerInvoices: '客户发票',
                    supplierPayments: '供应商付款',
                    profitAnalysis: '利润分析',
                    companyExpenses: '公司支出',
                    customers: '客户',
                    salesCommissions: '销售佣金',
                    newProject: '新建项目',
                    newTask: '新建任务',
                    listView: '列表视图',
                    staff: '员工',
                    balance: '余额',
                    backToCalendar: '返回日历'
                },
                
                // 通用术语
                common: {
                    dashboard: '控制面板',
                    logout: '退出',
                    settings: '设置',
                    help: '帮助',
                    search: '搜索',
                    filter: '筛选',
                    export: '导出',
                    import: '导入',
                    save: '保存',
                    cancel: '取消',
                    delete: '删除',
                    edit: '编辑',
                    view: '查看',
                    add: '添加',
                    close: '关闭',
                    submit: '提交',
                    refresh: '刷新',
                    loading: '加载中...',
                    noData: '暂无数据',
                    error: '错误',
                    success: '成功',
                    warning: '警告',
                    info: '信息',
                    confirm: '确认',
                    send: '发送',
                    today: '今天',
                    priority: '优先级',
                    priorityLow: '低',
                    priorityMedium: '中',
                    priorityHigh: '高',
                    priorityCritical: '紧急',
                    description: '描述',
                    startDate: '开始日期',
                    dueDate: '截止日期',
                    estimatedHours: '预计工时'
                },
                
                // 控制面板
                dashboard: {
                    activeProjects: '活动项目',
                    pendingTasks: '待处理任务',
                    staffUtilization: '员工利用率',
                    overdueItems: '逾期项目',
                    staffWorkload: '员工工作量',
                    tasksProjectsList: '任务和项目列表'
                },
                
                // 项目
                projects: {
                    createNew: '创建新项目',
                    title: '项目标题',
                    clientName: '客户名称',
                    manager: '项目经理',
                    budget: '预算（人民币）',
                    createButton: '创建项目'
                },
                
                // 任务
                tasks: {
                    createNew: '创建新任务',
                    title: '任务标题',
                    project: '项目',
                    assignedTo: '分配给',
                    createButton: '创建任务'
                },
                
                // 员工
                staff: {
                    title: '员工生产力和成本分析',
                    allOffices: '所有办公室',
                    performanceSummary: '团队绩效总结',
                    totalStaff: '员工总数',
                    totalHours: '总记录工时',
                    totalCost: '总成本',
                    avgProductivity: '平均生产力',
                    productivityComparison: '员工生产力对比',
                    staffDetails: '员工详情'
                },
                
                // 订单
                orders: {
                    title: '订单管理',
                    newOrder: '新订单'
                },
                
                // 日常活动
                dailyActivities: {
                    title: '日常活动跟踪',
                    allStaff: '所有员工',
                    allActivities: '所有活动',
                    timelineView: '时间线视图',
                    listView: '列表视图',
                    dailySummary: '每日总结',
                    staffAnalytics: '员工分析',
                    activities: '活动',
                    hoursLogged: '记录工时',
                    activeStaff: '活跃员工',
                    completed: '已完成',
                    dailyTimelineView: '每日时间线视图',
                    timelineDescription: '显示所选日期所有员工活动的横向时间线',
                    activityTypes: {
                        assignedTask: '指定任务',
                        clientCommunication: '客户沟通',
                        sourcing: '采购',
                        qualityControl: '质量控制',
                        administrative: '行政工作',
                        meeting: '会议',
                        travel: '出差',
                        research: '研究',
                        other: '其他'
                    }
                },
                
                // 消息系统
                messaging: {
                    title: '团队消息',
                    newMessage: '新消息',
                    compose: '撰写消息',
                    inbox: '收件箱',
                    sent: '已发送',
                    drafts: '草稿箱',
                    allMessages: '全部消息',
                    unread: '未读',
                    recipients: '收件人',
                    selectRecipients: '选择收件人',
                    selectMultiple: '(可多选)',
                    selected: '已选择',
                    messageType: '消息类型',
                    priority: '优先级',
                    category: '类别',
                    subject: '主题',
                    message: '消息内容',
                    relatedOrder: '相关订单（可选）',
                    relatedCustomer: '相关客户（可选）',
                    attachFile: '附加文件',
                    useTemplate: '使用模板',
                    saveDraft: '保存草稿',
                    sendMessage: '发送消息',
                    staffDirectory: '员工通讯录',
                    broadcast: '群发消息',
                    messageTemplates: '消息模板',
                    quickActions: '快速操作',
                    notifications: '通知',
                    markAllRead: '全部标记为已读',
                    participants: '参与者',
                    recentNotifications: '最近通知',
                    typeYourMessage: '输入您的消息...',
                    searchStaff: '按姓名或办公室搜索员工...',
                    offices: {
                        all: '所有办公室',
                        yiwu: '义乌办公室',
                        shenzhen: '深圳办公室',
                        greece: '希腊办公室'
                    },
                    types: {
                        internal: '仅内部',
                        email: '邮件通知',
                        wechat: '微信通知'
                    },
                    priorities: {
                        low: '低',
                        normal: '普通',
                        high: '高',
                        urgent: '紧急'
                    },
                    categories: {
                        general: '一般',
                        order: '订单相关',
                        customer: '客户相关',
                        urgent: '紧急',
                        announcement: '公告'
                    },
                    validation: {
                        selectRecipient: '请至少选择一位收件人！',
                        enterSubject: '请输入主题！',
                        enterMessage: '请输入消息内容！',
                        messageSent: '消息发送成功！',
                        messageFailed: '消息发送失败'
                    },
                    noMessages: '暂无消息',
                    noNotifications: '暂无通知',
                    selectConversation: '选择对话以查看消息',
                    viewMessage: '查看消息',
                    allFeatures: '查看所有功能'
                },
                
                // 日常活动
                activities: {
                    title: '日常活动跟踪',
                    allStaff: '全部员工',
                    allActivities: '全部活动',
                    timelineView: '时间线视图',
                    listView: '列表视图',
                    dailySummary: '每日摘要',
                    staffAnalytics: '员工分析',
                    logActivity: '记录活动',
                    staffMember: '员工',
                    startTime: '开始时间',
                    endTime: '结束时间',
                    activityType: '活动类型',
                    activityTitle: '活动标题',
                    details: '详情',
                    outcome: '结果',
                    clientName: '客户（如有）',
                    location: '地点',
                    saveActivity: '保存活动',
                    todayPerformance: '今日表现',
                    recentActivities: '最近活动',
                    totalActivities: '活动数',
                    hoursLogged: '记录小时数',
                    activeStaff: '活跃员工',
                    completedTasks: '已完成',
                    types: {
                        assignedTask: '分配任务',
                        clientCommunication: '客户沟通',
                        sourcing: '采购',
                        qualityControl: '质量控制',
                        administrative: '行政事务',
                        meeting: '会议',
                        travel: '出差',
                        research: '研究',
                        other: '其他'
                    },
                    outcomes: {
                        completed: '已完成',
                        inProgress: '进行中',
                        blocked: '受阻',
                        needsFollowup: '需要跟进'
                    },
                    locations: {
                        office: '办公室',
                        clientSite: '客户现场',
                        supplierLocation: '供应商地点',
                        remote: '远程',
                        travel: '出差中'
                    },
                    noActivitiesLogged: '当日无活动记录'
                },
                
                // 员工和团队
                staff: {
                    title: '员工管理',
                    staffCosts: '员工生产力与成本分析',
                    teamPerformance: '团队绩效总结',
                    totalStaff: '员工总数',
                    totalHours: '总记录小时数',
                    totalCost: '总成本',
                    avgProductivity: '平均生产力',
                    productivity: '生产力',
                    tasks: '任务',
                    productiveHours: '生产小时',
                    adminHours: '行政小时',
                    cost: '成本',
                    revenue: '收入',
                    recentTasks: '最近任务',
                    viewAllTasks: '查看全部',
                    messageStaff: '发消息',
                    noTasksLogged: '本月无任务记录',
                    role: '职位',
                    office: '办公室',
                    email: '邮箱',
                    phone: '电话',
                    wechatId: '微信号',
                    sendMessage: '发送消息'
                },
                
                // 财务
                finance: {
                    title: '财务',
                    financialAccounts: '财务账户',
                    recordPayment: '记录付款',
                    transactions: '交易记录',
                    customers: '客户发票',
                    suppliers: '供应商付款',
                    balance: '余额',
                    income: '收入',
                    expenses: '支出',
                    profit: '利润',
                    currency: '货币',
                    amount: '金额',
                    date: '日期',
                    description: '描述',
                    account: '账户',
                    status: '状态',
                    paid: '已付款',
                    pending: '待处理',
                    overdue: '逾期',
                    paymentHistory: '付款历史',
                    accountLedger: '账户分类账',
                    totalBalance: '总余额',
                    bankAccounts: '银行账户',
                    officeFinancials: '办公室财务',
                    companyCosts: '公司费用',
                    staffCosts: '员工成本',
                    salesCommissions: '销售佣金'
                },
                
                // 订单
                orders: {
                    title: '订单管理',
                    allOrders: '全部订单',
                    activeOrders: '活动订单',
                    completedOrders: '已完成订单',
                    pendingOrders: '待处理订单',
                    orderNumber: '订单号',
                    customer: '客户',
                    supplier: '供应商',
                    product: '产品',
                    quantity: '数量',
                    price: '价格',
                    totalAmount: '总金额',
                    orderDate: '订单日期',
                    deliveryDate: '交付日期',
                    orderStatus: '订单状态',
                    paymentStatus: '付款状态',
                    shippingStatus: '发货状态',
                    trackingNumber: '追踪号',
                    notes: '备注',
                    addOrder: '添加订单',
                    editOrder: '编辑订单',
                    viewOrder: '查看订单',
                    workflow: '工作流',
                    step: '步骤'
                },
                
                // 项目
                projects: {
                    title: '项目',
                    allProjects: '全部项目',
                    activeProjects: '活动项目',
                    completedProjects: '已完成项目',
                    projectName: '项目名称',
                    projectManager: '项目经理',
                    startDate: '开始日期',
                    endDate: '结束日期',
                    deadline: '截止日期',
                    progress: '进度',
                    budget: '预算',
                    team: '团队',
                    addProject: '添加项目',
                    editProject: '编辑项目',
                    viewProject: '查看项目'
                },
                
                // 通用表单
                form: {
                    required: '必填',
                    optional: '可选',
                    selectOption: '选择选项',
                    enterValue: '输入值',
                    chooseDate: '选择日期',
                    chooseFile: '选择文件',
                    uploadFile: '上传文件',
                    dragDrop: '拖放或点击上传',
                    invalidInput: '输入无效',
                    fieldRequired: '此字段为必填项',
                    saveChanges: '保存更改',
                    discardChanges: '放弃更改',
                    confirmDelete: '您确定要删除吗？',
                    confirmAction: '您确定要继续吗？'
                },
                
                // 时间和日期
                time: {
                    today: '今天',
                    yesterday: '昨天',
                    tomorrow: '明天',
                    thisWeek: '本周',
                    thisMonth: '本月',
                    lastMonth: '上月',
                    selectDate: '选择日期',
                    justNow: '刚刚',
                    minutesAgo: '分钟前',
                    hoursAgo: '小时前',
                    daysAgo: '天前',
                    weeksAgo: '周前',
                    monthsAgo: '月前'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.addLanguageToggle();
        this.translatePage();
    }
    
    addLanguageToggle() {
        // Add language toggle button to all pages
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'language-toggle';
        toggleContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        
        toggleContainer.innerHTML = `
            <button id="langToggle" class="px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                this.currentLanguage === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }">
                ${this.currentLanguage === 'en' ? 'EN' : '中文'}
            </button>
        `;
        
        // Find appropriate place in nav
        const navContainer = nav.querySelector('.flex.items-center.gap-3, .flex.items-center.space-x-4');
        if (navContainer) {
            navContainer.appendChild(toggleContainer);
        }
        
        // Add click handler
        document.getElementById('langToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'zh' : 'en';
        localStorage.setItem('language', this.currentLanguage);
        
        // Update button (old style - for messaging.html)
        const button = document.getElementById('langToggle');
        if (button) {
            button.textContent = this.currentLanguage === 'en' ? 'EN' : '中文';
            button.className = `px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                this.currentLanguage === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`;
        }
        
        // Update language label (new style - for index.html)
        const label = document.getElementById('languageLabel');
        if (label) {
            label.textContent = this.currentLanguage === 'en' ? '中文' : 'English';
        }
        
        this.translatePage();
    }
    
    translatePage() {
        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.get(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
        
        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.get(key);
            if (translation) {
                element.title = translation;
            }
        });
    }
    
    get(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    }
    
    t(key) {
        return this.get(key);
    }
}

// Initialize on page load
let i18n;
document.addEventListener('DOMContentLoaded', () => {
    i18n = new I18nSystem();
    window.i18n = i18n; // Make globally available
});

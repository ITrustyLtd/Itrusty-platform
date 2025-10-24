// Bilingual Translation System for I Trusty Ltd
// English / Chinese (Simplified)

const translations = {
    en: {
        // Navigation
        nav: {
            back: 'Back to Dashboard',
            title: 'Workflow & Order Manager',
            dashboard: 'Dashboard',
            orders: 'Orders',
            customers: 'Customers',
            workflow: 'Workflow',
            staff: 'Staff',
            financials: 'Financials',
            settings: 'Settings',
            logout: 'Logout'
        },
        filter: {
            allOrders: 'All Orders'
        },
        btn: {
            newWorkflow: 'New Workflow',
            addStep: 'Add Step',
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            addSubtask: 'Add Subtask',
            translate: 'Translate'
        },
        stats: {
            activeWorkflows: 'Active Workflows',
            inProgress: 'In Progress',
            blocked: 'Blocked',
            totalCost: 'Total Cost',
            laborCost: 'Labor Cost'
        },
        section: {
            workflowSteps: 'Workflow Steps',
            production: 'Production Tracking',
            shipping: 'Shipping & Export',
            quickActions: 'Quick Actions',
            costBreakdown: 'Cost Breakdown',
            staffAllocation: 'Staff Allocation',
            timeline: 'Timeline'
        },
        action: {
            quotation: 'Prepare Quotation',
            proforma: 'Proforma Invoice',
            production: 'Start Production',
            qc: 'QC Inspection',
            shipment: 'Prepare Shipment'
        },
        modal: {
            editTitle: 'Edit Item'
        },
        workflow: {
            request: 'Request',
            sourcing: 'Sourcing',
            quotationPrep: 'Quotation Preparation',
            customerApproval: 'Customer Approval',
            proformaInvoice: 'Proforma Invoice',
            depositPayment: 'Deposit Payment',
            supplierPayment: 'Supplier Payment',
            production: 'Production',
            privateLabeling: 'Private Labeling',
            warehouseArrival: 'Warehouse Arrival',
            qcInspection: 'QC Inspection',
            packing: 'Packing',
            exportPrep: 'Export Preparation',
            fob: 'FOB',
            shipment: 'Shipment',
            telexRelease: 'Telex Release',
            finalPayment: 'Final Payment'
        },
        status: {
            notStarted: 'Not Started',
            inProgress: 'In Progress',
            completed: 'Completed',
            blocked: 'Blocked',
            waiting: 'Waiting',
            cancelled: 'Cancelled'
        },
        form: {
            stepName: 'Step Name',
            assignedTo: 'Assigned To',
            startDate: 'Start Date',
            dueDate: 'Due Date',
            estimatedHours: 'Estimated Hours',
            cost: 'Cost (RMB)',
            notes: 'Notes',
            notesZh: 'Notes (Chinese)',
            status: 'Status'
        }
    },
    zh: {
        nav: {
            back: '返回仪表板',
            title: '工作流程和订单管理'
        },
        filter: {
            allOrders: '所有订单'
        },
        btn: {
            newWorkflow: '新建工作流程',
            addStep: '添加步骤',
            save: '保存',
            cancel: '取消',
            edit: '编辑',
            delete: '删除',
            addSubtask: '添加子任务',
            translate: '翻译'
        },
        stats: {
            activeWorkflows: '活跃工作流程',
            inProgress: '进行中',
            blocked: '受阻',
            totalCost: '总成本',
            laborCost: '人工成本'
        },
        section: {
            workflowSteps: '工作流程步骤',
            production: '生产跟踪',
            shipping: '运输和出口',
            quickActions: '快速操作',
            costBreakdown: '成本明细',
            staffAllocation: '员工分配',
            timeline: '时间轴'
        },
        action: {
            quotation: '准备报价',
            proforma: '形式发票',
            production: '开始生产',
            qc: '质量检查',
            shipment: '准备发货'
        },
        modal: {
            editTitle: '编辑项目'
        },
        workflow: {
            request: '请求',
            sourcing: '采购',
            quotationPrep: '报价准备',
            customerApproval: '客户批准',
            proformaInvoice: '形式发票',
            depositPayment: '定金支付',
            supplierPayment: '供应商付款',
            production: '生产',
            privateLabeling: '私人标签',
            warehouseArrival: '仓库到货',
            qcInspection: '质检',
            packing: '包装',
            exportPrep: '出口准备',
            fob: 'FOB',
            shipment: '发货',
            telexRelease: '电放',
            finalPayment: '尾款支付'
        },
        status: {
            notStarted: '未开始',
            inProgress: '进行中',
            completed: '已完成',
            blocked: '受阻',
            waiting: '等待中',
            cancelled: '已取消'
        },
        form: {
            stepName: '步骤名称',
            assignedTo: '分配给',
            startDate: '开始日期',
            dueDate: '截止日期',
            estimatedHours: '预计小时',
            cost: '成本（人民币）',
            notes: '备注',
            notesZh: '备注（中文）',
            status: '状态'
        }
    }
};

class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.init();
    }

    init() {
        this.updateUI();
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateUI();
        
        // Update language button states
        document.getElementById('langBtnEn').classList.toggle('active', lang === 'en');
        document.getElementById('langBtnZh').classList.toggle('active', lang === 'zh');
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    t(key) {
        const keys = key.split('.');
        let value = translations[this.currentLanguage];
        
        for (const k of keys) {
            value = value[k];
            if (!value) break;
        }
        
        return value || key;
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
    }

    async translateText(text, targetLang) {
        // For now, return a placeholder
        // In production, this would call a translation API
        if (!text || text.trim() === '') return '';
        
        // Simple demo translation (in production, use Google Translate API or similar)
        const translations = {
            'Hello': { 'zh': '你好', 'en': 'Hello' },
            'Thank you': { 'zh': '谢谢', 'en': 'Thank you' },
            'Completed': { 'zh': '已完成', 'en': 'Completed' },
            'In Progress': { 'zh': '进行中', 'en': 'In Progress' }
        };
        
        return translations[text]?.[targetLang] || `[${targetLang}] ${text}`;
    }

    // Real-time translation for input fields
    async autoTranslate(sourceText, sourceLang, targetLang) {
        // This would integrate with Google Translate API or similar
        // For demo purposes, showing structure
        try {
            // In production: const translated = await googleTranslateAPI(sourceText, targetLang);
            const translated = `[Auto-translated to ${targetLang}]: ${sourceText}`;
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return sourceText;
        }
    }
}

// Global translation manager instance
window.i18n = new TranslationManager();

// Global function for language switching
function switchLanguage(lang) {
    window.i18n.setLanguage(lang);
    
    // Trigger re-render of dynamic content
    if (window.workflowManager) {
        window.workflowManager.renderAll();
    }
}
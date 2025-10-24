// ========================================
// RBAC (Role-Based Access Control) System
// I Trusty Ltd - Enterprise Management
// ========================================

// Global current user (loaded on login)
let currentUser = null;
let currentUserRole = null;

// ========================================
// INITIALIZATION
// ========================================

async function initRBAC() {
    // Load current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        await loadUserRole();
    }
    
    console.log('✅ RBAC System initialized', {
        user: currentUser?.full_name,
        role: currentUserRole?.role_name
    });
}

// Load user's role from database
async function loadUserRole() {
    if (!currentUser || !currentUser.role_id) {
        console.warn('⚠️ No role_id for user, defaulting to Staff');
        currentUser.role_id = 'role_staff';
    }
    
    try {
        const response = await fetch(`tables/user_roles/${currentUser.role_id}`);
        if (response.ok) {
            currentUserRole = await response.json();
            currentUserRole.permissions = JSON.parse(currentUserRole.permissions || '{}');
        } else {
            // Fallback to default Staff role
            currentUserRole = getDefaultStaffRole();
        }
    } catch (error) {
        console.error('Error loading user role:', error);
        currentUserRole = getDefaultStaffRole();
    }
}

function getDefaultStaffRole() {
    return {
        role_name: 'Staff',
        role_name_cn: '员工',
        role_level: 3,
        permissions: {
            view_customer_initials_only: true,
            view_assigned_tasks_only: true,
            upload_files: true,
            add_comments: true
        }
    };
}

// ========================================
// PERMISSION CHECKING
// ========================================

/**
 * Check if current user has a specific permission
 * @param {string} permission - Permission key (e.g., 'view_customer_full_info')
 * @returns {boolean}
 */
function hasPermission(permission) {
    if (!currentUser || !currentUserRole) {
        console.warn('⚠️ No user/role loaded, denying permission:', permission);
        return false;
    }
    
    // Admins have all permissions
    if (currentUser.role_id === 'role_admin' || currentUserRole.role_level === 1) {
        return true;
    }
    
    // Check custom permissions first (user-specific overrides)
    if (currentUser.custom_permissions) {
        const customPerms = typeof currentUser.custom_permissions === 'string' 
            ? JSON.parse(currentUser.custom_permissions) 
            : currentUser.custom_permissions;
        
        if (customPerms.hasOwnProperty(permission)) {
            return customPerms[permission];
        }
    }
    
    // Check role base permissions
    if (currentUserRole.permissions.hasOwnProperty(permission)) {
        return currentUserRole.permissions[permission];
    }
    
    // Check legacy permissions for backwards compatibility
    if (permission === 'view_purchase_price' || permission === 'view_selling_price') {
        return currentUser.can_see_prices || false;
    }
    
    // Default deny
    return false;
}

/**
 * Mask a field value based on permission
 * @param {any} value - Original value
 * @param {string} permission - Required permission
 * @param {string} maskText - Text to show if no permission (default: "***")
 * @returns {any}
 */
function maskField(value, permission, maskText = '***') {
    if (hasPermission(permission)) {
        return value;
    } else {
        return maskText;
    }
}

/**
 * Get customer name (full or initials based on permission)
 * @param {object} customer - Customer object with company_name and customer_code
 * @returns {string}
 */
function getCustomerName(customer) {
    if (hasPermission('view_customer_full_info')) {
        return customer.company_name || customer.customer_name || customer.client_name || 'Unknown';
    } else if (hasPermission('view_customer_initials_only')) {
        return customer.customer_code || customer.company_name?.substring(0, 3).toUpperCase() || '***';
    } else {
        return '***';
    }
}

/**
 * Check if user can see a specific workflow step
 * @param {object} step - Workflow step object
 * @returns {boolean}
 */
function canViewWorkflowStep(step) {
    // Admins and Managers see all steps
    if (hasPermission('access_all_workflows')) {
        return true;
    }
    
    // Staff only see assigned steps
    if (hasPermission('view_assigned_tasks_only')) {
        return step.assigned_to_id === currentUser.staff_member_id || 
               step.assigned_to === currentUser.username ||
               step.assigned_to === currentUser.full_name;
    }
    
    return false;
}

/**
 * Check if user can edit an order
 * @param {object} order - Order object
 * @returns {boolean}
 */
function canEditOrder(order) {
    if (hasPermission('edit_order')) {
        // Check office restriction for managers
        if (currentUserRole.role_level === 2) {
            // Managers can only edit orders from their office (unless "Both")
            if (order.assigned_office === 'Both') return true;
            return order.assigned_office === currentUser.office;
        }
        return true;
    }
    return false;
}

/**
 * Check if user can delete an order
 * @param {object} order - Order object
 * @returns {boolean}
 */
function canDeleteOrder(order) {
    return hasPermission('delete_order');
}

// ========================================
// UI HELPERS
// ========================================

/**
 * Hide element if user doesn't have permission
 * @param {string} elementId - DOM element ID
 * @param {string} permission - Required permission
 */
function hideIfNoPermission(elementId, permission) {
    const element = document.getElementById(elementId);
    if (element && !hasPermission(permission)) {
        element.style.display = 'none';
    }
}

/**
 * Disable element if user doesn't have permission
 * @param {string} elementId - DOM element ID
 * @param {string} permission - Required permission
 */
function disableIfNoPermission(elementId, permission) {
    const element = document.getElementById(elementId);
    if (element && !hasPermission(permission)) {
        element.disabled = true;
        element.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

/**
 * Show permission denied message
 * @param {string} containerId - Container to show message in
 */
function showPermissionDenied(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <i class="fas fa-lock text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg mb-2">${t('no_permission')}</p>
                <p class="text-gray-400 text-sm">${t('contact_administrator')}</p>
            </div>
        `;
    }
}

/**
 * Apply RBAC to page navigation
 */
function applyNavigationPermissions() {
    // Hide Office Financials link if not admin
    if (!hasPermission('view_office_financials')) {
        const financialsLink = document.querySelector('a[href="office-financials.html"]');
        if (financialsLink) financialsLink.style.display = 'none';
    }
    
    // Hide Staff Costs link if not admin
    if (!hasPermission('view_staff_costs')) {
        const staffCostsLink = document.querySelector('a[href="staff-costs.html"]');
        if (staffCostsLink) staffCostsLink.style.display = 'none';
    }
}

// ========================================
// USER DISPLAY
// ========================================

/**
 * Get current user display name with role
 * @returns {string}
 */
function getCurrentUserDisplay() {
    if (!currentUser || !currentUserRole) return 'Guest';
    
    const lang = getCurrentUserLanguage();
    const roleName = lang === 'zh-CN' ? currentUserRole.role_name_cn : currentUserRole.role_name;
    
    return `${currentUser.full_name} (${roleName})`;
}

/**
 * Get current user language
 * @returns {string} 'en' or 'zh-CN'
 */
function getCurrentUserLanguage() {
    return currentUser?.language_preference || 'en';
}

// ========================================
// DEMO USERS (For Testing)
// ========================================

const DEMO_USERS = {
    admin: {
        id: 'user_admin',
        username: 'admin',
        password_hash: 'admin123',
        full_name: 'Ιωάννης Βλαχόπουλος',
        role_id: 'role_admin',
        office: 'Shenzhen',
        email: 'ioannis@itrusty.com',
        language_preference: 'en',
        active: true
    },
    lily: {
        id: 'user_lily',
        username: 'lily',
        password_hash: 'lily123',
        full_name: 'Lily Chen',
        role_id: 'role_manager',
        office: 'Shenzhen',
        email: 'lily@itrusty.com',
        language_preference: 'zh-CN',
        active: true,
        staff_member_id: 'staff_lily'
    },
    peng: {
        id: 'user_peng',
        username: 'peng',
        password_hash: 'peng123',
        full_name: 'Peng Wang',
        role_id: 'role_manager',
        office: 'Yiwu',
        email: 'peng@itrusty.com',
        language_preference: 'zh-CN',
        active: true,
        staff_member_id: 'staff_peng'
    },
    ruby: {
        id: 'user_ruby',
        username: 'ruby',
        password_hash: 'ruby123',
        full_name: 'Ruby Liu',
        role_id: 'role_staff',
        office: 'Shenzhen',
        email: 'ruby@itrusty.com',
        language_preference: 'zh-CN',
        active: true,
        custom_permissions: '{"view_purchase_price": true, "view_supplier_info": true}',
        staff_member_id: 'staff_ruby'
    },
    bigbrother: {
        id: 'user_bigbrother',
        username: 'bigbrother',
        password_hash: 'bb123',
        full_name: 'Big Brother Zheng',
        role_id: 'role_staff',
        office: 'Yiwu',
        email: 'zheng@itrusty.com',
        language_preference: 'zh-CN',
        active: true,
        custom_permissions: '{"upload_qc_photos": true}',
        staff_member_id: 'staff_bigbrother'
    },
    nikos: {
        id: 'user_nikos',
        username: 'nikos',
        password_hash: 'nikos123',
        full_name: 'Nikos Papadopoulos',
        role_id: 'role_manager',
        office: 'Greece',
        email: 'nikos@itrusty.com',
        language_preference: 'en',
        active: true,
        staff_member_id: 'staff_nikos'
    },
    chrysanthi: {
        id: 'user_chrysanthi',
        username: 'chrysanthi',
        password_hash: 'chrysanthi123',
        full_name: 'Chrysanthi Georgiou',
        role_id: 'role_manager',
        office: 'Greece',
        email: 'chrysanthi@itrusty.com',
        language_preference: 'en',
        active: true,
        custom_permissions: '{"view_customer_payments": true, "view_selling_price": true}',
        staff_member_id: 'staff_chrysanthi'
    }
};

// ========================================
// EXPORT FOR GLOBAL USE
// ========================================

window.RBAC = {
    initRBAC,
    hasPermission,
    maskField,
    getCustomerName,
    canViewWorkflowStep,
    canEditOrder,
    canDeleteOrder,
    hideIfNoPermission,
    disableIfNoPermission,
    showPermissionDenied,
    applyNavigationPermissions,
    getCurrentUserDisplay,
    getCurrentUserLanguage,
    getCurrentUser: () => currentUser,
    getCurrentUserRole: () => currentUserRole,
    DEMO_USERS
};

console.log('✅ RBAC System loaded');

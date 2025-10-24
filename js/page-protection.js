// ========================================
// PAGE PROTECTION MIDDLEWARE
// I Trusty Ltd - Enterprise Management
// Protects pages based on user_permissions
// ========================================

/**
 * Check if user has access to current page
 * Call this at the start of every protected page
 */
async function checkPageAccess(requiredPage = null) {
    // Get current session user
    const userData = sessionStorage.getItem('itrusty_user');
    
    if (!userData) {
        // No session - redirect to login
        console.warn('⚠️ No active session - redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    
    const user = JSON.parse(userData);
    
    // Get page name from current URL or parameter
    const pageName = requiredPage || getPageNameFromURL();
    
    try {
        // Load user permissions from database
        const response = await fetch(`tables/user_permissions?page=1&limit=100`);
        if (!response.ok) {
            console.error('❌ Failed to load permissions');
            return false;
        }
        
        const data = await response.json();
        const permissions = data.data || [];
        
        // Find user permission by user_id or username
        const userPerm = permissions.find(p => 
            p.user_id === user.id || 
            p.user_id === user.username ||
            p.user_name === user.full_name
        );
        
        if (!userPerm) {
            console.warn('⚠️ No permissions found for user:', user.username);
            // If no permissions record, allow access (backward compatibility)
            return true;
        }
        
        // Store permissions in session for faster access
        sessionStorage.setItem('itrusty_permissions', JSON.stringify(userPerm));
        
        // Check if user is admin (full access)
        if (userPerm.role === 'admin') {
            console.log('✅ Admin access granted');
            return true;
        }
        
        // Check page access
        const pagesAccess = userPerm.pages_access || [];
        const hasAllAccess = pagesAccess.includes('all');
        const hasPageAccess = pagesAccess.includes(pageName);
        
        if (!hasAllAccess && !hasPageAccess) {
            console.warn(`⚠️ Access denied to page: ${pageName}`);
            alert(`🔒 You don't have permission to access this page.\n\nPage: ${pageName}\nYour role: ${userPerm.role}\n\nContact administrator for access.`);
            window.location.href = 'index.html';
            return false;
        }
        
        console.log(`✅ Page access granted: ${pageName}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error checking page access:', error);
        // Allow access on error (fail-open for development)
        return true;
    }
}

/**
 * Get page name from current URL
 */
function getPageNameFromURL() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    const pageName = filename.replace('.html', '');
    
    // Map filename to permission page name
    const pageMapping = {
        'index': 'dashboard',
        'orders': 'orders',
        'orders-enhanced': 'orders',
        'orders-comprehensive': 'orders',
        'invoices-creator': 'invoices',
        'invoices-history': 'invoices',
        'products-library': 'products',
        'customers': 'customers',
        'daily-activities': 'daily-activities',
        'tasks': 'tasks',
        'projects': 'projects',
        'finance': 'finance',
        'transactions-customers': 'finance',
        'transactions-suppliers': 'finance',
        'company-expenses': 'finance',
        'analytics-dashboard': 'analytics',
        'office-financials': 'analytics',
        'staff-costs': 'analytics'
    };
    
    return pageMapping[pageName] || pageName;
}

/**
 * Check if user has access to a specific customer
 * @param {string} customerCode - Customer code to check (e.g., "SRP", "CTC")
 * @returns {boolean} - True if user can access this customer
 */
function hasAccessToCustomer(customerCode) {
    // Get user permissions from session
    const permData = sessionStorage.getItem('itrusty_permissions');
    
    if (!permData) {
        // No permissions - allow all (backward compatibility)
        return true;
    }
    
    const permissions = JSON.parse(permData);
    
    // Admin or empty customers_access = access to all customers
    if (permissions.role === 'admin' || 
        !permissions.customers_access || 
        permissions.customers_access.length === 0) {
        return true;
    }
    
    // Check if customer code is in allowed list
    const allowedCodes = permissions.customers_access;
    return allowedCodes.includes(customerCode);
}

/**
 * Filter customers based on user permissions
 * Call this before displaying customer lists
 */
async function filterCustomersByPermission(allCustomers) {
    // Get user permissions from session
    const permData = sessionStorage.getItem('itrusty_permissions');
    
    if (!permData) {
        // No permissions - return all (backward compatibility)
        return allCustomers;
    }
    
    const permissions = JSON.parse(permData);
    
    // Admin or empty customers_access = see all customers
    if (permissions.role === 'admin' || 
        !permissions.customers_access || 
        permissions.customers_access.length === 0) {
        return allCustomers;
    }
    
    // Filter customers by allowed customer_codes
    const allowedCodes = permissions.customers_access;
    const filtered = allCustomers.filter(customer => 
        allowedCodes.includes(customer.customer_code) ||
        allowedCodes.includes(customer.customer_name) ||
        allowedCodes.includes(customer.id)
    );
    
    console.log(`🔍 Customer filtering applied: ${filtered.length}/${allCustomers.length} customers visible`);
    
    return filtered;
}

/**
 * Filter orders based on user's customer access
 * @param {Array} allOrders - All orders from database
 * @returns {Array} - Filtered orders
 */
function filterOrdersByCustomerAccess(allOrders) {
    const permData = sessionStorage.getItem('itrusty_permissions');
    
    if (!permData) return allOrders;
    
    const permissions = JSON.parse(permData);
    
    // Admin or no restrictions = see all
    if (permissions.role === 'admin' || 
        !permissions.customers_access || 
        permissions.customers_access.length === 0) {
        return allOrders;
    }
    
    // Filter by customer_code
    const allowedCodes = permissions.customers_access;
    const filtered = allOrders.filter(order => 
        allowedCodes.includes(order.customer_code) ||
        allowedCodes.includes(order.customer_name) ||
        allowedCodes.includes(order.client_name)
    );
    
    console.log(`🔐 Order filtering applied: ${filtered.length}/${allOrders.length} orders visible`);
    return filtered;
}

/**
 * Filter invoices based on user's customer access
 * @param {Array} allInvoices - All invoices from database
 * @returns {Array} - Filtered invoices
 */
function filterInvoicesByCustomerAccess(allInvoices) {
    const permData = sessionStorage.getItem('itrusty_permissions');
    
    if (!permData) return allInvoices;
    
    const permissions = JSON.parse(permData);
    
    // Admin or no restrictions = see all
    if (permissions.role === 'admin' || 
        !permissions.customers_access || 
        permissions.customers_access.length === 0) {
        return allInvoices;
    }
    
    // Filter by customer_code
    const allowedCodes = permissions.customers_access;
    const filtered = allInvoices.filter(invoice => 
        allowedCodes.includes(invoice.customer_code) ||
        allowedCodes.includes(invoice.customer_name)
    );
    
    console.log(`🔐 Invoice filtering applied: ${filtered.length}/${allInvoices.length} invoices visible`);
    return filtered;
}

/**
 * Filter transactions based on user's customer access
 * @param {Array} allTransactions - All transactions from database
 * @returns {Array} - Filtered transactions
 */
function filterTransactionsByCustomerAccess(allTransactions) {
    const permData = sessionStorage.getItem('itrusty_permissions');
    
    if (!permData) return allTransactions;
    
    const permissions = JSON.parse(permData);
    
    // Admin or no restrictions = see all
    if (permissions.role === 'admin' || 
        !permissions.customers_access || 
        permissions.customers_access.length === 0) {
        return allTransactions;
    }
    
    // Filter by customer_code or customer_name
    const allowedCodes = permissions.customers_access;
    const filtered = allTransactions.filter(transaction => 
        allowedCodes.includes(transaction.customer_code) ||
        allowedCodes.includes(transaction.customer_name)
    );
    
    console.log(`🔐 Transaction filtering applied: ${filtered.length}/${allTransactions.length} transactions visible`);
    return filtered;
}

/**
 * Check if user can view financial data
 */
function canViewFinancials() {
    const permData = sessionStorage.getItem('itrusty_permissions');
    if (!permData) return true; // Default allow
    
    const permissions = JSON.parse(permData);
    return permissions.can_view_financials || permissions.role === 'admin';
}

/**
 * Check if user can view balances
 */
function canViewBalances() {
    const permData = sessionStorage.getItem('itrusty_permissions');
    if (!permData) return true; // Default allow
    
    const permissions = JSON.parse(permData);
    return permissions.can_view_balances || permissions.role === 'admin';
}

/**
 * Check if user can create payments
 */
function canCreatePayments() {
    const permData = sessionStorage.getItem('itrusty_permissions');
    if (!permData) return true; // Default allow
    
    const permissions = JSON.parse(permData);
    return permissions.can_create_payments || permissions.role === 'admin';
}

/**
 * Check if user can edit prices
 */
function canEditPrices() {
    const permData = sessionStorage.getItem('itrusty_permissions');
    if (!permData) return true; // Default allow
    
    const permissions = JSON.parse(permData);
    return permissions.can_edit_prices || permissions.role === 'admin';
}

/**
 * Check if user can delete records
 */
function canDeleteRecords() {
    const permData = sessionStorage.getItem('itrusty_permissions');
    if (!permData) return true; // Default allow
    
    const permissions = JSON.parse(permData);
    return permissions.can_delete_records || permissions.role === 'admin';
}

/**
 * Mask financial data if user doesn't have permission
 */
function maskFinancialData() {
    if (!canViewBalances()) {
        // Hide all elements with class 'balance-display'
        document.querySelectorAll('.balance-display, .amount-display, .price-display').forEach(el => {
            el.textContent = '***';
            el.style.filter = 'blur(5px)';
        });
    }
}

// Export functions
window.PageProtection = {
    checkPageAccess,
    hasAccessToCustomer,
    filterCustomersByPermission,
    filterOrdersByCustomerAccess,
    filterInvoicesByCustomerAccess,
    filterTransactionsByCustomerAccess,
    canViewFinancials,
    canViewBalances,
    canCreatePayments,
    canEditPrices,
    canDeleteRecords,
    maskFinancialData
};

console.log('✅ Page Protection loaded');

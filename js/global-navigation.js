/**
 * Global Navigation Menu System
 * Version: 1.0.0
 * Date: May 16, 2025
 * 
 * Provides quick navigation dropdown across all pages
 * Safe, standalone, no dependencies on existing code
 */

(function() {
    'use strict';
    
    console.log('🧭 Global Navigation initializing...');
    
    // Navigation structure - organized by category
    const navigationStructure = {
        dashboard: {
            icon: 'fa-home',
            label: 'Dashboard',
            url: 'index.html',
            color: '#3B82F6' // Blue
        },
        operations: {
            icon: 'fa-cogs',
            label: 'Operations',
            color: '#8B5CF6', // Purple
            children: [
                { label: 'Orders Management', url: 'orders.html', icon: 'fa-shopping-cart' },
                { label: 'Orders Enhanced', url: 'orders-enhanced.html', icon: 'fa-shopping-bag' },
                { label: 'Projects', url: 'projects.html', icon: 'fa-project-diagram' },
                { label: 'Current Projects Analysis', url: 'current_projects_analysis.html', icon: 'fa-chart-line' },
                { label: 'Daily Activities', url: 'daily-activities.html', icon: 'fa-calendar-day' },
                { label: 'Workflow Manager', url: 'workflow-manager.html', icon: 'fa-tasks' },
                { label: 'Workflow 17-Step', url: 'workflow-17step.html', icon: 'fa-stream' },
                { label: 'Team Management', url: 'team-management.html', icon: 'fa-users-cog' },
                { label: 'Staff Dashboard', url: 'staff-dashboard.html', icon: 'fa-user-tie' },
                { label: 'Staff Day Planner', url: 'staff-day-planner.html', icon: 'fa-calendar-check' },
                { label: 'Staff Costs', url: 'staff-costs.html', icon: 'fa-money-bill-wave' }
            ]
        },
        financial: {
            icon: 'fa-dollar-sign',
            label: 'Financial',
            color: '#10B981', // Green
            children: [
                { label: 'Finance Dashboard', url: 'finance.html', icon: 'fa-chart-pie' },
                { label: 'Transactions - Customers', url: 'transactions-customers.html', icon: 'fa-exchange-alt' },
                { label: 'Transactions - Suppliers', url: 'transactions-suppliers.html', icon: 'fa-file-invoice-dollar' },
                { label: 'Profit Analysis', url: 'profit-analysis.html', icon: 'fa-analytics' },
                { label: 'Financial Summary', url: 'financial-summary.html', icon: 'fa-file-contract' },
                { label: 'Office Financials', url: 'office-financials.html', icon: 'fa-building' },
                { label: 'Company Expenses', url: 'company-expenses.html', icon: 'fa-receipt' },
                { label: 'Sales Commissions', url: 'sales-commissions.html', icon: 'fa-percentage' }
            ]
        },
        crm: {
            icon: 'fa-handshake',
            label: 'CRM & Sales',
            color: '#F59E0B', // Orange
            children: [
                { label: 'Customers Management', url: 'customers.html', icon: 'fa-users' },
                { label: 'Suppliers Management', url: 'suppliers-list.html', icon: 'fa-truck' },
                { label: 'Products Library', url: 'products-library.html', icon: 'fa-box-open' },
                { label: 'Invoices Creator', url: 'invoices-creator.html', icon: 'fa-file-invoice' },
                { label: 'Invoices History', url: 'invoices-history.html', icon: 'fa-history' },
                { label: 'Packing List Creator', url: 'packing-list-creator.html', icon: 'fa-boxes' }
            ]
        },
        analytics: {
            icon: 'fa-chart-bar',
            label: 'Analytics & Reports',
            color: '#EC4899', // Pink
            children: [
                { label: 'Analytics Dashboard', url: 'analytics-dashboard.html', icon: 'fa-dashboard' },
                { label: 'My Dashboard', url: 'my-dashboard.html', icon: 'fa-user-chart' }
            ]
        },
        communication: {
            icon: 'fa-comments',
            label: 'Communication',
            color: '#06B6D4', // Cyan
            children: [
                { label: 'Team Messaging', url: 'messaging.html', icon: 'fa-comment-dots' }
            ]
        },
        admin: {
            icon: 'fa-shield-alt',
            label: 'Admin',
            color: '#6B7280', // Gray
            children: [
                { label: 'Login / Access', url: 'login.html', icon: 'fa-sign-in-alt' },
                { label: 'Login RBAC', url: 'login-rbac.html', icon: 'fa-lock' },
                { label: 'Admin Permissions', url: 'admin-permissions.html', icon: 'fa-user-shield' },
                { label: 'Admin Sessions', url: 'admin-sessions.html', icon: 'fa-clock' }
            ]
        }
    };
    
    // Get current page filename
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }
    
    // Find current page info
    function findCurrentPageInfo() {
        const currentPage = getCurrentPage();
        
        // Check dashboard
        if (currentPage === navigationStructure.dashboard.url) {
            return { 
                title: navigationStructure.dashboard.label,
                category: 'dashboard'
            };
        }
        
        // Check all categories
        for (const [categoryKey, category] of Object.entries(navigationStructure)) {
            if (category.children) {
                const found = category.children.find(item => item.url === currentPage);
                if (found) {
                    return {
                        title: found.label,
                        category: categoryKey
                    };
                }
            }
        }
        
        return { title: 'I Trusty Ltd', category: 'unknown' };
    }
    
    // Create navigation HTML
    function createNavigationHTML() {
        const currentPageInfo = findCurrentPageInfo();
        
        let html = `
            <div id="globalNavigation" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: white;
                border-bottom: 1px solid #E5E7EB;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                z-index: 9999;
                padding: 12px 20px;
            ">
                <div style="max-width: 1400px; margin: 0 auto; display: flex; align-items: center; gap: 16px;">
                    
                    <!-- Quick Navigation Dropdown -->
                    <div style="position: relative;">
                        <button id="navDropdownBtn" style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 8px 16px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';">
                            <i class="fas fa-compass"></i>
                            <span>Quick Navigation</span>
                            <i class="fas fa-chevron-down" style="font-size: 10px;"></i>
                        </button>
                        
                        <!-- Dropdown Menu (Hidden by default) -->
                        <div id="navDropdownMenu" style="
                            display: none;
                            position: absolute;
                            top: calc(100% + 8px);
                            left: 0;
                            background: white;
                            border: 1px solid #E5E7EB;
                            border-radius: 12px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                            min-width: 280px;
                            max-height: 600px;
                            overflow-y: auto;
                            z-index: 10000;
                        ">
                            <!-- Search Bar in Dropdown -->
                            <div style="padding: 12px; border-bottom: 1px solid #E5E7EB; background: #F9FAFB;">
                                <div style="position: relative;">
                                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; font-size: 13px;"></i>
                                    <input 
                                        type="text" 
                                        id="navSearchInput" 
                                        placeholder="Search pages..."
                                        style="
                                            width: 100%;
                                            padding: 8px 12px 8px 36px;
                                            border: 1px solid #D1D5DB;
                                            border-radius: 6px;
                                            font-size: 13px;
                                            outline: none;
                                        "
                                    />
                                </div>
                            </div>
                            
                            <!-- Navigation Items -->
                            <div id="navMenuItems" style="padding: 8px;">
        `;
        
        // Add Dashboard
        html += createMenuItem(
            navigationStructure.dashboard.url,
            navigationStructure.dashboard.label,
            navigationStructure.dashboard.icon,
            navigationStructure.dashboard.color,
            false
        );
        
        // Add all categories
        for (const [categoryKey, category] of Object.entries(navigationStructure)) {
            if (category.children) {
                // Category header
                html += `
                    <div style="padding: 8px 12px; margin-top: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6B7280; letter-spacing: 0.5px;">
                        <i class="fas ${category.icon}" style="color: ${category.color}; margin-right: 6px;"></i>
                        ${category.label}
                    </div>
                `;
                
                // Category items
                category.children.forEach(item => {
                    html += createMenuItem(item.url, item.label, item.icon, category.color, true);
                });
            }
        }
        
        html += `
                            </div>
                        </div>
                    </div>
                    
                    <!-- Current Page Title -->
                    <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-bookmark" style="color: #6B7280;"></i>
                        <span style="font-size: 16px; font-weight: 600; color: #111827;">${currentPageInfo.title}</span>
                    </div>
                    
                    <!-- Right Side Actions -->
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <a href="index.html" style="
                            padding: 8px 16px;
                            background: #F3F4F6;
                            color: #374151;
                            border-radius: 6px;
                            font-size: 13px;
                            font-weight: 500;
                            text-decoration: none;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
                            <i class="fas fa-home" style="margin-right: 6px;"></i>
                            Home
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Spacer to prevent content from hiding under fixed nav -->
            <div style="height: 64px;"></div>
        `;
        
        return html;
    }
    
    // Create individual menu item
    function createMenuItem(url, label, icon, color, isChild) {
        const currentPage = getCurrentPage();
        const isActive = url === currentPage;
        
        return `
            <a href="${url}" 
               class="nav-menu-item" 
               data-url="${url}" 
               data-label="${label.toLowerCase()}"
               style="
                   display: flex;
                   align-items: center;
                   gap: 10px;
                   padding: 10px 12px;
                   margin: 2px 0;
                   border-radius: 6px;
                   text-decoration: none;
                   color: ${isActive ? color : '#374151'};
                   background: ${isActive ? color + '15' : 'transparent'};
                   font-size: 13px;
                   font-weight: ${isActive ? '600' : '400'};
                   transition: all 0.15s;
                   border-left: 3px solid ${isActive ? color : 'transparent'};
                   ${isChild ? 'padding-left: 24px;' : ''}
               "
               onmouseover="if(!this.style.background.includes('${color}')) { this.style.background='#F9FAFB'; }"
               onmouseout="if(!this.style.background.includes('${color}')) { this.style.background='transparent'; }"
            >
                <i class="fas ${icon}" style="width: 16px; color: ${color};"></i>
                <span>${label}</span>
                ${isActive ? '<i class="fas fa-check-circle" style="margin-left: auto; font-size: 12px;"></i>' : ''}
            </a>
        `;
    }
    
    // Initialize navigation
    function initGlobalNavigation() {
        // Check if navigation already exists
        if (document.getElementById('globalNavigation')) {
            console.log('⚠️ Global Navigation already exists');
            return;
        }
        
        // Insert navigation HTML at the beginning of body
        const navHTML = createNavigationHTML();
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        
        // Setup dropdown toggle
        const dropdownBtn = document.getElementById('navDropdownBtn');
        const dropdownMenu = document.getElementById('navDropdownMenu');
        const searchInput = document.getElementById('navSearchInput');
        
        if (dropdownBtn && dropdownMenu) {
            // Toggle dropdown on click
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = dropdownMenu.style.display === 'block';
                dropdownMenu.style.display = isVisible ? 'none' : 'block';
                
                // Focus search input when opening
                if (!isVisible) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
                    dropdownMenu.style.display = 'none';
                }
            });
            
            // Search functionality
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase().trim();
                    const menuItems = document.querySelectorAll('.nav-menu-item');
                    
                    menuItems.forEach(item => {
                        const label = item.getAttribute('data-label');
                        const matches = label.includes(searchTerm);
                        item.style.display = matches ? 'flex' : 'none';
                    });
                });
            }
        }
        
        console.log('✅ Global Navigation initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalNavigation);
    } else {
        initGlobalNavigation();
    }
    
})();

// ========================================
// UNIVERSAL NAVIGATION WITH RBAC + I18N
// I Trusty Ltd
// ========================================

/**
 * Initialize universal navigation
 * Call this on every page after RBAC and i18n are loaded
 */
async function initUniversalNav() {
    await window.RBAC.initRBAC();
    
    // Add language switcher to navigation if it doesn't exist
    addLanguageSwitcher();
    
    // Add user display
    addUserDisplay();
    
    // Apply navigation permissions
    window.RBAC.applyNavigationPermissions();
    
    // Translate page
    if (window.i18n && window.i18n.translatePage) {
        window.i18n.translatePage();
    }
    
    console.log('✅ Universal Navigation initialized');
}

/**
 * Add language switcher to navigation
 */
function addLanguageSwitcher() {
    // Find navigation bar
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    // Check if language switcher already exists
    if (document.getElementById('lang-switcher')) return;
    
    // Find the right container (usually where logout button is)
    const navItems = nav.querySelector('.flex.items-center.gap-3');
    if (!navItems) return;
    
    // Create language switcher HTML
    const langSwitcher = document.createElement('div');
    langSwitcher.id = 'lang-switcher';
    langSwitcher.className = 'flex items-center gap-2 border rounded-lg p-1 bg-white';
    langSwitcher.innerHTML = `
        <button onclick="switchLanguage('en')" id="lang-en" 
                class="px-3 py-1 rounded hover:bg-gray-100 transition text-sm">
            🇬🇧 EN
        </button>
        <button onclick="switchLanguage('zh-CN')" id="lang-zh" 
                class="px-3 py-1 rounded hover:bg-gray-100 transition text-sm">
            🇨🇳 中文
        </button>
    `;
    
    // Insert before first child
    navItems.insertBefore(langSwitcher, navItems.firstChild);
    
    // Update button states
    const currentLang = window.i18n ? window.i18n.getCurrentUserLanguage() : 'en';
    updateLanguageSwitcherState(currentLang);
}

/**
 * Update language switcher button states
 */
function updateLanguageSwitcherState(lang) {
    const enBtn = document.getElementById('lang-en');
    const zhBtn = document.getElementById('lang-zh');
    
    if (enBtn && zhBtn) {
        if (lang === 'en') {
            enBtn.classList.add('bg-blue-100', 'text-blue-700', 'font-semibold');
            zhBtn.classList.remove('bg-blue-100', 'text-blue-700', 'font-semibold');
        } else {
            zhBtn.classList.add('bg-blue-100', 'text-blue-700', 'font-semibold');
            enBtn.classList.remove('bg-blue-100', 'text-blue-700', 'font-semibold');
        }
    }
}

/**
 * Add user display to navigation
 */
function addUserDisplay() {
    // Find navigation bar
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    // Check if user display already exists
    if (document.getElementById('current-user-display')) return;
    
    // Get current user
    const user = window.RBAC ? window.RBAC.getCurrentUser() : null;
    const role = window.RBAC ? window.RBAC.getCurrentUserRole() : null;
    
    if (!user) return;
    
    // Find where to insert (usually before language switcher or logout)
    const navItems = nav.querySelector('.flex.items-center.gap-3');
    if (!navItems) return;
    
    // Create user display
    const userDisplay = document.createElement('div');
    userDisplay.id = 'current-user-display';
    userDisplay.className = 'flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg';
    
    const lang = window.i18n ? window.i18n.getCurrentUserLanguage() : 'en';
    const roleName = role ? (lang === 'zh-CN' ? role.role_name_cn : role.role_name) : '';
    
    userDisplay.innerHTML = `
        <i class="fas fa-user-circle text-gray-600"></i>
        <div class="text-sm">
            <div class="font-semibold text-gray-800">${user.full_name}</div>
            <div class="text-xs text-gray-600">${roleName}</div>
        </div>
    `;
    
    // Insert before language switcher
    const langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
        navItems.insertBefore(userDisplay, langSwitcher);
    } else {
        navItems.insertBefore(userDisplay, navItems.firstChild);
    }
}

/**
 * Check if user is logged in, redirect to login if not
 */
function requireLogin() {
    const user = localStorage.getItem('currentUser');
    if (!user && window.location.pathname !== '/login-rbac.html') {
        window.location.href = 'login-rbac.html';
        return false;
    }
    return true;
}

/**
 * Logout user
 */
function logout() {
    if (confirm(window.i18n ? window.i18n.t('confirm_logout') : 'Logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login-rbac.html';
    }
}

// ========================================
// AUTO-CHECK LOGIN ON PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Skip login check for login page itself
    if (window.location.pathname.includes('login')) {
        return;
    }
    
    // Check if user is logged in
    if (!requireLogin()) {
        return;
    }
    
    // Initialize navigation
    initUniversalNav();
});

// ========================================
// EXPORT FOR GLOBAL USE
// ========================================

window.UniversalNav = {
    initUniversalNav,
    addLanguageSwitcher,
    addUserDisplay,
    requireLogin,
    logout
};

console.log('✅ Universal Navigation system loaded');

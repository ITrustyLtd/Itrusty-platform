// ========================================
// SESSION TRACKING MIDDLEWARE
// I Trusty Ltd - Enterprise Management
// ========================================

/**
 * Session Tracker - Monitors user sessions and activity
 * Tracks: Login time, duration, page views, last activity
 */

// Global session state
let sessionHeartbeatInterval = null;

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize session tracking on page load
 * Call this on every page that requires authentication
 */
function initSessionTracking() {
    const user = getCurrentSessionUser();
    
    if (!user) {
        // No session - redirect to login
        if (window.location.pathname !== '/login.html' && 
            window.location.pathname !== '/login-rbac.html') {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    // Update last activity timestamp
    updateLastActivity();
    
    // Start heartbeat (every 60 seconds)
    startSessionHeartbeat();
    
    // Track page view
    logPageView(user);
    
    // Monitor user activity (mouse, keyboard)
    monitorUserActivity();
    
    console.log('✅ Session tracking initialized', {
        user: user.full_name,
        session_id: user.session_id,
        login_time: user.login_time,
        duration: getSessionDuration()
    });
    
    return true;
}

// ========================================
// SESSION MANAGEMENT
// ========================================

/**
 * Get current session user from sessionStorage
 */
function getCurrentSessionUser() {
    const userData = sessionStorage.getItem('itrusty_user');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Update last activity timestamp
 */
function updateLastActivity() {
    const user = getCurrentSessionUser();
    if (user) {
        user.last_activity = new Date().toISOString();
        sessionStorage.setItem('itrusty_user', JSON.stringify(user));
    }
}

/**
 * Get session duration in minutes
 */
function getSessionDuration() {
    const user = getCurrentSessionUser();
    if (!user || !user.login_time) return 0;
    
    const loginTime = new Date(user.login_time);
    const now = new Date();
    const durationMs = now - loginTime;
    return Math.floor(durationMs / 60000); // Convert to minutes
}

/**
 * Check if session is still active (within 30 minutes of last activity)
 */
function isSessionActive() {
    const user = getCurrentSessionUser();
    if (!user || !user.last_activity) return false;
    
    const lastActivity = new Date(user.last_activity);
    const now = new Date();
    const inactiveMinutes = (now - lastActivity) / 60000;
    
    return inactiveMinutes < 30; // 30 minutes timeout
}

/**
 * Logout user and clear session
 */
async function logoutUser() {
    const user = getCurrentSessionUser();
    
    if (user) {
        // Log logout to audit_log
        await logUserLogout(user);
    }
    
    // Clear session
    sessionStorage.removeItem('itrusty_user');
    
    // Stop heartbeat
    if (sessionHeartbeatInterval) {
        clearInterval(sessionHeartbeatInterval);
    }
    
    // Redirect to login
    window.location.href = 'login.html';
}

// ========================================
// HEARTBEAT & ACTIVITY MONITORING
// ========================================

/**
 * Start session heartbeat (updates every 60 seconds)
 */
function startSessionHeartbeat() {
    // Clear existing interval
    if (sessionHeartbeatInterval) {
        clearInterval(sessionHeartbeatInterval);
    }
    
    // Update every 60 seconds
    sessionHeartbeatInterval = setInterval(() => {
        if (!isSessionActive()) {
            console.warn('⚠️ Session expired due to inactivity');
            logoutUser();
        } else {
            updateLastActivity();
        }
    }, 60000); // 60 seconds
}

/**
 * Monitor user activity (mouse movement, clicks, keyboard)
 */
function monitorUserActivity() {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(eventType => {
        document.addEventListener(eventType, () => {
            updateLastActivity();
        }, { passive: true });
    });
}

// ========================================
// AUDIT LOGGING
// ========================================

/**
 * Log page view to audit_log
 */
async function logPageView(user) {
    try {
        const pageName = document.title || window.location.pathname;
        
        await fetch('tables/audit_log', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: user.id,
                user_name: user.full_name,
                action_type: 'view',
                resource_type: 'page',
                resource_id: window.location.pathname,
                resource_name: pageName,
                action_details: `Viewed page: ${pageName}`,
                ip_address: 'browser_session',
                success: true,
                timestamp: new Date().toISOString(),
                session_id: user.session_id
            })
        });
    } catch (error) {
        console.error('Failed to log page view:', error);
    }
}

/**
 * Log user logout to audit_log
 */
async function logUserLogout(user) {
    try {
        const duration = getSessionDuration();
        
        await fetch('tables/audit_log', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: user.id,
                user_name: user.full_name,
                action_type: 'logout',
                resource_type: 'system',
                resource_id: 'logout',
                resource_name: 'User Logout',
                action_details: `User logged out after ${duration} minutes`,
                ip_address: 'browser_session',
                success: true,
                timestamp: new Date().toISOString(),
                session_id: user.session_id
            })
        });
    } catch (error) {
        console.error('Failed to log user logout:', error);
    }
}

/**
 * Log user action to audit_log (for important operations)
 */
async function logUserAction(actionType, resourceType, resourceId, resourceName, details = '') {
    const user = getCurrentSessionUser();
    if (!user) return;
    
    try {
        await fetch('tables/audit_log', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: user.id,
                user_name: user.full_name,
                action_type: actionType, // 'create', 'edit', 'delete', 'export'
                resource_type: resourceType, // 'invoice', 'product', 'customer', etc.
                resource_id: resourceId,
                resource_name: resourceName,
                action_details: details,
                ip_address: 'browser_session',
                success: true,
                timestamp: new Date().toISOString(),
                session_id: user.session_id
            })
        });
    } catch (error) {
        console.error('Failed to log user action:', error);
    }
}

// ========================================
// ADMIN FUNCTIONS (for admin-sessions.html)
// ========================================

/**
 * Get all active sessions (for admin dashboard)
 * NOTE: This is a client-side approximation
 * For real-time tracking, would need server-side session store
 */
async function getActiveSessions() {
    try {
        // Get recent logins from audit_log (last 24 hours)
        const response = await fetch('tables/audit_log?page=1&limit=1000');
        if (!response.ok) return [];
        
        const data = await response.json();
        const logs = data.data || [];
        
        // Filter login events from last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentLogins = logs.filter(log => 
            log.action_type === 'login' && 
            new Date(log.timestamp) > yesterday
        );
        
        // Group by user and get latest login
        const userSessions = {};
        recentLogins.forEach(login => {
            if (!userSessions[login.user_id] || 
                new Date(login.timestamp) > new Date(userSessions[login.user_id].timestamp)) {
                userSessions[login.user_id] = login;
            }
        });
        
        // Convert to array and calculate duration
        const sessions = Object.values(userSessions).map(session => {
            const loginTime = new Date(session.timestamp);
            const now = new Date();
            const durationMinutes = Math.floor((now - loginTime) / 60000);
            
            return {
                user_id: session.user_id,
                user_name: session.user_name,
                session_id: session.session_id,
                login_time: session.timestamp,
                duration_minutes: durationMinutes,
                is_active: durationMinutes < 30 // Active if less than 30 min old
            };
        });
        
        return sessions;
    } catch (error) {
        console.error('Failed to get active sessions:', error);
        return [];
    }
}

/**
 * Get login history for a specific user
 */
async function getUserLoginHistory(userId, limit = 50) {
    try {
        const response = await fetch(`tables/audit_log?page=1&limit=${limit}`);
        if (!response.ok) return [];
        
        const data = await response.json();
        const logs = data.data || [];
        
        // Filter login/logout events for this user
        return logs.filter(log => 
            log.user_id === userId && 
            (log.action_type === 'login' || log.action_type === 'logout')
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
        console.error('Failed to get login history:', error);
        return [];
    }
}

// ========================================
// EXPORT FOR GLOBAL USE
// ========================================

window.SessionTracker = {
    initSessionTracking,
    getCurrentSessionUser,
    getSessionDuration,
    isSessionActive,
    logoutUser,
    updateLastActivity,
    logUserAction,
    getActiveSessions,
    getUserLoginHistory
};

console.log('✅ Session Tracker loaded');

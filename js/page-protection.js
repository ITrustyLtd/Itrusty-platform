// Page Protection - DISABLED FOR DEVELOPMENT
console.log('🔓 Page protection DISABLED - allowing all access');

// Set default auth for all pages
if (!localStorage.getItem('authToken')) {
    localStorage.setItem('authToken', 'dev-token-12345');
    localStorage.setItem('currentUser', JSON.stringify({
        username: 'Johny',
        role: 'admin',
        email: 'johny@itrusty.com',
        fullName: 'Ioannis Vlachopoulos'
    }));
}

// Export functions for compatibility
function checkAuth() {
    return true;
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

console.log('✅ Auth set:', JSON.parse(localStorage.getItem('currentUser')));

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GLOBAL: Check Authentication
    // Prevents users from jumping to inner pages without logging in
    checkAuthStatus();

    // 2. GLOBAL: Load User Profile Data
    // If we are on a page that shows user info (like profile.html), fill it in
    loadUserData();

    // 3. GLOBAL: Setup UI Interactions
    // Handles the Menu hamburger and Notification bell found on most pages
    setupGlobalUI();
});

/* =========================================
   1. AUTHENTICATION GUARD
   ========================================= */
function checkAuthStatus() {
    const currentPage = window.location.pathname.split("/").pop();
    const publicPages = ['index.html', 'signup.html', '']; // Pages that don't require login
    
    // Get user from browser memory
    const user = JSON.parse(localStorage.getItem('m2m_user'));

    // If user is NOT logged in AND trying to access a restricted page
    if (!user && !publicPages.includes(currentPage)) {
        // Redirect back to login
        window.location.href = 'index.html';
    }

    // Optional: If user IS logged in but tries to go to login page, send them to profile
    if (user && (currentPage === 'index.html' || currentPage === 'signup.html')) {
        if(user.role === 'driver') window.location.href = 'driver.html';
        else if(user.role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'profile.html';
    }
}

/* =========================================
   2. PERSONALIZATION (Load Name/Email)
   ========================================= */
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('m2m_user'));
    if (!user) return;

    // A. Fill Profile Page Header (profile.html)
    const profileName = document.querySelector('.user-profile-header h3');
    const profileEmail = document.querySelector('.user-profile-header p');

    if (profileName) profileName.innerText = user.name;
    if (profileEmail) profileEmail.innerText = user.email;

    // B. Fill "Welcome" messages on other pages (Optional)
    // If you have an element with id="user-welcome", this updates it
    const welcomeMsg = document.getElementById('user-welcome');
    if (welcomeMsg) welcomeMsg.innerText = `Hi, ${user.name.split(' ')[0]}`;
}

/* =========================================
   3. GLOBAL UI HANDLERS
   ========================================= */
function setupGlobalUI() {
    
    // A. Notification Bell Logic
    const bell = document.querySelector('.notification-icon');
    if (bell) {
        bell.addEventListener('click', () => {
            // In a real app, this would open a dropdown
            alert("You have no new notifications.");
        });
    }

    // B. Hamburger Menu Logic
    const menu = document.querySelector('.menu-icon');
    if (menu) {
        menu.addEventListener('click', () => {
            // For now, just a placeholder. 
            // Later this can slide out a sidebar.
            alert("Menu clicked! Sidebar functionality coming soon.");
        });
    }

    // C. Logout Logic
    // We look for any button/link with class 'btn-logout' or similar
    // Note: You might need to add a Logout button to your Profile HTML
    const logoutBtns = document.querySelectorAll('.btn-logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            performLogout();
        });
    });
}

/* =========================================
   HELPER FUNCTIONS
   ========================================= */
function performLogout() {
    if(confirm("Are you sure you want to log out?")) {
        // Clear memory
        localStorage.removeItem('m2m_user');
        // Send back to login
        window.location.href = 'index.html';
    }
}
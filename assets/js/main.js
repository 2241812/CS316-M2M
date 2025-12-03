// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadUserData();
    setupGlobalUI();
});

/* =========================================
   1. AUTHENTICATION GUARD
   ========================================= */
function checkAuthStatus() {
    const currentPage = window.location.pathname.split("/").pop();
    const publicPages = ['index.html', 'signup.html', '']; 
    
    const user = JSON.parse(localStorage.getItem('m2m_user'));

    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
    }

    if (user && (currentPage === 'index.html' || currentPage === 'signup.html')) {
        if(user.role === 'driver') window.location.href = 'driver.html';
        else if(user.role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'profile.html';
    }
}

/* =========================================
   2. PERSONALIZATION
   ========================================= */
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('m2m_user'));
    if (!user) return;

    const profileName = document.querySelector('.user-profile-header h3');
    const profileEmail = document.querySelector('.user-profile-header p');

    if (profileName) profileName.innerText = user.name;
    if (profileEmail) profileEmail.innerText = user.email;

    const welcomeMsg = document.getElementById('user-welcome');
    if (welcomeMsg) welcomeMsg.innerText = `Hi, ${user.name.split(' ')[0]}`;
}

/* =========================================
   3. GLOBAL UI HANDLERS
   ========================================= */
function setupGlobalUI() {
    const menuIcon = document.querySelector('.menu-icon'); 
    const sidebar = document.getElementById('sidebar');    
    const overlay = document.getElementById('sidebar-overlay'); 
    const closeBtn = document.getElementById('close-sidebar'); 

    function toggleSidebar() {
        if(sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    if (menuIcon) menuIcon.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    const logoutBtns = document.querySelectorAll('.btn-logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to log out?")) {
                localStorage.removeItem('m2m_user');
                window.location.href = 'index.html';
            }
        });
    });
}
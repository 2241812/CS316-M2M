// assets/js/admin_dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardMetrics();
    loadActivityFeed();
    loadNotifications(); // Now fetches from DB
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadDashboardMetrics();
        loadNotifications();
    }, 30000);
});

// --- METRICS ---
async function loadDashboardMetrics() {
    try {
        const response = await fetch('api/admin/get_metrics.php');
        const json = await response.json();
        if (json.success) {
            const data = json.data;
            const bookingEl = document.getElementById('metric-bookings');
            if (bookingEl) bookingEl.innerText = data.bookings_today;
            
            const shuttleEl = document.getElementById('metric-shuttles');
            if (shuttleEl) shuttleEl.innerText = `${data.active_shuttles}/${data.total_shuttles}`;
            
            const priorityEl = document.getElementById('metric-priority');
            if (priorityEl) priorityEl.innerText = data.priority_count;
        }
    } catch (error) {
        console.error('Error fetching metrics:', error);
    }
}

// --- MODAL LOGIC ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('custom-modal')) {
        event.target.style.display = 'none';
    }
}

// --- SEND ANNOUNCEMENT (REAL DB) ---
async function sendAnnouncement() {
    const input = document.getElementById('announce-input');
    const message = input.value.trim();

    if (!message) {
        alert("Please enter a message.");
        return;
    }

    try {
        // Create form data to send to PHP
        const formData = new FormData();
        formData.append('message', message);
        // You can add 'user_id' here if you want to track who sent it
        // formData.append('admin_id', 1); 

        const response = await fetch('api/admin/send_announcement.php', {
            method: 'POST',
            body: formData
        });

        const json = await response.json();

        if (json.success) {
            alert("Announcement posted successfully!");
            input.value = "";
            closeModal('announcement-modal');
            // Reload notifications so we see the new one immediately
            loadNotifications();
        } else {
            alert("Failed to send: " + json.message);
        }
        
    } catch (error) {
        console.error("Error sending announcement:", error);
        alert("Server error occurred.");
    }
}

// --- GET NOTIFICATIONS (REAL DB) ---
async function loadNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    try {
        const response = await fetch('api/admin/get_notifications.php');
        const json = await response.json();

        if (json.success) {
            const notifs = json.data;

            if (notifs.length === 0) {
                list.innerHTML = '<li class="feed-item"><p>No new notifications.</p></li>';
                return;
            }

            list.innerHTML = notifs.map(item => `
                <li class="feed-item">
                    <div class="feed-icon" style="background:#eef2ff; color:#4f46e5;">
                        <i class="fas fa-bullhorn"></i>
                    </div>
                    <div class="feed-content">
                        <p>${item.message}</p>
                        <span>${item.created_at}</span>
                    </div>
                </li>
            `).join('');
        }
    } catch (error) {
        console.error("Error loading notifications", error);
    }
}
async function loadActivityFeed() {
    const list = document.getElementById('activity-feed-list');
    if (!list) return;

    try {
        const response = await fetch('api/admin/get_activity_feed.php');
        const json = await response.json();

        if (json.success) {
            const activities = json.data;

            if (activities.length === 0) {
                list.innerHTML = '<li class="feed-item" style="justify-content:center; color:#999;">No recent activity.</li>';
                return;
            }

            list.innerHTML = activities.map(item => `
                <li class="feed-item">
                    <div class="feed-icon"><i class="fas ${item.icon}"></i></div>
                    <div class="feed-content">
                        <p>${item.text}</p>
                        <span>${item.time}</span>
                    </div>
                </li>
            `).join('');
        }
    } catch (error) {
        console.error("Error loading activity feed:", error);
    }

}
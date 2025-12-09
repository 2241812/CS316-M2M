document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('m2m_user'));
    
    if (!user || !user.id) {
        // Redirect if not logged in
        window.location.href = 'index.html';
        return;
    }
    loadNotifications(user.id);
});

async function loadNotifications(userId) {
    const list = document.getElementById('notification-list');
    if (!list) return;

    list.innerHTML = ''; 

    try {
        const response = await fetch(`api/user/get_notifications.php?user_id=${userId}`);
        const json = await response.json();

        if (json.success && json.data) {
            const notifs = json.data;
            let unreadCount = 0; 
            
    
            if (notifs.length === 0) {
                list.innerHTML = `
                    <li class="notification-item">
                        <p style="text-align: center; width: 100%; color: #999; padding: 10px 0;">No notifications yet.</p>
                    </li>
                `;
                return;
            }

            list.innerHTML = notifs.map(item => {
                const isUnread = item.is_read === 0;
                if (isUnread) unreadCount++; 

                const unreadClass = isUnread ? 'unread' : '';
                
                let iconClass = 'fas fa-info-circle';
                let iconColor = '#5067d5';
                let backgroundColor = '#eef2ff';

                if (item.type === 'announcement') {
                    iconClass = 'fas fa-bullhorn'; 
                    iconColor = '#17a2b8'; 
                    backgroundColor = '#e6faff';
                } else if (item.type === 'booking_confirm') {
                    iconClass = 'fas fa-calendar-check'; 
                    iconColor = '#28a745'; 
                    backgroundColor = '#e9ffe9';
                } else if (item.type === 'booking_reminder') {
                    iconClass = 'fas fa-bell'; 
                    iconColor = '#ffc107'; 
                    backgroundColor = '#fffbed';
                }

                return `
                    <li class="notification-item ${unreadClass}" 
                        data-id="${item.id}" 
                        data-type="${item.type}" 
                        onclick="markNotificationAsRead(this, '${item.id}', '${item.type}')">
                        
                        <div class="notification-icon-wrapper" style="background:${backgroundColor}; color:${iconColor};">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="notification-content">
                            <p>${item.message}</p>
                            <span>${item.created_at}</span>
                        </div>
                    </li>
                `;
            }).join('');
            
            const dot = document.querySelector('.notification-dot');
            if (dot) {
                dot.style.display = unreadCount > 0 ? 'block' : 'none';
            }
        } else {
             list.innerHTML = `<li class="notification-item"><p style="text-align: center; width: 100%; color: #E02B2B; padding: 10px 0;">Error loading updates.</p></li>`;
        }

    } catch (error) {
        console.error("Error loading notifications:", error);
        list.innerHTML = `<li class="notification-item"><p style="text-align: center; width: 100%; color: #E02B2B; padding: 10px 0;">Network error. Please try again.</p></li>`;
    }
}

async function markNotificationAsRead(element, id, type) {
    if (!element.classList.contains('unread')) return;

    try {
        const response = await fetch('api/routes/mark_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, type: type }) 
        });

        const json = await response.json();

        if (json.success) {
            element.classList.remove('unread');

  
            const dot = document.querySelector('.notification-dot');
            if (dot) {

                loadNotifications(JSON.parse(localStorage.getItem('m2m_user')).id); 
            }
        }
    } catch (error) {
        console.error("Failed to mark notification as read", error);
    }
}